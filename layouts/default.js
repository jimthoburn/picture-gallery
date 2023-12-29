
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
            "htm": "https://esm.sh/v135/htm@3.1.1?bundle",
            "lit": "https://esm.sh/v135/lit@3.1.0?bundle",
            "markdown-it": "https://esm.sh/v135/markdown-it@14.0.0?bundle",
            "markdown-it-deflist": "https://esm.sh/v135/markdown-it-deflist@3.0.0?bundle",
            "preact": "https://esm.sh/v135/preact@10.19.3?bundle",
            "preact/hooks": "https://esm.sh/v135/preact@10.19.3/hooks?bundle",
            "react": "https://esm.sh/preact@10.19.3/compat?bundle&external=preact",
            "xstate": "https://esm.sh/v135/xstate@5.4.0?bundle",
            "@xstate/react": "https://esm.sh/v135/@xstate/react@4.0.1?bundle&external=react,xstate"
          }
        }
        </script>

        ${ /* web components */ '' }
        <link rel="modulepreload" href="https://esm.sh/v135/lit@3.1.0?bundle" />
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
