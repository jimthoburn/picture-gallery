
import { getGalleryData }                  from "../data/gallery.js";
import { getAlbumNamesFromPicturesFolder } from "../data-file-system/albums-from-pictures-folder.js";
import { onlyUnique }                      from "../helpers/array.js";
import { fetchFromFileSystem as fetch }    from "../helpers/fetch-from-file-system.js";


// TBD: This includes secret albums and public albums
const [ secretAlbums, secretAlbumGroups ] = getAlbumNamesFromPicturesFolder();

const groupAlbums = secretAlbumGroups.map(group => group.uri);


function notGroupAlbum(album) {
  const matchingGroupAlbums =
    groupAlbums.filter(groupAlbum => groupAlbum === album);
  return matchingGroupAlbums.length <= 0
}

async function getNonGroupAlbumNames() {
  const galleryData = await getGalleryData({ fetch });
  return galleryData.albums.concat(secretAlbums).filter( notGroupAlbum ).filter( onlyUnique );
} 

function getGroupAlbumNames() {
  return secretAlbumGroups.map(groupAlbum => groupAlbum.uri);
}

async function getAlbumNames() {
  const nonGroups = await getNonGroupAlbumNames();
  const groups    = getGroupAlbumNames();
  return [
    ...nonGroups,
    ...groups
  ];
}


export {
  getAlbumNames
}

