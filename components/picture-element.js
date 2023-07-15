
import { createElement }        from "preact";
import   htm                    from "htm";
const    html = htm.bind(createElement);

import { getSource,
         getSourceSet }         from "../helpers/image-source-set.js";

function PictureElement({ album, picture, sizes, children, config }) {
  if (picture.filename) {
    return html`
      <picture>

        ${ (config && config.imageFormats && config.imageFormats.avif) ?
          html`
          <source
            srcset="${getSourceSet({album, picture, type: "avif"})}"
            sizes=" ${getSourceSet({album, picture}) ? sizes : null}"
            type="image/avif"
            />
          ` : "" }

        ${ (config && config.imageFormats && config.imageFormats.webp) ?
          html`
          <source
            srcset="${getSourceSet({album, picture, type: "webp"})}"
            sizes=" ${getSourceSet({album, picture}) ? sizes : null}"
            type="image/webp"
            />
          ` : "" }

        <source
          srcset="${getSourceSet({album, picture, type: "jpeg"})}"
          sizes=" ${getSourceSet({album, picture}) ? sizes : null}"
          type="image/jpeg"
          />

        ${children}
      </picture>
    `;
  } else {
    return children;
  }
}


export { PictureElement };

