
import { createElement }  from "preact";
import   htm              from "htm";
const    html = htm.bind(createElement);

import { getSource }      from "../helpers/image-source-set.js";
import { PictureElement } from "../components/picture-element.js";
import { responsiveImageHTML } from "../components/responsive-image-html.js";

function IndexPage({ title, date, albums, config }) {

  return html`
    <section class="picture-list picture-list__has-captions">
      <h1>${ title }</h1>
      
      ${ (date)
         ? html`<p>${ date }</p>`
         : "" }

      <ol>
        ${albums.map((album, index) => {
          let match, picture, imageSourceAlbum;

          // If this is a group album
          if (album.albums) {

            // If the group album has a local cover picture specified
            if (album.coverPicture && album.coverPicture.split("/").length === 2) {
              const matchingAlbums = album.albums.filter(
                nextAlbum => {
                  console.log("nextAlbum.uri");
                  console.log(nextAlbum.uri);
                  console.log(`album.coverPicture.split("/")[0]`);
                  console.log(album.coverPicture.split("/")[0])
                  return nextAlbum.uri === album.coverPicture.split("/")[0];
                }
              );
              match = matchingAlbums[0].pictures.filter(picture =>
                picture.filename === album.coverPicture.split("/")[1] || 
                picture.source   === album.coverPicture.split("/")[1]
              );
              picture = match.length > 0 ? match[0] : album.albums[0].pictures[0];
              imageSourceAlbum = matchingAlbums[0];

            // If the group album has a remote cover picture specified
            } else if (album.coverPicture && album.coverPicture.indexOf("http") >= 0) {
              const matchingAlbum = album.albums.filter(
                nextAlbum => {
                  const matchingPictures = nextAlbum.pictures.filter(picture => picture.source === album.coverPicture)
                  if (matchingPictures.length > 0) {
                    picture = matchingPictures[0];
                    return true;
                  }
                }
              );
              imageSourceAlbum = matchingAlbum;

            // Default to the cover picture for the first album
            } else {
              match = album.albums[0].pictures.filter(picture =>
                picture.filename === album.albums[0].coverPicture || 
                picture.source   === album.albums[0].coverPicture
              );
              picture = match.length > 0 ? match[0] : album.albums[0].pictures[0];
              imageSourceAlbum = album.albums[0];
            }

          // Regular albums
          } else {
            match = album.pictures.filter(picture =>
              picture.filename === album.coverPicture || 
              picture.source   === album.coverPicture
            );
            picture = match.length > 0 ? match[0] : album.pictures[0];
            imageSourceAlbum = album;
          }

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
                  aspect-ratio="${aspectRatio}"
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
                  
                  <${PictureElement} album="${imageSourceAlbum}" picture="${picture}" sizes="${sizes}" config="${config}">
                    <img
                      src="${getSource({ album: imageSourceAlbum, picture, type: "jpeg" })}"
                      loading="lazy"
                      alt="${
                        (picture.description)
                        ? picture.description
                        : `Picture ${index + 1}`
                      }"
                      width="${ (picture.width)  ? 320 * (picture.width  > picture.height ? 1 : picture.width / picture.height) : 320 }"
                      height="${(picture.height) ? 320 * (picture.height > picture.width  ? 1 : picture.height / picture.width) : null }"
                      ${/* SHIM: Make <picture><img /></picture> fill the available space (but only if <picture /> exists) */ ''}
                      style="${picture.filename ? "width: 100%; height: auto;" : ""}"
                    />
                  </${PictureElement}>
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

