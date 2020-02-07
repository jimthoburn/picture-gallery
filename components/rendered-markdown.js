
import { createElement }      from "../web_modules/preact.js";
import   htm                  from "../web_modules/htm.js";
const    html = htm.bind(createElement);
import   MarkdownIt           from "../web_modules/markdown-it.js";
import   deflist              from "../web_modules/markdown-it-deflist.js";

const md = new MarkdownIt().use(deflist);

function RenderedMarkdown({ markdown }) {
  return html`<div dangerouslySetInnerHTML=${ { __html: md.render(markdown) } }></div>`
}


export { RenderedMarkdown };

