
import { createElement, Component } from "preact";
import htm from "htm"; const html = htm.bind(createElement);

import { getMachine }      from "../components/picture-gallery.js";
import { getLastDispatch } from "../helpers/xstate-preact.js";

class Catcher extends Component {

  constructor(props) {
    super(props);
    this.state = {
      errored: false
    }
  }

  componentDidCatch(error) {
    try {

      console.log("😿 Something went wrong");
      console.error(error);

      // Assume client-side rendering is out of service and
      // attempt to load HTML for the next state from the server.

      // 1) Get the last known state of the machine
      const [lastKnownState, dispatch, service] = getMachine();

      // 2) Get the last message sent to the machine
      const lastDispatch = getLastDispatch();
      console.log("Last dispatch received was...");
      console.log({lastDispatch});

      if (service && lastDispatch) {
        console.log(
          `😺 Catcher is finding the next state...`
        );
        
        // 3) Ask the machine for the next state
        const nextState = service.send(lastDispatch);
        console.log(nextState.value);

        // 4) Visit the URL for that state
        if ((nextState.matches("transitioning_to_details") || 
             nextState.matches("showing_details")) && 
             nextState.context.selectedPictureIndex != null) {
          const nextURL = document.querySelector(
            `.picture-list li:nth-child(${nextState.context.selectedPictureIndex + 1}) a`
          ).getAttribute("href");
          
          console.log(`nextURL: ${nextURL}`);
          if (nextURL != null && nextURL != "") {
            window.location = nextURL;
          }
        } else {
          const nextURL = document.querySelector(
            ".picture-details .all a"
          ).getAttribute("href");
          
          console.log(`nextURL: ${nextURL}`);
          if (nextURL != null && nextURL != "") {
            window.location = nextURL;
          }
        }

      } else {
        console.log(
          `😺 The next state isn’t known. It’s likely that the error happened during
           the initial render, and before any actions by the user.`
        );
      }
    } catch (e) {
      console.error(e);
    }

    this.setState({ errored: true });
  }

  render(props, state) {
    if (state.errored) {
      try {

        // Assume client-side rendering is out of service and that the 
        // the original source HTML for this page is still good
        console.log("😺 Catcher is restoring the original server-side rendered HTML");
        document.body.innerHTML = this.props.originalBodyInnerHTML;
  
        return html``;

      } catch (e) {
        console.error(e);
        return html`
        <section>

          <h1>Uh oh!</h1>

          <p>Something went wrong on this page.</p>

          <p>You may want to visit the <a href="/">home page</a> instead.</p>

        </section>`;
      }
    }

    return this.props.children;
  }
}


export {
  Catcher
};

