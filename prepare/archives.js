
import fs from "fs";

// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import mkdirp from "mkdirp";
import archiver from "archiver";

const galleryData = JSON.parse(fs.readFileSync("./_data/index.json", 'utf8'));

const albums = fs.existsSync("./albums.json")
  ? JSON.parse(fs.readFileSync("./albums.json", 'utf8'))
  : galleryData.albums;

// KUDOS: https://www.npmjs.com/package/archiver
function createZip(source, destination, callback) {
  console.log(`Creating zip from ${source} to ${destination}`)

  // create a file to stream archive data to. 
  var output = fs.createWriteStream(destination)
  var archive = archiver('zip', {
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
  archive.directory(source, false)
   
  // finalize the archive (ie we are done appending files but streams have to finish yet) 
  archive.finalize()

}

mkdirp("archives", function (err) {
  if (err) {
    console.error(err)
  } else {
    albums.forEach(album => {
      createZip(`./pictures/${album}/6000-wide/`, `./archives/${album}.zip`)
    })
  }
})

