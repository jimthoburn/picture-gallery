
import { createElement }        from "../web_modules/preact.js";
import { useRef,
         useEffect,
         useContext }           from "../web_modules/preact/hooks.js";
import   htm                    from "../web_modules/htm.js";
const    html = htm.bind(createElement);
import { GalleryDispatch }      from "../components/picture-gallery.js";
import { PictureImage }         from "../components/picture-image.js";
import { CloseButton }          from "../components/close-button.js";
import { getSource,
         getSourceSet,
         IMAGE_DETAILS_SIZES }  from "../helpers/image-source-set.js";


function PictureDetails({ pictures, album, state }) {

  const dispatch = useContext(GalleryDispatch);
  const detailsElement = useRef(null);

  const picture = pictures[state.context.selectedPictureIndex];

  const selectedIndex = state.context.selectedPictureIndex;
  const firstIndex    = 0;
  const lastIndex     = pictures.length - 1;
  const previousIndex = selectedIndex - 1;
  const nextIndex     = selectedIndex + 1;

  const next_data     = (nextIndex     <= lastIndex)  ? pictures[nextIndex]     
                                                      : pictures[firstIndex];

  const previous_data = (previousIndex >= firstIndex) ? pictures[previousIndex]
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

  const downloadURL = picture.filename
    ? `/pictures/${ album.uri }/6000-wide/${ picture.filename }`
    : picture.source;

  const stateStrings = state.toStrings();

  return html`
    <section class="picture-details"
             data-state="${stateStrings[stateStrings.length - 1]}"
             style="--scale: ${state.context.transform.scale};
                    --translateX: ${state.context.transform.translateX};
                    --translateY: ${state.context.transform.translateY};"
             ref="${detailsElement}">
      <header>
        <div class="all">
          <h1>${ picture.caption ? picture.caption : picture.description ? picture.description : `Picture ${ state.context.selectedPictureIndex + 1 }` }</h1>
          <p><${CloseButton} album="${album}" state="${state}" /></p>
        </div>
        <p class="download">
          <a href="${ downloadURL }">
            Download
          </a>
        </p>
      </header>

      <a href="${ downloadURL }">
        ${// 📚 SHIM: Use an array and a key, even though there’s only one item
          //         so that the image element will be removed and re-added to
          //         the DOM when the data changes (to prevent the browser from
          //         continuing to show the old image while the new image loads).
          [""].map(item => {
          return html`
          <${PictureImage} key="${picture.uri}" album="${album}" picture="${picture}" state="${state}" />
          `
        })}
      </a>

      ${ (next_data && previous_data) ? html`

        <nav>
          <ul>
            <li class="next">
              <a href="/${album.uri}/${next_data.uri}/" onClick="${onNextClick}">
                <svg width="24" height="24" viewBox="0 0 24 24" aria-label="Next">
                  <switch>
                    <polygon points="7.3,0.9 18.4,12 7.2,23.1 5.7,21.6 15.2,12.1 5.6,2.6 " />
                    <foreignobject>Next</foreignobject>
                  </switch>
                </svg>
              </a>
            </li>
            <li class="previous">
              <a href="/${album.uri}/${previous_data.uri}/" onClick="${onPreviousClick}">
                <svg width="24" height="24" viewBox="0 0 24 24" aria-label="Previous">
                  <switch>
                    <polygon points="16.7,0.9 5.6,12 16.8,23.1 18.3,21.6 8.8,12.1 18.4,2.6 " />
                    <foreignobject>Previous</foreignobject>
                  </switch>
                </svg>
              </a>
            </li>
          </ul>
        </nav>

        ${"" /* Preload next & previous images */ }
        ${state.context.detailsPictureLoaded ? html`
          <div style="width: 0; height: 0; overflow: hidden; position: absolute; opacity: 0;">

            <img src="   ${getSource(   {album, picture: next_data})}"
                 srcset="${getSourceSet({album, picture: next_data})}"
                 sizes=" ${getSourceSet({album, picture: next_data}) 
                            ? (next_data.width && next_data.height)
                              ? `(min-aspect-ratio: ${next_data.width}/${next_data.height}) calc(${next_data.width / next_data.height} * 100vh), 100vw`
                              : `100vw`
                            : null}" alt="" />

            <img src="   ${getSource(   {album, picture: previous_data})}"
                 srcset="${getSourceSet({album, picture: previous_data})}"
                 sizes=" ${getSourceSet({album, picture: previous_data})
                            ? (previous_data.width && previous_data.height)
                              ? `(min-aspect-ratio: ${previous_data.width}/${previous_data.height}) calc(${previous_data.width / previous_data.height} * 100vh), 100vw`
                              : `100vw`
                            : null}" alt="" />
          </div>
        ` : ""}

      ` : ""}
    </section>
  `;
}


export { PictureDetails };

