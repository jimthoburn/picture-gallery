
import { assign } from "../web_modules/xstate.js";

import { getSelectedPicture as getListPicture } from "../components/picture-list.js";
import { getPicture as getDetailsPicture }      from "../components/picture-image.js";


const PICTURE_MOVE_THRESHOLD_PIXELS = 25;


const setDidPopHistoryState = assign({
  didPopHistoryState: (context, event) => {
    console.log("setDidPopHistoryState: " + event.didPopHistoryState);
    return event.didPopHistoryState;
  }
});

const setDetailsPictureLoaded = assign({
  detailsPictureLoaded: (context, event) => {
    console.log("setDetailsPictureLoaded: " + (event.type === "PICTURE_LOADED"));
    return event.type === "PICTURE_LOADED";
  }
});

const setSelectedImageIndex = assign({
  selectedPictureIndex: (context, event) => event.selectedPictureIndex
});

const hasSelectedPictureIndex = function(context) {
  return context.selectedPictureIndex != null;
};

const setBoundingClientRect = assign({
  fromBoundingClientRect: (context, event) => {
    // console.log("setBoundingClientRect: getDetailsPicture()");
    // console.log(getDetailsPicture());
    // console.log(getDetailsPicture().getBoundingClientRect());
    return (getDetailsPicture())
      ? getDetailsPicture().getBoundingClientRect()
      : context.fromBoundingClientRect
    },
  toBoundingClientRect: (context, event) => {
    // console.log("setBoundingClientRect: getListPicture()");
    // console.log(getListPicture());
    // console.log(getListPicture().getBoundingClientRect());
    return (getListPicture())
      ? getListPicture().getBoundingClientRect()
      : context.toBoundingClientRect
    }
});

const setInitialTouch = assign({
  initialTouch: (context, event) => event.touch
});

const movedPictureFarEnough = function(context, event) {
  console.log("🎏 movedPictureFarEnough");
  if (
    !event.touch ||
    !context.initialTouch ||
    !event.touch.y ||
    !context.initialTouch.y
  ) {
    return false;
  }

  return (
    Math.abs(event.touch.y - context.initialTouch.y) > PICTURE_MOVE_THRESHOLD_PIXELS ||
    Math.abs(event.touch.x - context.initialTouch.x) > PICTURE_MOVE_THRESHOLD_PIXELS
  );
};

const setMoveTransform = assign({
  transform: (context, event) => {
    if (
      !event.touch ||
      !context.initialTouch ||
      !event.touch.y ||
      !context.initialTouch.y
    ) {
      return context.transform;
    }

    const translateX = event.touch.x - context.initialTouch.x;
    const translateY = event.touch.y - context.initialTouch.y;

    // Base the scale on how far the user has pushed the picture, relative to the viewport
    const nextScale = 1.0 - Math.abs(translateY) / event.viewportHeight;

    // Only allow the scale to get smaller over time
    const scale =
      nextScale < context.transform.scale ? nextScale : context.transform.scale;

    return {
      translateX,
      translateY,
      scale
    };
  }
});

const setShrinkTransform = assign({
  transform: (context, event) => {
    // https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect

    // From
    const rectA = context.fromBoundingClientRect;

    // To
    const rectB = context.toBoundingClientRect;

    if (!rectA || !rectB || !rectA.y || !rectB.y) {
      return context.transform;
    }

    let translateX = rectB.x - rectA.x;
    let translateY = rectB.y - rectA.y;
    let scale = rectB.width / rectA.width;

    // Compensate for the transform origin being set to “center” (instead of “top left”)
    translateX += (rectB.width - rectA.width) / 2;
    translateY += (rectB.height - rectA.height) / 2;

    // Compensate for the image already being transformed during a gesture
    if (context.transform.translateY) {
      translateY += context.transform.translateY;
    }
    if (context.transform.translateY) {
      translateX += context.transform.translateX;
    }
    if (context.transform.scale) {
      scale = scale * context.transform.scale;
    }

    return {
      translateX,
      translateY,
      scale
    };
  }
});

const resetTransform = assign({
  transform: (context, event) => {
    return {
      translateX: 0,
      translateY: 0,
      scale: 1
    };
  }
});


const actions = {
  setDidPopHistoryState,
  setDetailsPictureLoaded,
  setSelectedImageIndex,
  setBoundingClientRect,
  setInitialTouch,
  setMoveTransform,
  setShrinkTransform,
  resetTransform
};

const guards = {
  hasSelectedPictureIndex,
  movedPictureFarEnough
}


export {
  actions,
  guards
}

