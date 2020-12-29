
import fs from "fs";
import mkdirp from "mkdirp";

import gm from "gm";

import { getAlbumNamesFromPicturesFolder } from "../data-file-system/albums-from-pictures-folder.js";


const galleryData = JSON.parse(fs.readFileSync("./_api/index.json", "utf8"));

const [secretAlbums, secretAlbumGroups] = getAlbumNamesFromPicturesFolder();

const albums = secretAlbums;

const SIZES = [
  16,
  384,
  512,
  768,
  1024,
  1536,
  2048,
  6000
];

function getSize(gmFile) {
  return new Promise((resolve, reject) => {
    gmFile
      .size((err, size) => {
        if (!err) {
          resolve(size);
        } else {
          console.error(err);
          reject();
        }
      });
  });
}

// KUDOS: https://github.com/scalableminds/gulp-image-resize
function generateImage({ targetWidth, sourceFile, destinationFile }) {
  return new Promise(async (resolve, reject) => {
    const gmFile = gm(sourceFile);
    const imageSize = await getSize(gmFile);
    if (!imageSize) reject();

    const options = {
      width: Math.min(targetWidth, imageSize.width),
      height: imageSize.height,
    };

    gmFile
      .resize(options.width, options.height)
      .write(destinationFile, (err) => {
        if (!err) {
          resolve();
        } else {
          console.error(err);
          reject();
        }
      });

  });
}

async function generateImages(targetWidth, imagePath) {
  console.log('generateImages: ' + targetWidth + ' :: ' + imagePath);

  const sourceFolder      = `${imagePath}/original`;
  const destinationFolder = `${imagePath}/${targetWidth}-wide`
  
  const files = getAllFilesFromFolder(sourceFolder);

  try {
    await mkdirp(destinationFolder);

    for (let sourceFile of files) {
      const pathBits = sourceFile.split("/");
      const fileName = pathBits[pathBits.length - 1];
      await generateImage({
        targetWidth,
        sourceFile,
        destinationFile: `${destinationFolder}/${fileName}`,
      });
    }
  } catch(e) {
    console.error(e);
  }

  generateNext();
}

let nextCursor = 0;
let nextImagePath;
function generateNext() {
  if (nextCursor < SIZES.length) {
    console.log('generateNext: ' + nextCursor + ' :: ' + SIZES[nextCursor] + ' :: ' + nextImagePath);
    generateImages(SIZES[nextCursor], nextImagePath);
    nextCursor++;
  } else {
    generateNextFolder();
  }
}

let nextFolderCursor = 0;
function generateNextFolder() {
  if (nextFolderCursor < albums.length) {
    console.log('generateNextFolder: ' + nextFolderCursor + ' :: ' + albums[nextFolderCursor]);

    nextCursor = 0;
    nextImagePath = `_pictures/${ albums[nextFolderCursor] }`;
    generateNext();

    nextFolderCursor++;
  } else {
    console.log("Finished creating images");
  }
}

// https://stackoverflow.com/questions/20822273/best-way-to-get-folder-and-file-list-in-javascript#21459809
function getAllFilesFromFolder(dir) {

  let results = []

  fs.readdirSync(dir).forEach(function(file) {

    file = dir+'/'+file
    let stat = fs.statSync(file)

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFilesFromFolder(file))
    } else {
      if (!file.includes('DS_Store')) {
        results.push(file);
      }
    }

  })

  return results
}


// Generate images
nextFolderCursor = 0;
generateNextFolder();

