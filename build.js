
import fs from "fs-extra";
import mkdirp from "mkdirp";
import jsBeautify from "js-beautify";

import { render } from "./web_modules/preact-render-to-string.js";

import { DefaultLayout } from "./layouts/default.js";
import { WithoutClientLayout } from "./layouts/without-client.js";
import { AlbumPage } from "./pages/album.js";
import { IndexPage } from "./pages/index.js";
import { ParentAlbumPage } from "./pages/parent-album.js";
import { Error404Page, error404PageTitle } from "./pages/404.js";
import { getInitialPageTitle } from "./components/picture-gallery.js";

const galleryData = JSON.parse(fs.readFileSync("./_data/index.json", 'utf8'));

import { albums } from "./albums.js";

const GENERATED_FILES_FOLDER = "./_site";

const staticFolders = [
  "archives",
  "components",
  "css",
  "helpers",
  "machines",
  "pictures",
  "web_modules"
];


function createFile({ pageURL, filename, html }) {
  // console.log('**** ');
  // console.log('createFile for ' + pageURL);
  // console.log('html ' + html);

  let writePath = GENERATED_FILES_FOLDER + pageURL;

  let output = html;

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


function generateAlbum({ album, hideFromSearchEngines }) {

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
    const content = render(AlbumPage({ getPageURL, pictures: album.pictures, album }));

    const renderedHTML = DefaultLayout({ title, content, hideFromSearchEngines });
    const beautifiedHTML = jsBeautify.html_beautify(renderedHTML);

    createFile({ pageURL, html: beautifiedHTML });
  }
}


function generateIndexPage() {
  console.log(`Generating index page`);
  const albums = galleryData.albums.map(
    albumURI => JSON.parse(fs.readFileSync(`./_data/${albumURI}.json`, 'utf8'))
  );
  const { title, hideFromSearchEngines } = galleryData;
  const content = render(IndexPage({ ...galleryData, albums }));

  const beautifiedHTML = jsBeautify.html_beautify(WithoutClientLayout({ title, content, hideFromSearchEngines }));
  createFile({ pageURL: "/", filename: "index.html", html: beautifiedHTML });
}


function generateError404Page() {
  console.log(`Generating error 404 page`);
  const title   = error404PageTitle;
  const content = render(Error404Page());

  const beautifiedHTML = jsBeautify.html_beautify(WithoutClientLayout({ title, content }));
  createFile({ pageURL: "/", filename: "404.html", html: beautifiedHTML });
}


function generateAllAlbums() {
  for (let nextAlbumName of albums) {

    const album = JSON.parse(fs.readFileSync(`./_data/${nextAlbumName}.json`, "utf8"));

    if (album.albums) {
      console.log(`Generating group album for: ${ album.title }`);

      const pageURL = `/${ album.uri }/`;

      console.log(`Generating page for: ${ pageURL }`);

      const { title, hideFromSearchEngines } = album;
      const content = render(ParentAlbumPage({ parent: album, children: album.albums }));

      const renderedHTML = WithoutClientLayout({ title, content, hideFromSearchEngines });
      const beautifiedHTML = jsBeautify.html_beautify(renderedHTML);

      createFile({ pageURL, html: beautifiedHTML });

      for (let childAlbum of album.albums) {
        generateAlbum({ 
          album: {
            ...childAlbum,
            uri: `${album.uri}/${childAlbum.uri}`,
            parent: album
          },
          hideFromSearchEngines: album.hideFromSearchEngines
        });
      }
    } else {
      generateAlbum({ album, hideFromSearchEngines: album.hideFromSearchEngines });
    }
  }
}


function copyAllStaticFiles() {
  for (let folder of staticFolders) {

    const source      = `./${folder}`;
    const destination = `${GENERATED_FILES_FOLDER}/${folder}`;

    copy({source, destination});

  }

  // Copy _data as /api
  copy({source: "./_data", destination: `${GENERATED_FILES_FOLDER}/api`});

  const extras = ["client.js"];

  for (let source of extras) {
    const destination = `${GENERATED_FILES_FOLDER}/${source}`;
    copy({ source, destination });
  }

}


function build() {

  if (galleryData) generateIndexPage();

  generateAllAlbums();

  copyAllStaticFiles();

  generateError404Page();

  console.log(`Build files saved to: ${GENERATED_FILES_FOLDER}`);

}


build();

