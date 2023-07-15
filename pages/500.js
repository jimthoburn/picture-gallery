
import { createElement }  from "preact";
import   htm              from "htm";
const    html = htm.bind(createElement);


const error500PageTitle = "Something went wrong on this page";


function Error500Page({ errorMessage }) {

  return html`
  <section>
  
    <h1>Uh oh!</h1>

    <p>Something went wrong on this page.</p>
    <p>You may want to visit the <a href="/">home page</a> instead.</p>
    
    <p><small>Error details:<br /><pre><code>${ errorMessage }</code></pre></small></p>
  </section>
  `;
}


export { Error500Page, error500PageTitle };

