
import { exec } from "child_process";

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

function optimizeNextSize() {
  const size = SIZES[nextSizeIndex];

  console.log(`Optimizing images at size: ${size}`);

  // https://stackoverflow.com/questions/20643470/execute-a-command-line-binary-with-node-js#answer-20643568
  exec(`imageoptim '_pictures/**/${size}-wide/*.jpg'`, (err, stdout, stderr) => {
    if (err) {
      // node couldn't execute the command
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
}


optimizeNextSize();

