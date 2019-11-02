
import fs from "fs";

const whenDefined = fs.readFileSync("helpers/when-defined.js", 'utf8');

export const ParentAlbumLayout = ({ title, content }) => {
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
