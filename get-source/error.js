
import jsBeautify from "js-beautify";

import { render }            from "../web_modules/preact-render-to-string.js";
import { config }            from "../_config.js";
import { Error404Page,
         error404PageTitle } from "../pages/404.js";
import { Error500Page,
         error500PageTitle } from "../pages/500.js";
import { DefaultLayout }     from "../layouts/default.js";


function getError404HTML() {
  const title   = error404PageTitle;
  const content = render(Error404Page());

  const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({
    title,
    content,
    includeClientJS: false
  }));

  return beautifiedHTML;
}

function getError500HTML(err) {
  const title   = error500PageTitle;
  const content = render(Error500Page({ errorMessage: err.stack }));

  const beautifiedHTML = jsBeautify.html_beautify(DefaultLayout({
    title,
    content,
    includeClientJS: false
  }));

  return beautifiedHTML;
}


export {
  getError404HTML,
  getError500HTML
}

