
import { config } from "../_config.js";

export const DefaultLayout = ({ title, content, askSearchEnginesNotToIndex, includeClientJS = true, openGraphImage }) => {
  return `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />

        ${ askSearchEnginesNotToIndex || config.askSearchEnginesNotToIndex 
          ? `<meta name="robots" content="noindex" />`
          : ""}
        <title>${ title }</title>

        ${ openGraphImage 
          ? `<meta property="og:image" content="${ openGraphImage }" />`
          : ""}

        <link rel="icon" href="${ config.favicon }" />

        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Fredericka+the+Great&amp;display=swap" />
        <link rel="stylesheet" href="/css/shared.css" />
        <link rel="stylesheet" href="/css/album.css" />
        <link rel="stylesheet" href="/css/picture.css" />
        <link rel="stylesheet" href="/css/transition.css" />

        <link rel="preconnect" href="https://esm.sh" />

        <script type="importmap">
          {
            "imports": {
              "htm": "https://esm.sh/v128/htm@3.1.1?bundle",
              "lit": "https://esm.sh/v128/lit@2.8.0?bundle",
              "markdown-it": "https://esm.sh/v128/markdown-it@13.0.2?bundle",
              "markdown-it-deflist": "https://esm.sh/v128/markdown-it-deflist@2.1.0?bundle",
              "preact": "https://esm.sh/v128/preact@10.18.0?bundle",
              "preact/hooks": "https://esm.sh/v128/preact@10.18.0/hooks?bundle",
              "xstate": "https://esm.sh/v128/xstate@4.38.3?bundle"
            }
          }
        </script>

        ${ /* web components */ '' }
        <link rel="modulepreload" href="https://esm.sh/v128/lit@2.8.0?bundle" />
        <script type="module" src="/components/responsive-image-html.js"></script>
        <script type="module" src="/components/responsive-image.js"></script>

        ${ includeClientJS 
          ? `
          <script type="module" src="/client.js"></script>
          `
          : ""}
      </head>
      <body>
        ${ content }
      </body>
    </html>
  `;
};
