
import fs from "fs";
import mkdirp from "mkdirp";
import { exec } from "child_process";
import sizeOf from "image-size";
import chalk  from "chalk";

import { getAlbumNamesFromPicturesFolder } from "../data-file-system/albums-from-pictures-folder.js";


const configData  = JSON.parse(fs.readFileSync("./_api/config.json", "utf8"));
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
  6000,
];

const cavif = "./lib/cavif-0.6.4/mac/cavif";

const imageMagick = "magick";

// SHIM: Use the installed squoosh-cli
const squoosh = `node node_modules/.bin/squoosh-cli`;
// const squoosh = `npx @squoosh/cli@^0.6.0`;

/*
// https://developers.google.com/speed/webp/docs/api
const webp = {
  quality: 75,       // between 0 and 100. For lossy, 0 gives the smallest
                      // size and 100 the largest. For lossless, this
                      // parameter is the amount of effort put into the
                      // compression: 0 is the fastest but gives larger
                      // files compared to the slowest, but best, 100.
  target_size: 0,
  target_PSNR: 0,
  method: 4,          // quality/speed trade-off (0=fast, 6=slower-better).
  sns_strength: 50,
  filter_strength: 60,
  filter_sharpness: 0,
  filter_type: 1,
  partitions: 0,
  segments: 4,
  pass: 1,
  show_compressed: 0,
  preprocessing: 0,
  autofilter: 0,
  partition_limit: 0,
  alpha_compression: 1,
  alpha_filtering: 1,
  alpha_quality: 100,
  lossless: 0,         // Lossless encoding (0=lossy(default), 1=lossless).
  exact: 0,
  image_hint: 0,
  emulate_jpeg_size: 0,
  thread_level: 0,
  low_memory: 0,
  near_lossless: 100,
  use_delta_palette: 0,
  use_sharp_yuv: 0,
};

// https://research.mozilla.org/av1-media-codecs/
// https://jakearchibald.com/2020/avif-has-landed/
// https://netflixtechblog.com/avif-for-next-generation-image-coding-b1d75675fe4
const avif = {
  minQuantizer: 0,
  maxQuantizer: 33,
  minQuantizerAlpha: 0,
  maxQuantizerAlpha: 63,
  tileColsLog2: 0,
  tileRowsLog2: 0,
  speed: 1, // 8 ==> fastest
  subsample: 1,
};

const rotate = {
  numRotations: 0, // degrees = (numRotations * 90) % 360
}

const quant = {
  numColors: 255,
  dither: 1.0,
}
*/

function doCommand(command) {
  return new Promise((resolve, reject) => {
    // https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js#answer-20643568
    console.log(command);
    exec(`${command} && echo 'finished task'`, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        console.error(err);
        reject(err);
        return;
      }

      // the *entire* stdout and stderr (buffered)
      if (stdout) {
        console.log(stdout);
        resolve();
      }
      if (stderr) {
        console.log(stderr);
        reject(stderr);
      }
    });
  });
}

function stringify(options) {
  // Remove quotes
  return `'${JSON.stringify(options).replace(/\"/g, ``)}'`;
}

