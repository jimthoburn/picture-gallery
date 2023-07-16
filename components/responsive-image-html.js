

const style = `
  :host {
    border: 1px solid transparent;
    display: block;
    position: relative;
    overflow: hidden;
    width: var(--width);
    height: var(--height);
  }

  ::slotted(img) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  ::slotted(picture) {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  ::slotted(img.preview) {
    margin: calc(0% - 3em);
    width: calc(100% + 6em);
    height: calc(100% + 6em);
    filter: blur(1.5em);
  }
  ::slotted(img.preview.loaded) {
    display: none;
  }
`;


function aspectRatioIsValid(aspectRatio) {
  return (aspectRatio && aspectRatio.split("/").length >= 2 &&
      !isNaN(aspectRatio.split("/")[0].trim()) &&
      !isNaN(aspectRatio.split("/")[1].trim()) )
}


const responsiveImageHTML = ({ maxWidth = "100vw", maxHeight = "100vh", html, ...rest }) => {
  // Handle the case where aspect ratio is not valid
  const aspectRatio =
    aspectRatioIsValid(rest.aspectRatio) ? rest.aspectRatio : "1/1";

  const [width, height] = 
    aspectRatio.split("/").map(
      string => Number(string.trim())
    );

  if (maxWidth  === "100vw" &&
      maxHeight === "100vh") {
    return html`
      <style>
        ${style}

        :host {
          --width:  ${maxWidth};
          --height: calc(${height / width} * ${maxWidth});
        }

        @media (min-aspect-ratio: ${aspectRatio}) {
          :host {
            --width: calc(${width / height} * ${maxHeight});
            --height: ${maxHeight};
          }
        }
      </style>
      <slot></slot>`
    ;
  } else if (width > height) {
    return html`
      <style>
          ${style}

          :host {
            --width:  ${maxWidth};
            --height: calc(${height / width} * ${maxWidth});
          }
      </style>
      <slot></slot>`
    ;
  } else if (height > width) {
    return html`
      <style>
        ${style}

        :host {
          --width: calc(${width / height} * ${maxHeight});
          --height: ${maxHeight};
        }
      </style>
      <slot></slot>`
    ;
  } else {
    return html`
      <style>
        ${style}

        :host {
          --width: ${maxWidth};
          --height: ${maxHeight};
        }
      </style>
      <slot></slot>`
    ;
  }
};


export { responsiveImageHTML };

