
import { createElement, hydrate } from "./web_modules/preact.js";
import htm from "./web_modules/htm.js"; const html = htm.bind(createElement);

import { PictureGallery, getInitialPageTitle } from "./components/picture-gallery.js";

async function getData(url) {
  const response = await fetch(url);
  return response.json();
}

function getPageURL() {
  return window.location.href;
}

function start() {

  // https://example.com/wildflowers/7/  ==>  /wildflowers/
  let urlArray = getPageURL().split("://").pop().split("?").shift().split("/");
  urlArray.shift(); // Remove the domain and port
  const albumURI = urlArray[0];
  // console.log(albumURI);

  getData(`/api/${albumURI}.json`).then(data => {
    let album;
    if (data.albums) {
      const childAlbumURI = urlArray[1];
      const childAlbum = data.albums.filter(album => album.uri === childAlbumURI)[0];
      album = {
        ...childAlbum,
        uri: `${data.uri}/${childAlbum.uri}`,
        parent: data
      };
    } else {
      album = data;
    }
    hydrate(
      html`<${PictureGallery} getPageURL=${getPageURL} pictures=${album.pictures} album=${album} />`,
      document.body
    );
    document.title = getInitialPageTitle({ getPageURL, album, pictures: album.pictures });
  })
}

// https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}

