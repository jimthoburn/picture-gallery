
import { createElement, hydrate, Component } from "./web_modules/preact.js";
import htm from "./web_modules/htm.js"; const html = htm.bind(createElement);

import { PictureGallery, getInitialPageTitle, getMachine } from "./components/picture-gallery.js";

import { getLastDispatch }      from "./helpers/xstate-preact.js";
import { getCombinedAlbumJSON, getAlbumURI } from "./helpers/album.js";

class Catcher extends Component {

  constructor(props) {
    super(props);
    this.state = {
      errored: false
    }
  }

  componentDidCatch(error) {
    try {

      console.log("😿 Something went wrong");
      console.error(error);

      // Assume client-side rendering is out of service and
      // attempt to load HTML for the next state from the server.

      // 1) Get the last known state of the machine
      const [lastKnownState, dispatch, service] = getMachine();

      // 2) Get the last message sent to the machine
      const lastDispatch = getLastDispatch();
      console.log("Last dispatch received was...");
      console.log(lastDispatch);

      if (service && lastDispatch) {
        console.log(
          `Finding the next state...`
        );
        
        // 3) Ask the machine for the next state
        const nextState = service.send(lastDispatch);
        console.log(nextState.value);

        // 4) Visit the URL for that state
        if ((nextState.matches("transitioning_to_details") || 
             nextState.matches("showing_details")) && 
             nextState.context.selectedPictureIndex != null) {
          const nextURL = document.querySelector(
            `.picture-list li:nth-child(${nextState.context.selectedPictureIndex + 1}) a`
          ).getAttribute("href");
          
          console.log(`nextURL: ${nextURL}`);
          if (nextURL != null && nextURL != "") {
            window.location = nextURL;
          }
        } else {
          const nextURL = document.querySelector(
            ".picture-details .all a"
          ).getAttribute("href");
          
          console.log(`nextURL: ${nextURL}`);
          if (nextURL != null && nextURL != "") {
            window.location = nextURL;
          }
        }

      } else {
        console.log(
          `The next state isn’t known. It’s likely that the error happened during
           the initial render, and before any actions by the user.`
        );
      }
    } catch (e) {
      console.error(e);
    }

    this.setState({ errored: true });
  }

  render(props, state) {
    if (state.errored) {
      try {

        // Assume client-side rendering is out of service and that the 
        // the original source HTML for this page is still good
        console.log("😺 Catcher is restoring the original server-side rendered HTML");
        document.body.innerHTML = originalBodyInnerHTML;
  
        return html``;

      } catch (e) {
        console.error(e);
        return html`
        <section>

          <h1>Uh oh!</h1>

          <p>Something went wrong on this page.</p>

          <p>You may want to visit the <a href="/">home page</a> instead.</p>

        </section>`;
      }
    }

    return props.children;
  }
}

function getData(url) {
  console.log("url", url);
  return new Promise((resolve, reject) => {
    fetch(url).then(response => {
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
    getAlbumJSON({ albumURI: urlArray.join("/") }).then(data => {
      if (urlArray.length >= 2) {
        getData(`/api/${urlArray[0]}/index.json`).then(parent => {
          startHydrate({ data, parent });
        });
      } else {
        startHydrate({ data });
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
        getAlbumJSON({ albumURI: urlArray.slice(0, urlArray.length - 1).join("/") }).then(data => {
          if (urlArray.length >= 3) {
            getData(`/api/${urlArray[0]}/index.json`).then(parent => {
              startHydrate({ data, parent });
            });
          } else {
            startHydrate({ data });
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
  console.log("url", url);
  return new Promise((resolve, reject) => {
    fetch(url).then(response => {
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
    }).catch(error => {
      console.error(error);
      resolve(null);
    });
  });
}

function startHydrate({ data, parent }) {
  console.log("startHydrate");
  console.log("data", data);
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
        getPageURL=${getPageURL}
        pictures=${album.pictures}
        album=${album}>
        <${PictureGallery}
          getPageURL=${getPageURL}
          pictures=${album.pictures}
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

