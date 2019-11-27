
import fs from "fs";

// https://github.com/gulpjs/gulp
import gulp from "gulp";

// https://www.npmjs.com/package/gulp-image-resize
import imageResize from "gulp-image-resize";

import { exec } from "child_process";

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
    optimizeImages();
  }
}

function optimizeImages() {
  for (let album of albums) {
    // for (let size of SIZES) {
    for (let size of [16]) {
      // const files = getAllFilesFromFolder(`_pictures/${ album }/${size}-wide`);
      // imageOptim.optim(files);

      // https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js#answer-20643568
      exec(`imageoptim --no-stats '_pictures/**/${size}-wide/*'`, (err, stdout, stderr) => {
        if (err) {
          // node couldn't execute the command
          return;
        }

        // the *entire* stdout and stderr (buffered)
        if (stdout) console.log(stdout);
        if (stderr) console.log(stderr);
      });
    }
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

