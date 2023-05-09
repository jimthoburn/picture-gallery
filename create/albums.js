
import fs from "fs";
import fetch, {
  fileFromSync,
} from "node-fetch";

// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

import { mkdirp } from "mkdirp";
import exif from "exif";
import capitalize from "capitalize";

import { getAlbumNamesFromPicturesFolder } from "../data-file-system/albums-from-pictures-folder.js";

const overwriteReadyOnlyFiles = false; // Set this “true” to re-generate existing read-only data files in the “_pictures” folder.

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

// Load an image from the file system and return it as
// a base64 string. This is useful for including a small
// preview image as part of an initial web page download.
async function getPreviewBase64(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
}

// Send a request to the Azure Computer Vision API to
// get a description of the image located at filePath
async function getDescription(filePath) {
  if (process.env.AZURE_COMPUTER_VISION_API_ENDPOINT
      && 
      process.env.AZURE_COMPUTER_VISION_API_KEY) {

    console.log("getDescription for " + filePath);

    // Wait 4 seconds to avoid rate limiting
    await new Promise((resolve, reject) => {
      console.log("Waiting to send request for image description...");
      setTimeout(resolve, 4 * 1000);
    });
    console.log("Sending request for image description...");

    const url = process.env.AZURE_COMPUTER_VISION_API_ENDPOINT;
    const params = {
      "features": "caption,read",
      "language": "en",
      "model-version": "latest",
      "api-version": "2023-02-01-preview",
    };
    const headers = {
      "Content-Type": "application/octet-stream",
      "Ocp-Apim-Subscription-Key": process.env.AZURE_COMPUTER_VISION_API_KEY,
    };

    const mimetype = "image/jpeg";
    const blob = fileFromSync(filePath, mimetype);

    const searchParams = new URLSearchParams(params).toString();

    const response = await fetch(`${url}?${searchParams}`, { method: "POST", headers, body: blob })
    if (!response.ok) {
      console.log(response);
      throw new Error("Network response was not ok");
    }

    const responseData = await  response.json();
    console.log("Received image description: " + responseData.captionResult.text);
    return responseData.captionResult.text;
  }

  return null;
};

async function createAlbumJSON({ source, sourceForPreviewBase64, sourceForDescription, destination, album }) {
  console.log("createAlbumJSON");
  console.log(arguments);
  const files = getAllFilesFromFolder(source)

  // KUDOS: https://stackoverflow.com/questions/50779268/how-can-i-sort-sequentially-numbered-files-in-javascript#answer-50779312
  files.sort((a, b) => a.localeCompare(b, 'en', {numeric: true }))

  console.log(files)

  const pictures = [];
  const picturesWithDataPreview = [];
  const picturesWithExif = [];

  console.log("files");

  for (let filePath of files) {

    const photoFileName = filePath.split("/").pop()

    // https://www.npmjs.com/package/exif
    const meta = await getImageMetadata(filePath);

    // get a description of an image located at filePath using open ai
    const description = await getDescription(`${sourceForDescription}/${photoFileName}`);

    const previewBase64 = await getPreviewBase64(`${sourceForPreviewBase64}/${photoFileName}`);

    const picture = {
      filename: encodeURIComponent(photoFileName),
      description,
      caption: null,
      uri: encodeURIComponent(photoFileName.split(".").shift()),
    };

    const pictureWithDataPreview = {
      ...picture,
      width: meta.exif.ExifImageWidth,
      height: meta.exif.ExifImageHeight,
      previewBase64,
    };

    const pictureWithMeta = {
      ...pictureWithDataPreview,
      meta,
    };

    pictures.push(picture);
    picturesWithDataPreview.push(pictureWithDataPreview);
    picturesWithExif.push(pictureWithMeta);
  }

  const userEditableData = {
    ...album,
    pictures
  }

  const readOnlyData = picturesWithDataPreview;
  const readOnlyExif = picturesWithExif;

  return {userEditableData, readOnlyData, readOnlyExif};

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

async function saveJSON({ destination, fileName, data, overwrite }) {

  const output =
`${JSON.stringify(data, null, 2)}
`; // Add a trailing line return

  try {
    await mkdirp(destination);
    if (fs.existsSync(`${destination}/${fileName}`) && overwrite !== true) {
      console.log(`${destination}/${fileName} already exists. Skipping…`);
    } else {
      fs.writeFileSync(`${destination}/${fileName}`, output, 'utf8', (err) => {
        if (err) {
          console.log(err)
        }
      })
    }
  } catch(e) {
    console.error(e);
  }
}

const destination = "./_api";


albums.forEach(async (album) => {

let pathBits = album.split("/");
pathBits.pop();
let basepath = pathBits.join("/");
let uri = album.split("/").pop();

if (
  fs.existsSync(`${destination}${basepath != "" ? `/${basepath}` : ''}/${uri}.json`)
  &&
  fs.existsSync(`./_pictures/${album}/data.json`)
  &&
  fs.existsSync(`./_pictures/${album}/exif.json`)
  &&
  overwriteReadyOnlyFiles !== true
) {
  console.log(`All data files for ./_pictures/${album} already exist. Skipping…`);
} else {

  let {userEditableData, readOnlyData, readOnlyExif} = await createAlbumJSON({
    source: `./_pictures/${album}/original`,
    sourceForPreviewBase64: `./_pictures/${album}/16-wide`,
    sourceForDescription: `./_pictures/${album}/2048-wide`,
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

  saveJSON({ destination: `${destination}${basepath != "" ? `/${basepath}` : ''}`, fileName: `${uri}.json`, data: userEditableData });
  saveJSON({ destination: `./_pictures/${album}`, fileName: `data.json`, data: readOnlyData, overwrite: true });
  saveJSON({ destination: `./_pictures/${album}`, fileName: `exif.json`, data: readOnlyExif, overwrite: true });

}
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

