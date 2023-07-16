

import { LitElement, html, css } from "lit";


import { responsiveImageHTML } from "./responsive-image-html.js";


class ResponsiveImage extends LitElement {


  static get properties() {
    return {
      "aspect-ratio": { type: String },
      "max-width"   : { type: String },
      "max-height"  : { type: String }
    };
  }


  static get styles() {
    return css``;
  }


  constructor() {
    super();

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

    if (image) this.querySelector("img:not(.preview)")
                   .removeEventListener("load", this.onImageLoaded);
  }


  render() {
    const aspectRatio = this["aspect-ratio"];
    const maxWidth = this["max-width"];
    const maxHeight = this["max-height"];
    return responsiveImageHTML({ aspectRatio, maxWidth, maxHeight, html });
  }


}

customElements.define('responsive-image', ResponsiveImage);

