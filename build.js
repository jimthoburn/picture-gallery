
import fs from "fs-extra";
import mkdirp from "mkdirp";
import jsBeautify from "js-beautify";

import { render } from "./web_modules/preact-render-to-string.js";

import { config } from "./_config.js";
import { DefaultLayout } from "./layouts/default.js";
import { RobotsText } from "./layouts/robots.txt.js";
import { SiteMapXML } from "./layouts/sitemap.xml.js";
import { AlbumPage } from "./pages/album.js";
import { IndexPage } from "./pages/index.js";
import { ParentAlbumPage } from "./pages/parent-album.js";
import { Error404Page, error404PageTitle } from "./pages/404.js";
import { getInitialPageTitle, getOpenGraphImage } from "./components/picture-gallery.js";

import { getCombinedAlbumJSON } from "./helpers/album.js";
import { getSecretAlbums } from "./helpers/secret-albums.js";

const galleryData = JSON.parse(fs.readFileSync("./_api/index.json", "utf8"));

const [secretAlbums, secretAlbumGroups] = getSecretAlbums();

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
  const matchingGroupAlbums =
    groupAlbums.filter(groupAlbum => groupAlbum === album);
  return matchingGroupAlbums.length >= 1
}

const groupAlbums = secretAlbumGroups.map(group => group.uri);

const albums = galleryData.albums.concat(secretAlbums).filter( notGroupAlbum ).filter( onlyUnique );

console.log("*** albums");
console.log(albums);

const GENERATED_FILES_FOLDER = "./_site";

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


function createFile({ pageURL, filename, output }) {

  const writePath = GENERATED_FILES_FOLDER + pageURL;

  mkdirp(writePath, function (err) {
    if (err) {
      console.error(err);
    } else {
      fs.writeFileSync(`${writePath}/${filename ? filename : "index.html"}`, output, 'utf8', (err) => {
        if (err) {
          console.log(err);
        }
      });
    }
  });
}


function removeFile({ pageURL, filename }) {
  const writePath = GENERATED_FILES_FOLDER + pageURL;

  const path = `${writePath}/${filename ? filename : "index.html"}`;
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}


function copy({source, destination}) {

  console.log(`Copying files from: ${source}`);

  // https://www.npmjs.com/package/fs-extra
  fs.copy(source, destination, function (err) {
    if (err){
      console.log('An error occured while copying the folder.')
      return console.error(err)
    }
  });
}


function generateAlbum({ album, story, askSearchEnginesNotToIndex }) {

  const urlsToGenerate = [`/${album.uri}/`].concat(
                           album.pictures.map(picture => `/${album.uri}/${picture.uri}/`)
                         );
  console.log(`Generating album for: ${album.title}`);

  for (let pageURL of urlsToGenerate) {

    // console.log(`Generating page for: ${pageURL}`);

    function getPageURL() {
      return pageURL;
    }

    const title   = getInitialPageTitle({ getPageURL, pictures: album.pictures, album });
    const content = render(AlbumPage({ getPageURL, pictures: album.pictures, story, album }));

    const renderedHTML = DefaultLayout({
      title,
      content,
      askSearchEnginesNotToIndex,
      openGraphImage:
        config.host
          ? `${config.host}${ getOpenGraphImage({ getPageURL, pictures: album.pictures, album }) }`
          : null
    });
    const beautifiedHTML = jsBeautify.html_beautify(renderedHTML);

    createFile({ pageURL, output: beautifiedHTML });
  }
}


function getAlbumJSON({ albumURI }) {
  const album             = JSON.parse(fs.readFileSync(`./_api/${albumURI}.json`, 'utf8'));
  const generatedPictures = fs.existsSync(`./_pictures/${albumURI}/data.json`)
    ? JSON.parse(fs.readFileSync(`./_pictures/${albumURI}/data.json`, "utf8"))
    : [];
  return getCombinedAlbumJSON({ album, generatedPictures });
}


function getAlbumStory({ albumURI }) {
  const story = fs.existsSync(`./_api/${albumURI}.markdown`)
    ? fs.readFileSync(`./_api/${albumURI}.markdown`, "utf8")
    : null;
  return story;
}


function generateIndexPage() {
  console.log(`Generating index page`);
  console.log("groupAlbums", groupAlbums);
  const albums = galleryData.albums.map(albumURI => {
    console.log("index: albumURI", albumURI);
    const isGroupAlbum = (groupAlbums.filter(album => album === albumURI).length > 0);
    console.log("index: isGroupAlbum", isGroupAlbum);
    let json = getAlbumJSON({
      albumURI: `${albumURI}${(isGroupAlbum) ? "/index" : ""}`
    });
    if (isGroupAlbum) {
      const children = json.albums.map(
        childAlbumURI => getAlbumJSON({ albumURI: `${albumURI}/${childAlbumURI}`})
      )
      json.albums = children
    }
    return json;
  });
  const { title, askSearchEnginesNotToIndex } = galleryData;
  const content = render(IndexPage({ ...galleryData, albums }));

  function getPageURL() {
    return "/";
  }

  const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({
    title,
    content,
    askSearchEnginesNotToIndex,
    includeClientJS: false,
    openGraphImage:
      config.host
        ? `${config.host}${ getOpenGraphImage({ getPageURL, pictures: albums[0].pictures, album: albums[0] }) }`
        : null
  }));

  createFile({ pageURL: "/", filename: "index.html", output: beautifiedHTML });
}


