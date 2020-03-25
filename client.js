
import { createElement, hydrate, Component } from "./web_modules/preact.js";
import htm from "./web_modules/htm.js"; const html = htm.bind(createElement);

import { PictureGallery, getInitialPageTitle } from "./components/picture-gallery.js";
import { Catcher } from "./components/catcher.js";

import { getCombinedAlbumJSON, getAlbumURI } from "./helpers/album.js";

function getData(url) {
  // console.log("url", url);
  return new Promise((resolve, reject) => {
    fetch(url).then(response => {
      if (response.ok) {
        try {
          response.text().then(text => {
            try {
              // console.log(text);
              // json = response.json();
              const json = JSON.parse(text);
              resolve(json);
            } catch(e) {
              console.error(e);
              resolve(null);
            }
          });
        } catch(e) {
          console.error(e);
          console.error(response.status);
          console.error(url);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    }).catch(error => {
      console.error(error);
      resolve(null);
    });
  });
}

function getMarkdown(url) {
  // console.log("url", url);
  return new Promise((resolve, reject) => {
    fetch(url).then(response => {
      if (response.ok) {
        try {
          response.text().then(resolve);
        } catch(e) {
          console.error(e);
          console.error(response.status);
          console.error(url);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    }).catch(error => {
      console.error(error);
      resolve(null);
    });
  });
}

async function getAlbumJSON({ albumURI }) {

  // TODO: Send these requests in parallel
  const album             = await getData(`/api/${albumURI}.json`);
  const generatedPictures = await getData(`/pictures/${albumURI}/data.json`);

  return getCombinedAlbumJSON({ album, generatedPictures });
}

async function getAlbumStory({ albumURI }) {
  return await getMarkdown(`/api/${albumURI}.markdown`);
}

// async function getAlbumJSON({ albumURI }) {
//   return new Promise((resolve, reject) => {
//     Promise.all([
//       getData(`/api/${albumURI}.json`),
//       getData(`/pictures/${albumURI}/data.json`)
//     ]).then((album, generatedPictures) => {
//       resolve(getCombinedAlbumJSON({ album, generatedPictures }));
//     });
//   })
// }

function getPageURL() {
  return window.location.href;
}

let originalBodyInnerHTML;

async function start() {
  originalBodyInnerHTML = document.body.innerHTML;

  // https://example.com/wildflowers/7/  ==>  ["example.com", "wildflowers", "7"]
  // https://example.com/baking/a/3/     ==>  ["example.com", "baking", "a", "3"]
  // https://example.com/baking/a/       ==>  ["example.com", "baking", "a"]
  let urlArray = getPageURL().split("://").pop().split("?").shift().split("/").filter(bit => bit !== "");
  urlArray.shift(); // Remove the domain and port
  console.log(urlArray);

  let testResult;

  // The whole URL might match an album
  // baking   ==> baking.json
  // baking/a ==> baking/a.json
  testResult = await testURL(`/api/${ urlArray.join("/") }.json`);
  // console.log(testResult);
  if (testResult) {
    console.log("test 1 passed");
    Promise.all([
      getAlbumJSON( { albumURI: urlArray.join("/") }),
      getAlbumStory({ albumURI: urlArray.join("/") })
    ]).then((values) => {
      const [data, story] = values;
      if (!data) return;
      if (urlArray.length >= 2) {
        getData(`/api/${urlArray[0]}/index.json`).then(parent => {
          startHydrate({ data, story, parent });
        });
      } else {
        startHydrate({ data, story });
      }
    });
    return;
  } else {
    console.log("test 1 did not pass");
  }

  // Or part of the URL might match an album
  // baking/3   ==> baking.json
  // baking/a/3 ==> baking/a.json
  if (urlArray.length >= 2) {
    console.log(`Testing: /api/${ urlArray.slice(0, urlArray.length - 1).join("/") }.json`)
    testURL(`/api/${ urlArray.slice(0, urlArray.length - 1).join("/") }.json`).then(testResult => {
      // console.log(testResult);
      if (testResult) {
        console.log("test 2 passed");
        Promise.all([
          getAlbumJSON( { albumURI: urlArray.slice(0, urlArray.length - 1).join("/") }),
          getAlbumStory({ albumURI: urlArray.slice(0, urlArray.length - 1).join("/") })
        ]).then((values) => {
          const [data, story] = values;
          if (!data) return;
          if (urlArray.length >= 3) {
            getData(`/api/${urlArray[0]}/index.json`).then(parent => {
              startHydrate({ data, story, parent });
            });
          } else {
            startHydrate({ data, story });
          }
        });
        return;
      } else {
        console.log("test 2 did not pass");
      }
    });
  }

}

function testURL(url) {
  // console.log("url", url);
  return new Promise((resolve, reject) => {
    fetch(url).then(response => {
      if (response.ok) {
        try {
          response.text().then(text => {
            try {
              // console.log(text);
              // json = response.json();
              const json = JSON.parse(text);
              resolve(json);
            } catch(e) {
              console.error(e);
              resolve(null);
            }
          });
        } catch(e) {
          console.error(e);
          console.error(response.status);
          console.error(url);
          resolve(null);
        }
      } else {
        resolve(null);
      }
    }).catch(error => {
      console.error(error);
      resolve(null);
    });
  });
}

function startHydrate({ data, story, parent }) {
  // console.log("startHydrate");
  // console.log("data", data);
  let album;
  if (parent) {
    album = {
      ...data,
      uri: `${parent.uri}/${data.uri}`,
      parent
    };
  } else {
    album = data;
  }
  hydrate(
    html`
      <${Catcher}
        originalBodyInnerHTML=${originalBodyInnerHTML}>
        <${PictureGallery}
          getPageURL=${getPageURL}
          pictures=${album.pictures}
          story=${story}
          album=${album} />
      </${Catcher}>
    `,
    document.body
  );
  document.title = getInitialPageTitle({ getPageURL, album, pictures: album.pictures });
}

// https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}

