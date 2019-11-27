

import { LitElement, html, css } from "../web_modules/lit-element.js";


class ResponsiveImage extends LitElement {


  static get properties() {
    return {
      "aspect-ratio": { type: String },
      "max-width"   : { type: String },
      "max-height"  : { type: String }
    };
  }


  static get styles() {
    return css`

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
  }


  constructor() {
    super();

    this["aspect-ratio"] = "1/1";

    this["max-height"] = "100vh";
    this["max-width"]  = "100vw";

    this.onImageLoaded = (e) => {
      const image = this.querySelector("img.preview");
      if (image) image.classList.add("loaded");
    }
  }


  connectedCallback() {
    super.connectedCallback();

    const image = this.querySelector("img:not(.preview)");

    if (image) image.addEventListener("load", this.onImageLoaded);

    // https://stackoverflow.com/questions/1977871/check-if-an-image-is-loaded-no-errors-with-jquery#answer-1978021
    if (image && image.complete && image.naturalWidth != 0) {
      this.onImageLoaded();
    }
  }


  disconnectedCallback() {
    super.disconnectedCallback();

    const image = this.querySelector("img:not(.preview)");

    if (image) this.querySelector("img:not(.preview)").removeEventListener("load", this.onImageLoaded);
  }


  render() {
    let aspectRatio = this["aspect-ratio"];

    // Handle the case where aspect ratio is not valid
    if (isNaN(aspectRatio.split("/")[0]) || isNaN(aspectRatio.split("/")[1])) {
      aspectRatio = "1/1";
    }

    const [width, height] = aspectRatio.split("/");
    const maxWidth  = this["max-width"];
    const maxHeight = this["max-height"];

    if (maxWidth  === "100vw" &&
        maxHeight === "100vh") {
      return html`
        <style>
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
          :host {
            --width: ${maxWidth};
            --height: ${maxHeight};
          }
        </style>
        <slot></slot>`
      ;
    }
  }


}


customElements.define('responsive-image', ResponsiveImage);

