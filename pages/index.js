
import { createElement }  from "../web_modules/preact.js";
import   htm              from "../web_modules/htm.js";
const    html = htm.bind(createElement);
import { getSource,
         getSourceSet,
         IMAGE_LIST_SIZES }   from "../helpers/image-source-set.js";


function IndexPage({ title, date, albums }) {

  return html`
    <section class="picture-list picture-list__has-captions">
      <h1>${ title }</h1>
      
      ${ (date)
         ? html`<p>${ date }</p>`
         : "" }

      <ol>
        ${albums.map((album, index) => {
          const match = album.pictures.filter(picture =>
            picture.filename === album.coverPicture || 
            picture.source   === album.coverPicture
          );
          const picture = match.length > 0 ? match[0] : album.pictures[0];

          return html`
            <li>
              <a href="/${album.uri}/">
                <responsive-image>
                  <img
                    src="${getSource({album, picture})}"
                    srcset="${getSourceSet({album, picture})}"
                    sizes="${getSourceSet({album, picture}) ? IMAGE_LIST_SIZES : null}"
                    alt=""
                    width="320" />
                </responsive-image>
                <span class="caption">${ album.title }</span>
              </a>
            </li>
          `;

        })}
      </ol>
    </section>

  `;
}


export { IndexPage };

