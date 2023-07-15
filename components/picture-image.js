
import { createElement }        from "preact";
import { useRef,
         useEffect,
         useContext }           from "preact/hooks";
import   htm                    from "htm";
const    html = htm.bind(createElement);
import { useMoveGesture }       from "../helpers/move-gesture.js";
import { isBrowser,
         prefersReducedMotion } from "../helpers/environment.js";
import { getSource }            from "../helpers/image-source-set.js";

import { GalleryDispatch }      from "../components/picture-gallery.js";
import { PictureElement }       from "../components/picture-element.js";
import { getSelectedPicture as getListPicture } from "../components/picture-list.js";


let getPicture = function() {
  return null;
}


function PictureImage({ album, picture, state, config }) {

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
      touch
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
      fromBoundingClientRect: (image.current != null)
                                ? image.current.getBoundingClientRect()
                                : null,
      toBoundingClientRect:   (getListPicture() != null)
                                ? getListPicture().getBoundingClientRect()
                                : null
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


  const alt = (picture.description)
    ? picture.description
    : `Picture ${state.context.selectedPictureIndex + 1}`;

  const sizes = (picture.width && picture.height)
    ? `(min-aspect-ratio: ${picture.width}/${picture.height}) calc(${picture.width / picture.height} * 100vh), 100vw`
    : `100vw`;

  return html`
    <figure>
      <responsive-image
        aspect-ratio="${
          (picture.width && picture.height)
          ? `${picture.width}/${picture.height}`
          : "1/1"
        }"
        max-width="100vw"
        max-height="100vh"
        ref="${image}">
        ${ (picture.previewBase64)
          ? html`
            <img
              class="preview"
              width="0"
              height="0"
              src="data:image/jpeg;base64,${picture.previewBase64}" alt="" />`
          : "" }

        <${PictureElement} album="${album}" picture="${picture}" sizes="${sizes}" config="${config}">
          <img
            src="${getSource({album, picture, type: "jpeg"})}"
            alt="${alt}"
            width="${ (picture.width)  ? 320 * (picture.width  > picture.height ? 1 : picture.width / picture.height) : null }"
            height="${(picture.height) ? 320 * (picture.height > picture.width  ? 1 : picture.height / picture.width) : null }"
            onLoad="${onImageLoaded}"
            />
        </${PictureElement}>
      </responsive-image>
    </figure>
  `;
}


export { PictureImage, getPicture };

