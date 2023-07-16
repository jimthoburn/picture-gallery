
import { config } from "../_config.js";

export const DefaultLayout = ({ title, content, askSearchEnginesNotToIndex, includeClientJS = true, openGraphImage }) => {
  return `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
      <head>
        ${ /* web components */ '' }
        <link rel="preload" crossorigin href="https://esm.sh/v128/lit@2.7.6?bundle" as="script" />
        <link rel="preload" crossorigin href="https://esm.sh/v128/lit@2.7.6/es2021/lit.bundle.mjs" as="script" />
        <link rel="preload" crossorigin href="/components/responsive-image-html.js" as="script" />
        <link rel="preload" crossorigin href="/components/responsive-image.js" as="script" />

        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${ askSearchEnginesNotToIndex || config.askSearchEnginesNotToIndex 
          ? `<meta name="robots" content="noindex" />`
          : ""}
        <title>${ title }</title>

        <link rel="preconnect" href="https://fonts.gstatic.com" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Fredericka+the+Great&amp;display=swap" />
        <link rel="stylesheet" href="/css/shared.css" />
        <link rel="stylesheet" href="/css/album.css" />
        <link rel="stylesheet" href="/css/picture.css" />
        <link rel="stylesheet" href="/css/transition.css" />

        <link rel="icon" href="${ config.favicon }" />
        
        <script type="importmap">
          {
            "imports": {
              "htm": "https://esm.sh/v128/htm@3.1.1?bundle",
              "lit": "https://esm.sh/v128/lit@2.7.6?bundle",
              "markdown-it": "https://esm.sh/v128/markdown-it@13.0.1?bundle",
              "markdown-it-deflist": "https://esm.sh/v128/markdown-it-deflist@2.1.0?bundle",
              "preact": "https://esm.sh/v128/preact@10.16.0?bundle",
              "preact/hooks": "https://esm.sh/v128/preact@10.16.0/hooks?bundle",
              "xstate": "https://esm.sh/v128/xstate@4.38.1?bundle"
            }
          }
        </script>
        <script type="module" crossorigin src="https://esm.sh/v128/lit@2.7.6?bundle"></script>
        <script type="module" crossorigin src="https://esm.sh/v128/lit@2.7.6/es2021/lit.bundle.mjs"></script>
        <script type="module" crossorigin src="/components/responsive-image-html.js"></script>
        <script type="module" crossorigin src="/components/responsive-image.js"></script>
        ${ includeClientJS 
          ? `
          <script type="module" crossorigin src="/client.js"></script>
          `
          : ""}

        ${ openGraphImage 
          ? `<meta property="og:image" content="${ openGraphImage }" />`
          : ""}
      </head>
      <body>
        ${ content }
      </body>
    </html>
  `;
};
