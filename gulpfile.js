// https://github.com/gulpjs/gulp
var gulp = require('gulp');

// https://www.npmjs.com/package/gulp-image-resize
var imageResize = require('gulp-image-resize');

var parallel = require("concurrent-transform");
var os = require("os");

const SIZES = [
  384,
  512,
  768,
  1024,
  1536,
  2048,
  6000
];

const FOLDER_NAMES = require("./albums-cjs.js")

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

var nextCursor = 0;
var nextImagePath;
function generateNext() {
  if (nextCursor < SIZES.length) {
    console.log('generateNext: ' + nextCursor + ' :: ' + SIZES[nextCursor] + ' :: ' + nextImagePath);
    generateImages(SIZES[nextCursor], nextImagePath);
    nextCursor++;
  } else {
    generateNextFolder();
  }
}

var nextFolderCursor = 0;
function generateNextFolder() {
  if (nextFolderCursor < FOLDER_NAMES.length) {
    console.log('generateNextFolder: ' + nextFolderCursor + ' :: ' + FOLDER_NAMES[nextFolderCursor]);

    nextCursor = 0;
    nextImagePath = `pictures/${ FOLDER_NAMES[nextFolderCursor] }`;
    generateNext();

    nextFolderCursor++;
  }
}

gulp.task("default", function() {

  console.log("gulp default task is starting")

  // Generate images
  nextFolderCursor = 0;
  generateNextFolder();

});
