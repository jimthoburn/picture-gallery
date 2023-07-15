
import { useEffect } from "preact/hooks";

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

      // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
      const options = { passive: false };

      targetRef.current.addEventListener("touchstart", onTouchStart, options);
      targetRef.current.addEventListener("touchmove", onTouchMove, options);
      targetRef.current.addEventListener("touchend", onTouchEnd, options);
      return () => {
        targetRef.current.removeEventListener("touchstart", onTouchStart, options);
        targetRef.current.removeEventListener("touchmove", onTouchMove, options);
        targetRef.current.removeEventListener("touchend", onTouchEnd, options);
      };
    }
  }, [targetRef]);

}


export { useMoveGesture };

