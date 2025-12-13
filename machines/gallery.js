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
    /** @xstate-layout N4IgpgJg5mDOIC5RQIYBs1gE4E8B0sYALkQJYB2UA+gK4AOAxOgO4o6wDaADALqKh0A9rFJlB5fiAAeiALQA2LgGYANCBxz5AFgAcAXz1rUGbPkIkK1ekzSt2HAIx8kIISLESXMhLICc8vCUlLV8uBwBWACZI3wcAdnkdNQ0fbX1DEGNMXAIAC0FmSyo0UlgiBgAFAEkAYQAVAFUAJQBRKgBlFoAZFvqWgBFuZwFhUVJxSW94rXlkuSUwgyN0bPwiLBRyd3HyIqJBKghiFFI0WDw0QRQIIrpSAGMiGiwwStrG1qougHkAQX6BkNJG4xhMvIgHKFInMEDo4r4lpkVqY8OtNttxHsDkciCczhcrjdKFQ7o9nq8pGUUEQwHgUAAzGlYAAUl2utweTxehzAaDYAEoGFkUWitqDdsT9jzcadzmyidRSVywECXCCPJMIfJwrN1IgdDoHIjhTlRRiJdQpTi8ec6C86CgsHsNmKPAxWgA5AGtQa8YGjDXghAOeT+GEOBxacLG5Gml3mrHSm2o+PiywMOpNX4e9pVOpVb4eqgtL2qkbmzXB2K6lIOJTwmMmOPotOS7HHWUplsedOU3E0umM7DMs3iqhkAC2YEENCIPL5OEFJrWqZ7baTndHa6gZdcAZ2lZD4S04aUhsbqy7rp2ietsoYALqvyqXXaVBqP06vuGe4rQYcMRcDCWiRNGGTLleCbrneZxvPUzRtD8-yAn6ar7mCoBTHE4ThOG2ryBeIqrje0EdrBEDiLSVIDhBW4kZa7Yymcu7qge-5KPIqh6sGWhKJEhE5LA+SFMSMHnKQECYAwACy3wAGptO0T5NHULHoZ4mGaFxKRxOe4GxmYwlFGJeAvOQRxOsSJRlO6JbeihP6sRh0hyHC4ZcFoRr6U2hkFMZZHnBOggAG4cmSLwyfJbTVPBrRqX+mk+CGvinlwYHLD5eR+aJAV4EFoXEkq5KRQpVAxR8LSOI56mVrIyWpelSKZUJ2XUCZ+VhcqDA9HUVAAOLfFQ3wAGJle8CHxeKtVBEk3EGgR3mXi1IltblMBlM86ayaV5UTah5ZTUGkTYeG4RcAtGVLUZOVMec61cumPX9YNI1jbFlX7b+h2JXVXBAdxIZcAii0ost-m3Q+LRPi+b4ft8X6TYGiX4cBoECb5K0brBu2fJ0PR9N+-oJS5wahjCkR-V5l2g9dq0QzjiF-AChNocT3h1bx4a+L4cTo1lmNiQwFHkFR-a0hBYM3TaiNsYl4SzSkWghHzdGYuu1lEKZYDmdgRQa7ZXotD6MvOez2lyBTjW0cRasMcUpSa6rFoZlmOZ5gWRZ2SbGkk7I0LcceKs2xa44HPrDMdN0vR1A5RPfSTWh-TCsgLLzIPNtetuh-bNnC6L1LiwZkGtnbGve5WvhnsnnleRk5CCEc8AuMucdI772oOMnBpKHz5hkMS9Ct7Lvs4f7KSyDoaW97TOdEEPpsQvCCtyJ5Pfpyu3b0dnYnzz7Uw6mPiBxHWQeb1nVq5fKnXkrvh6JJ3c1cPx6-F9u2+5XaYAOpZlrB7f-7yAcP9FIvgdBaFPpnEOF9bqv3ov-RKR5cIA0iEoYG1MM5QTtiZPO8CSbxC4MvHiDYX6SzpjaXBZsdA1kQCEZ+6CMbg2TBJTAFCLZIJSPIUM09WpY3OGZCyesHasNSMAxAlc070P5owzsHVCqchvqzeO7NOHhgpuAkhM8TL3U2pQYRsgZinRiNwgWuUcGKLbpQ8McQowQMwdnDWeiybcX0fICRTVLxO0TBrLWOsf6zz0ZCZOMQqbuKImfKBYcHawNtnoyID9x4AToaEjBJd7FRLMQdCxcgALhkTgYAwQA */
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
