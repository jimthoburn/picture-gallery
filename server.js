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
import { WithoutClientLayout } from "./layouts/without-client.js";
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

const albums = secretAlbums.concat(secretAlbumGroups.map(group => group.uri));

// console.log(albums);

const port = parseInt(process.env.PORT, 10) || 5000;
const server = express();

function getData(url) {
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

async function getAlbumJSON({ albumURI, req }) {

  // TODO: Send these requests in parallel
  const album             = await getData(`${req.protocol}://${req.get("host")}/api/${albumURI}.json`);
  const generatedPictures = await getData(`${req.protocol}://${req.get("host")}/pictures/${albumURI}/data.json`);

  return getCombinedAlbumJSON({ album, generatedPictures });
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
  Promise.all(galleryData.albums.map(
    albumURI => getAlbumJSON({ albumURI, req })
  )).then(albums => {
    const { title, askSearchEnginesNotToIndex } = galleryData;
    const content = render(IndexPage({ ...galleryData, albums }));

    function getPageURL() {
      // https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
      return `${req.protocol}://${req.get("host")}${req.originalUrl}`;
    }

    const beautifiedHTML = jsBeautify.html_beautify(WithoutClientLayout({
      title,
      content,
      askSearchEnginesNotToIndex,
      openGraphImage:
        config.host
          ? `${config.host}${ getOpenGraphImage({ getPageURL, pictures: albums[0].pictures, album: albums[0] }) }`
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
  // console.log("serveAlbumPage")

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
    if (albumURI) {
       albumURI = albumURI + "/index";
    }
  }

  // const test = await getData(`${req.protocol}://${req.get("host")}/api/${albumURI}.json`);
  // if (!test) {
  //   // If the request failed, try again by looking for an index.json file
  //   // (for the case where this is a parent album)
  //   albumURI = albumURI + "/index";
  // }

  getAlbumJSON({ albumURI, req }).then(async function(data) {
    let album;

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
          childAlbumURI => getAlbumJSON({ albumURI: `${albumURI.replace("/index", "")}/${childAlbumURI}`, req })
        )).then(albums => {
          const { title, askSearchEnginesNotToIndex } = data;
          const content = render(ParentAlbumPage({ parent: data, children: albums }));

          const beautifiedHTML = jsBeautify.html_beautify(WithoutClientLayout({
            title,
            content,
            askSearchEnginesNotToIndex,
            openGraphImage:
              config.host
                ? `${config.host}${ getOpenGraphImage({ getPageURL, pictures: albums[0].pictures, album: albums[0], parent: data }) }`
                : null
          }));
          res.send(beautifiedHTML);
        })
      //}

    // If this is part of a group album
    } else if (getAlbumURI({ pageURL: getPageURL(), albumNames: secretAlbumGroups.map(group => group.uri) })) {
      // console.log("**** CHILD ALBUM");

      getAlbumJSON({ albumURI: `${getAlbumURI({ pageURL: getPageURL(), albumNames: secretAlbumGroups.map(group => group.uri) })}/index`, req }).then(parent => {
        album = {
          ...data,
          uri: getAlbumURI({ pageURL: getPageURL(), albumNames: secretAlbumGroups.map(group => group.uri) }) + "/" + data.uri,
          parent,
          askSearchEnginesNotToIndex: data.askSearchEnginesNotToIndex || parent.askSearchEnginesNotToIndex
        };
        // console.log(album);

        const title   = getInitialPageTitle({ getPageURL, album, pictures: album.pictures });
        const content = render(AlbumPage({ getPageURL, album, pictures: album.pictures }));
        const { askSearchEnginesNotToIndex } = album;

        const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({
          title,
          content,
          askSearchEnginesNotToIndex,
          openGraphImage:
            config.host
              ? `${config.host}${ getOpenGraphImage({ getPageURL, pictures: album.pictures, album }) }`
              : null
        }));
        res.send(beautifiedHTML);
      });

    } else {
      // console.log("**** ALBUM");

      album = data;
      // console.log(album);

      const title   = getInitialPageTitle({ getPageURL, album, pictures: album.pictures });
      const content = render(AlbumPage({ getPageURL, album, pictures: album.pictures }));
      const { askSearchEnginesNotToIndex } = album;

      const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({
        title,
        content,
        askSearchEnginesNotToIndex,
        openGraphImage:
          config.host
            ? `${config.host}${ getOpenGraphImage({ getPageURL, pictures: album.pictures, album }) }`
            : null
      }));
      res.send(beautifiedHTML);
    }

  });
}

function sendError404Page(req, res, next) {

  const title   = error404PageTitle;
  const content = render(Error404Page());

  const beautifiedHTML = jsBeautify.html_beautify(WithoutClientLayout({
    title,
    content
  }));
  res.status(404).send(beautifiedHTML);
}

function sendError500Page(err, req, res, next) {
  const title   = error500PageTitle;
  const content = render(Error500Page({ errorMessage: err.stack }));

  const beautifiedHTML = jsBeautify.html_beautify(WithoutClientLayout({
    title,
    content
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

// Add trailing slashes to URLs: /wildflowers => /wildflowers/
server.use(slashes());

server.use(sendError404Page);

server.use(sendError500Page);

server.listen(port, err => {
  if (err) throw err;
  console.log(`Ready on http://localhost:${port}`);
});

