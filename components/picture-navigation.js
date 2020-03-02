
import { createElement }        from "../web_modules/preact.js";
import { useContext }           from "../web_modules/preact/hooks.js";
import   htm                    from "../web_modules/htm.js";
const    html = htm.bind(createElement);
import { GalleryDispatch }      from "../components/picture-gallery.js";
import { Icon }                 from "../components/icon.js";
import { ImagePreloader }       from "../components/image-preloader.js";


function PictureNavigation({ pictures, album, state }) {

  const dispatch = useContext(GalleryDispatch);
  
  const selectedIndex = state.context.selectedPictureIndex;
  const firstIndex    = 0;
  const lastIndex     = pictures.length - 1;
  const previousIndex = selectedIndex - 1;
  const nextIndex     = selectedIndex + 1;

  const nextData     = (nextIndex     <= lastIndex)  ? pictures[nextIndex]     
                                                     : pictures[firstIndex];

  const previousData = (previousIndex >= firstIndex) ? pictures[previousIndex]
                                                     : pictures[lastIndex];

  function onNextClick(e) {

    // ⌨️ If the a modifier key is pressed, let the browser handle it
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;

    dispatch({
      type: "PICTURE_SELECTED",
      selectedPictureIndex: (nextIndex <= lastIndex)  ? nextIndex : firstIndex
    });

    e.preventDefault();
  }

  function onPreviousClick(e) {

    // ⌨️ If the a modifier key is pressed, let the browser handle it
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;

    dispatch({
      type: "PICTURE_SELECTED",
      selectedPictureIndex: (previousIndex >= firstIndex) ? previousIndex : lastIndex
    });

    e.preventDefault();
  }

  if (nextData && previousData) {
    return html`
      <nav>
        <ul>
          <li class="next">
            <a href="/${album.uri}/${nextData.uri}/" onClick="${onNextClick}">
              <${Icon} shape="arrow-right" label="Next"></${Icon}>
            </a>
          </li>
          <li class="previous">
            <a href="/${album.uri}/${previousData.uri}/" onClick="${onPreviousClick}">
              <${Icon} shape="arrow-left" label="Previous"></${Icon}>
            </a>
          </li>
        </ul>
      </nav>

      ${"" /* If the current image has already loaded,
              preload the next and previous images */ }
      ${state.context.detailsPictureLoaded ? html`
        <${ImagePreloader} album=${album} picture=${nextData}></${ImagePreloader}>
        <${ImagePreloader} album=${album} picture=${previousData}></${ImagePreloader}>
      ` : ""}
    `;
  } else {
    return "";
  }

}


export { PictureNavigation };

