
import { createElement }  from "../web_modules/preact.js";
import   htm              from "../web_modules/htm.js";
const    html = htm.bind(createElement);
import { getSource,
         getSourceSet,
         IMAGE_LIST_SIZES }   from "../helpers/image-source-set.js";

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
            <a href="/${parent.uri}/${album.uri}/">
              <responsive-image
                aspect-ratio="${picture.width}/${picture.height}"
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
                <img
                  src="${getSource({parent, album, picture})}"
                  srcset="${getSourceSet({parent, album, picture})}"
                  sizes="${getSourceSet({parent, album, picture}) ? sizes : null}"
                  loading="lazy"
                  alt=""
                  width="${ 320 * (picture.width  > picture.height ? 1 : picture.width/picture.height) }"
                  height="${320 * (picture.height > picture.width  ? 1 : picture.height/picture.width) }"
                  data-style="background-color: ${picture.primaryColor}" />
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

