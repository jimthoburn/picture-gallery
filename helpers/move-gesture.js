
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

      const target = targetRef.current;

      // https://developer.mozilla.org/en-US/docs/Web/API/EventTarget/addEventListener
      const options = { passive: false };

      target.addEventListener("touchstart", onTouchStart, options);
      target.addEventListener("touchmove", onTouchMove, options);
      target.addEventListener("touchend", onTouchEnd, options);
      return () => {
        target.removeEventListener("touchstart", onTouchStart, options);
        target.removeEventListener("touchmove", onTouchMove, options);
        target.removeEventListener("touchend", onTouchEnd, options);
      };
    }
  }, [targetRef]);

}


export { useMoveGesture };

