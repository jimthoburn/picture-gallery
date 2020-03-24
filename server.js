
import fs from "fs";

// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import express from "express";
import slashes from "connect-slashes";
import fetch from "node-fetch";
import jsBeautify from "js-beautify";

import { render } from "./web_modules/preact-render-to-string.js";

import { config } from "./_config.js";
import { DefaultLayout } from "./layouts/default.js";
import { RobotsText } from "./layouts/robots.txt.js";
import { SiteMapXML } from "./layouts/sitemap.xml.js";
import { IndexPage } from "./pages/index.js";
import { AlbumPage } from "./pages/album.js";
import { ParentAlbumPage } from "./pages/parent-album.js";
import { Error404Page, error404PageTitle } from "./pages/404.js";
import { Error500Page, error500PageTitle } from "./pages/500.js";
import { getInitialPageTitle, getOpenGraphImage } from "./components/picture-gallery.js";

import { getCombinedAlbumJSON } from "./helpers/album.js";
import { getSecretAlbums } from "./helpers/secret-albums.js";

const galleryData = JSON.parse(fs.readFileSync("./_api/index.json", "utf8"));

const [secretAlbums, secretAlbumGroups] = getSecretAlbums();

const groupAlbums = secretAlbumGroups.map(group => group.uri);
console.log({groupAlbums});

const albums = galleryData.albums
                .concat(secretAlbums)
                .concat(secretAlbumGroups.map(group => group.uri))
                .filter( onlyUnique );

console.log({albums});

// https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
function onlyUnique(value, index, self) { 
  return self.indexOf(value) === index;
}

function notGroupAlbum(album) {
  const matchingGroupAlbums =
    groupAlbums.filter(groupAlbum => groupAlbum === album);
  return matchingGroupAlbums.length <= 0
}

function isGroupAlbum(album) {
  console.log("isGroupAlbum");
  const matchingGroupAlbums =
    groupAlbums.filter(groupAlbum => groupAlbum === album);
  console.log({album});
  console.log({groupAlbums});
  console.log({matchingGroupAlbums});
  console.log({ isGroupAlbum: matchingGroupAlbums.length >= 1 });
  return matchingGroupAlbums.length >= 1
}

const port = parseInt(process.env.PORT, 10) || 4000;
const server = express();

function getData(url) {
  console.log("getData: " + url);
  return new Promise((resolve, reject) => {
    fetch(url).then(response => {
      if (response.ok) {
        resolve(response.json());
      } else {
        console.error(response.status);
        console.error(url);
        resolve(null);
      }
    }).catch(error => {
      console.error(error);
      resolve(null);
    });
  });
}

function getMarkdown(url) {
  return new Promise((resolve, reject) => {
    fetch(url).then(response => {
      if (response.ok) {
        resolve(response.text());
      } else {
        console.error(response.status);
        console.error(url);
        resolve(null);
      }
    }).catch(error => {
      console.error(error);
      resolve(null);
    });
  });
}

async function getAlbumJSON({ albumURI, req }) {

  // TODO: Send these requests in parallel
  const album             = await getData(`${req.protocol}://${req.get("host")}/api/${albumURI}.json`);
  const generatedPictures = await getData(`${req.protocol}://${req.get("host")}/pictures/${albumURI}/data.json`);

  return getCombinedAlbumJSON({ album, generatedPictures });
}

async function getAlbumStory({ albumURI, req }) {
  const story = await getMarkdown(`${req.protocol}://${req.get("host")}/api/${albumURI}.markdown`);
  return story;
}

// function getAlbumJSON({ albumURI, req }) {
//   return new Promise((resolve, reject) => {
//     Promise.all([
//       getData(`${req.protocol}://${req.get("host")}/api/${albumURI}.json`),
//       getData(`${req.protocol}://${req.get("host")}/pictures/${albumURI}/data.json`)
//     ]).then((album, generatedPictures) => {
//       resolve(getCombinedAlbumJSON({ album, generatedPictures }));
//     });
//   })
// }

