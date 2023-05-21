
import fs from "node:fs";
import { mkdirp } from "mkdirp";
import sizeOf from "image-size";
import chalk from "chalk";
import sharp from "sharp";

import { getAlbumNamesFromPicturesFolder } from "../data-file-system/albums-from-pictures-folder.js";

const overwrite = false; // Set this “true” to re-generate existing image files.
const startTime = Date.now();

const configData  = JSON.parse(fs.readFileSync("./_api/config.json", "utf8"));

const [secretAlbums] = getAlbumNamesFromPicturesFolder();

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

function generateOneImage({ width, sourceFile, destinationFolder }) {
  return new Promise(async (resolve, reject) => {

    const pathBits = sourceFile.split("/");
    const fileName = pathBits[pathBits.length - 1];
    const fileNameBits = fileName.split(".");
    const fileNameBase = fileNameBits.slice(0, fileNameBits.length - 1).join(".");

    const sourceFileSize = sizeOf(sourceFile); // https://github.com/image-size/image-size

    console.log("");
    console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
    console.log("⏱️ ", chalk.cyan(`generateOneImage: sourceFileSize: `), { sourceFileSize });
    console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
    console.log("");
    console.log(`Time elapsed:\n${Date.now() - startTime} milliseconds\n`);
    console.log("");

    // JPEG
    const jpegFileName = `${destinationFolder}/${fileNameBase}.jpeg`;
    if (fs.existsSync(jpegFileName) && overwrite !== true) {
      console.log(``);
      console.log(`${jpegFileName} already exists. Skipping…`);
    } else {
      console.log(``);
      console.log(`🖼  Generating JPEG`);

      const originalImage = await sharp(sourceFile);
      const resizedImage =
        (width != sourceFileSize.width)
        ? await originalImage.resize({ width, withoutEnlargement: true })
        : originalImage;
      const jpegImage = resizedImage.jpeg({ mozjpeg: true, quality: 65 });

      jpegImage.toFile(jpegFileName);
    }

    if (width > 16) { // Skip WebP and AVIF for the smallest size (16px), since it’s only used for preview images

      // WebP
      if (configData.imageFormats && configData.imageFormats.webp) {
        const webpFileName = `${destinationFolder}/${fileNameBase}.webp`;
        if (fs.existsSync(webpFileName) && overwrite !== true) {
          console.log(``);
          console.log(`${webpFileName} already exists. Skipping…`);
        } else {
          console.log(``);
          console.log(`🖼  Generating WebP`);

          const originalImage = await sharp(sourceFile);
          const resizedImage =
            (width != sourceFileSize.width)
            ? await originalImage.resize(width, null, { withoutEnlargement: true })
            : originalImage;
          const webpImage = resizedImage.webp({ quality: 50 });
    
          webpImage.toFile(webpFileName);
        }
      }
      
      // AVIF
      if (configData.imageFormats && configData.imageFormats.avif) {
        const avifFileName = `${destinationFolder}/${fileNameBase}.avif`;
        if (fs.existsSync(avifFileName) && overwrite !== true) {
          console.log(``);
          console.log(`${avifFileName} already exists. Skipping…`);
        } else {

          console.log(``);
          console.log(`🖼  Generating AVIF`);

          const originalImage = await sharp(sourceFile);
          const resizedImage =
            (width != sourceFileSize.width)
            ? await originalImage.resize(width, null, { withoutEnlargement: true })
            : originalImage;
          const avifImage = resizedImage.avif({ quality: 50, effort: 1 });
    
          avifImage.toFile(avifFileName);
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
  console.log("");
  console.log(`Time elapsed:\n${Date.now() - startTime} milliseconds\n`);
  console.log("");

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
    console.log(`Total time elapsed: ${Date.now() - startTime} milliseconds`);
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
nextFolderCursor = 0;
generateNextFolder();

