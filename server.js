
// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
import { dirname }          from 'path';
import { fileURLToPath }    from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import express              from "express";

import { config }           from "./_config.js";
import { getStaticFolders } from "./data/static-folders.js";

import { getAlbumURLs }     from "./data-from-files-and-fetch/album-urls.js";
import { getSourceByURL }   from "./get-source/by-url.js";
import { getError404HTML,
         getError500HTML }  from "./get-source/error.js";


const port = parseInt(process.env.PORT, 10) || config.serverPort;
const server = express();


function serveStaticFiles() {
  for (let folder of getStaticFolders()) {
    const folderWithoutLeadingUnderscore = folder.replace(/^_/, "");
    server.use( `/${folderWithoutLeadingUnderscore}`, express.static( `./${folder}` ) );
  }

  // _public is a general folder for any static file to be served from “/”
  server.use(express.static("./_public"));

  server.get("/client.js", function(req, res) {
    res.sendFile("client.js", { root: __dirname });
  });
}

function serveGallery(urls) {
  for (let url of urls) {
    console.log("serveGallery: " + encodeURI(url));
    server.get(encodeURI(url), (req, res) => {
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

function serveError404Page() {
  console.log(`Serving error 404 page`);
  server.use(function (req, res, next) {
    res.status(404).send(getError404HTML());
  });
}

function serveError500Page() {
  console.log(`Serving error 500 page`);
  server.use(function (err, req, res, next) {
    res.status(500).send(getError500HTML(err));
  });
}

function withoutTrailingSlash(url) {
  return url.replace(/\/$/, "");
}

function addTrailingSlashes(urls) {
  // Add trailing slashes to URLs: /wildflowers => /wildflowers/
  server.use(function(req, res, next) {
    const matches = urls.filter(url => encodeURI(withoutTrailingSlash(url)) === req.url);
    if (matches.length) {
      console.log("Adding a trailing slash to: " + req.url);
      res.redirect(302, matches[0]);
      return;
    }
    next();
  });
}

function serve(urls) {
  console.log(urls);

  addTrailingSlashes(urls);

  serveGallery(urls);
  serveStaticFiles();

  if (config.askSearchEnginesNotToIndex !== true && config.host) {
    serveRobotsText();
    serveSiteMap();
  }

  serveError404Page();
  serveError500Page();

  server.listen(port, err => {
    if (err) throw err;
    console.log(`Ready on http://localhost:${port}`);
  });
}

console.log("Starting server");
getAlbumURLs().then(albumURLs => {
  serve(["/", ...albumURLs]);
});

