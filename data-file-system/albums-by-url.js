
import { getAlbumNames }                from "../data-file-system/album-names.js";

import { fetchFromFileSystem as fetch } from "../helpers/fetch-from-file-system.js";
import { getAlbumByURL }                from "../data/album-by-url.js";
import { onlyUnique }                   from "../helpers/array.js";


const urls = {};
const publicURLs = {};


function isPublic(album) {
  return !album.askSearchEnginesNotToIndex &&
        (!album.parent || !album.parent.askSearchEnginesNotToIndex)
}

async function __initURLs() {

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
  }

  const albumNames = await getAlbumNames();

  for (let name of albumNames) {
    const url = `/${name}/`;
    const album = await getAlbumByURL({ url, fetch });
    await addAlbum(album);
  }

  // console.log("***** album urls *****");
  // console.log(urls);
  // console.log(publicURLs);
}

async function getAlbumsByURL() {
  await __initURLs();
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
  getAlbumsByURL,
  getPublicURLs,
  getPublicAlbums,
  isGroupAlbum,
  isAlbum,
  getAlbum
}

