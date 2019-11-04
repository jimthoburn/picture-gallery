
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
        ${children.map((child, index) => {
          const match = album.pictures.filter(picture =>
            picture.filename === album.cover_picture || 
            picture.source   === album.cover_picture
          );
          const picture = match.length > 0 ? match[0] : child.pictures[0];
          const album = child;

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
                <span class="caption">${ child.title }</span>
              </responsive-image>
            </a>
          </li>
          `
        })}
      </ol>
    </section>

  `;
}


export { ParentAlbumPage };

