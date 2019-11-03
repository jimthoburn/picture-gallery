
import { createElement }        from "../web_modules/preact.js";
import { useRef,
         useEffect,
         useContext }           from "../web_modules/preact/hooks.js";
import   htm                    from "../web_modules/htm.js";
const    html = htm.bind(createElement);
import { useMoveGesture }       from "../helpers/move-gesture.js";
import { isBrowser,
         prefersReducedMotion } from "../helpers/environment.js";
import { GalleryDispatch }      from "../components/picture-gallery.js";
import { getSelectedPicture as getListPicture } from "../components/picture-list.js";


let getPicture = function() {
  return null;
}


function PictureImage({ album, picture, state }) {

  const dispatch = useContext(GalleryDispatch);
  const image = useRef(null);


  getPicture = function() {
    return image.current;
  }


  // 📣 Announce touch events
  useMoveGesture({ 
    targetRef: image,
    onMoveStart: touch => dispatch({
      type:"MOVE_START",
      touch,
      fromBoundingClientRect: image.current.getBoundingClientRect(),
      toBoundingClientRect: getListPicture().getBoundingClientRect()
    }),
    onMove: touch => dispatch({
      type:"MOVE_PICTURE",
      touch,
      viewportHeight: window.innerHeight
    }),
    onRelease: () => dispatch({
      type: "LET_GO_OF_PICTURE"
    })
  });

  
  // 📣 Announce loading events
  function onImageLoaded() {
    dispatch({
      type: "PICTURE_LOADED",
      fromBoundingClientRect: image.current.getBoundingClientRect(),
      toBoundingClientRect: getListPicture().getBoundingClientRect()
    });
  }


  // 📣 Announce transition events
  useEffect(() => {
    if (isBrowser()) {

      function onTransitionEnd() {
        dispatch({
          type: "TRANSITION_END"
        });
      }

      // If the user prefers reduced motion, announce transitions right away
      if (prefersReducedMotion &&
         (state.matches("transitioning_to_list") || 
          state.matches("transitioning_to_details.transitioning"))) {
        console.log(`found matching state transitioning_to_list`);
        onTransitionEnd();
  
      // Otherwise, listen for transition events from the browser
      } else {
        // console.log("🐶 adding TransitionEventListener");
        image.current.addEventListener("transitionend", onTransitionEnd, false);
        return () => {
          // console.log("🦁 removing TransitionEventListener");
          image.current.removeEventListener("transitionend", onTransitionEnd, false);
          // console.log("done removing");
        };
      }
    }
  }, [prefersReducedMotion, state.value, image]);

  return html`
    <figure>
      <responsive-image>
        <img
          src="/pictures/${ album.uri }/384-wide/${ picture.filename }"
          srcset="/pictures/${ album.uri }/384-wide/${ picture.filename } 384w,
                  /pictures/${ album.uri }/512-wide/${ picture.filename } 512w,
                  /pictures/${ album.uri }/768-wide/${ picture.filename } 768w,
                  /pictures/${ album.uri }/1024-wide/${ picture.filename } 1024w,
                  /pictures/${ album.uri }/1536-wide/${ picture.filename } 1536w,
                  /pictures/${ album.uri }/2048-wide/${ picture.filename } 2048w"
          sizes="100vw"
          alt="${
            (picture.description)
            ? html`${picture.description}`
            : html`Picture ${state.context.selectedPictureIndex + 1}`
          }"
          onLoad="${onImageLoaded}"
          ref="${image}" />
      </responsive-image>
    </figure>
  `;
}


export { PictureImage, getPicture };