function serveIndexPage(req, res, next) {
  console.log("serveIndexPage");
  
  Promise.all(galleryData.albums.map(
    async (albumURI) => {
      const json = await getAlbumJSON({ albumURI: `${albumURI}${(isGroupAlbum(albumURI)) ? "/index" : ""}`, req });
      if (isGroupAlbum(albumURI)) {
        const children = await Promise.all(json.albums.map(
          async (childAlbumURI) => await getAlbumJSON({ albumURI: `${albumURI}/${childAlbumURI}`, req })
        ));
        json.albums = children;
      }
      return json;
    }
  )).then(albums => {

    console.log("albums for serveIndexPage");
    console.log({ albums });

    const { title, askSearchEnginesNotToIndex } = galleryData;
    const content = render(IndexPage({ ...galleryData, albums }));

    function getPageURL() {
      // https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
      return `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    }

    const openGraphImage = 
      albums[0].albums
        ? getOpenGraphImage({ getPageURL, pictures: albums[0].albums[0].pictures, album: albums[0].albums[0] })
        : getOpenGraphImage({ getPageURL, pictures: albums[0].pictures, album: albums[0] });

    const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({
      title,
      content,
      askSearchEnginesNotToIndex,
      includeClientJS: false,
      openGraphImage:
        openGraphImage ?
          openGraphImage.indexOf("http") != 0 && config.host
            ? `${config.host}${openGraphImage}`
            : openGraphImage
          : null
    }));
    res.send(beautifiedHTML);
  }).catch(function(err) {
    console.error(err.stack);
    sendError500Page(err, req, res, next);
  });
}

// https://example.com/wildflowers/7/  ==>  wildflowers
// https://example.com/wildflowers/    ==>  wildflowers
// https://example.com/baking/a/3/     ==>  baking/a
// https://example.com/baking/a/       ==>  baking/a
function getAlbumURI({ pageURL, albumNames }) {

  // console.log("getAlbumURI")
  // console.log("pageURL", pageURL)
  // console.log("albumNames", albumNames)

  // https://example.com/wildflowers/7/  ==>  ["example.com", "wildflowers", "7"]
  // https://example.com/baking/a/3/     ==>  ["example.com", "baking", "a", "3"]
  // https://example.com/baking/a/       ==>  ["example.com", "baking", "a"]
  let urlArray = pageURL.split("://").pop().split("?").shift().split("/").filter(bit => bit !== "");
  urlArray.shift(); // Remove the domain and port
  // console.log(urlArray);
  
  let groupMatches = albumNames.filter(name => name === urlArray[0]);
  // console.log("groupMatches", groupMatches);
  let matches       = albumNames.filter(name => name === urlArray.slice(0, urlArray.length - 1).join("/"));
  // console.log("matches", matches);
  let strongMatches = albumNames.filter(name => name === urlArray.join("/"));
  // console.log("strongMatches", strongMatches);

  if (strongMatches.length > 0) {
    return strongMatches[0]
  } else if (matches.length > 0) {
    return matches[0]
  } else if (groupMatches.length > 0) {
    return groupMatches[0]
  }
}

async function serveAlbumPage(req, res) {
  console.log("serveAlbumPage")

  function getPageURL() {
    // https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
    return `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  }

  let albumURI;
  if (!albumURI) {
    albumURI = getAlbumURI({ pageURL: getPageURL(), albumNames: secretAlbums });
  }
  if (!albumURI) {
    albumURI = getAlbumURI({ pageURL: getPageURL(), albumNames: galleryData.albums });
  }
  if (!albumURI) {
    albumURI = getAlbumURI({ pageURL: getPageURL(), albumNames: secretAlbumGroups.map(group => group.uri) });
  }

  if (isGroupAlbum(albumURI)) {
     albumURI = albumURI + "/index";
  }

  console.log({albumURI});

  // const test = await getData(`${req.protocol}://${req.get("host")}/api/${albumURI}.json`);
  // if (!test) {
  //   // If the request failed, try again by looking for an index.json file
  //   // (for the case where this is a parent album)
  //   albumURI = albumURI + "/index";
  // }

  getAlbumJSON({ albumURI, req }).then(async function(data) {
    console.log("getAlbumJSON");
    let album;

    console.log({data});

    // If this is a parent album
    if (data.albums) {
      // console.log("**** PARENT ALBUM");

      // const childAlbumURI = urlArray[1];
      // const childAlbum = data.albums.filter(album => album.uri === childAlbumURI)[0];
      // const childAlbum = await getAlbumJSON({ albumURI: `${albumURI}/${childAlbumURI}`, req });
      // console.log(childAlbum);

      // if (childAlbum) {
      //   album = {
      //     ...childAlbum,
      //     uri: `${data.uri}/${childAlbum.uri}`,
      //     parent: data,
      //     askSearchEnginesNotToIndex: data.askSearchEnginesNotToIndex
      //   };
      // } else {
        Promise.all(data.albums.map(
          async (childAlbumURI) => await getAlbumJSON({ albumURI: `${albumURI.replace("/index", "")}/${childAlbumURI}`, req })
        )).then(albums => {
          const { title, askSearchEnginesNotToIndex } = data;
          const content = render(ParentAlbumPage({ parent: data, children: albums }));

          const openGraphImage = getOpenGraphImage({ getPageURL, pictures: albums[0].pictures, album: albums[0], parent: data });

          const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({
            title,
            content,
            askSearchEnginesNotToIndex,
            includeClientJS: false,
            openGraphImage:
              openGraphImage ?
                openGraphImage.indexOf("http") != 0 && config.host
                  ? `${config.host}${openGraphImage}`
                  : openGraphImage
                : null
          }));
          res.send(beautifiedHTML);
        })
      //}

    // If this is part of a group album
    } else if (getAlbumURI({ pageURL: getPageURL(), albumNames: secretAlbumGroups.map(group => group.uri) })) {
      // console.log("**** CHILD ALBUM");

      getAlbumJSON({ albumURI: `${getAlbumURI({ pageURL: getPageURL(), albumNames: secretAlbumGroups.map(group => group.uri) })}/index`, req }).then(async function(parent) {
        const childAlbumURI = getAlbumURI({ pageURL: getPageURL(), albumNames: secretAlbumGroups.map(group => group.uri) }) + "/" + data.uri;

        console.log("childAlbumURI", childAlbumURI);

        album = {
          ...data,
          uri: childAlbumURI,
          parent,
          askSearchEnginesNotToIndex: data.askSearchEnginesNotToIndex || parent.askSearchEnginesNotToIndex
        };
        // console.log(album);

        const story = await getAlbumStory({ albumURI: childAlbumURI, req });

        const title   = getInitialPageTitle({ getPageURL, album, pictures: album.pictures });
        const content = render(AlbumPage({ getPageURL, album, pictures: album.pictures, story }));
        const { askSearchEnginesNotToIndex } = album;

        const openGraphImage = getOpenGraphImage({ getPageURL, pictures: album.pictures, album });

        const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({
          title,
          content,
          askSearchEnginesNotToIndex,
          openGraphImage:
            openGraphImage ?
              openGraphImage.indexOf("http") != 0 && config.host
                ? `${config.host}${openGraphImage}`
                : openGraphImage
              : null
        }));
        res.send(beautifiedHTML);
      });

    } else {
      // console.log("**** ALBUM");

      album = data;
      // console.log(album);

      const story   = await getAlbumStory({ albumURI, req });
      const title   = getInitialPageTitle({ getPageURL, album, pictures: album.pictures });
      const content = render(AlbumPage({ getPageURL, album, pictures: album.pictures, story }));
      const { askSearchEnginesNotToIndex } = album;

      const openGraphImage = getOpenGraphImage({ getPageURL, pictures: album.pictures, album });

      const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({
        title,
        content,
        askSearchEnginesNotToIndex,
        openGraphImage:
          openGraphImage ?
            openGraphImage.indexOf("http") != 0 && config.host
              ? `${config.host}${openGraphImage}`
              : openGraphImage
            : null
      }));
      res.send(beautifiedHTML);
    }

  });
}

