
import { createElement }        from "preact";
import { useRef,
         useLayoutEffect }      from "preact/hooks";
import   htm                    from "htm";
const    html = htm.bind(createElement);
import { isBrowser }            from "../helpers/environment.js";


function getShapeElements({ shape }) {
  switch(shape) {
    case "arrow-right":
      return html`<polygon points="7.3,0.9 18.4,12 7.2,23.1 5.7,21.6 15.2,12.1 5.6,2.6 " />`;
    case "arrow-left":
      return html`<polygon points="16.7,0.9 5.6,12 16.8,23.1 18.3,21.6 8.8,12.1 18.4,2.6 " />`;
  }
}

function Icon({ shape, label }) {

  const svgElement = useRef(null);
  const shapeElements = getShapeElements({ shape });

  if (shapeElements) {
    if (label) {
      return html`
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          aria-label="${ label }"
          ref="${svgElement}"
        >
          <title>${ label }</title>
          <switch>
            <g>${shapeElements}</g>
            <g><foreignObject>${ label }</foreignObject></g>
          </switch>
        </svg>
      `;
    } else {
      return html`
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          ref="${svgElement}"
        >
          ${ shapeElements }
        </svg>
      `;
    }
  } else {
    console.error(`An unexpected “shape” attribute was passed to <Icon />: ${ shape }`);
    return label;
  }
}


export { Icon };