function generateError404Page() {
  console.log(`Generating error 404 page`);
  const title   = error404PageTitle;
  const content = render(Error404Page());

  const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({
    title,
    content,
    includeClientJS: false
  }));
  createFile({ pageURL: "/", filename: "404.html", output: beautifiedHTML });
}


function generateSiteMap({ host }) {
  console.log(`Generating site map`);
  const publicAlbums = galleryData.albums.filter( notGroupAlbum ).map(albumURI => getAlbumJSON({ albumURI }));
  const publicGroupAlbums =
    galleryData.albums.filter( isGroupAlbum ).map(
      groupAlbumURI => {
        const album = getAlbumJSON({ albumURI: `${groupAlbumURI}/index` });
        const children = album.albums.map(
          childAlbumURI => getAlbumJSON({ albumURI: `${groupAlbumURI}/${childAlbumURI}`})
        )
        return {
          ...album,
          albums: children
        };
      }
    );

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

  const xml = SiteMapXML({ host, albums: publicAlbums, groupAlbums: publicGroupAlbums });

  createFile({ pageURL: "/", filename: "sitemap.xml", output: xml });
}


function generateRobotsText({ host }) {
  console.log(`Generating robots.txt`);
  const text = RobotsText({ host });
  createFile({ pageURL: "/", filename: "robots.txt", output: text });
}


function generateAllAlbums() {
  for (let nextAlbumName of albums) {

    const album = getAlbumJSON({ albumURI: nextAlbumName });
    const story = getAlbumStory({ albumURI: nextAlbumName });

    const parentAlbums = groupAlbums.filter(groupAlbumName => groupAlbumName === nextAlbumName.split("/")[0]);

    if (parentAlbums.length > 0) {
      // console.log("**** CHILD ALBUM");

      const parent = getAlbumJSON({ albumURI: `${parentAlbums[0]}/index` });
      generateAlbum({ 
        album: {
          ...album,
          uri: `${parent.uri}/${album.uri}`,
          parent
        },
        story,
        askSearchEnginesNotToIndex: album.askSearchEnginesNotToIndex || parent.askSearchEnginesNotToIndex
      });

    } else {
      generateAlbum({ album, story, askSearchEnginesNotToIndex: album.askSearchEnginesNotToIndex });
    }

  }
  for (let nextAlbumName of groupAlbums) {

    const album = getAlbumJSON({ albumURI: `${nextAlbumName}/index` });

    const children = album.albums.map(
      childAlbumURI => getAlbumJSON({ albumURI: `${nextAlbumName}/${childAlbumURI}`})
    )

    console.log(`Generating group album for: ${ album.title }`);

    const pageURL = `/${ album.uri }/`;

    function getPageURL() {
      return pageURL;
    }

    console.log(`Generating page for: ${ pageURL }`);

    const { title, askSearchEnginesNotToIndex } = album;
    const content = render(ParentAlbumPage({ parent: album, children }));

    const renderedHTML = DefaultLayout({
      title,
      content,
      askSearchEnginesNotToIndex,
      includeClientJS: false,
      openGraphImage:
        config.host
          ? `${config.host}${ getOpenGraphImage({ getPageURL, pictures: children[0].pictures, album: children[0], parent: album }) }`
          : null
    });
    const beautifiedHTML = jsBeautify.html_beautify(renderedHTML);

    createFile({ pageURL, output: beautifiedHTML });
  }
}


function copyAllStaticFiles() {
  for (let folder of staticFolders) {

    const folderWithoutLeadingUnderscore = folder.replace(/^_/, "");

    const source      = `./${folder}`;
    const destination = `${GENERATED_FILES_FOLDER}/${folderWithoutLeadingUnderscore}`;

    copy({source, destination});

  }

  const extras = ["client.js"];

  for (let source of extras) {
    const destination = `${GENERATED_FILES_FOLDER}/${source}`;
    copy({ source, destination });
  }

  // _public is a general folder for any static file to be served from “/”
  const source      = `./_public`;
  const destination = `${GENERATED_FILES_FOLDER}`;

  copy({source, destination});
}


function build() {

  if (galleryData) generateIndexPage();

  generateAllAlbums();

  copyAllStaticFiles();

  generateError404Page();

  if (config.askSearchEnginesNotToIndex !== true) {
    generateRobotsText({ host: config.host });
    generateSiteMap({ host: config.host });
  } else {
    console.log("Removing sitemap.xml");
    removeFile({ pageURL: "/", filename: "sitemap.xml" });

    console.log("Removing robots.txt");
    removeFile({ pageURL: "/", filename: "robots.txt" });
  }

  console.log(`Build files saved to: ${GENERATED_FILES_FOLDER}`);

}


build();

