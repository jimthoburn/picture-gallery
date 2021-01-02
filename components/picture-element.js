
import { createElement }        from "../web_modules/preact.js";
import   htm                    from "../web_modules/htm.js";
const    html = htm.bind(createElement);

import { getSource,
         getSourceSet }         from "../helpers/image-source-set.js";

function PictureElement({ album, picture, sizes, children }) {
  if (picture.filename) {
    return html`
      <picture>

        ${/* AVIF */''}
        ${/* 
        <source
          srcset="${getSourceSet({album, picture, type: "avif"})}"
          sizes=" ${getSourceSet({album, picture}) ? sizes : null}"
          type="image/avif"
          />
        */''}

        ${/* WebP */''}
        ${/* 
        <source
          srcset="${getSourceSet({album, picture, type: "webp"})}"
          sizes=" ${getSourceSet({album, picture}) ? sizes : null}"
          type="image/webp"
          />
        */''}

        ${/* JPG */''}
        <source
          srcset="${getSourceSet({album, picture, type: "jpg"})}"
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

