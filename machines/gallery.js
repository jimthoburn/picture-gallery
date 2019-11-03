// See a visualization of this machine at:
// https://xstate.js.org/viz/?gist=18995ef2fca6c1949991f21b1b68c6d0

import { Machine, assign } from "../web_modules/xstate.js";

const LOADING_PICTURE_TIMEOUT_SECONDS = 0.5;
const TRANSITION_TIMEOUT_SECONDS = 1;
const PICTURE_MOVE_THRESHOLD_PIXELS = 25;

const setSelectedImageIndex = assign({
  selectedPictureIndex: (context, event) => event.selectedPictureIndex
});

const hasSelectedPictureIndex = function(context) {
  return context.selectedPictureIndex != null;
};

const setBoundingClientRect = assign({
  fromBoundingClientRect: (context, event) =>
    event.fromBoundingClientRect
      ? event.fromBoundingClientRect
      : context.fromBoundingClientRect,
  toBoundingClientRect: (context, event) =>
    event.toBoundingClientRect
      ? event.toBoundingClientRect
      : context.toBoundingClientRect
});

const setInitialTouch = assign({
  initialTouch: (context, event) => event.touch
});

const movedPictureFarEnough = function(context, event) {
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

const galleryMachine = Machine(
  {
    id: "gallery",
    context: {
      selectedPictureIndex: null,
      fromBoundingClientRect: null,
      toBoundingClientRect: null,
      initialTouch: {
        x: null,
        y: null
      },
      transform: {
        translateX: 0,
        translateY: 0,
        scale: 1
      }
    },
    initial: "setting_up",
    states: {
      setting_up: {
        on: {
          "": [
            { target: "showing_details", cond: "hasSelectedPictureIndex" },
            { target: "showing_list" }
          ]
        }
      },
      showing_list: {
        on: {
          PICTURE_SELECTED: {
            target: "transitioning_to_details"
          }
        }
      },
      transitioning_to_details: {
        entry: "setSelectedImageIndex",
        on: {
          DETAILS_CLOSED: [
            {
              target: "transitioning_to_list"
            }
          ]
        },
        onDone: "showing_details",
        initial: "loading_picture",
        states: {
          loading_picture: {
            on: {
              PICTURE_LOADED: [
                {
                  target: "preparing_transition"
                }
              ]
            },
            after: [
              {
                delay: LOADING_PICTURE_TIMEOUT_SECONDS * 1000,
                target: "preparing_transition"
              }
            ]
          },
          preparing_transition: {
            entry: ["setBoundingClientRect", "setShrinkTransform"],
            on: {
              RENDERED: "transitioning"
            }
          },
          transitioning: {
            entry: ["resetTransform"],
            on: {
              TRANSITION_END: "done"
            },
            after: [
              {
                delay: TRANSITION_TIMEOUT_SECONDS * 1000,
                target: "done"
              }
            ]
          },
          done: {
            type: "final"
          }
        }
      },
      showing_details: {
        on: {
          DETAILS_CLOSED: [
            {
              target: "transitioning_to_list"
            }
          ],
          PICTURE_SELECTED: {
            target: "showing_details",
            actions: ["setSelectedImageIndex"]
          }
        },
        onDone: "transitioning_to_list",
        initial: "idle",
        states: {
          idle: {
            on: {
              MOVE_START: [
                {
                  target: "moving_picture",
                  actions: ["setInitialTouch", "setBoundingClientRect"]
                }
              ]
            }
          },
          moving_picture: {
            on: {
              MOVE_PICTURE: [
                {
                  target: "gesturing",
                  actions: "setMoveTransform",
                  cond: "movedPictureFarEnough"
                },
                { target: "moving_picture", actions: "setMoveTransform" }
              ],
              LET_GO_OF_PICTURE: [
                {
                  target: "idle",
                  actions: "resetTransform"
                }
              ]
            }
          },
          gesturing: {
            on: {
              MOVE_PICTURE: [
                {
                  target: "gesturing",
                  actions: "setMoveTransform"
                }
              ],
              LET_GO_OF_PICTURE: "done"
            }
          },
          done: {
            type: "final"
          }
        }
      },
      transitioning_to_list: {
        entry: ["setBoundingClientRect", "setShrinkTransform"],
        exit: "resetTransform",
        on: {
          TRANSITION_END: "showing_list",
          PICTURE_SELECTED: "transitioning_to_details"
        },
        after: [
          {
            delay: TRANSITION_TIMEOUT_SECONDS * 1000,
            target: "showing_list"
          }
        ]
      }
    }
  },
  {
    actions: {
      setSelectedImageIndex,
      setBoundingClientRect,
      setInitialTouch,
      setMoveTransform,
      setShrinkTransform,
      resetTransform
    },
    guards: {
      hasSelectedPictureIndex,
      movedPictureFarEnough
    }
  }
);

export { galleryMachine };
