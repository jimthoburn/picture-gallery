
import fs from "fs";

import { config } from "../_config.js";

const whenDefined = fs.readFileSync("helpers/when-defined.js", 'utf8');

export const DefaultLayout = ({ title, content, hideFromSearchEngines }) => {
  return `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${ hideFromSearchEngines || config.hideFromSearchEngines 
          ? `<meta name="robots" content="noindex">`
          : ""}
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css?family=Fredericka+the+Great&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/shared.css" />
        <link rel="stylesheet" href="/css/album.css" />
        <link rel="stylesheet" href="/css/picture.css" />
        <link rel="stylesheet" href="/css/transition.css" />

        <!-- https://dev.to/pickleat/add-an-emoji-favicon-to-your-site-co2 -->
        <link rel="icon" href="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/233/frame-with-picture_1f5bc.png">

        <script type="module" src="/components/responsive-image.js"></script>
        <script type="module" src="/client.js"></script>
      </head>
      <body>
        ${content}
        <script>
        (function() {
          ${whenDefined}
        })();
        </script>
      </body>
    </html>
  `;
};
