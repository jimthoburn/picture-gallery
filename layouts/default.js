
import { config } from "../_config.js";

export const DefaultLayout = ({ url, title, content, askSearchEnginesNotToIndex, includeClientJS = true, openGraphImage }) => {
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

        ${ url && config.host
          ? `<link rel="canonical" href="${ config.host }${ url }" />`
          : ""}

        <link rel="icon" href="${ config.favicon }" />

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Fredericka+the+Great&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="/css/shared.css" />
        <link rel="stylesheet" href="/css/album.css" />
        <link rel="stylesheet" href="/css/picture.css" />
        <link rel="stylesheet" href="/css/transition.css" />

        <link rel="preconnect" href="https://esm.sh" />

        <script type="importmap">
        {
          "imports": {
            "htm": "https://esm.sh/v135/htm@3.1.1?bundle-deps",
            "lit": "https://esm.sh/v135/lit@3.1.0?bundle-deps",
            "markdown-it": "https://esm.sh/v135/markdown-it@14.0.0?bundle-deps",
            "markdown-it-deflist": "https://esm.sh/v135/markdown-it-deflist@3.0.0?bundle-deps",
            "preact": "https://esm.sh/v135/preact@10.19.3",
            "preact/": "https://esm.sh/v135/preact@10.19.3/",
            "react": "https://esm.sh/v135/preact@10.19.3/compat?external=preact",
            "xstate": "https://esm.sh/v135/xstate@5.17.1?bundle-deps",
            "@xstate/react": "https://esm.sh/v135/@xstate/react@4.1.1?bundle-deps&external=react,xstate"
          }
        }
        </script>

        ${ /* web components */ '' }
        <link rel="modulepreload" href="https://esm.sh/v135/lit@3.1.0?bundle-deps" />
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
