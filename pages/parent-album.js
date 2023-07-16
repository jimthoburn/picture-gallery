
import { createElement }  from "preact";
import   htm              from "htm";
const    html = htm.bind(createElement);

import { getSource }      from "../helpers/image-source-set.js";
import { PictureElement } from "../components/picture-element.js";
import { responsiveImageHTML } from "../components/responsive-image-html.js";

function ParentAlbumPage({ parent, children, config }) {

  return html`
    <section class="picture-list picture-list__has-captions">
      <h1>${ parent.title }</h1>
      <p>${ parent.date }</p>

      <ol>
        ${children.map((album, index) => {
          const match = album.pictures.filter(picture =>
            picture.filename === album.coverPicture || 
            picture.source   === album.coverPicture
          );
          const picture = match.length > 0 ? match[0] : album.pictures[0];

          const sizes = (picture.width && picture.height)
            ? `(min-width: 60em) 33vw, (min-width: 30em) 50vw, 100vw`
            : `100vw`;

          const aspectRatio = (picture.width && picture.height)
            ? `${picture.width}/${picture.height}`
            : "1/1"

          return html`
          <li>
            <a href="/${album.uri}/">
              <responsive-image
                aspect-ratio="${
                  (picture.width && picture.height)
                  ? `${picture.width}/${picture.height}`
                  : "1/1"
                }"
                max-width="100%"
                max-height="100%">
                <template shadowrootmode="open">
                  ${responsiveImageHTML({ aspectRatio, maxWidth: "100%", maxHeight: "100%", html })}
                </template>
                ${ (picture.previewBase64)
                   ? html`
                  <img
                    class="preview"
                    width="0"
                    height="0"
                    src="data:image/jpeg;base64,${picture.previewBase64}" alt="" />`
                   : "" }
                   
                <${PictureElement} album="${album}" picture="${picture}" sizes="${sizes}" config="${config}">
                  <img
                    src="${getSource({album, picture, type: "jpeg"})}"
                    loading="lazy"
                    alt="${
                    (picture.description)
                    ? picture.description
                    : `Picture ${index + 1}`
                    }"
                    width="${ (picture.width)  ? 320 * (picture.width  > picture.height ? 1 : picture.width / picture.height) : null }"
                    height="${(picture.height) ? 320 * (picture.height > picture.width  ? 1 : picture.height / picture.width) : null }"
                    ${/* SHIM: Make <picture><img /></picture> fill the available space (but only if <picture /> exists) */ ''}
                    style="${picture.filename ? "width: 100%; height: auto;" : ""}"
                  />
                </${PictureElement}>
              </responsive-image>
              <span class="caption">${ album.title }</span>
            </a>
          </li>
          `
        })}
      </ol>
    </section>

  `;
}


export { ParentAlbumPage };