function sendError404Page(req, res, next) {

  const title   = error404PageTitle;
  const content = render(Error404Page());

  const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({
    title,
    content,
    includeClientJS: false
  }));
  res.status(404).send(beautifiedHTML);
}

function sendError500Page(err, req, res, next) {
  const title   = error500PageTitle;
  const content = render(Error500Page({ errorMessage: err.stack }));

  const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({
    title,
    content,
    includeClientJS: false
  }));
  res.status(500).send(beautifiedHTML);
}



server.get("/", serveIndexPage);

console.log("albums", albums);

for (let album of albums) {
  server.get(`/${album}/$`, serveAlbumPage); // Albums
  server.get(`/${album}/*/$`, serveAlbumPage); // Pictures
}

const staticFolders = [
  "_api",
  "_archives",
  "_pictures",
  "components",
  "css",
  "helpers",
  "machines",
  "web_modules"
];

for (let folder of staticFolders) {
  const folderWithoutLeadingUnderscore = folder.replace(/^_/, "");
  server.use( `/${folderWithoutLeadingUnderscore}`, express.static( `./${folder}` ) );
}

// _public is a general folder for any static file to be served from “/”
server.use(express.static("./_public"));

server.get("/client.js", function(req, res) {
  res.sendFile("client.js", { root: __dirname });
});

