
import fs from "fs";

import express from "express";
import slashes from "connect-slashes";
import fetch from "node-fetch";

import { render } from "./web_modules/preact-render-to-string.js";

import { DefaultLayout } from "./layouts/default.js";
import { ParentAlbumLayout } from "./layouts/parent-album.js";
import { IndexPage } from "./pages/index.js";
import { ParentAlbumPage } from "./pages/parent-album.js";
import { getInitialPageTitle} from "./components/picture-gallery.js";

import { albums } from "./albums.js";

const port = parseInt(process.env.PORT, 10) || 5000;
const server = express();

async function getData(url) {
  const response = await fetch(url);
  return response.json();
}

function servePage(req, res) {

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
    let album;
    if (data.albums) {
      const childAlbumURI = urlArray[1];
      const childAlbum = data.albums.filter(album => album.uri === childAlbumURI)[0];
      console.log(childAlbum);

      if (childAlbum) {
        album = {
          ...childAlbum,
          uri: `${data.uri}/${childAlbum.uri}`,
          parent: data
        };
      } else {
        album = data;
        const title   = album.title;
        const content = render(ParentAlbumPage({ parent: album, children: album.albums }));
        res.send(ParentAlbumLayout({ title, content }));

        return;
      }
    } else {
      album = data;
    }

    const title   = getInitialPageTitle({ getPageURL, album, pictures: album.pictures });
    const content = render(IndexPage({ getPageURL, album, pictures: album.pictures }));

    res.send(DefaultLayout({ title, content }));
  })
}

function serveClientJS(req, res) {
  const clientJS = fs.readFileSync("./client.js", 'utf8');

  res.setHeader("Content-Type", "application/javascript");
  res.send(clientJS);
}

const staticFolders = [
  "api",
  "archives",
  "components",
  "css",
  "helpers",
  "machines",
  "pictures",
  "web_modules"
];

for (let folder of staticFolders) {
  server.use( `/${folder}`, express.static( `./${folder}` ) );
}

server.get("/client.js", serveClientJS);

// TODO: Redirect to canonical URL:
// https://expressjs.com/en/api.html#res.redirect
for (let album of albums) {
  server.get(`/${album}/$`, servePage); // Albums
  server.get(`/${album}/*/$`, servePage); // Pictures or child albums
}

// Add trailing slashes to URLs: /wildflowers => /wildflowers/
server.use(slashes());

server.listen(port, err => {
  if (err) throw err;
  console.log(`Ready on http://localhost:${port}`);
});

