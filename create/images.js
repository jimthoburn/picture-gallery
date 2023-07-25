import fs from "node:fs";
import { mkdirp } from "mkdirp";
import sizeOf from "image-size";
import chalk from "chalk";
import wasmImageProcessingFactory from "wasm-vips/lib/vips-es6.js";

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

const wasmImageProcessingOptions = {
  // print: (stdout) => console.log(stdout.replace(/\033\[[0-9;]*m/g, "")),
  // Uncomment to disable dynamic modules
  // dynamicLibraries: [],
  // Test all available dynamic modules
  // dynamicLibraries: ['vips-jxl.wasm', 'vips-heif.wasm', 'vips-resvg.wasm'],
  // preRun: (module) => {
    // module.setAutoDeleteLater(true);
    // module.setDelayFunction(fn => {
    //   globalThis.cleanup = fn;
    // });

    // Handy for debugging
    // module.ENV.VIPS_INFO = '1';
    // module.ENV.VIPS_LEAK = '1';

    // Preload test files
    // for (const file of Helpers.testFiles)
    //   module.FS.createPreloadedFile('/', file.split('/').pop(), 'test/unit/images/' + file, true, false);
  // },
  postRun: (module) => {
    const pad = 30;
    const have = (name) => module.Utils.typeFind('VipsOperation', name) !== 0;

    console.log('vips version:'.padEnd(pad), module.version());
    console.log('Emscripten version:'.padEnd(pad), module.emscriptenVersion());
    //console.log(module.config());
    console.log('Concurrency:'.padEnd(pad), module.concurrency());

    console.log('Cache max mem:'.padEnd(pad), module.Cache.maxMem());
    console.log('Cache max operations:'.padEnd(pad), module.Cache.max());
    console.log('Cache current operations:'.padEnd(pad), module.Cache.size());
    console.log('Cache max open files:'.padEnd(pad), module.Cache.maxFiles());

    console.log('Memory allocations:'.padEnd(pad), module.Stats.allocations());
    console.log('Memory currently allocated:'.padEnd(pad), module.Stats.mem());
    console.log('Memory high water:'.padEnd(pad), module.Stats.memHighwater());
    console.log('Open files:'.padEnd(pad), module.Stats.files());

    console.log('JPEG support:'.padEnd(pad), have('jpegload') ? 'yes' : 'no');
    console.log('JPEG XL support:'.padEnd(pad), have('jxlload') ? 'yes' : 'no');
    console.log('AVIF support:'.padEnd(pad), have('heifload') ? 'yes' : 'no');
    console.log('PNG support:'.padEnd(pad), have('pngload') ? 'yes' : 'no');
    console.log('TIFF support:'.padEnd(pad), have('tiffload') ? 'yes' : 'no');
    console.log('WebP support:'.padEnd(pad), have('webpload') ? 'yes' : 'no');
    console.log('GIF support:'.padEnd(pad), have('gifload') ? 'yes' : 'no');

    console.log('SVG load:'.padEnd(pad), have('svgload') ? 'yes' : 'no');

    console.log('Text rendering support:'.padEnd(pad), have('text') ? 'yes' : 'no');
  }
};

