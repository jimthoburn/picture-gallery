// See a visualization of this machine at:
// https://xstate.js.org/viz/?gist=18995ef2fca6c1949991f21b1b68c6d0

import { Machine } from "../web_modules/xstate.js";

const LOADING_PICTURE_TIMEOUT_SECONDS = 0.01;
const TRANSITION_TIMEOUT_SECONDS = 1;

const galleryMachine = Machine(
  {
    id: "gallery",
    context: {
      didPopHistoryState: null,
      selectedPictureIndex: null,
      detailsPictureLoaded: null,
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
            target: "transitioning_to_details",
            actions: ["setSelectedImageIndex", "setDetailsPictureLoaded", "setDidPopHistoryState"]
          }
        }
      },
      transitioning_to_details: {
        on: {
          DETAILS_CLOSED: [
            {
              target: "transitioning_to_list",
              actions: ["setDidPopHistoryState"]
            }
          ],
          PICTURE_LOADED: [
            {
              actions: ["setDetailsPictureLoaded"]
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
        exit: ["setDetailsPictureLoaded"],
        on: {
          DETAILS_CLOSED: [
            {
              target: "transitioning_to_list",
              actions: ["setDidPopHistoryState"]
            }
          ],
          PICTURE_SELECTED: {
            target: "showing_details",
            actions: ["setSelectedImageIndex", "setDetailsPictureLoaded", "setDidPopHistoryState"]
          },
          PICTURE_LOADED: [
            {
              actions: ["setDetailsPictureLoaded"]
            }
          ]
        },
        onDone: "transitioning_to_list",
        initial: "idle",
        states: {
          idle: {
            on: {
              MOVE_START: [
                {
                  target: "rendering_list",
                  actions: ["setInitialTouch"]
                }
              ]
            }
          },
          rendering_list: {
            on: {
              RENDERED: [
                {
                  target: "moving_picture",
                  actions: ["setBoundingClientRect"]
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
        exit: "resetTransform",
        on: {
          PICTURE_SELECTED: {
            target: "transitioning_to_details",
            actions: ["setSelectedImageIndex", "setDetailsPictureLoaded", "setDidPopHistoryState"]
          }
        },
        onDone: "showing_list",
        initial: "rendering_list",
        states: {
          rendering_list: {
            on: {
              RENDERED: "transitioning"
            }
          },
          transitioning: {
            entry: ["setBoundingClientRect", "setShrinkTransform"],
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
      }
    }
  },
  {
    actions: {
      setDidPopHistoryState: function() {},
      setDetailsPictureLoaded: function() {},
      setSelectedImageIndex: function() {},
      setBoundingClientRect: function() {},
      setInitialTouch: function() {},
      setMoveTransform: function() {},
      setShrinkTransform: function() {},
      resetTransform: function() {}
    },
    guards: {
      hasSelectedPictureIndex: function() {},
      movedPictureFarEnough: function() {}
    }
  }
);

export { galleryMachine };
