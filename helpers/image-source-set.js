
export const IMAGE_LIST_SIZES    = "100vw"; //"(min-width: 40em) 320px, 44vw";
export const IMAGE_DETAILS_SIZES = "100vw"; //"(min-aspect-ratio: 1/1) 100vh, 100vw";

export function getSource({album, picture, largestSize = false}) {
  const albumURI = album.uri;
  return (picture.filename)
    ? `/pictures/${ albumURI }/${ largestSize ? "6000" : "384" }-wide/${ picture.filename }`
    : picture.source;
}

export function getSourceSet({album, picture}) {
  const albumURI = album.uri;
  return (picture.filename)
    ? `/pictures/${ albumURI }/384-wide/${ picture.filename } 384w,
       /pictures/${ albumURI }/512-wide/${ picture.filename } 512w,
       /pictures/${ albumURI }/768-wide/${ picture.filename } 768w,
       /pictures/${ albumURI }/1024-wide/${ picture.filename } 1024w,
       /pictures/${ albumURI }/1536-wide/${ picture.filename } 1536w,
       /pictures/${ albumURI }/2048-wide/${ picture.filename } 2048w,
       /pictures/${ albumURI }/6000-wide/${ picture.filename } 6000w`
    : null;
}

export function getCoverPhoto({album,}) {
  const match = album.pictures.filter(picture =>
    picture.filename === album.coverPicture || 
    picture.source   === album.coverPicture
  );
  const picture = match.length > 0 ? match[0] : album.pictures[0];
  return getSource({ album, picture, largestSize: true });
}

