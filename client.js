
import { createElement, hydrate, Component } from "./web_modules/preact.js";
import htm from "./web_modules/htm.js"; const html = htm.bind(createElement);

import { PictureGallery, getInitialPageTitle, getMachine } from "./components/picture-gallery.js";

import { getLastDispatch }     from "../helpers/xstate-preact.js";

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


async function getData(url) {
  const response = await fetch(url);
  return response.json();
}

function getPageURL() {
  return window.location.href;
}

let originalBodyInnerHTML;

function start() {
  originalBodyInnerHTML = document.body.innerHTML;

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
  })
}

// https://developer.mozilla.org/en-US/docs/Web/API/Document/DOMContentLoaded_event
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", start);
} else {
  start();
}

