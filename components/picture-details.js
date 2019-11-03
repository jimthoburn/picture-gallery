
import { createElement }        from "../web_modules/preact.js";
import { useRef,
         useEffect,
         useContext }           from "../web_modules/preact/hooks.js";
import   htm                    from "../web_modules/htm.js";
const    html = htm.bind(createElement);
import { GalleryDispatch }      from "../components/picture-gallery.js";
import { PictureImage }         from "../components/picture-image.js";
import { CloseButton }          from "../components/close-button.js";


function PictureDetails({ pictures, album, state }) {

  const dispatch = useContext(GalleryDispatch);
  const detailsElement = useRef(null);

  const picture = pictures[state.context.selectedPictureIndex];


  // 📣 📚 SHIM: Announce that the preparation step has rendered
  useEffect(() => {
    if (state.matches("transitioning_to_details.preparing_transition")) {
      dispatch("RENDERED");
    }
  }, [state.value]);


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

  let stateStrings = state.toStrings();
  return html`
    <section class="picture-details"
             data-state="${stateStrings[stateStrings.length - 1]}"
             style="--scale: ${state.context.transform.scale};
                    --translateX: ${state.context.transform.translateX};
                    --translateY: ${state.context.transform.translateY};"
             ref="${detailsElement}">
      <header>
        <p class="all">
          <${CloseButton} album="${album}" state="${state}" /> / ${ picture.caption ? picture.caption : `Picture ${ state.context.selectedPictureIndex + 1 }` }
        </p>
        <p class="download">
          <a href="/pictures/${ album.uri }/6000-wide/${ picture.filename }">
            Download
          </a>
        </p>
      </header>

      <a href="/pictures/${ album.uri }/6000-wide/${ picture.filename }">
        <${PictureImage} album="${album}" picture="${picture}" state="${state}" />
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
        <div style="width: 0; height: 0; overflow: hidden; position: absolute; opacity: 0;">
          <img src="/pictures/${ album.uri }/384-wide/${ next_data.filename }" srcset="/pictures/${ album.uri }/384-wide/${ next_data.filename } 384w, /pictures/${ album.uri }/512-wide/${ next_data.filename } 512w, /pictures/${ album.uri }/768-wide/${ next_data.filename } 768w, /pictures/${ album.uri }/1024-wide/${ next_data.filename } 1024w, /pictures/${ album.uri }/1536-wide/${ next_data.filename } 1536w, /pictures/${ album.uri }/2048-wide/${ next_data.filename } 2048w" sizes="100vw" alt="" />
          <img src="/pictures/${ album.uri }/384-wide/${ previous_data.filename }" srcset="/pictures/${ album.uri }/384-wide/${ previous_data.filename } 384w, /pictures/${ album.uri }/512-wide/${ previous_data.filename } 512w, /pictures/${ album.uri }/768-wide/${ previous_data.filename } 768w, /pictures/${ album.uri }/1024-wide/${ previous_data.filename } 1024w, /pictures/${ album.uri }/1536-wide/${ previous_data.filename } 1536w, /pictures/${ album.uri }/2048-wide/${ previous_data.filename } 2048w" sizes="100vw" alt="" />
        </div>

    ` : ""}
    </section>
  `;
}


export { PictureDetails };

