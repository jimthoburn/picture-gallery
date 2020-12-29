
import fs                   from "fs-extra";
import mkdirp               from "mkdirp";
import chalk                from "chalk";

import { config }           from "./_config.js";

import { getAlbumsByURL }   from "./data-file-system/albums-by-url.js";
import { getSourceByURL }   from "./get-source/by-url.js";
import { getError404HTML }  from "./get-source/error.js";


const GENERATED_FILES_FOLDER = `./${config.buildFolder}`;


async function createFile({ pageURL, filename, output }) {

  const writePath = GENERATED_FILES_FOLDER + pageURL;
  const fileName = `${writePath}/${filename ? filename : "index.html"}`;

  try {
    await mkdirp(writePath);
    fs.writeFileSync(fileName, output, 'utf8', (err) => {
      if (err) {
        console.log(err);
      }
    });
  } catch(e) {
    console.error(e);
  }
}

function removeFile({ pageURL, filename }) {
  const writePath = GENERATED_FILES_FOLDER + pageURL;

  const path = `${writePath}/${filename ? filename : "index.html"}`;
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}

function copy({source, destination}) {
  // console.log(`📂 Copying files from: ${source}`);

  // https://www.npmjs.com/package/fs-extra
  fs.copy(source, destination, function (err) {
    if (err){
      console.log('An error occured while copying the folder.')
      return console.error(err)
    }
  });
}

function buildStaticFiles() {
  console.log(`📂 Preparing static files`);
  for (let folder of config.staticFolders) {

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
  console.log(`📗 Preparing albums`);
  for (let url of urls) {
    getSourceByURL(url)
      .then(html => createFile({ pageURL: url, output: html }))
      .catch(err => console.error(err));
  }
}

function buildRobotsText() {
  console.log(`🤖 Preparing robots.txt`);
  getSourceByURL("/robots.txt")
    .then(text => createFile({ pageURL: "/", filename: "robots.txt", output: text }))
    .catch(err => console.error(err));
}

function buildSiteMap() {
  console.log(`🗺  Preparing sitemap.xml`);
  getSourceByURL("/sitemap.xml")
    .then(xml => createFile({ pageURL: "/", filename: "sitemap.xml", output: xml }))
    .catch(err => console.error(err));
}

function buildError404Page() {
  console.log(`🚥 Preparing 404 "not found" page`);
  createFile({ pageURL: "/", filename: "404.html", output: getError404HTML() });
}

function build(urls) {

  buildGallery(urls);
  buildStaticFiles();

  if (config.askSearchEnginesNotToIndex !== true && config.host) {
    buildRobotsText();
    buildSiteMap();
  } else {
    if (config.askSearchEnginesNotToIndex === true) console.log("⚠️ ", chalk.italic("askSearchEnginesNotToIndex"), "is set to", chalk.italic(true), "in", chalk.italic("_config.js"));
    if (!config.host) console.log("⚠️ ", chalk.italic("host"), "is not set in", chalk.italic("_config.js"));
    console.log("⚠️  Skipping sitemap.xml");
    removeFile({ pageURL: "/", filename: "sitemap.xml" });

    console.log("⚠️  Skipping robots.txt");
    removeFile({ pageURL: "/", filename: "robots.txt" });
  }

  buildError404Page();
  
  console.log("");
  console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
  console.log("🏁", chalk.cyan(`Build files saved to`), chalk.italic(config.buildFolder));
  console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
  console.log("");
}

console.log("");
console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
console.log("⏱️ ", chalk.cyan("Starting build"));
console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
console.log("");
getAlbumsByURL().then(albumURLs => {
  build(["/", ...albumURLs]);
});

