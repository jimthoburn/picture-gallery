
import { createElement }      from "preact";
import { useRef,
         useEffect,
         useContext }         from "preact/hooks";
import   htm                  from "htm";
const    html = htm.bind(createElement);
import { isBrowser,
         usingKeyboard,
         onKeyboardDetected } from "../helpers/environment.js";
import { closest }            from "../helpers/closest.js";
import { getSource }          from "../helpers/image-source-set.js";

import { GalleryDispatch }    from "../components/picture-gallery.js";
import { RenderedMarkdown }   from "../components/rendered-markdown.js";
import { PictureElement }     from "../components/picture-element.js";
import { responsiveImageHTML } from "../components/responsive-image-html.js";


let getSelectedPicture = function() {
  return null;
}


function PictureList({ album, pictures, story, state, config }) {
  const dispatch = useContext(GalleryDispatch);

  const selectedPicture = useRef(null);


  // ⌨️ If the list view just appeared, move focus to the current selected picture
  useEffect(() => {
    if (usingKeyboard() && 
        state.matches("showing_list") && 
        state.context.selectedPictureIndex != null) {
      closest(selectedPicture.current, "a").focus();
    }
  }, [state.value, state.context.selectedPictureIndex, selectedPicture]);


  // Scroll list photo into view, if needed
  useEffect(() => {
    if (isBrowser() &&
        state.context.selectedPictureIndex != null) {
      const picture = selectedPicture.current
      if (picture.getBoundingClientRect().y > window.innerHeight ||
          picture.getBoundingClientRect().y + picture.offsetHeight < 0) {
        picture.scrollIntoView();
      }
    }
  }, [state.context.selectedPictureIndex, selectedPicture]);

  
  // 📣 Announce selection events
  function onListImageClick(e, index) {

    // 🤖 TEST: Simulate a client-side error after user interaction
    // if (new URLSearchParams(window.location.search).get("test") === "error-after-user-interaction") {
    //   throw "Simulating a client-side error after user interaction";
    //   return;
    // }

    // ⌨️ If the a modifier key is pressed, let the browser handle it
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;

    dispatch({ type: "PICTURE_SELECTED", selectedPictureIndex: index });

    e.preventDefault();
  }

  
  // ⌨️ 📚 SHIM: Handle the case where a list item gains focus when the list is hidden
  //            (to avoid a hidden focus state)
  //
  //            A better solution might be to prevent the list from gaining focus,
  //            ideally by removing it from the DOM.
  function onListImageFocus(e) {
    if (state.matches("showing_details")) {
      dispatch({ type: "DETAILS_CLOSED" });
    }
  }


  getSelectedPicture = function() {
    return selectedPicture.current;
  }

  const stateStrings = typeof state.value === "string" ? [state.value] : [Object.entries(state.value).reduce(
    (accumulator, [key,entry]) => `${key}.${entry}`,
    "",
  )];

  return html`
    <section class="picture-list"
             data-state="${stateStrings[stateStrings.length - 1]}">
      <h1>
        ${ album.title }
        ${ (album.parent)
            ? html` / <a href="/${ album.parent.uri }/">${ album.parent.title }</a>`
            : "" }
      </h1>
      ${ (album.date)
         ? html`<p>${ album.date }</p>`
         : "" }

      <ol>
        ${pictures.map((picture, index) => {

          const sizes = (picture.width && picture.height)
            ? `(min-width: 30em) 50vw, 100vw`
            : `100vw`;

          const linkLabel = `Picture ${ index + 1 }.${ picture.caption ? ` ${picture.caption}` : "" }`;

          const aspectRatio = (picture.width && picture.height)
            ? `${picture.width}/${picture.height}`
            : "1/1"

          return html`
          <li key="${picture.uri}">
            <a href="/${album.uri}/${picture.uri}/"
               onClick="${ e => onListImageClick(e, index) }"
               onKeyUp="${onKeyboardDetected}"
               onFocus="${onListImageFocus}">
              <responsive-image
                aspect-ratio="${aspectRatio}"
                max-width="100%"
                max-height="100%"
                ref="${state.context.selectedPictureIndex === index ? selectedPicture : null}">
                <template shadowrootmode="open">
                  ${responsiveImageHTML({ aspectRatio, maxWidth: "100%", maxHeight: "100%", html })}
                </template>
                ${ (picture.previewBase64)
                   ? html`
                  <img
                    class="preview"
                    width="0"
                    height="0"
                    src="data:image/jpeg;base64,${picture.previewBase64}" alt="" />`
                   : "" }
                 <${PictureElement} album="${album}" picture="${picture}" sizes="${sizes}" config="${config}">
                   <img src="${getSource({album, picture, type: "jpeg"})}"
                        width="${ (picture.width)  ? 320 * (picture.width  > picture.height ? 1 : picture.width / picture.height) : 320 }"
                        height="${(picture.height) ? 320 * (picture.height > picture.width  ? 1 : picture.height / picture.width) : null }"
                        loading="lazy"
                        alt="${linkLabel}"
                        ${/* SHIM: Make <picture><img /></picture> fill the available space (but only if <picture /> exists) */ ''}
                        style="${picture.filename ? "width: 100%; height: auto;" : ""}"
                        data-selected="${(state.context.selectedPictureIndex === index) ? "true" : ""}" />
                 </${PictureElement}>
              </responsive-image>
            </a>
          </li>
          `
        })}
      </ol>

      ${ (story)
         ? html`<article><${RenderedMarkdown} markdown="${ story }"></${RenderedMarkdown}></article>`
         : "" }

      ${ (album.zipFileSize)
         ? html`<p class="action">
                  <a href="/archives/${ album.uri }.zip" download="${ album.uri.replace(/\//g, "-") }.zip">Download All Pictures</a><br />
                  <small>ZIP file / ${ album.zipFileSize }</small>
                </p>`
         : "" }
    </section>

  `;

}


export { PictureList, getSelectedPicture };

