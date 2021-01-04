
import { createElement }        from "../web_modules/preact.js";
import   htm                    from "../web_modules/htm.js";
const    html = htm.bind(createElement);

import { getSource }            from "../helpers/image-source-set.js";
import { PictureElement }       from "../components/picture-element.js";

function ImagePreloader({ album, picture, config }) {

  const sizes = (picture.width && picture.height)
    ? `(min-aspect-ratio: ${picture.width}/${picture.height}) calc(${picture.width / picture.height} * 100vh), 100vw`
    : `100vw`;

  return html`
    <div style="width: 0; height: 0; overflow: hidden; position: absolute; opacity: 0;">
      <${PictureElement} album="${album}" picture="${picture}" sizes="${sizes}" config="${config}">
        <img
          src="${getSource({ album, picture, type: "jpeg" })}"
          alt=""
        />
      </${PictureElement}>
    </div>
  `;
}


export { ImagePreloader };

