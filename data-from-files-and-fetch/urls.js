
import { getGroupAlbumNames }           from "../data-from-files/group-albums.js";
import { getNonGroupAlbumNames }        from "../data-from-files/non-group-album-names.js";

import { fetchFromFileSystem as fetch } from "../helpers/fetch-from-file-system.js";
import { getAlbumByURL }                from "../data/album-by-url.js";
import { onlyUnique } from "../helpers/array.js";


// const allURLs = [
//     "/",
//     ...getGroupAlbumURLs(),
//     ...getNonGroupAlbumURLs(), 
//     ...getPictureURLs()
//   ]
//   .sort()
//   .filter(onlyUnique);

// non group albums that are also not child albums
// const groupAlbumNames = getGroupAlbumNames();
// const nonGroupChildAlbumNames = getNonGroupAlbumNames()
//   .filter(name => {
//     const isChildAlbum = groupAlbumNames.filter(groupName => name.indexOf(groupName) >= 0);
//     return (isChildAlbum.length && isChildAlbum.length > 0) ? false : true;
//   })
// 
// const albumNames = [
//   ...nonGroupChildAlbumNames,
//   ...groupAlbumNames
// ];

const albumNames = [
  ...getNonGroupAlbumNames(),
  ...getGroupAlbumNames()
];

const urls = {};
const publicURLs = {};

function isPublic(album) {
  return !album.askSearchEnginesNotToIndex &&
        (!album.parent || !album.parent.askSearchEnginesNotToIndex)
}

// console.log("***** starting up *****");
(async function() {
  // console.log("***** albumNames *****");
  // console.dir(albumNames);

  async function addAlbum(album) {
    const url = `/${album.uri}/`;
    urls[url] = album;
    if (isPublic(album)) {
      publicURLs[url] = album;
    }

    if (album.pictures) {
      for (let picture of album.pictures) {
        const url = `/${album.uri}/${picture.uri}/`;
        urls[url] = album;
        if (isPublic(album)) {
          publicURLs[url] = album;
        }
      }
    }

    // Replace the array of albumURIs with complete album data
    // if (album.albums) {
      // album.albums = await Promise.all(album.albums.map(async (childAlbumURI) => {
      //   console.log("childAlbumURI: ");
      //   console.log(childAlbumURI);
      //   return await getAlbumByURL({ url: `/${album.uri}/${childAlbumURI}/`, fetch });
      // }));
      // for (let childAlbumURI of album.albums) {
      //   const childAlbum = await getAlbumByURL({ url: `/${album.uri}/${childAlbumURI}/`, fetch });
      //   addAlbum(childAlbum);
      // }
    // }
  }

  for (let name of albumNames) {
    // console.log("***** name *****");
    // console.log(name);
    const url = `/${name}/`;
    const album = await getAlbumByURL({ url, fetch });
    // console.log(album);
    await addAlbum(album);
  }

  // console.log("***** urls *****");
  // console.log(urls);
  // console.log(publicURLs);
})();

function getURLs() {
  return Object.keys(urls);
}

function getPublicURLs() {
  return Object.entries(urls)
    .filter(entry => {
      const [url, album] = entry;
      return isPublic(album)
    })
    .map(entry => {
      const [url, album] = entry;
      return url
    });
}

function getPublicAlbums() {
  // console.log("getPublicAlbums");
  return Object.entries(urls)
    .filter(entry => {
      const [url, album] = entry;
      return isPublic(album)
    })
    .map(entry => {
      const [url, album] = entry;
      return album;
    })
    .filter(onlyUnique);
}

function isGroupAlbum(url) {
  return (urls[url] != null && urls[url].albums != null)
          ? true : false;
}

function isAlbum(url) {
  return (urls[url] != null && urls[url].pictures != null)
          ? true : false;
}

function getAlbum(url) {
  return urls[url];
}


export {
  getURLs,
  getPublicURLs,
  getPublicAlbums,
  isGroupAlbum,
  isAlbum,
  getAlbum
}


// const urlsToGenerate = [`/${album.uri}/`].concat(
//                          album.pictures.map(picture => `/${album.uri}/${picture.uri}/`)
// 
// albums.forEach(album => {
//   addItem({ url: `/${album.uri}/` });
//   album.pictures.forEach(picture => {
//     addItem({ url: `/${album.uri}/${picture.uri}/` });
//   });
// });
// 
// groupAlbums.forEach(groupAlbum => {
//   if (groupAlbum.askSearchEnginesNotToIndex !== true) {
//     addItem({ url: `/${groupAlbum.uri}/` });
//     groupAlbum.albums.forEach(album => {
//       addItem({ url: `/${groupAlbum.uri}/${album.uri}/` });
//       album.pictures.forEach(picture => {
//         addItem({ url: `/${groupAlbum.uri}/${album.uri}/${picture.uri}/` });
//       });
//     });
//   }
// });
