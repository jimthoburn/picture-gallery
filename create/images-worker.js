import wasmImageProcessingFactory from "wasm-vips/lib/vips-es6.js";


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


async function generateOneImageSize({ imagesToCreate, width, originalImageBlob, sourceFileSize, imageDescription }) {

  console.log(``);
  console.log(`🤖 WebAssembly instance starting for ${imageDescription}`);
  console.log(``);

  // console.log("");
  // console.log("- - - - - - - - - - - - - - - - - - - - - - -");
  // console.log("⏳ ", "Starting WebAssembly instance...");
  // console.log("");
  const wasmImageProcessingInstance = await wasmImageProcessingFactory();
  // const wasmImageProcessingInstance = await wasmImageProcessingFactory(wasmImageProcessingOptions);
  // console.log("");
  // console.log("🏁", "WebAssembly instance ready");
  // console.log("- - - - - - - - - - - - - - - - - - - - - - -");
  // console.log("");

  const originalImageBlob = await Deno.readFile(sourceFile);

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
    // console.log({ options: fileOptionsString });

    // Write the result to a buffer
    const outputImageBlob = resizedImage.writeToBuffer(`.${format}${fileOptionsString}`);

    // Write the buffer to a file
    Deno.writeFile(outputFile, outputImageBlob);
  }

  const withMetaData = width >= 2048;

  if (imagesToCreate[width].jpeg) {
    console.log(``);
    console.log(`🖼  Generating JPEG for ${imagesToCreate[width].jpeg}`);
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
      interlace: 1, // jpegProgressive = true;
    }
    const quality = width === 16 ? 30 : 65; // Use lower quality for “preview” images
    // key=value,key=value,key=value
    const optionsString = Object.entries(options).map(([ key, value ]) => `${key}=${value}`).join(",")

    createImage({ resizedImage, outputFile: imagesToCreate[width].jpeg, format: 'jpeg', withMetaData, quality, optionsString });
  }

  if (imagesToCreate[width].webp) {
    console.log(``);
    console.log(`🖼  Generating WebP for ${imagesToCreate[width].webp}`);
    console.log(``);

    /**
     * @see https://github.com/kleisauke/wasm-vips/blob/a9a1d86b611f94bdca025b5521317371d65f2540/lib/vips.d.ts
     */
    const options = {
      effort: 4,
    }
    const quality = 50;
    // key=value,key=value,key=value
    const optionsString = Object.entries(options).map(([ key, value ]) => `${key}=${value}`).join(",")

    createImage({ resizedImage, outputFile: imagesToCreate[width].webp, format: 'webp', withMetaData, quality, optionsString });
  }

  if (imagesToCreate[width].avif) {
    console.log(``);
    console.log(`🖼  Generating AVIF for ${imagesToCreate[width].avif}`);
    console.log(``);

    /**
     * @see https://github.com/kleisauke/wasm-vips/blob/a9a1d86b611f94bdca025b5521317371d65f2540/lib/vips.d.ts
     */
    const options = {
      effort: 1,
      compression: "av1", // encoder to use.
      subsample_mode: "on", // heifChromaSubsampling == "4:4:4" ? "on" : "off",
      bitdepth: 8, // Number of bits per pixel.
    }
    const quality = 50;
    // key=value,key=value,key=value
    const optionsString = Object.entries(options).map(([ key, value ]) => `${key}=${value}`).join(",")

    createImage({ resizedImage, outputFile: imagesToCreate[width].avif, format: 'avif', withMetaData, quality, optionsString });
  }

  // console.log("");
  // console.log("- - - - - - - - - - - - - - - - - - - - - - -");
  // console.log("⏳ ", "Shutting down WebAssembly instance...");
  wasmImageProcessingInstance.shutdown();
  // console.log("");
  // console.log("✅ ", "WebAssembly instance shutdown finished");
  // console.log("- - - - - - - - - - - - - - - - - - - - - - -");
  // console.log("");

  console.log(``);
  console.log(`🤖 WebAssembly instance shutdown for ${imageDescription}`);
  console.log(``);

  // For WebAssembly
  // https://esbuild.github.io/getting-started/#deno
  // Deno.exit(0);
}

self.onmessage = async (e) => {
  // console.log("📦", "Message received from main thread");

  const { imagesToCreate, width, sourceFile, sourceFileSize, imageDescription } = e.data;

  console.log(``);
  console.log(`🧵 Worker starting for ${imageDescription}`);
  console.log(``);

  await generateOneImageSize({ imagesToCreate, width, sourceFile, sourceFileSize, imageDescription })

  console.log(``);
  console.log(`🧵 Worker finished for ${imageDescription}`);
  console.log(``);

  // console.log("📦", "Sending message to main thread")
  postMessage({ type: "DONE" });
  self.close();
};
