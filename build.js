
import fs     from "fs-extra";
import mkdirp from "mkdirp";

import { config }          from "./_config.js";
import { getStaticFolders }   from "./data/static-folders.js";

import { getURLs }         from "./data-from-files-and-fetch/urls.js";
import { getSourceByURL }  from "./get-source/by-url.js";
import { getError404HTML } from "./get-source/error.js";

const GENERATED_FILES_FOLDER = "./_site";


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

function buildStaticFiles() {
  for (let folder of getStaticFolders()) {

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

function buildGallery(urls) {
  for (let url of urls) {
    getSourceByURL(url)
      .then(html => createFile({ pageURL: url, output: html }))
      .catch(err => console.error(err));
  }
}

async function buildRobotsText() {
  console.log(`Generating robots.txt`);
  getSourceByURL("/robots.txt")
    .then(text => createFile({ pageURL: "/", filename: "robots.txt", output: text }))
    .catch(err => console.error(err));
}

function buildSiteMap() {
  console.log(`Generating sitemap.xml`);
  getSourceByURL("/sitemap.xml")
    .then(xml => createFile({ pageURL: "/", filename: "sitemap.xml", output: xml }))
    .catch(err => console.error(err));
}

function buildError404Page() {
  console.log(`Generating error 404 page`);
  createFile({ pageURL: "/", filename: "404.html", output: getError404HTML() });
}

function build(urls) {

  buildGallery(urls);
  buildStaticFiles();

  if (config.askSearchEnginesNotToIndex !== true && config.host) {
    buildRobotsText();
    buildSiteMap();
  } else {
    console.log("Removing sitemap.xml");
    removeFile({ pageURL: "/", filename: "sitemap.xml" });

    console.log("Removing robots.txt");
    removeFile({ pageURL: "/", filename: "robots.txt" });
  }

  buildError404Page();

  console.log(`Build files saved to: ${GENERATED_FILES_FOLDER}`);
}

getURLs().then(urls => {
  console.log("*** starting build ***");
  build(["/", ...urls]);
});

