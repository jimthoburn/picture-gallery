
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
            "htm": "https://esm.sh/htm@3.1.1",
            "lit": "https://esm.sh/lit@3.3.3",
            "markdown-it": "https://esm.sh/markdown-it@15.0.3",
            "markdown-it-deflist": "https://esm.sh/markdown-it-deflist@3.0.1",
            "preact": "https://esm.sh/preact@11.0.2",
            "preact/": "https://esm.sh/preact@11.0.2/",
            "react": "https://esm.sh/preact@11.0.2/compat",
            "preact-render-to-string": "https://esm.sh/preact-render-to-string@6.8.1?external=preact",
            "xstate": "https://esm.sh/xstate@5.33.3",
            "@xstate/react": "https://esm.sh/@xstate/react@6.1.0?external=react,xstate"
          },
          "integrity": {
            "https://esm.sh/htm@3.1.1": "sha512-88nnv5leYK7WEpqEBt4gyzsbC8oFpeObGZ/jPhxCpQbZVKwy4G7HWZmcQcVEfe6pGE8nLVmbrosHUgOLT28M6A==",
            "https://esm.sh/lit@3.3.3": "sha512-kV8Rtrey9T/fy8Qm4ookUNaXC3cGOLKSsLxRKYYFLds0+8I9HULoQv/2+tGCVz8nRKMEi6Mwe3Ja7UCpyb7+Lw==",
            "https://esm.sh/markdown-it@15.0.3": "sha512-YGPbB8qveF2tRYThmp4Nhw7gfLc9J9jQgnEbH+FFVqTZCVMl7hOiv+pCHBV1sWOfO1NFwV6uWMtZnYx7w3Ow/w==",
            "https://esm.sh/markdown-it-deflist@3.0.1": "sha512-3M2pI7XCPtD0pwZ92KvKasdy5eEwzYn7A1/Vw7R3okRivtbv83QrIQGtaFjFcIEMR36NhyoDKg9sE4UWELjAXw==",
            "https://esm.sh/preact@11.0.2": "sha512-2jxmDjrUM7+lWo9+D/rCSLfI4qT//OSARyZH7Jg72VqtJkogmveqm/Nf1h9ShHnkESjF4fNoSwkeCv59//ZJVA==",
            "https://esm.sh/preact@11.0.2/": "sha512-2jxmDjrUM7+lWo9+D/rCSLfI4qT//OSARyZH7Jg72VqtJkogmveqm/Nf1h9ShHnkESjF4fNoSwkeCv59//ZJVA==",
            "https://esm.sh/preact@11.0.2/compat": "sha512-po3I/iHO80Ieq4k/4eTQqkpZq61Lwj+tFZKe8jKhprCSEyGKXvPVv7Y85wOc2nS0VcLUV+zfoOkA7AxqHQVp1g==",
            "https://esm.sh/preact-render-to-string@6.8.1?external=preact": "sha512-A0MnuV8psOtCXI7+OYpeRFFWKPxOrZPQUIMSdw30FX0oZ3Y3A/uIJJptZIk/CGhItde+UqCFgHLtMQ8y7lwRcw==",
            "https://esm.sh/xstate@5.33.3": "sha512-Xui1O/N6i5nS66/UzLLO/nzppb5fyi1o5h/nUhb+jZ21MMXQdtdzbkbtbqrPY+4XwcptMcrx3RKp2jA6EN+AfA==",
            "https://esm.sh/@xstate/react@6.1.0?external=react,xstate": "sha512-sd9ruQchVDVa9HbIcbWn3vWl4XWGnpV3+4jQIwXayydkM76NMwz/8MakRUH2oK5ffxiK51dqE8YrR6V8SWTnFA=="
          }
        }
        </script>

        ${ /* web components */ '' }
        <link rel="modulepreload" href="https://esm.sh/lit@3.3.3?bundle-deps" />
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
