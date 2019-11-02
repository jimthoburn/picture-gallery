
import { createElement }  from "../web_modules/preact.js";
import   htm              from "../web_modules/htm.js";
const    html = htm.bind(createElement);
import { PictureGallery } from "../components/picture-gallery.js";


function IndexPage({ album, pictures, getPageURL }) {

  return html`
    <${PictureGallery}
      album="${album}"
      pictures="${pictures}"
      getPageURL="${getPageURL}" />
  `;
}


export { IndexPage };

