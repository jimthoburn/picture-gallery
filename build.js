
import fs from "fs-extra";
import mkdirp from "mkdirp";
import jsBeautify from "js-beautify";

import { render } from "./web_modules/preact-render-to-string.js";

import { DefaultLayout } from "./layouts/default.js";
import { WithoutClientLayout } from "./layouts/without-client.js";
import { AlbumPage } from "./pages/album.js";
import { IndexPage } from "./pages/index.js";
import { ParentAlbumPage } from "./pages/parent-album.js";
import { getInitialPageTitle } from "./components/picture-gallery.js";

const galleryData = JSON.parse(fs.readFileSync("./_data/index.json", 'utf8'));

import { albums } from "./albums.js";

const GENERATED_FILES_FOLDER = "./_site";

// let watch = false;
// 
// 
// process.argv.forEach((val, index) => {
//   if (val === "--watch") {
//     watch = true;
//   }
// });


const staticFolders = [
  "archives",
  "components",
  "css",
  "helpers",
  "machines",
  "pictures",
  "web_modules"
];

const rebuildOnChange = [
  "layouts",
  "pages",
  "components",
  "helpers",
  "web_modules"
];


function createFile({ pageURL, html }) {
  // console.log('**** ');
  // console.log('createFile for ' + pageURL);
  // console.log('html ' + html);

  let writePath = GENERATED_FILES_FOLDER + pageURL;

  let filename = "index.html";

  let output = html;

  mkdirp(writePath, function (err) {
    if (err) {
      console.error(err);
    } else {
      fs.writeFileSync(writePath + '/' +  filename, output, 'utf8', (err) => {
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


function generateAlbum({ album }) {

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

    const renderedHTML = DefaultLayout({ title, content });
    const beautifiedHTML = jsBeautify.html_beautify(renderedHTML);

    createFile({ pageURL, html: beautifiedHTML });
  }
}


function generateIndexPage() {
  console.log(`Generating index page`);
  const albums = galleryData.albums.map(
    albumURI => JSON.parse(fs.readFileSync(`./_data/${albumURI}.json`, 'utf8'))
  );
  const title   = galleryData.title;
  const content = render(IndexPage({ ...galleryData, albums }));

  const beautifiedHTML = jsBeautify.html_beautify(WithoutClientLayout({ title, content }));
  createFile({ pageURL: `/`, html: beautifiedHTML });
}


function generateAll() {
  for (let nextAlbumName of albums) {

    const album = JSON.parse(fs.readFileSync(`./_data/${nextAlbumName}.json`, "utf8"));

    if (album.albums) {
      const urlsToGenerate = [`/${ album.uri }/`];
      console.log(`Generating group album for: ${ album.title }`);

      for (let pageURL of urlsToGenerate) {

        console.log(`Generating page for: ${pageURL}`);

        const title   = album.title;
        const content = render(ParentAlbumPage({ parent: album, children: album.albums }));

        const renderedHTML = WithoutClientLayout({ title, content });
        const beautifiedHTML = jsBeautify.html_beautify(renderedHTML);

        createFile({ pageURL, html: beautifiedHTML });
      }

      for (let childAlbum of album.albums) {
        generateAlbum({ 
          album: {
            ...childAlbum,
            uri: `${album.uri}/${childAlbum.uri}`,
            parent: album
          }
        });
      }
    } else {
      generateAlbum({ album });
    }
  }
}


function copyAll() {
  for (let folder of staticFolders) {

    const source      = `./${folder}`;
    const destination = `${GENERATED_FILES_FOLDER}/${folder}`;

    // if (watch) {
    //   fs.watch(source, (eventType, filename) => {
    //     console.log(`event type is: ${eventType}`);
    //     if (filename) {
    //       console.log(`filename provided: ${filename}`);
    //     } else {
    //       console.log('filename not provided');
    //     }
    //     console.log(`Change detected in ${source}`);
    //     console.log(`Copying files…`);
    //     copy({source, destination});
    //   });
    // }

    copy({source, destination});

  }

  // Copy _data as /api
  copy({source: "./_data", destination: `${GENERATED_FILES_FOLDER}/api`});

  const extras = ["client.js", "pages/404.html"];

  for (let source of extras) {
    const destination = `${GENERATED_FILES_FOLDER}/${source.replace("pages/", "")}`;
    copy({ source, destination });

    // if (watch) {
    //   fs.watch(source, (eventType, filename) => {
    //     console.log(`event type is: ${eventType}`);
    //     if (filename) {
    //       console.log(`filename provided: ${filename}`);
    //     } else {
    //       console.log('filename not provided');
    //     }
    //     console.log(`Change detected in ${source}`);
    //     console.log(`Copying files…`);
    //     copy({source, destination});
    //   });
    // }
  }

}


function build() {

  // fs.removeSync(GENERATED_FILES_FOLDER);

  generateAll();

  // if (watch) {
  //   for (let folder of rebuildOnChange) {
  //     const source      = `./${folder}`;
  //     fs.watch(source, (eventType, filename) => {
  //       console.log(`event type is: ${eventType}`);
  //       if (filename) {
  //         console.log(`filename provided: ${filename}`);
  //       } else {
  //         console.log('filename not provided');
  //       }
  //       console.log(`Change detected in ${source}`);
  //       console.log(`Regenerating…`);
  //       generateAll();
  //     });
  //   }
  // }

  if (galleryData) generateIndexPage();

  copyAll();

  console.log(`Build files saved to: ${GENERATED_FILES_FOLDER}`);

  // if (watch) {
  //   console.log("Watching files…");
  // } else {
  //   console.log("Not watching files. Enable with `--watch`");
  // }
}


build();

