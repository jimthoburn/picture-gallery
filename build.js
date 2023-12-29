
import fs                   from "fs-extra";
import { mkdirp }           from "mkdirp";
import chalk                from "chalk";

import { config }           from "./_config.js";

import { getAlbumsByURL }   from "./data-file-system/albums-by-url.js";
import { getSourceByURL }   from "./get-source/by-url.js";
import { getError404HTML }  from "./get-source/error.js";


const GENERATED_FILES_FOLDER = `./${config.buildFolder}`;


async function createFile({ pageURL, filename, output }) {

  const writePath = GENERATED_FILES_FOLDER + pageURL;
  const fileName = `${writePath}/${filename ? filename : "index.html"}`;

  await mkdirp(writePath).catch(err => { throw err; });
  fs.writeFileSync(fileName, output, 'utf8', (err) => {
    if (err) {
      throw err;
    }
  });
}

async function removeFile({ pageURL, filename }) {
  const writePath = GENERATED_FILES_FOLDER + pageURL;

  const path = `${writePath}/${filename ? filename : "index.html"}`;
  if (fs.existsSync(path)) {
    fs.unlinkSync(path);
  }
}

function copy({source, destination}) {
  return new Promise((resolve, reject) => {
    console.log(`📂 Copying files from: ${source}`);

    // https://www.npmjs.com/package/fs-extra
    fs.copy(source, destination, function (err) {
      if (err){
        console.log('An error occured while copying the folder.')
        console.error(err);
        reject(err);
      }
      resolve();
    });
  });
}

async function buildStaticFiles() {
  console.log(`📂 Preparing static files`);
  for (let folder of config.staticFolders) {

    const folderWithoutLeadingUnderscore = folder.replace(/^_/, "");

    const source      = `./${folder}`;
    const destination = `${GENERATED_FILES_FOLDER}/${folderWithoutLeadingUnderscore}`;

    await copy({source, destination}).catch(err => { throw err; });
  }

  const extras = ["client.js"];

  for (let source of extras) {
    const destination = `${GENERATED_FILES_FOLDER}/${source}`;
    await copy({ source, destination }).catch(err => { throw err; });
  }

  // _public is a general folder for any static file to be served from “/”
  const source      = `./_public`;
  const destination = `${GENERATED_FILES_FOLDER}`;

  await copy({source, destination}).catch(err => { throw err; });
}

async function buildGallery(urls) {
  console.log(`📗 Preparing albums`);
  for (let url of urls) {
    const html = await getSourceByURL(url).catch(err => { throw err; });
    await createFile({
      pageURL: url,
      output: html
    }).catch(err => { throw err; });
  }
}

async function buildRobotsText() {
  console.log(`🤖 Preparing robots.txt`);
  const text = await getSourceByURL("/robots.txt").catch(err => { throw err; });
  await createFile({
    pageURL: "/",
    filename: "robots.txt",
    output: text
  }).catch(err => { throw err; });
}

async function buildSiteMap() {
  console.log(`🗺  Preparing sitemap.xml`);
  const xml = await getSourceByURL("/sitemap.xml").catch(err => { throw err; });
  await createFile({
    pageURL: "/",
    filename: "sitemap.xml",
    output: xml
  }).catch(err => { throw err; });
}

async function buildRedirectsFile() {
  console.log(`🗺  Preparing _redirects`);
  const text = await getSourceByURL("/_redirects").catch(err => { throw err; });
  await createFile({
    pageURL: "/",
    filename: "_redirects",
    output: text,
  }).catch(err => { throw err; });
}

async function buildError404Page() {
  console.log(`🚥 Preparing 404 "not found" page`);
  await createFile({
    pageURL: "/",
    filename: "404.html",
    output: getError404HTML()
  }).catch(err => { throw err; });
}

async function build(urls) {

  await buildGallery(urls);
  await buildStaticFiles();

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

  buildRedirectsFile();
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

