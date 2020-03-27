
import { getAlbumNamesFromPicturesFolder } from "../data-from-files/albums-from-pictures-folder.js";

// TBD: This includes secret albums and public albums
const [ secretAlbums, secretAlbumGroups ] = getAlbumNamesFromPicturesFolder();

const groupAlbums = secretAlbumGroups.map(group => group.uri);


function isGroupAlbum(album) {
  const matchingGroupAlbums =
    secretAlbumGroups.filter(groupAlbum => groupAlbum.uri === album);
  return matchingGroupAlbums.length >= 1
}

function notGroupAlbum(album) {
  const matchingGroupAlbums =
    groupAlbums.filter(groupAlbum => groupAlbum === album);
  return matchingGroupAlbums.length <= 0
}

function getGroupAlbumNames() {
  return secretAlbumGroups.map(groupAlbum => groupAlbum.uri);
}

export {
  isGroupAlbum,
  notGroupAlbum,
  getGroupAlbumNames
}
