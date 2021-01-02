
import { createElement }  from "../web_modules/preact.js";
import   htm              from "../web_modules/htm.js";
const    html = htm.bind(createElement);

import { getSource }      from "../helpers/image-source-set.js";
import { PictureElement } from "../components/picture-element.js";

function ParentAlbumPage({ parent, children }) {

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
                ${ (picture.previewBase64)
                   ? html`
                  <img
                    class="preview"
                    width="${ 320 * (picture.width  > picture.height ? 1 : picture.width/picture.height) }"
                    height="${320 * (picture.height > picture.width  ? 1 : picture.height/picture.width) }"
                    src="data:image/jpeg;base64,${picture.previewBase64}" alt="" />`
                   : "" }
                   
                 <${PictureElement} album="${album}" picture="${picture}" sizes="${sizes}">
                   <img
                     src="${getSource({album, picture, type: "jpg"})}"
                     loading="lazy"
                     alt="${
                       (picture.description)
                       ? picture.description
                       : `Picture ${index + 1}`
                     }"
                     width="${ 320 * (picture.width  > picture.height ? 1 : picture.width/picture.height) }"
                     height="${320 * (picture.height > picture.width  ? 1 : picture.height/picture.width) }"
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

