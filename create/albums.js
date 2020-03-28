
import fs from "fs";

// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import mkdirp from "mkdirp";
import exif from "exif";
import base64 from "../helpers/node-base64-image.js";
import ColorThief from "color-thief";
import capitalize from "capitalize";

import { getAlbumNamesFromPicturesFolder } from "../data-file-system/albums-from-pictures-folder.js";


const colorthief = new ColorThief();

const galleryData = JSON.parse(fs.readFileSync("./_api/index.json", "utf8"));

const [secretAlbums, secretAlbumGroups] = getAlbumNamesFromPicturesFolder();

const albums = secretAlbums;

const albumGroups = secretAlbumGroups;


// https://www.npmjs.com/package/exif
function getImageMetadata(imageFilePath) { 
  return new Promise((resolve, reject) => {
    console.log(getImageMetadata);
    console.log(imageFilePath);
    try {
      new exif.ExifImage({ image: imageFilePath }, function (error, exifData) {
        if (error) {
          console.log('Error: '+error.message);
          reject(error);
        } else {
          resolve(exifData); // Do something with your data!
        }
      });
    } catch (error) {
      console.log('Error: ' + error.message);
      reject(error);
    }
  });
}

function getPreviewBase64(url) {
  return new Promise((resolve, reject) => {
    base64.encode(url, { string: true, local: true }, (error, result) => {
      if (error) {
        reject(error);
      } else {
        resolve(result);
      }
    });
  });
}

async function createAlbumJSON({ source, sourceForPreviewBase64, destination, album }) {
  console.log("createAlbumJSON");
  console.log(arguments);
  const files = getAllFilesFromFolder(source)

  // KUDOS: https://stackoverflow.com/questions/50779268/how-can-i-sort-sequentially-numbered-files-in-javascript#answer-50779312
  files.sort((a, b) => a.localeCompare(b, 'en', {numeric: true }))

  console.log(files)

  const pictures = [];
  const picturesWithEXIF = [];

  console.log("files");

  for (let filePath of files) {

    const photoFileName = filePath.split("/").pop()

    // https://www.npmjs.com/package/exif
    const meta = await getImageMetadata(filePath);

    // https://lokeshdhakar.com/projects/color-thief/#examples
    const primaryColor = await colorthief.getColor(filePath);

    const previewBase64 = await getPreviewBase64(`${sourceForPreviewBase64}/${photoFileName}`);

    pictures.push({
      filename: encodeURIComponent(photoFileName),
      description: null,
      caption: null,
      uri: encodeURIComponent(photoFileName.split(".").shift())
    });

    picturesWithEXIF.push({
      filename: encodeURIComponent(photoFileName),
      description: null,
      caption: null,
      uri: encodeURIComponent(photoFileName.split(".").shift()),
      width: meta.exif.ExifImageWidth,
      height: meta.exif.ExifImageHeight,
      primaryColor: `rgb(${primaryColor[0]}, ${primaryColor[1]}, ${primaryColor[2]})`,
      previewBase64,
      meta
    });
  }

  const userEditableData = {
    ...album,
    pictures
  }

  const readOnlyData = picturesWithEXIF;

  return {userEditableData, readOnlyData};

  //for (let picture of pictures) {

    // Get the EXIF data

    // Get the primary color

    // Save the data as <picture-name>.json in the same parent folder as "originals"
    // For Example:
    //
    // wildflowers/
    //   originals/
    //     1.jpg
    //     2.jpg
    //     3.jpg
    //   metadata/
    //     1.json
    //     2.json
    //     3.json

  //}
  //saveJSON({ destination, fileName: `${album.uri}-pictures.json`, data })

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

function saveJSON({ destination, fileName, data, overwrite }) {

  const output =
`${JSON.stringify(data, null, 2)}
`; // Add a trailing line return

  mkdirp(destination, function (err) {
    if (err) {
      console.error(err)
    } else {
      if (fs.existsSync(`${destination}/${fileName}`) && overwrite !== true) {
        console.log(`${destination}/${fileName} already exists. Skipping…`);
      } else {
        fs.writeFileSync(`${destination}/${fileName}`, output, 'utf8', (err) => {
          if (err) {
            console.log(err)
          }
        })
      }
    }
  })
}

const destination = "./_api";


albums.forEach(async (album) => {
  let uri = album.split("/").pop();
  let {userEditableData, readOnlyData} = await createAlbumJSON({
    source: `./_pictures/${album}/original`,
    sourceForPreviewBase64: `./_pictures/${album}/16-wide`,
    album: {
      uri,
      title: capitalize(uri.replace(/\-/g, " ")),
      date: null,
      zipFileSize: null,
      coverPicture: null, // source:
                          //   https://cdn.com/els9-234-sdf.jpg
                          // OR filename:
                          //   my-image-file.jpg
      askSearchEnginesNotToIndex: null
    }
  });

  let pathBits = album.split("/");
  pathBits.pop();
  let basepath = pathBits.join("/");

  saveJSON({ destination: `${destination}/${basepath}`, fileName: `${uri}.json`, data: userEditableData });
  saveJSON({ destination: `./_pictures/${album}`, fileName: `data.json`, data: readOnlyData, overwrite: true });
});

if (albumGroups.length > 0) {
  albumGroups.forEach(async (group) => {

    let data = {
      uri: group.uri,
      title: capitalize(group.uri.replace(/\-/g, " ")),
      date: null,
      coverPicture: null, // source:
                          //   https://cdn.com/els9-234-sdf.jpg
                          // OR filename:
                          //   my-image-file.jpg
      askSearchEnginesNotToIndex: null,
      albums: group.albums
    }

    saveJSON({ destination: `${destination}/${group.uri}`, fileName: `index.json`, data })
  });
}

