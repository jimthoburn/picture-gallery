
import { createElement }  from "../web_modules/preact.js";
import   htm              from "../web_modules/htm.js";
const    html = htm.bind(createElement);


function IndexPage({ title, date, albums }) {
  
  return html`
    <section class="picture-list">
      <h1>${ title }</h1>
      
      ${ (date)
         ? html`<p>${ date }</p>`
         : "" }

      <ol>
        ${albums.map((album, index) => {
          const cover = album.pictures[album.cover_picture_index];
          const picture = cover ? cover : album.pictures[0];
          return html`
          <li>
            <a href="/${album.uri}/">
              <responsive-image>
                <img src="${ picture.source }"
                     width="320" />
                <span class="caption">${ album.title }</span>
              </responsive-image>
            </a>
          </li>
          `
        })}
      </ol>
    </section>

  `;
}


export { IndexPage };

