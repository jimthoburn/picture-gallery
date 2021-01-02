
import fs from "fs";

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

// SHIM: Change “.jpg” to “.jpeg” to make image URLs consistent
const files = getAllFilesFromFolder("./_pictures");

for (let file of files) {
  if (file.includes(".jpg")) {
    fs.rename(file, file.replace(".jpg", ".jpeg"), function(err) {
      if ( err ) console.log('ERROR: ' + err);
    });
  }
}