// https://web.dev/squoosh-v2/
// https://github.com/GoogleChromeLabs/squoosh/tree/dev/cli
// https://github.com/GoogleChromeLabs/squoosh/blob/dev/cli/src/codecs.js
function generateOneImage({ width, sourceFile, destinationFolder }) {
  return new Promise(async (resolve, reject) => {

    const pathBits = sourceFile.split("/");
    const fileName = pathBits[pathBits.length - 1];
    const fileNameBits = fileName.split(".");
    const fileNameBase = fileNameBits.slice(0, fileNameBits.length - 1).join(".");
    const fileExtension = fileNameBits[fileNameBits.length - 1];

    const sourceFileSize = sizeOf(sourceFile); // https://github.com/image-size/image-size

    console.log("");
    console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
    console.log("⏱️ ", chalk.cyan(`generateOneImage: sourceFileSize: `), { sourceFileSize });
    console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));

    const mozjpeg = {
      quality: 65,
      baseline: false,
      arithmetic: false,
      progressive: true,
      optimize_coding: true,
      smoothing: 0,
      color_space: 3 /*YCbCr*/,
      quant_table: 3,
      trellis_multipass: false,
      trellis_opt_zero: false,
      trellis_opt_table: false,
      trellis_loops: 1,
      auto_subsample: true,
      chroma_subsample: 2,
      separate_chroma_quality: false,
      chroma_quality: 75,
    };

    const oxipng  = {
      level: 1
    };

    const resize = {
      width: Math.min(width, sourceFileSize.width), // SHIM: Avoid scaling the image up
      // height,
    }

    const squooshOptions = [
      `-d ${destinationFolder}`,
    ];
    if (resize.width != sourceFileSize.width) {
      squooshOptions.push(
        `--resize ${stringify(resize)}`,
      );
    }

    const cavifOptions = [
      `--quality=${50}`,
      `--speed=1`, // Encoding speed between 1 (best, but slowest) and 10 (fastest)
      `--overwrite`,
      // `--color=rgb`,

      `-o '${destinationFolder}/${fileNameBase}.avif'`,
    ];
    
    // https://imagemagick.org/script/defines.php
    const imageMagickOptions = [
      `'${sourceFile}'`,
    ];
    if (resize.width != sourceFileSize.width) {
      const infinity = 9999;
      imageMagickOptions.push(
        `-resize ${resize.width}x${infinity}`
      );
    }

    // JPEG
    console.log(``);
    console.log(`🖼  Generating JPEG`);
    await doCommand(`${squoosh} ${ [`--mozjpeg ${stringify(mozjpeg)}`,...squooshOptions].join(" ") } ${sourceFile}`);

    if (width > 16) { // Skip WebP and AVIF for the smallest size (16px), since it’s only used for preview images

      // WebP
      if (configData.imageFormats && configData.imageFormats.webp) {
        console.log(``);
        console.log(`🖼  Generating WebP`);
        // SHIM: Use ImageMagick for WebP images, since it’s tricky to produce
        //       WebP images with Squoosh that are similar to JPEG in quality & file size
        await doCommand(`${imageMagick} ${ [
          ...imageMagickOptions,
          `-quality ${50}`,
          `'${destinationFolder}/${fileNameBase}.webp'`,
        ].join(" ") }`);
      }
      
      if (configData.imageFormats && configData.imageFormats.avif) {

        // AVIF
        console.log(``);
        console.log(`🖼  Generating AVIF`);
        // SHIM: Use Cavif for the AVIF images, since 
        //       Squoosh seems to have an upper limit of 4500 pixels
        //       https://github.com/kornelski/cavif-rs
        
        if (resize.width != sourceFileSize.width) { 
          // SHIM: Use a temporary TIFF file as the source image, since cavif doesn’t have a resize feature
          await doCommand(`${imageMagick} ${ [
            ...imageMagickOptions,
            `'${destinationFolder}/${fileNameBase}.tiff'`,
          ].join(" ") }`);

          await doCommand(`${cavif} ${ cavifOptions.join(" ") } '${destinationFolder}/${fileNameBase}.tiff'`);

          // Delete temporary TIFF
          fs.unlinkSync(`${destinationFolder}/${fileNameBase}.tiff`);
  
        } else {
          await doCommand(`${cavif} ${ cavifOptions.join(" ") } '${sourceFile}'`);
        }
      }

    }

    resolve();
  });
}


async function generateImages({ width, imagePath }) {

  console.log("");
  console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
  console.log("⏱️ ", chalk.cyan('generateImages: ' + width + ' :: ' + imagePath));
  console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));

  const sourceFolder      = `${imagePath}/original`;
  const destinationFolder = `${imagePath}/${width}-wide`;

  const files = getAllFilesFromFolder(sourceFolder);

  try {
    await mkdirp(destinationFolder);

    for (let index = 0; index < files.length; index++) {
      const sourceFile = files[index];
      const pathBits = sourceFile.split("/");
      const fileName = pathBits[pathBits.length - 1];
      console.log(chalk.cyan(`${nextFolderCursor} of ${albums.length} albums`));
      console.log(chalk.cyan(`${nextCursor} of ${SIZES.length} sizes`));
      console.log(chalk.cyan(`${index + 1} of ${files.length} pictures`));
      await generateOneImage({
        width,
        sourceFile,
        destinationFolder,
      });
    }

  } catch(e) {
    console.error(e);
  }

  generateNextSize();
}

let nextCursor = 0;
let nextImagePath;
function generateNextSize() {
  if (nextCursor < SIZES.length) {
    console.log('generateNext: ' + nextCursor + ' :: ' + SIZES[nextCursor] + ' :: ' + nextImagePath);
    generateImages({
      width: SIZES[nextCursor],
      imagePath: nextImagePath
    });
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
    generateNextSize();

    nextFolderCursor++;
  } else {
    console.log("");
    console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
    console.log("🏁", chalk.cyan(`Finished creating images`));
    console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
    console.log("");
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
nextFolderCursor = 2;
generateNextFolder();

