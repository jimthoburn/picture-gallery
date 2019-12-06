
import fs from "fs";

// https://github.com/gulpjs/gulp
import gulp from "gulp";

// https://www.npmjs.com/package/gulp-image-resize
import imageResize from "gulp-image-resize";

import parallel from "concurrent-transform";

import os from "os";

const galleryData = JSON.parse(fs.readFileSync("./_api/index.json", "utf8"));

const secretAlbums = fs.existsSync("./_secret_albums.json")
  ? JSON.parse(fs.readFileSync("./_secret_albums.json", "utf8"))
  : [];

const albums = galleryData.albums.concat(secretAlbums);

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

function generateImages(size, imagePath) {
  console.log('generateImages: ' + size + ' :: ' + imagePath);

  let options = {
    upscale: false,
    width: size
    // interlace: "Line" // Make the image “progressive” // https://fettblog.eu/snippets/node.js/progressive-jpegs-gm/
  }

  gulp.src(imagePath + "/original/*.{jpg,png}")
    .pipe(parallel(
      imageResize(options),
      os.cpus().length
    ))
    .pipe(gulp.dest(imagePath + "/" + size + "-wide"))
    .on('end', generateNext);
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

