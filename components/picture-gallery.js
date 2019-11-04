
import { createElement,
         createContext }  from "../web_modules/preact.js";
import { useEffect }      from "../web_modules/preact/hooks.js";
import   htm              from "../web_modules/htm.js";
const    html = htm.bind(createElement);
import { isBrowser }      from "../helpers/environment.js";
import { useMachine }     from "../helpers/xstate-preact.js";
import { galleryMachine } from "../machines/gallery.js";
import { PictureList }    from "../components/picture-list.js";
import { PictureDetails } from "../components/picture-details.js";


const GalleryDispatch = createContext(null);


let getMachine = function() {
  return null;
} 


function PictureGallery({ album, pictures, getPageURL }) {

  if (isBrowser()) {
    console.log(`🖼 ✨ Render`);
  }

  const selectedPictureIndex = getSelectedPictureIndexFromURL({ album, pictures, getPageURL });

  // if (getPageURL().includes("tenryū-ji-temple") ||
  //     getPageURL().includes(encodeURIComponent("tenryū-ji-temple"))) {
  //   console.log("tenryū-ji-temple");
  //   console.log("selectedPictureIndex: ");
  //   console.log(selectedPictureIndex);
  // }

  const [state, dispatch, service] = useMachine(galleryMachine, { context: { selectedPictureIndex } });
  if (isBrowser()) {
    console.log(state.value);
  }

  getMachine = function() {
    return [state, dispatch, service];
  }


  // 💡 TBD: Should this code be called more directly, from the gallery machine?
  //         https://xstate.js.org/docs/guides/communication.html
  useEffect(() => {
    
    if (isBrowser()) {
      if (state.event.type === "PICTURE_SELECTED") {
        const selectedPicture = pictures[state.context.selectedPictureIndex];
        const selectedPictureTitle = selectedPicture.caption || selectedPicture.description || `Picture ${ state.context.selectedPictureIndex + 1 }`;
        document.title = selectedPictureTitle;

        if (!state.event.didPopHistoryState) {
          window.history.pushState(
            { selectedPictureIndex: state.context.selectedPictureIndex },
            selectedPictureTitle,
            `/${album.uri}/${selectedPicture.uri}/`
          );
        }

      } else if (state.matches("transitioning_to_list")) {
        document.title = album.title;

        if (!state.event.didPopHistoryState) {
          window.history.pushState(
            { },
            album.title,
            `/${album.uri}/`
          );
        }
      }
    }
  }, [pictures, state.value, state.event, state.context.selectedPictureIndex]);


  // 🎉 Respond to the browser’s forward & backward feature
  useEffect(() => {
    function onPopState(e) {
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


  return html`
    <${GalleryDispatch.Provider} value="${dispatch}">
      <${PictureList}
        album="${album}"
        pictures="${pictures}"
        state="${state}" />
      ${!state.matches("showing_list")
        ? html`
          <${PictureDetails}
            album="${album}"
            pictures="${pictures}"
            state="${state}" />`
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
      // TRICKY:
      // for server.js 
      `/${encodeURIComponent(album.uri)}/${encodeURIComponent(pictures[index].uri)}/` === pageURL ||
      // for build.js 
      `/${album.uri}/${pictures[index].uri}/` === pageURL) {
      return index;
    }
  }
}

function getInitialPageTitle({ album, pictures, getPageURL }) {
  let selectedPictureIndex = getSelectedPictureIndexFromURL({ album, pictures, getPageURL });
  if (selectedPictureIndex) {
    return pictures[selectedPictureIndex].caption || `Picture ${ selectedPictureIndex + 1 }`;
  } else {
    return album.title;
  }
}


export { PictureGallery, GalleryDispatch, getInitialPageTitle, getMachine };

