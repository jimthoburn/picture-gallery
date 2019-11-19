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

import { DefaultLayout } from "./layouts/default.js";
import { WithoutClientLayout } from "./layouts/without-client.js";
import { IndexPage } from "./pages/index.js";
import { AlbumPage } from "./pages/album.js";
import { ParentAlbumPage } from "./pages/parent-album.js";
import { Error404Page, error404PageTitle } from "./pages/404.js";
import { Error500Page, error500PageTitle } from "./pages/500.js";
import { getInitialPageTitle} from "./components/picture-gallery.js";

const galleryData = JSON.parse(fs.readFileSync("./_api/index.json", "utf8"));

const secretAlbums = fs.existsSync("./_secret_albums.json")
  ? JSON.parse(fs.readFileSync("./_secret_albums.json", "utf8"))
  : [];

const albums = galleryData.albums.concat(secretAlbums);

const port = parseInt(process.env.PORT, 10) || 5000;
const server = express();

async function getData(url) {
  const response = await fetch(url);
  return response.json();
}

function serveIndexPage(req, res, next) {
  Promise.all(galleryData.albums.map(
    albumURI => getData(`${req.protocol}://${req.get("host")}/api/${albumURI}.json`)
  )).then(albums => {
    const { title, hideFromSearchEngines } = galleryData;
    const content = render(IndexPage({ ...galleryData, albums }));

    const beautifiedHTML = jsBeautify.html_beautify(WithoutClientLayout({ title, content, hideFromSearchEngines }));
    res.send(beautifiedHTML);
  }).catch(function(err) {
    console.error(err.stack);
    sendError500Page(err, req, res, next);
  });
}

function serveAlbumPage(req, res) {

  function getPageURL() {
    // https://stackoverflow.com/questions/10183291/how-to-get-the-full-url-in-express
    return `${req.protocol}://${req.get("host")}${req.originalUrl}`;
  }

  // https://example.com/wildflowers/7/  ==>  /wildflowers/
  let urlArray = getPageURL().split("://").pop().split("?").shift().split("/");
  urlArray.shift(); // Remove the domain and port
  const albumURI = urlArray[0];
  console.log(albumURI);

  getData(`${req.protocol}://${req.get("host")}/api/${albumURI}.json`).then(data => {
    let album

    // If this is a parent album
    if (data.albums) {
      const childAlbumURI = urlArray[1];
      const childAlbum = data.albums.filter(album => album.uri === childAlbumURI)[0];
      console.log(childAlbum);

      if (childAlbum) {
        album = {
          ...childAlbum,
          uri: `${data.uri}/${childAlbum.uri}`,
          parent: data,
          hideFromSearchEngines: data.hideFromSearchEngines
        };
      } else {
        album = data;

        const { title, hideFromSearchEngines } = album;
        const content = render(ParentAlbumPage({ parent: album, children: album.albums }));

        const beautifiedHTML = jsBeautify.html_beautify(WithoutClientLayout({ title, content, hideFromSearchEngines }));
        res.send(beautifiedHTML);

        return;
      }
    } else {
      album = data;
    }

    const title   = getInitialPageTitle({ getPageURL, album, pictures: album.pictures });
    const content = render(AlbumPage({ getPageURL, album, pictures: album.pictures }));
    const { hideFromSearchEngines } = album;

    const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({ title, content, hideFromSearchEngines }));
    res.send(beautifiedHTML);
  }).catch(function(err) {
    console.error(err.stack);
    sendError500Page(err, req, res, next);
  });
}

function sendError404Page(req, res, next) {

  const title   = error404PageTitle;
  const content = render(Error404Page());

  const beautifiedHTML = jsBeautify.html_beautify(WithoutClientLayout({ title, content }));
  res.status(404).send(beautifiedHTML);
}

function sendError500Page(err, req, res, next) {
  const title   = error500PageTitle;
  const content = render(Error500Page({ errorMessage: err.stack }));

  const beautifiedHTML = jsBeautify.html_beautify(WithoutClientLayout({ title, content }));
  res.status(500).send(beautifiedHTML);
}



server.get("/", serveIndexPage);

for (let album of albums) {
  server.get(`/${album}/$`, serveAlbumPage); // Albums
  server.get(`/${album}/*/$`, serveAlbumPage); // Pictures
}

const staticFolders = [
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

server.use( "/api", express.static( "./_api") );

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

