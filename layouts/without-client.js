
import fs from "fs";

import { config } from "../_config.js";

const whenDefined = fs.readFileSync("helpers/when-defined.js", 'utf8');

export const WithoutClientLayout = ({ title, content, hideFromSearchEngines }) => {
  return `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
      <head>
        <script> (function() { ${whenDefined} })(); </script>
        <link rel="preload" crossorigin href="/components/responsive-image.js" as="script" />
        <link rel="preload" crossorigin href="/web_modules/lit-element.js" as="script" />

        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${ hideFromSearchEngines || config.hideFromSearchEngines 
          ? `<meta name="robots" content="noindex" />`
          : ""}
        <title>${title}</title>

        <link href="https://fonts.googleapis.com/css?family=Fredericka+the+Great&amp;display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/shared.css" />
        <link rel="stylesheet" href="/css/album.css" />
        <link rel="stylesheet" href="/css/picture.css" />
        <link rel="stylesheet" href="/css/transition.css" />

        <!-- https://dev.to/pickleat/add-an-emoji-favicon-to-your-site-co2 -->
        <!-- https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/233/frame-with-picture_1f5bc.png -->
        <link rel="icon" href="/favicon/emojipedia-us.s3.dualstack.us-west-1.amazonaws.com-thumbs-120-twitter-233-frame-with-picture_1f5bc.png" />
        
        <script type="module" crossorigin src="/web_modules/lit-element.js"></script>
        <script type="module" crossorigin src="/components/responsive-image.js"></script>
      </head>
      <body>
        ${content}
      </body>
    </html>
  `;
};
