
import fs from "fs";

const galleryData = JSON.parse(fs.readFileSync("./_api/index.json", "utf8"));

function getGalleryData() {
  return galleryData;
}

export {
  getGalleryData
}
