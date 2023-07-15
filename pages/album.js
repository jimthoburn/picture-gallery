
import { createElement }  from "preact";
import   htm              from "htm";
const    html = htm.bind(createElement);
import { PictureGallery } from "../components/picture-gallery.js";


function AlbumPage({ album, pictures, story, getPageURL, config }) {

  return html`
    <${PictureGallery}
      album="${album}"
      pictures="${pictures}"
      story="${story}"
      getPageURL="${getPageURL}"
      config="${config}" />
  `;
}


export { AlbumPage };

