
import fs from "node:fs";

import { onlyUnique } from "../helpers/array.js";


// https://stackoverflow.com/questions/20822273/best-way-to-get-folder-and-file-list-in-javascript#21459809
function getAllFilesFromFolder(dir) {
  let results = [];
  fs.readdirSync(dir).forEach(function(file) {
    file = dir+'/'+file;
    let stat = fs.statSync(file);
    
    results.push(file);

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFilesFromFolder(file));
    }
  });
  return results;
};



// Recursively look through the _pictures folder
  // 1) Create a list of album folders that contain an “original” folder of images
  // 2) Create a list of groups of album folders

function getAlbumNamesFromPicturesFolder() {
  let secretAlbums = [];
  let secretAlbumGroups = [];


  const files = getAllFilesFromFolder("./_pictures");
  const originalFolders = files.filter(file => file.match(/\/original$/) ? true : false);

  secretAlbums = originalFolders.map(folder => {
    return folder.replace(/^.\/_pictures\//, "").replace(/\/original$/, "");
  });

  secretAlbumGroups = secretAlbums.map(folder => {
    const bits = folder.split("/");
    bits.pop()
    return bits.join("/");
  }).filter(folder => folder != "" && folder != null).filter( onlyUnique );

  secretAlbumGroups = secretAlbumGroups.map(uri => {
    return {
      uri,
      albums: secretAlbums
                .filter(folder => folder.indexOf(uri) === 0)
                .map(folder => folder.split("/").pop())
    }
  })

  return [secretAlbums, secretAlbumGroups];
}


export {
  getAlbumNamesFromPicturesFolder
}

