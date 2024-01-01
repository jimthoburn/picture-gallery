
import fs from "node:fs";
import { encodeBase64 } from "encoding/base64.ts";

// https://stackoverflow.com/questions/46745014/alternative-for-dirname-in-node-when-using-the-experimental-modules-flag
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
const __dirname = dirname(fileURLToPath(import.meta.url));

import { mkdirp } from "mkdirp";
import exif from "exif";
import capitalize from "capitalize";
import sizeOf from "image-size";

import { getAlbumNamesFromPicturesFolder } from "../data-file-system/albums-from-pictures-folder.js";

import OpenAI from "openai";

const overwriteReadyOnlyFiles = false; // Set this “true” to re-generate existing read-only data files in the “_pictures” folder.

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
function getPreviewBase64(filePath) {
  const fileBuffer = fs.readFileSync(filePath);
  return fileBuffer.toString('base64');
}

async function getDescriptionAzure({ filePath, env, fetch, readFile }) {
  const url = env.AZURE_COMPUTER_VISION_API_ENDPOINT;
  const params = {
    "features": "caption,read",
    "language": "en",
    "model-version": "latest",
    "api-version": "2023-02-01-preview",
  };
  const headers = {
    "Content-Type": "application/octet-stream",
    "Ocp-Apim-Subscription-Key": env.AZURE_COMPUTER_VISION_API_KEY,
  };

  /*
    For testing...
    headers { "Content-Type": "application/json" }
    body: JSON.stringify({ url: "https://learn.microsoft.com/azure/cognitive-services/computer-vision/media/quickstarts/presentation.png" }),
  */

  const blob = await readFile(filePath);

  const searchParams = new URLSearchParams(params).toString();

  const response = await fetch(
    `${url}?${searchParams}`,
    {
      method: "POST",
      headers,
      body: blob,
    }
  );
  if (!response.ok) {
    console.log(response);
    throw new Error("Network response was not ok");
  }

  const responseData = await response.json();
  console.log("Received image description: " + responseData.captionResult.text);

  return responseData.captionResult.text;
}


// https://platform.openai.com/docs/guides/vision
async function getDescriptionOpenAI({ filePath, env, readFile }) {

  const blob = await readFile(filePath);

  const base64Image = encodeBase64(blob);
  console.log({ base64Image });

  const client = new OpenAI({ apiKey: env.OPENAI_API_KEY });

  const chatCompletion = await client.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Describe this photograph for someone who is visually impaired"
          },
          {
            type: "image_url",
            image_url: {
              "url": `data:image/jpeg;base64,${base64Image}`,
              "detail": "high",
            }
          },
        ],
      },
    ],
    max_tokens: 3000,
  });

  console.log({ chatCompletion });

  console.log("Received image description: " + chatCompletion.choices[0].message.content);

  return chatCompletion.choices[0].message.content;
}


// Send a request to the Azure Computer Vision API to
// get a description of the image located at filePath
async function getDescription({ filePath, env, fetch, readFile }) {

  if (env.OPENAI_API_KEY) {

    console.log("getDescription for " + filePath);

    // Wait 4 seconds to avoid rate limiting
    await new Promise((resolve, reject) => {
      console.log("Waiting to send request for image description...");
      setTimeout(resolve, 8 * 1000);
    });

    console.log("Sending request for image description...");
    return getDescriptionOpenAI({ filePath, env, readFile });

  } else if (env.AZURE_COMPUTER_VISION_API_ENDPOINT && env.AZURE_COMPUTER_VISION_API_KEY) {

    console.log("getDescription for " + filePath);

    // Wait 4 seconds to avoid rate limiting
    await new Promise((resolve, reject) => {
      console.log("Waiting to send request for image description...");
      setTimeout(resolve, 4 * 1000);
    });

    console.log("Sending request for image description...");
    return getDescriptionAzure({ filePath, env, fetch, readFile });

  } else {
    console.log("An API key wasn’t found for image description. Skipping...");
  }

  return null;
}

async function getDataForFile({ filePath, sourceForPreviewBase64, sourceForDescription, env, fetch, readFile }) {  
  const photoFileName = filePath.split("/").pop()

  // https://www.npmjs.com/package/exif
  const meta = await getImageMetadata(filePath);

  // get a description of an image located at filePath using open ai
  const description = await getDescription({ filePath: `${sourceForDescription}/${photoFileName}`, env, fetch, readFile });

  const previewBase64 = getPreviewBase64(`${sourceForPreviewBase64}/${photoFileName}`);

  const picture = {
    filename: encodeURIComponent(photoFileName),
    description,
    caption: null,
    uri: encodeURIComponent(photoFileName.split(".").shift()),
  };

  const sourceFileSize = sizeOf(filePath); // https://github.com/image-size/image-size

  const pictureWithDataPreview = {
    ...picture,
    ...sourceFileSize,
    previewBase64,
  };

  const pictureWithMeta = {
    ...pictureWithDataPreview,
    meta,
  };

  return {
    picture,
    pictureWithDataPreview,
    pictureWithMeta,
  };
}

async function getDataForAlbum({ files, pictures, picturesWithDataPreview, picturesWithExif, source, sourceForPreviewBase64, sourceForDescription, env, fetch, readFile, album}) {
  for (const filePath of files) {
    const { picture, pictureWithDataPreview, pictureWithMeta } = await getDataForFile({ filePath, pictures, picturesWithDataPreview, picturesWithExif, source, sourceForPreviewBase64, sourceForDescription, env, fetch, readFile, album });
    pictures.push(picture);
    picturesWithDataPreview.push(pictureWithDataPreview);
    picturesWithExif.push(pictureWithMeta);
  }
}

async function createAlbumJSON({ env, fetch, readFile, source, sourceForPreviewBase64, sourceForDescription, destination, album }) {
  console.log("createAlbumJSON");
  console.log({ source, sourceForPreviewBase64, sourceForDescription, destination, album });
  const files = getAllFilesFromFolder(source)

  // KUDOS: https://stackoverflow.com/questions/50779268/how-can-i-sort-sequentially-numbered-files-in-javascript#answer-50779312
  files.sort((a, b) => a.localeCompare(b, 'en', {numeric: true }))

  console.log(files)

  const pictures = [];
  const picturesWithDataPreview = [];
  const picturesWithExif = [];

  console.log("files");

  await getDataForAlbum({ files, pictures, picturesWithDataPreview, picturesWithExif, source, sourceForPreviewBase64, sourceForDescription, env, fetch, readFile, album });

  const userEditableData = {
    ...album,
    pictures
  }

  const readOnlyData = picturesWithDataPreview;
  const readOnlyExif = picturesWithExif;

  return {userEditableData, readOnlyData, readOnlyExif};
}

// https://stackoverflow.com/questions/20822273/best-way-to-get-folder-and-file-list-in-javascript#21459809
function getAllFilesFromFolder(dir) {

  let results = []

  fs.readdirSync(dir).forEach(function(file) {

    file = dir+'/'+file
    const stat = fs.statSync(file)

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

async function processAlbum({ env, fetch, readFile, album, destination }) {
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
      env, fetch, readFile,
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
}

async function createAlbums({ env, fetch, readFile }) {
  const destination = "./_api";

  for (const album of albums) {
    await processAlbum({ env, fetch, readFile, album, destination });
  }

  if (albumGroups.length > 0) {
    albumGroups.forEach((group) => {
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
}

export { createAlbums };

