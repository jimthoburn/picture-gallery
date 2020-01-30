
import fs from "fs";


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


function getSecretAlbums() {
  let secretAlbums = [];
  let secretAlbumGroups = [];

  
  // Recursively look through the _pictures folder
    // 1) Create a list of album folders that contain an “original” folder of images
    // 2) Create a list of groups of album folders


  const files = getAllFilesFromFolder("./_pictures");

  const originalFolders = files.filter(file => file.match(/\/original$/) ? true : false);
  
  //   console.log(files);
  // console.log("originalFolders", originalFolders);


  // For each location file
  // for (let index = 0; index < files.length; index++) {
  //   if (files[index].indexOf(".DS_Store") >= 0) continue;
  // 
  //   // If this is a folder
  //   if (files[index] == "folder") {
  //     // If its name is “original”
  //     if (files[index].name == "original") {
  //       // Add it to the list of albums
  //       albums.push(files[index])
  //       // If it has a parent folder, create or update the group album
  //     }
  //     // Otherwise
  //     getSecretAlbums(files[index]);
  //   }
  // }


  secretAlbums = originalFolders.map(folder => {
    return folder.replace(/^.\/_pictures\//, "").replace(/\/original$/, "");
  });

  console.log("secretAlbums", secretAlbums);

  // https://stackoverflow.com/questions/1960473/get-all-unique-values-in-a-javascript-array-remove-duplicates
  function onlyUnique(value, index, self) { 
    return self.indexOf(value) === index;
  }

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

  console.log("secretAlbumGroups", secretAlbumGroups);

  // secretAlbums = fs.existsSync("./_secret_albums.json")
  //   ? JSON.parse(fs.readFileSync("./_secret_albums.json", "utf8"))
  //   : [];

  // secretAlbumGroups = fs.existsSync("./_secret_album_groups.json")
  //   ? JSON.parse(fs.readFileSync("./_secret_album_groups.json", "utf8"))
  //   : [];


  return [secretAlbums, secretAlbumGroups];
}


export {
  getSecretAlbums
}

