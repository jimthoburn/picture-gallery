
import { createElement }  from "../web_modules/preact.js";
import   htm              from "../web_modules/htm.js";
const    html = htm.bind(createElement);


function ParentAlbumPage({ parent, children }) {

  return html`
    <section class="picture-list">
      <h1>${ parent.title }</h1>
      <p>${ parent.date }</p>

      <ol>
        ${children.map((child, index) => {
          const match = child.pictures.filter(picture => picture.filename === child.cover_picture_filename);
          const picture = match.length > 0 ? match[0] : child.pictures[0];
          return html`
          <li>
            <a href="/${parent.uri}/${child.uri}/">
              <responsive-image aspect-ratio="2/1">
                <img src="/pictures/${ parent.uri }/${ child.uri }/384-wide/${ picture.filename }"
                     srcset="/pictures/${ parent.uri }/${ child.uri }/384-wide/${ picture.filename } 384w,
                             /pictures/${ parent.uri }/${ child.uri }/512-wide/${ picture.filename } 512w,
                             /pictures/${ parent.uri }/${ child.uri }/768-wide/${ picture.filename } 768w,
                             /pictures/${ parent.uri }/${ child.uri }/1024-wide/${ picture.filename } 1024w,
                             /pictures/${ parent.uri }/${ child.uri }/1536-wide/${ picture.filename } 1536w,
                             /pictures/${ parent.uri }/${ child.uri }/2048-wide/${ picture.filename } 2048w"
                     sizes="320px"
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