server.get("/robots.txt", function(req, res, next) {
  if (config.askSearchEnginesNotToIndex || !config.host) {
    sendError404Page(req, res, next);
    return;
  }

  const text = RobotsText({ host: config.host });
  res.type('text/plain');
  res.send(text);
});

server.get("/sitemap.xml", async function(req, res, next) {
  if (config.askSearchEnginesNotToIndex || !config.host) {
    sendError404Page(req, res, next);
    return;
  }
  console.log({galleryData});

  const publicAlbumURIs = galleryData.albums.filter( notGroupAlbum );

  console.log({publicAlbumURIs});

  const publicAlbums = await Promise.all(publicAlbumURIs.map(async (albumURI) => {
    const json = await getAlbumJSON({ albumURI, req });
    return json;
  }));

  console.log({publicAlbums});

  // https://stackoverflow.com/questions/40140149/use-async-await-with-array-map
  const publicGroupAlbums = await Promise.all(
    galleryData.albums.filter( isGroupAlbum ).map(
      async groupAlbumURI => {
        const album = await getAlbumJSON({ albumURI: `${groupAlbumURI}/index`, req });
        console.log(album);

        const childrenURIs = album.albums;
        console.log({childrenURIs});
        const children = await Promise.all(childrenURIs.map(async (childAlbumURI) => {
          const json = await getAlbumJSON({ albumURI: `${groupAlbumURI}/${childAlbumURI}`, req });
          return json;
        }));
        console.log({children});

        return {
          ...album,
          albums: children
        };
      }
    )
  );

  // console.log({publicGroupAlbums});

  // const publicGroupAlbums = [];
  // for (let nextAlbumName of groupAlbums) {
  //   const album = getAlbumJSON({ albumURI: `${nextAlbumName}/index` });
  //   const children = album.albums.map(
  //     childAlbumURI => getAlbumJSON({ albumURI: `${nextAlbumName}/${childAlbumURI}`})
  //   )
  //   publicGroupAlbums.push({
  //     ...album,
  //     albums: children
  //   });
  // }

  const xml = SiteMapXML({ host: config.host, albums: publicAlbums, groupAlbums: publicGroupAlbums });
  res.type('text/xml');
  res.send(xml);
});

// If the browser has cached a trailing slash redirects to a file with an extension,
// Redirect back to the original file
// server.get(`*.*/$`, function(req, res, next) {
// 
//   const urlWithoutTrailingSlash = `${req.originalUrl}`.replace(/\/$/g, "");
//   const urlWithoutLeadingOrTrailingSlash = `${urlWithoutTrailingSlash}`.replace(/^\//g, "");
// 
//   if (fs.existsSync(`.${urlWithoutLeadingOrTrailingSlash}`) ||
//       fs.existsSync(`./_${urlWithoutLeadingOrTrailingSlash}`) ||
//       fs.existsSync(`./_public/${urlWithoutLeadingOrTrailingSlash}`)) {
//     res.redirect(urlWithoutTrailingSlash);
//   } else {
//     sendError404Page(req, res, next)
//   }
// });

// Add trailing slashes to URLs: /wildflowers => /wildflowers/
server.use(slashes(true, { code: 302 })); // 302 Temporary redirects

server.use(sendError404Page);

server.use(sendError500Page);

server.listen(port, err => {
  if (err) throw err;
  console.log(`Ready on http://localhost:${port}`);
});

