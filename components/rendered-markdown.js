
import { createElement }      from "preact";
import   htm                  from "htm";
const    html = htm.bind(createElement);
import   MarkdownIt           from "markdown-it";
import   deflist              from "markdown-it-deflist";

const md = new MarkdownIt().use(deflist);

function RenderedMarkdown({ markdown }) {
  return html`<div dangerouslySetInnerHTML=${ { __html: md.render(markdown) } }></div>`
}


export { RenderedMarkdown };

