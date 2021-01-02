
import fs from "fs";

// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import mkdirp from "mkdirp";
import archiver from "archiver";
import { getAlbumNamesFromPicturesFolder } from "../data-file-system/albums-from-pictures-folder.js";


const galleryData = JSON.parse(fs.readFileSync("./_api/index.json", "utf8"));

const [secretAlbums, secretAlbumGroups] = getAlbumNamesFromPicturesFolder();

const albums = secretAlbums;

// KUDOS: https://www.npmjs.com/package/archiver
async function createZip(source, destination, callback) {
  console.log(`Creating zip from ${source} to ${destination}`)

  let folder = destination.split("/");
  folder.pop(); // Remove the filename
  folder = folder.join("/") + "/";

  console.log("folder", folder);

  try {
    await mkdirp(folder);
    // create a file to stream archive data to. 
    let output = fs.createWriteStream(destination)
    let archive = archiver('zip', {
        zlib: { level: 9 } // Sets the compression level. 
    })
     
    // listen for all archive data to be written 
    output.on('close', function() {
      console.log(archive.pointer() + ' total bytes')
      console.log('archiver has been finalized and the output file descriptor has closed.')
    })
     
    // good practice to catch warnings (ie stat failures and other non-blocking errors) 
    archive.on('warning', function(err) {
      if (err.code === 'ENOENT') {
          // log warning 
      } else {
          // throw error 
          throw err
      }
    })
     
    // good practice to catch this error explicitly 
    archive.on('error', function(err) {
      throw err
    })
     
    // pipe archive data to the file 
    archive.pipe(output)
     
    // append files from a sub-directory, putting its contents at the root of archive 
    // archive.directory(source, false)

    // append files from a glob pattern
    archive.glob(source);
     
    // finalize the archive (ie we are done appending files but streams have to finish yet) 
    archive.finalize()
  } catch(e) {
    console.error(e);
  }
}

(async () => {
  try {
    await mkdirp("_archives");
    albums.forEach(album => {
      createZip(`_pictures/${album}/6000-wide/*.jpeg`, `_archives/${album}.zip`);
    });
  } catch(e) {
    console.error(e);
  }
})();

