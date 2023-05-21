
import { exec } from "node:child_process";

const SIZES = [
  16,
  384,
  512,
  768,
  1024,
  1536,
  2048,
  // 6000
];

let nextSizeIndex = 0;

function hasImageOptim() {
  return new Promise((resolve, reject) => {

    // https://stackoverflow.com/questions/32801791/how-can-i-determine-if-a-binary-is-installed-using-bash
    exec("which imageoptim 2>/dev/null || echo FALSE", (err, stdout, stderr) => {
      if (err) {
        console.log("⚠️  Something went wrong while checking for ImageOptim. Skipping optimization...");
        reject(err);
      }

      if (stderr) {
        console.log("⚠️  Something went wrong while checking for ImageOptim. Skipping optimization...");
        console.log(stderr);
        reject(err);
      }

      if (stdout === "FALSE\n") {
        console.log("⚠️  ImageOptim is not installed. Skipping optimization...");
        resolve(false);
      }

      resolve(true);
    });
  });
}

function optimizeNextSize() {
  const size = SIZES[nextSizeIndex];

  console.log(`Optimizing images at size: ${size}`);

  try {
    // https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js#answer-20643568
    exec(`imageoptim '_pictures/**/${size}-wide/*.jpeg'`, (err, stdout, stderr) => {
      if (err) {
        // node couldn't execute the command
        console.log("⚠️  Something went wrong while running ImageOptim.");
        return;
      }

      // the *entire* stdout and stderr (buffered)
      if (stdout) console.log(stdout);
      if (stderr) console.log(stderr);

      nextSizeIndex++;
      if (nextSizeIndex < SIZES.length) {
        optimizeNextSize();
      }
    });
  } catch (error) {
    console.log(error);
  }
}

if (await hasImageOptim() === true) {
  console.log(``);
  console.log("✅ ImageOptim is installed.");
  console.log(``);
  optimizeNextSize();
}
