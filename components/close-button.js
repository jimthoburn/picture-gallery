
import { createElement }        from "../web_modules/preact.js";
import { useRef,
         useEffect,
         useContext }           from "../web_modules/preact/hooks.js";
import   htm                    from "../web_modules/htm.js";
const    html = htm.bind(createElement);
import { usingKeyboard,
         onKeyboardDetected }   from "../helpers/environment.js";
import { GalleryDispatch }       from "../components/picture-gallery.js";


function CloseButton({ state, album }) {

  const dispatch = useContext(GalleryDispatch);
  const closeButton = useRef(null);


  // ⌨️ If the details view just appeared, move focus to the close button
  useEffect(() => {
    if (usingKeyboard() &&
        state.matches("showing_details") && 
        state.history.matches("transitioning_to_details")) {
      closeButton.current.focus();
    }
  }, [closeButton, state.value, state.history]);


  // 📣 Announce click events
  function onCloseButtonClick(e) {

    // ⌨️ If the a modifier key is pressed, let the browser handle it
    if (e.metaKey || e.ctrlKey || e.shiftKey) return;

    // TODO: Handle case where the details are transitioning in when this event happens
    // (Or more likely, when the forward/backward buttons are pressed)
    dispatch({
      type: "DETAILS_CLOSED"
    });

    e.preventDefault();
  }


  return html`
    <a href="/${album.uri}/"
       onClick="${onCloseButtonClick}"
       onKeyUp="${onKeyboardDetected}"
       ref="${closeButton}">
      ${album.title}
    </a>
  `;
}


export { CloseButton };

