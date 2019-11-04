
import { createElement }  from "../web_modules/preact.js";
import   htm              from "../web_modules/htm.js";
const    html = htm.bind(createElement);


const error404PageTitle = "This page couldn’t be found";


function Error404Page() {

  return html`
  <section>

    <h1>Oops!</h1>
    <p>This page couldn’t be found.</p>
    <p>You may want to visit the <a href="/">home page</a> instead.</p>

  </section>
  `;
}


export { Error404Page, error404PageTitle };

