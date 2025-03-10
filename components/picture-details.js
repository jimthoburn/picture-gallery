
import { createElement }        from "preact";
import   htm                    from "htm";
const    html = htm.bind(createElement);
import { PictureImage }         from "../components/picture-image.js";
import { PictureNavigation }    from "../components/picture-navigation.js";
import { CloseButton }          from "../components/close-button.js";


function PictureDetails({ pictures, album, state, config, pictureListShouldRender }) {

  const picture = pictures[state.context.selectedPictureIndex];

  const downloadURL = picture.filename
    ? `/pictures/${ album.uri }/original/${ picture.filename }`
    : picture.source;

  // 1) Remove “https://”
  //    https://regex101.com/r/WgRjOx/1
  // 2) Remove starting slash
  //    https://regex101.com/r/WgRjOx/2
  // 3) Replace slashes with dashes
  const downloadFilename = downloadURL.replace(/http[s]?\:\/\//, "").replace(/^\//, "").replace(/\//g, "-");

  const stateStrings = typeof state.value === "string" ? [state.value] : [Object.entries(state.value).reduce(
    (accumulator, [key,entry]) => `${key}.${entry}`,
    "",
  )];

  const headingText = `Picture ${ state.context.selectedPictureIndex + 1 }.${ picture.caption ? ` ${picture.caption}` : "" }`;

  return html`
    <section aria-atomic="true"
             class="picture-details"
             data-picture-list-rendered="${pictureListShouldRender}"
             data-state="${stateStrings[stateStrings.length - 1]}"
             style="--scale: ${state.context.transform.scale};
                    --translateX: ${state.context.transform.translateX};
                    --translateY: ${state.context.transform.translateY};">
      <header>
        <div class="all">
          <h1 aria-live="polite">${headingText}</h1>
          <p><${CloseButton} album="${album}" state="${state}" /></p>
        </div>
        <p class="download">
          <a href="${ downloadURL }" download="${ downloadFilename }">
            Download
          </a>
        </p>
      </header>

      <a href="${ downloadURL }" aria-live="polite">
        ${// 📚 SHIM: Use an array and a key, even though there’s only one item
          //         so that the image element will be removed and re-added to
          //         the DOM when the data changes (to prevent the browser from
          //         continuing to show the old image while the new image loads).
          [""].map(item => {
          return html`
          <${PictureImage} key="${picture.uri}" album="${album}" picture="${picture}" state="${state}" config="${config}" />
          `
        })}
      </a>

      <${PictureNavigation} pictures=${pictures} album=${album} state=${state} config="${config}"></${PictureNavigation}>
    </section>
  `;
}


export { PictureDetails };

