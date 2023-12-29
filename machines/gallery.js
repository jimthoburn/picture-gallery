import { setup,
         createMachine }   from "xstate";
import { actions,
         guards }          from "../machines/gallery-options.js";

const LOADING_PICTURE_TIMEOUT_SECONDS = 0.01;
const TRANSITION_TIMEOUT_SECONDS = 1;

const galleryMachine = setup({
  actions,
  guards,
  delays: {
    loading_picture_delay: LOADING_PICTURE_TIMEOUT_SECONDS * 1000,
    transition_timeout_delay: TRANSITION_TIMEOUT_SECONDS * 1000,
  }
}).createMachine(
  {
    id: "gallery",
    context: ({ input }) => ({
      album: input.album ?? null,
      pictures: input.pictures ?? null,
      selectedPictureIndex: input.selectedPictureIndex ?? null,
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
    }),
    initial: "setting_up",
    states: {
      setting_up: {
        always: [
          { target: "showing_details", guard: "hasSelectedPictureIndex" },
          { target: "showing_list" }
        ],
      },
      showing_list: {
        on: {
          PICTURE_SELECTED: {
            target: "transitioning_to_details",
            actions: ["setSelectedImageIndex", "setDetailsPictureLoaded", "updateBrowserForDetailsPage"]
          }
        }
      },
      transitioning_to_details: {
        on: {
          DETAILS_CLOSED: [
            {
              target: "transitioning_to_list",
              actions: ["updateBrowserForListPage"],
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
            after: {
              loading_picture_delay: {
                target: "preparing_transition"
              }
            },
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
            after: {
              transition_timeout_delay: {
                target: "done"
              },
            },
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
              actions: ["updateBrowserForListPage"],
            }
          ],
          PICTURE_SELECTED: {
            target: "showing_details",
            actions: ["setSelectedImageIndex", "setDetailsPictureLoaded", "updateBrowserForDetailsPage"]
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
                  guard: "movedPictureFarEnough"
                },
                { target: "moving_picture", actions: "setMoveTransform" }
              ],
              LET_GO_OF_PICTURE: [
                {
                  target: "idle",
                  actions: ["resetTransform", "updateBrowserForListPage"],
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
              LET_GO_OF_PICTURE: [
                {
                  target: "done",
                  actions: ["updateBrowserForListPage"],
                }
              ],
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
            actions: ["setSelectedImageIndex", "setDetailsPictureLoaded", "updateBrowserForDetailsPage"]
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
              TRANSITION_END: {
                target: "done",
              },
            },
            transition_timeout_delay: {
              target: "done"
            },
          },
          done: {
            type: "final"
          }
        }
      }
    }
  },
);

export { galleryMachine };
