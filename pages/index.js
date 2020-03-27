
import { createElement }  from "../web_modules/preact.js";
import   htm              from "../web_modules/htm.js";
const    html = htm.bind(createElement);
import { getSource,
         getSourceSet,
         IMAGE_LIST_SIZES }   from "../helpers/image-source-set.js";


function IndexPage({ title, date, albums }) {

  // console.log("IndexPage");
  // console.log(albums);

  return html`
    <section class="picture-list picture-list__has-captions">
      <h1>${ title }</h1>
      
      ${ (date)
         ? html`<p>${ date }</p>`
         : "" }

      <ol>
        ${albums.map((album, index) => {
          let match, picture, sourceData;

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
              sourceData = {
                parent: album,
                album: matchingAlbums[0],
                picture
              }

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
              sourceData = {
                parent: album,
                album: matchingAlbum,
                picture
              }

            // Default to the cover picture for the first album
            } else {
              match = album.albums[0].pictures.filter(picture =>
                picture.filename === album.albums[0].coverPicture || 
                picture.source   === album.albums[0].coverPicture
              );
              picture = match.length > 0 ? match[0] : album.albums[0].pictures[0];
              sourceData = {
                parent: album,
                album: album.albums[0],
                picture
              }
            }

          // Regular albums
          } else {
            match = album.pictures.filter(picture =>
              picture.filename === album.coverPicture || 
              picture.source   === album.coverPicture
            );
            picture = match.length > 0 ? match[0] : album.pictures[0];
            sourceData = {
              album,
              picture
            }
          }

          const sizes = (picture.width && picture.height)
            ? `(min-width: 60em) 33vw, (min-width: 30em) 50vw, 100vw`
            : `100vw`;

          return html`
            <li>
              <a href="/${album.uri}/">
                <responsive-image
                  aspect-ratio="${
                    (picture.width && picture.height)
                    ? `${picture.width} / ${picture.height}`
                    : "1 / 1"
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
                  <img
                    src="${   getSource(   sourceData)}"
                    srcset="${getSourceSet(sourceData)}"
                    sizes="${ getSourceSet(sourceData) ? sizes : null}"
                    loading="lazy"
                    alt="${
                      (picture.description)
                      ? picture.description
                      : `Picture ${index + 1}`
                    }"
                    width="${ 320 * (picture.width  > picture.height ? 1 : picture.width/picture.height) }"
                    height="${320 * (picture.height > picture.width  ? 1 : picture.height/picture.width) }"
                    data-style="background-color: ${ picture.primaryColor || "unset" }" />
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

