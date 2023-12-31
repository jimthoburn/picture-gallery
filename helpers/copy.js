
import fs         from "node:fs";
import fsPromises from "node:fs/promises";
import { mkdirp } from "mkdirp";

// Copy folder recursively, ovewriting any existing files (unless they’re the same)
async function copyFolder({ source, destination }) {
  console.log(`📂 Copying files from: ${source}`);

  try {
    await mkdirp(destination).catch(err => { throw err; });

    const items = await fsPromises.readdir(source);

    for (const item of items) {

      const sourceItem = `${source}/${item}`;
      const destinationItem = `${destination}/${item}`;

      const meta = await fsPromises.stat(sourceItem);
  
      if (meta.isDirectory()) {
        await copyFolder({
          source: sourceItem,
          destination: destinationItem,
        });
      } else if (item.startsWith(".")) {
        // console.log(`Source file starts with a dot (.) and may be a secret. Skipping copy of: ${sourceItem}`);
      } else {
        await copyFile({ file: sourceItem, destination: destinationItem, fileMeta: meta });
      }
  
    }

  } catch(err) {
    console.log(`An error occured while copying the folder: ${source} to ${destination}`)
    console.error(err);
    throw err;
  }
}

async function copyFile({ file, destination, fileMeta }) {
  // console.log(`📂 Copying file from: ${file} to ${destination}`);

  try {

    const sourceMeta = fileMeta ?? await fsPromises.stat(file).catch((err) => {});
    const destinationMeta = await fsPromises.stat(destination).catch((err) => {});
  
    if (
      sourceMeta?.size && destinationMeta?.size &&
      sourceMeta.size === destinationMeta.size
    ) {
      // console.log(`Skipping copy because the destination file exists and has a size that matches: ${file}`);
      return;
    }

  } catch(err) {}

  try {
    const OVERWRITE = fs.constants.COPYFILE_FICLONE;
    await fsPromises.copyFile(file, destination, OVERWRITE);

  } catch(err) {
    console.log(`An error occured while copying the file: ${file} to ${destination}`)
    console.error(err);
    throw err;
  }
}

export {
  copyFolder,
  copyFile,
}