function generateOneImage({ width, sourceFile, destinationFolder }) {
  return new Promise(async (resolve, reject) => {

    const pathBits = sourceFile.split("/");
    const fileName = pathBits[pathBits.length - 1];
    const fileNameBits = fileName.split(".");
    const fileNameBase = fileNameBits.slice(0, fileNameBits.length - 1).join(".");

    const sourceFileSize = sizeOf(sourceFile); // https://github.com/image-size/image-size

    console.log("");
    console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
    console.log(chalk.cyan(`generateOneImage`));
    console.log({ sourceFileSize, destinationFolder, fileNameBase });
    console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
    console.log("");

    const jpegFileName = `${destinationFolder}/${fileNameBase}.jpeg`;
    const webpFileName = `${destinationFolder}/${fileNameBase}.webp`;
    const avifFileName = `${destinationFolder}/${fileNameBase}.avif`;

    const imageFormatsToCreate = {
      jpeg: false,
      webp: false,
      avif: false,
    };

    if (!fs.existsSync(jpegFileName) || overwrite === true) {
      imageFormatsToCreate.jpeg = true;
    } else {
      console.log(``);
      console.log(`${jpegFileName} already exists. Skipping…`);
      console.log(``);
    }

    if (width > 16 && configData.imageFormats && configData.imageFormats.webp && (!fs.existsSync(webpFileName) || overwrite === true)) {
      imageFormatsToCreate.webp = true;
    } else {
      if (fs.existsSync(webpFileName)) {
        console.log(``);
        console.log(`${webpFileName} already exists. Skipping…`)
        console.log(``);
      };
    }

    if (width > 16 && configData.imageFormats && configData.imageFormats.avif && (!fs.existsSync(avifFileName) || overwrite === true)) {
      imageFormatsToCreate.avif = true;
    } else {
      if (fs.existsSync(avifFileName)) {
        console.log(``);
        console.log(`${avifFileName} already exists. Skipping…`);
        console.log(``);
      }
    }

    if (imageFormatsToCreate.jpeg || imageFormatsToCreate.webp || imageFormatsToCreate.avif) {

      console.log("");
      console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
      console.log("⏳ ", chalk.cyan("Starting WebAssembly..."));
      console.log("");
      const wasmImageProcessingInstance = await wasmImageProcessingFactory();
      // const wasmImageProcessingInstance = await wasmImageProcessingFactory(wasmImageProcessingOptions);
      console.log("");
      console.log("🏁", chalk.cyan("WebAssembly ready"));
      console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
      console.log("");

      // Load an image from a file
      const originalImageBlob = await Deno.readFile(sourceFile);
      console.log({ originalImageBlob });

      // Load an image from a preloaded file
      const source = wasmImageProcessingInstance.Source.newFromMemory(originalImageBlob);
      const originalImage = wasmImageProcessingInstance.Image.newFromSource(source);

      /**
       * resize(scale, options)
       * @see https://github.com/kleisauke/wasm-vips/blob/a9a1d86b611f94bdca025b5521317371d65f2540/lib/vips.d.ts
       * For example, if the original image is 2000px wide, and we want a 1000px wide image,
       * we need to resize it to 0.5 (1000 / 2000) of its original size.
       */
      const scale = width / sourceFileSize.width;
      const resizedImage =
        (width < sourceFileSize.width)
        ? await originalImage.resize(scale)
        : originalImage;

      const createImage = async ({ format, quality, optionsString, withMetaData, resizedImage, outputFile }) => {
        const fileOptionsString = `[Q=${quality}${optionsString ? `,${optionsString}` : ''}${withMetaData === false ? ",strip=1" : ""}]`;
        console.log({ options: fileOptionsString });

        // Write the result to a buffer
        const outputImageBlob = resizedImage.writeToBuffer(`.${format}${fileOptionsString}`);

        // Write the buffer to a file
        Deno.writeFile(outputFile, outputImageBlob);
      }

      const withMetaData = width >= 2048;

      if (imageFormatsToCreate.jpeg) {
        console.log(``);
        console.log(`🖼  Generating JPEG`);
        console.log(``);

        /**
         * @see https://github.com/kleisauke/wasm-vips/blob/a9a1d86b611f94bdca025b5521317371d65f2540/lib/vips.d.ts
         */
        const options = {
          trellis_quant: 1, // jpegTrellisQuantisation = true;
          overshoot_deringing: 1, // jpegOvershootDeringing = true;
          optimize_scans: 1, // jpegOptimiseScans = true;
          interlace: 1, // jpegProgressive = true;
          quant_table: 3, // jpegQuantisationTable = 3;
        }
        // key=value,key=value,key=value
        const optionsString = Object.entries(options).map(([ key, value ]) => `${key}=${value}`).join(",")

        createImage({ resizedImage, outputFile: jpegFileName, format: 'jpeg', withMetaData, quality: 65, optionsString });
      }

      if (imageFormatsToCreate.webp) {
        console.log(``);
        console.log(`🖼  Generating WebP`);
        console.log(``);

        /**
         * @see https://github.com/kleisauke/wasm-vips/blob/a9a1d86b611f94bdca025b5521317371d65f2540/lib/vips.d.ts
         */
        const options = {
          effort: 4,
        }
        // key=value,key=value,key=value
        const optionsString = Object.entries(options).map(([ key, value ]) => `${key}=${value}`).join(",")

        createImage({ resizedImage, outputFile: webpFileName, format: 'webp', withMetaData, quality: 50, optionsString });
      }

      if (imageFormatsToCreate.avif) {
        console.log(``);
        console.log(`🖼  Generating AVIF`);
        console.log(``);

        /**
         * @see https://github.com/kleisauke/wasm-vips/blob/a9a1d86b611f94bdca025b5521317371d65f2540/lib/vips.d.ts
         */
        const options = {
          effort: 4,
          compression: "av1", // encoder to use.
          subsample_mode: "on", // heifChromaSubsampling == "4:4:4" ? "on" : "off",
          bitdepth: 8, // Number of bits per pixel.
        }
        // key=value,key=value,key=value
        const optionsString = Object.entries(options).map(([ key, value ]) => `${key}=${value}`).join(",")

        createImage({ resizedImage, outputFile: avifFileName, format: 'avif', withMetaData, quality: 50, optionsString });
      }

      console.log("");
      console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
      console.log("⏳ ", chalk.cyan("Shutting down WebAssembly..."));
      wasmImageProcessingInstance.shutdown();
      console.log("");
      console.log("✅ ", chalk.cyan("WebAssembly shutdown finished"));
      console.log(chalk.cyan("- - - - - - - - - - - - - - - - - - - - - - -"));
      console.log("");
    }

    console.log("");
    console.log(`⏱️ Time elapsed:\n${Date.now() - startTime} milliseconds\n`); 
    console.log("");

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

    // For WebAssembly
    // https://esbuild.github.io/getting-started/#deno
    Deno.exit(0);
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

