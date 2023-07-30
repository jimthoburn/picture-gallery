import fs from "node:fs";
import { mkdirp } from "mkdirp";
import sizeOf from "image-size";
import chalk from "chalk";

import { getAlbumNamesFromPicturesFolder } from "../data-file-system/albums-from-pictures-folder.js";

const overwrite = false; // Set this “true” to re-create existing image files.
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

async function createOneImage({ sourceFile, destinationFolder }) {

  const pathBits = sourceFile.split("/");
  const fileName = pathBits[pathBits.length - 1];
  const fileNameBits = fileName.split(".");
  const fileNameBase = fileNameBits.slice(0, fileNameBits.length - 1).join(".");

  const sourceFileSize = sizeOf(sourceFile); // https://github.com/image-size/image-size

  console.log("");
  console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
  console.log(chalk.cyan(`createOneImage`));
  console.log("");
  console.log({ sourceFileSize, destinationFolder, fileNameBase });
  console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
  console.log("");

  const imagesToCreate = {};

  for (const width of SIZES) {
    imagesToCreate[width] = {};

    const jpegFileName = `${destinationFolder}/${width}-wide/${fileNameBase}.jpeg`;
    const webpFileName = `${destinationFolder}/${width}-wide/${fileNameBase}.webp`;
    const avifFileName = `${destinationFolder}/${width}-wide/${fileNameBase}.avif`;

    if (!fs.existsSync(jpegFileName) || overwrite === true) {
      imagesToCreate[width].jpeg = jpegFileName;
    } else {
      console.log(``);
      console.log(`✅ `, `Found ${jpegFileName} file (keeping existing image)`);
      console.log(``);
    }

    if (width > 16 && configData.imageFormats && configData.imageFormats.webp && (!fs.existsSync(webpFileName) || overwrite === true)) {
      imagesToCreate[width].webp = webpFileName;
    } else {
      if (fs.existsSync(webpFileName)) {
        console.log(``);
        console.log(`✅ `, `Found ${webpFileName} file (keeping existing image)`);
        console.log(``);
      };
    }

    if (width > 16 && configData.imageFormats && configData.imageFormats.avif && (!fs.existsSync(avifFileName) || overwrite === true)) {
      imagesToCreate[width].avif = avifFileName;
    } else {
      if (fs.existsSync(avifFileName)) {
        console.log(``);
        console.log(`✅ `, `Found ${avifFileName} file (keeping existing image)`);
        console.log(``);
      }
    }

  }

  const sizesWithImagesToCreate = SIZES.filter(width => imagesToCreate[width].jpeg || imagesToCreate[width].webp || imagesToCreate[width].avif);

  if (sizesWithImagesToCreate.length > 0) {

    // Load an image from a file
    const originalImageBlob = await Deno.readFile(sourceFile);
    // console.log({ originalImageBlob });

    // console.log({ imagesToCreate });

    await Promise.all(sizesWithImagesToCreate.map(
      (width) => {
        return new Promise(async (resolve, reject) => {
          const imageDescription = `${destinationFolder}/${width}-wide/${fileNameBase}`;

          const worker = new Worker(
            new URL("./images-worker.js", import.meta.url).href,
            {
              type: "module",
            },
          );
          worker.onmessage = (e) => {
            // console.log("");
            // console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
            // console.log("✅ ", chalk.cyan(`Finished creating image at size ${width}px for ${sourceFile}`));
            // console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
            // console.log("");

            // console.log("📦", "Message received from worker");
            // console.log({ data: e.data });

            resolve();
          };
          worker.postMessage({ imagesToCreate, width, originalImageBlob, sourceFileSize, imageDescription });
        });
      }
    ));

    console.log("");
    console.log(`⏱️ `, `Time elapsed:\n${Date.now() - startTime} milliseconds\n`); 
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


// Create a folder for each image size
async function createAlbumFolders({ albumPath }) {
  for (const width of SIZES) {
    try {
      await mkdirp(`${albumPath}/${width}-wide`);
    } catch(e) {
      console.error(e);
    }
  }
}

async function createAlbumImages({ albumIndex, albumPath, originalImageFiles }) {
  
  // Create sizes and formats for each of the images
  await Promise.all(originalImageFiles.map(
    async (sourceFile, imageIndex) => {
      console.log("");
      console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
      console.log("⏱️ ", chalk.cyan('Creating images for album: ' + albumPath));
      console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
      console.log("");
      console.log(`Time elapsed:\n${Date.now() - startTime} milliseconds\n`);
      console.log("");
    
      console.log(chalk.cyan(`${albumIndex + 1} of ${albums.length} albums`));
      console.log(chalk.cyan(`${imageIndex + 1} of ${originalImageFiles.length} pictures`));

      await createOneImage({
        sourceFile,
        destinationFolder: albumPath,
      });
    }
  ));
}

async function createImages() {
  for (let albumIndex = 0; albumIndex < albums.length; albumIndex++) {
    const album = albums[albumIndex];
    console.log(`creating next album: ${album}`);

    const albumPath = `_pictures/${ album }`;
    const originalImageFiles = getAllFilesFromFolder(`${albumPath}/original`);

    await createAlbumFolders({ albumPath });
    await createAlbumImages({ albumIndex, albumPath, originalImageFiles });
  }

  console.log("");
  console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
  console.log("🏁", chalk.cyan(`Finished creating images`));
  console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
  console.log("");
  console.log(`Total time elapsed: ${Date.now() - startTime} milliseconds`);
  console.log("");

  // For WebAssembly
  // https://esbuild.github.io/getting-started/#deno
  Deno.exit(0);
}

createImages();
