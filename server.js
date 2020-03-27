
// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import express from "express";
import slashes from "connect-slashes";

import { config } from "./_config.js";
import { staticFolders } from "./data/static-folders.js";

import { getURLs }         from "./data-from-files-and-fetch/urls.js";
import { getSourceByURL } from "./get-source/by-url.js";
import { getError404HTML, getError500HTML } from "./get-source/error.js";


const port = parseInt(process.env.PORT, 10) || 4000;
const server = express();


function serveStaticFiles() {
  for (let folder of staticFolders) {
    const folderWithoutLeadingUnderscore = folder.replace(/^_/, "");
    server.use( `/${folderWithoutLeadingUnderscore}`, express.static( `./${folder}` ) );
  }

  // _public is a general folder for any static file to be served from “/”
  server.use(express.static("./_public"));

  server.get("/client.js", function(req, res) {
    res.sendFile("client.js", { root: __dirname });
  });
}

function serveGallery() {
  for (let url of ["/", ...getURLs()]) {
    console.log("serveGallery: " + encodeURI(url));
    server.get(encodeURI(url), (req, res) => {
      console.log("serveGallery: " + url);
      getSourceByURL(url)
        .then(html => res.send(html))
        .catch(err => res.status(500).send(getError500HTML(err)));
    });
  }
}

function serveRobotsText() {
  const url = "/robots.txt";
  server.get(url, function(req, res, next) {
    getSourceByURL(url)
      .then(text => res.type('text/plain').send(text))
      .catch(err => res.status(500).send(getError500HTML(err)));
  });
}

function serveSiteMap() {
  const url = "/sitemap.xml";
  server.get(url, async function(req, res, next) {
    getSourceByURL(url)
      .then(xml => res.type('text/xml').send(xml))
      .catch(err => res.status(500).send(getError500HTML(err)));
  });
}

function serve() {
  serveGallery();
  serveStaticFiles();

  if (config.askSearchEnginesNotToIndex !== true && config.host) {
    serveRobotsText();
    serveSiteMap();
  }

  // Add trailing slashes to URLs: /wildflowers => /wildflowers/
  server.use(slashes(true, { code: 302 })); // 302 Temporary redirects
  
  // serveError404Page();

  server.use(function (req, res, next) {
    console.log("serve 404: " + req.originalUrl);
    res.status(404).send(getError404HTML());
  });

  server.use(function (err, req, res, next) {
    res.status(500).send(getError500HTML(err));
  });

  server.listen(port, err => {
    if (err) throw err;
    console.log(`Ready on http://localhost:${port}`);
  });
}


setTimeout(() => {
  console.log("*** starting server ***");
  console.dir(getURLs());

  serve();
}, 1000);


