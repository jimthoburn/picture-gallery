
import fs from "fs";

const whenDefined = fs.readFileSync("helpers/when-defined.js", 'utf8');

export const DefaultLayout = ({ title, content }) => {
  return `
    <!DOCTYPE html>
    <html lang="en" dir="ltr">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${title}</title>
        <link href="https://fonts.googleapis.com/css?family=Fredericka+the+Great&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="/css/shared.css" />
        <link rel="stylesheet" href="/css/album.css" />
        <link rel="stylesheet" href="/css/picture.css" />
        <link rel="stylesheet" href="/css/transition.css" />

        <script type="module" src="/components/responsive-image.js"></script>
        <script type="module" src="/client.js"></script>
      </head>
      <body>
        <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="0" height="0" style="display: none;">
          <!-- Created by Viktor Vorobyev, from the Noun Project -->
          <symbol viewBox="0 0 100 125" id="download">
            <polygon points="79.7,46.1 71.9,38.4 55.9,54.6 55.9,6 44.9,6 44.9,54.8 28.5,38.4 20.7,46.1 50.5,75.9  "/>
            <rect x="14.6" y="80" width="71.2" height="11"/>
          </symbol>
        </svg>
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
