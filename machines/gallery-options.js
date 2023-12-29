
import { assign } from "xstate";

import { getSelectedPicture as getListPicture } from "../components/picture-list.js";
import { getPicture as getDetailsPicture }      from "../components/picture-image.js";
import { formatPageTitle }                      from "../helpers/page-title.js";


const PICTURE_MOVE_THRESHOLD_PIXELS = 25;


const setDetailsPictureLoaded = assign({
  detailsPictureLoaded: ({ event }) => {
    console.log("setDetailsPictureLoaded: " + (event.type === "PICTURE_LOADED"));
    return event.type === "PICTURE_LOADED";
  }
});

const setSelectedImageIndex = assign({
  selectedPictureIndex: ({ event }) => event.selectedPictureIndex
});

const hasSelectedPictureIndex = function({ context }) {
  return context.selectedPictureIndex != null;
};

const setBoundingClientRect = assign({
  fromBoundingClientRect: ({ context }) => {
    return (getDetailsPicture())
      ? getDetailsPicture().getBoundingClientRect()
      : context.fromBoundingClientRect
    },
  toBoundingClientRect: ({ context }) => {
    return (getListPicture())
      ? getListPicture().getBoundingClientRect()
      : context.toBoundingClientRect
    }
});

const setInitialTouch = assign({
  initialTouch: ({ event }) => event.touch
});

const movedPictureFarEnough = function({ context, event }) {
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
  transform: ({ context, event }) => {
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
  transform: ({ context }) => {
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
  transform: () => {
    return {
      translateX: 0,
      translateY: 0,
      scale: 1
    };
  }
});


// Update the page URL and title to match the current state
const updateBrowserForListPage = ({ context, event }) => {
  const album = context.album;
  if (album.parent) {
    document.title = `${album.title} / ${album.parent.title}`;
  } else {
    document.title = album.title;
  }

  if (event.didPopHistoryState != true) {
    console.log("🎉 Pushing state to browser history");
    console.log([
      { },
      album.title,
      `/${album.uri}/`
    ])
    window.history.pushState(
      { },
      album.title,
      `/${album.uri}/`
    );
  }
};
const updateBrowserForDetailsPage = ({ context, event }) => {
  const { album, pictures } = context;

  // 🤖 TEST:
  if (new URLSearchParams(window.location.search).get("test") === "error-after-user-interaction") {
    throw "Simulating a client-side error after user interaction";
    return;
  }

  const selectedPicture = pictures[context.selectedPictureIndex];
  const selectedPictureTitle = formatPageTitle({
    imageNumber: context.selectedPictureIndex + 1,
    imageCaption: selectedPicture.caption,
    albumTitle: album.title
  });

  document.title = selectedPictureTitle;

  if (event.didPopHistoryState != true) {
    console.log("🎉 Pushing state to browser history");
    console.log([
      { selectedPictureIndex: context.selectedPictureIndex },
      selectedPictureTitle,
      `/${album.uri}/${selectedPicture.uri}/`
    ])
    window.history.pushState(
      { selectedPictureIndex: context.selectedPictureIndex },
      selectedPictureTitle,
      `/${album.uri}/${selectedPicture.uri}/`
    );
  }
};


const actions = {
  setDetailsPictureLoaded,
  setSelectedImageIndex,
  setBoundingClientRect,
  setInitialTouch,
  setMoveTransform,
  setShrinkTransform,
  resetTransform,
  updateBrowserForDetailsPage,
  updateBrowserForListPage,
};

const guards = {
  hasSelectedPictureIndex,
  movedPictureFarEnough
};


export {
  actions,
  guards,
};

