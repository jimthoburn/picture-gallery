
export const config = {

  // The place where this gallery will be published (this is used for open graph images and the site map).
  // "host": "https://example.com",
  
  // https://dev.to/pickleat/add-an-emoji-favicon-to-your-site-co2
  // https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/233/frame-with-picture_1f5bc.png
  "favicon": "/favicon/emojipedia-frame-with-picture.png",

  // Set to `true` to override the settings in individual albums, and “noindex” the entire site
  // "askSearchEnginesNotToIndex": true,

  // For the development server
  "serverPort"    : "4000",
  "serverHostname" : "0.0.0.0",

  // Folder for publishing the gallery
  "buildFolder"   : "_site",

  // These folders are copied into the build folder
  "staticFolders" : [
    "_api",
    "_archives",
    "_pictures",
    "components",
    "css",
    "data",
    "helpers",
    "machines",
  ],

  "redirects": [
    // {
    //   from: "/example/from",
    //   to: "/example/to",
    // },
    // {
    //   from: "https://www.example.com/*",
    //   to: "https://example.com/:splat",
    // },
  ],

  "test": {
    "hostURL"              : "http://localhost:4000",
    "homeURL"              : "/",
    "albumURL"             : "/japan/",
    "pictureURL"           : "/japan/37-tenryū-ji-temple/",
    "groupAlbumURL"        : "/wildflowers/",
    "groupAlbumChildURL"   : "/wildflowers/joshua-tree/",
    "groupAlbumChildName"  : "Joshua Tree",
    "groupAlbumPictureURL" : "/wildflowers/joshua-tree/1/",
    "secretAlbumURL"       : "/northern-lights/",
  }

};
