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
    /** @xstate-layout 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 */
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
