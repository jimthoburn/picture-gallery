

import { LitElement, html, css } from "../web_modules/lit-element.js";


class ResponsiveImage extends LitElement {


  static get properties() {
    return { "aspect-ratio": { type: String } };
  }


  static get styles() {
    return css`

      ::slotted(img) {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        object-fit: contain;
        /* border: 1px solid green; */
      }

      span {
        border: 1px solid transparent;
        display: block;
        position: relative;
        /* padding-bottom: calc(var(--height) / var(--width) * 100%); */
        padding-bottom: 100%;
      }

    `;
  }


  constructor() {
    super();

    this["aspect-ratio"] = "1/1";
  }


  render() {
    const [width, height] = this["aspect-ratio"].split("/");

    return html`
      <span style="--width: ${width}; --height: ${height}">
        <slot></slot>
      </span>`
    ;
  }


}


customElements.define('responsive-image', ResponsiveImage);

