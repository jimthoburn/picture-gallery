
export const config = {

  // For open graph images and site map
  // "host": "https://example.com",
  
  // https://dev.to/pickleat/add-an-emoji-favicon-to-your-site-co2
  // https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/120/twitter/233/frame-with-picture_1f5bc.png
  "favicon": "/favicon/emojipedia-us.s3.dualstack.us-west-1.amazonaws.com-thumbs-120-twitter-233-frame-with-picture_1f5bc.png",

  // Override the settings in individual albums, and “noindex” the entire site
  // "askSearchEnginesNotToIndex": true,

  "buildFolder"   : "_site",
  "serverPort"    : "4000",
  "staticFolders" : [
    "_api",
    "_archives",
    "_pictures",
    "components",
    "css",
    "data",
    "helpers",
    "machines",
    "web_modules"
  ],

  "test": {
    "hostURL"              : "http://localhost:4000",
    "homeURL"              : "/",
    "albumURL"             : "/japan/",
    "pictureURL"           : "/japan/tenryū-ji-temple/",
    "groupAlbumURL"        : "/wildflowers/",
    "groupAlbumChildURL"   : "/wildflowers/joshua-tree/",
    "groupAlbumChildName"  : "Joshua Tree",
    "groupAlbumPictureURL" : "/wildflowers/joshua-tree/1/",
    "secretAlbumURL"       : "/northern-lights/"
  }

};
