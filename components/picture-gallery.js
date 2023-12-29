
import { createElement,
         createContext }  from "preact";
import { useState,
         useLayoutEffect,
         useEffect }      from "preact/hooks";
import { useMachine }     from "@xstate/react";
import   htm              from "htm";
const    html = htm.bind(createElement);
import { isBrowser }      from "../helpers/environment.js";
import { galleryMachine } from "../machines/gallery.js";
import { PictureList }    from "../components/picture-list.js";
import { PictureDetails } from "../components/picture-details.js";
import { getSource,
         getCoverPhoto }  from "../helpers/image-source-set.js";
import { formatPageTitle } from "../helpers/page-title.js";


const GalleryDispatch = createContext(null);


let getMachine = function() {
  return null;
} 

function PictureGallery({ album, pictures, story, getPageURL, config }) {

  if (isBrowser()) {
    console.log(`🖼 ✨ Render`);
  }

  const selectedPictureIndex = getSelectedPictureIndexFromURL({ album, pictures, getPageURL });

  const [pictureListShouldRender, setPictureListShouldRender] = useState(false);

  const [state, dispatch, service] = useMachine(galleryMachine, {
    input: {
      selectedPictureIndex,
      album,
      pictures,
    },
  });

  if (isBrowser()) {
    console.log(state.value);
  }
  
  // 💡 TBD: Is there a better way to make the machine available outside of this component?
  getMachine = function() {
    return [state, dispatch, service];
  }

  // 📣 📚 SHIM: Announce that the next state has rendered
  useEffect(() => {
    if (state.matches("transitioning_to_details.preparing_transition") ||
        state.matches("transitioning_to_list.rendering_list") ||
        state.matches("showing_details.rendering_list")) {
          
      // ⏰ 📚 SHIM: Give the list a chance to render before calling getBoundingClientRect
      requestAnimationFrame(function() {

        dispatch({
          type: "RENDERED"
        });

      });
    }
  }, [state.value]);


  // 🎉 Respond to the browser’s forward & backward feature
  useEffect(() => {
    function onPopState(e) {
      console.log("🎉 Browser history state popped")
      console.log(e.state);
      const selectedPictureIndex = e.state ? e.state.selectedPictureIndex : null;
      if (selectedPictureIndex != null) {
        dispatch({ type: "PICTURE_SELECTED", selectedPictureIndex, didPopHistoryState: true });
      } else {
        dispatch({ type: "DETAILS_CLOSED", didPopHistoryState: true });
      }
    }
    if (isBrowser()) {
      window.addEventListener('popstate', onPopState);
      return () => {
        window.removeEventListener('popstate', onPopState);
      };
    }
  }, [pictures]);


  // 📚 SHIM: If the state is anything other than details, render the PictureList from now on
  //         (since removing and re-rendering it isn’t good for performance)
  if (!state.matches("showing_details.idle") && isBrowser()) {
    setPictureListShouldRender(true);
  }
  
  // 🤖 TEST:
  if (isBrowser() && new URLSearchParams(window.location.search).get("test") === "error-during-initial-render") {
    document.body.innerHTML = "";
    throw "Simulating a client-side error during the initial page render";
    return "";
  }

  return html`
    <${GalleryDispatch.Provider} value="${dispatch}">
      ${!state.matches("showing_list")
        ? html`
          <${PictureDetails}
            album="${album}"
            pictures="${pictures}"
            state="${state}"
            config="${config}"
            pictureListShouldRender="${pictureListShouldRender}" />`
        : ""}
      ${(!state.matches("showing_details.idle") || pictureListShouldRender === true)
        ? html`
          <${PictureList}
            album="${album}"
            pictures="${pictures}"
            story="${story}"
            state="${state}"
            config="${config}" />`
        : ""}
    </${GalleryDispatch.Provider}>
  `;
}


function getSelectedPictureIndexFromURL({ album, pictures, getPageURL }) {
  if (!getPageURL) return;

  // https://example.com/photos/air/  ==>  /photos/air/
  let urlArray = getPageURL().split("://").pop().split("?").shift().split("/");
  urlArray.shift(); // Remove the domain and port
  const pageURL = `/${urlArray.join("/")}`;

  for (let index = 0; index < pictures.length; index++) {
    if (
      // TRICKY: Support with or without trailing slash, and
      //                 with or without encoded UTF-8 characters
      // for server-node.js and server-deno.js
      `/${encodeURIComponent(album.uri)}/${encodeURIComponent(pictures[index].uri)}/` === pageURL ||
      `/${encodeURIComponent(album.uri)}/${encodeURIComponent(pictures[index].uri)}`  === pageURL ||
      // for build.js
      `/${album.uri}/${pictures[index].uri}/` === pageURL ||
      `/${album.uri}/${pictures[index].uri}`  === pageURL) {
      return index;
    }
  }
}

function getInitialPageTitle({ album, parent, pictures, getPageURL }) {
  let selectedPictureIndex = getSelectedPictureIndexFromURL({ album, pictures, getPageURL });
  if (selectedPictureIndex != null) {
    return formatPageTitle({
      imageNumber: selectedPictureIndex + 1,
      imageCaption: pictures[selectedPictureIndex].caption,
      albumTitle: album.title
    });
  } else if (parent) {
    return `${album.title} / ${parent.title}`;
  } else {
    return album.title;
  }
}

function getOpenGraphImage({ album, parent, pictures, getPageURL }) {
  let selectedPictureIndex = getSelectedPictureIndexFromURL({ album, pictures, getPageURL });
  if (selectedPictureIndex != null) {
    const picture = pictures[selectedPictureIndex];
    return getSource({ album, picture, type: "jpeg", largestSize: true });
  } else {
    return getCoverPhoto({album});
  }
}


export { PictureGallery, GalleryDispatch, getInitialPageTitle, getOpenGraphImage, getMachine };

