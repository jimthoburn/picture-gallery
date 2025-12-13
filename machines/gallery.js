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
    /** @xstate-layout N4IgpgJg5mDOIC5RQIYBs1gE4E8B0sYALkQJYB2UA+gK4AOAxOgO4o6wDaADALqKh0A9rFJlB5fiAAeiALQAWAJwAOPAHYAzIoCMXAKwAmA-IBsXRfIA0IHHJN7teLtrXy9ZvaeVq9AX1-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-SkUIPkf8L4IAA */
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
