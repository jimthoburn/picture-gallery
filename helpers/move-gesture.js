
import { useEffect } from "../web_modules/preact/hooks.js";

import { getTouchPosition, multiTouch } from "../helpers/touch.js";
import { isBrowser } from "../helpers/environment.js";


function useMoveGesture({ targetRef, onMoveStart, onMove, onRelease }) {

  function onTouchStart(e) {
    console.log("onTouchStart")
    if (multiTouch(e)) return;
    onMoveStart(getTouchPosition(e));
    e.preventDefault();
  }

  function onTouchMove(e) {
    if (multiTouch(e)) return;
    onMove(getTouchPosition(e));
    e.preventDefault();
  }

  function onTouchEnd(e) {
    if (multiTouch(e)) return;
    onRelease();
    e.preventDefault();
  }

  // Listen for touch events
  useEffect(() => {
    if (isBrowser() && targetRef.current) {
      targetRef.current.addEventListener("touchstart", onTouchStart);
      targetRef.current.addEventListener("touchmove", onTouchMove);
      targetRef.current.addEventListener("touchend", onTouchEnd);
      return () => {
        targetRef.current.removeEventListener("touchstart", onTouchStart);
        targetRef.current.removeEventListener("touchmove", onTouchMove);
        targetRef.current.removeEventListener("touchend", onTouchEnd);
      };
    }
  }, [targetRef]);

}


export { useMoveGesture };

