
import { createElement }        from "../web_modules/preact.js";
import   htm                    from "../web_modules/htm.js";
const    html = htm.bind(createElement);
import { getSource,
         getSourceSet,
         IMAGE_DETAILS_SIZES }  from "../helpers/image-source-set.js";

function ImagePreloader({ album, picture }) {

  return html`
    <div style="width: 0; height: 0; overflow: hidden; position: absolute; opacity: 0;">
      <img
        src="   ${getSource(   { album, picture })}"
        srcset="${getSourceSet({ album, picture })}"
        sizes="
          ${getSourceSet({ album, picture }) 
            ? (picture.width && picture.height)
              ? `(min-aspect-ratio: ${picture.width}/${picture.height}) calc(${picture.width / picture.height} * 100vh),
                 100vw`
              : `100vw`
            : null}"
        alt=""
      />
    </div>
  `;
}


export { ImagePreloader };

