
import { createElement, hydrate, Component } from "./web_modules/preact.js";
import htm from "./web_modules/htm.js"; const html = htm.bind(createElement);

import { PictureGallery, getInitialPageTitle } from "./components/picture-gallery.js";
import { Catcher } from "./components/catcher.js";

import { getAlbumByURL } from "./data/album-by-url.js";
import { getConfigData } from "./data/config.js";

function getPageURL() {
  return window.location.href;
}

async function start() {
  const album = await getAlbumByURL({ url: getPageURL(), fetch });
  const config = await getConfigData({ fetch });
  console.log({album});

  hydrate(
    html`
      <${Catcher} originalBodyInnerHTML="${document.body.innerHTML}">
        <${PictureGallery}
          getPageURL="${getPageURL}"
          pictures="${album.pictures}"
          story="${album.story}"
          album="${album}"
          config="${config}"
        />
      </${Catcher}>
    `,
    document.body
  );

  // document.title = getInitialPageTitle({ getPageURL, album, pictures: album.pictures });
}

// https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}

