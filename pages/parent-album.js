
import { createElement }  from "../web_modules/preact.js";
import   htm              from "../web_modules/htm.js";
const    html = htm.bind(createElement);
import { getSource,
         getSourceSet,
         IMAGE_LIST_SIZES }   from "../helpers/image-source-set.js";

function ParentAlbumPage({ parent, children }) {

  return html`
    <section class="picture-list">
      <h1>${ parent.title }</h1>
      <p>${ parent.date }</p>

      <ol>
        ${children.map((album, index) => {
          const match = album.pictures.filter(picture =>
            picture.filename === album.coverPicture || 
            picture.source   === album.coverPicture
          );
          const picture = match.length > 0 ? match[0] : album.pictures[0];

          return html`
          <li>
            <a href="/${parent.uri}/${album.uri}/">
              <responsive-image aspect-ratio="2/1">
                <img
                  src="${getSource({parent, album, picture})}"
                  srcset="${getSourceSet({parent, album, picture})}"
                  sizes="${getSourceSet({parent, album, picture}) ? IMAGE_LIST_SIZES : null}"
                  alt=""
                  width="320" />
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

