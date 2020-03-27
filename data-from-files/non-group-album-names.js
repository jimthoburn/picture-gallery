
import { getAlbumNamesFromPicturesFolder } from "../data-from-files/albums-from-pictures-folder.js";
import { isGroupAlbum, notGroupAlbum } from "../data-from-files/group-albums.js";
import { getGalleryData } from "../data-from-files/gallery-from-index-json.js";

import { onlyUnique } from "../helpers/array.js";

const [secretAlbums, secretAlbumGroups] = getAlbumNamesFromPicturesFolder();

function getNonGroupAlbumNames() {
  return getGalleryData().albums.concat(secretAlbums).filter( notGroupAlbum ).filter( onlyUnique );
} 

export {
  getNonGroupAlbumNames
}
