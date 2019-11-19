
import fs from "fs";

// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import mkdirp from "mkdirp";

const galleryData = JSON.parse(fs.readFileSync("./_api/index.json", "utf8"));

const secretAlbums = fs.existsSync("./_secret_albums.json")
  ? JSON.parse(fs.readFileSync("./_secret_albums.json", "utf8"))
  : [];

const albums = galleryData.albums.concat(secretAlbums);

function createAlbumJSON({ source, destination, album }) {
  const files = getAllFilesFromFolder(source)

  // KUDOS: https://stackoverflow.com/questions/50779268/how-can-i-sort-sequentially-numbered-files-in-javascript#answer-50779312
  files.sort((a, b) => a.localeCompare(b, 'en', {numeric: true }))

  console.log(files)

  const pictures = [];

  files.forEach(filePath => {
    if (filePath.includes('DS_Store')) return

    const photoFileName = filePath.split("/").pop()

    pictures.push({
      filename: encodeURIComponent(photoFileName),
      description: null,
      caption: null,
      uri: encodeURIComponent(photoFileName.split(".").shift())
    });
  })

  const data = {
    ...album,
    pictures
  }

  saveJSON({ destination, fileName: `${album.uri}.json`, data })
}

// https://stackoverflow.com/questions/20822273/best-way-to-get-folder-and-file-list-in-javascript#21459809
function getAllFilesFromFolder(dir) {

  let results = []

  fs.readdirSync(dir).forEach(function(file) {

    file = dir+'/'+file
    let stat = fs.statSync(file)

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFilesFromFolder(file))
    } else results.push(file)

  })

  return results

}

function saveJSON({ destination, fileName, data }) {

  // https://www.npmjs.com/package/js-yaml#safedump-object---options-
  let output = JSON.stringify(data, null, 2);

  mkdirp(destination, function (err) {
    if (err) {
      console.error(err)
    } else {
      fs.writeFileSync(`${destination}/${fileName}`, output, 'utf8', (err) => {
        if (err) {
          console.log(err)
        }
      })
    }
  })
}

albums.forEach(album => {
  createAlbumJSON({
    source: `./pictures/${album}/original`,
    destination: `./_api`,
    album: {
      uri: album.split("/").pop(),
      title: album.split("/").pop(),
      date: null,
      zipFileSize: null,
      coverPicture: null, // source:
                          //   https://cdn.com/els9-234-sdf.jpg
                          // OR filename:
                          //   my-image-file.jpg
      hideFromSearchEngines: null
    }
  });
});

