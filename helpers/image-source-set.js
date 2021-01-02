
export function getSource({album, picture, type, largestSize = false}) {
  const albumURI = album.uri;
  return (picture.filename)
    ? `/pictures/${ albumURI }/${ largestSize ? "6000" : "384" }-wide/${ picture.filename.replace(/\..+$/, `.${type}`) }`
    : picture.source;
}

export function getSourceSet({album, picture, type}) {
  const albumURI = album.uri;

  // https://regex101.com/r/Hz0ar1/2
  // image.jpg ==> image.avif
  // image.jpg ==> image.webp
  const filename =
    (type != null) ?
    picture.filename.replace(/\..+$/, `.${type}`)
    :
    picture.filename;

  return (filename)
    ? `/pictures/${ albumURI }/384-wide/${ filename } 384w,
       /pictures/${ albumURI }/512-wide/${ filename } 512w,
       /pictures/${ albumURI }/768-wide/${ filename } 768w,
       /pictures/${ albumURI }/1024-wide/${ filename } 1024w,
       /pictures/${ albumURI }/1536-wide/${ filename } 1536w,
       /pictures/${ albumURI }/2048-wide/${ filename } 2048w,
       /pictures/${ albumURI }/6000-wide/${ filename } 6000w`
    : null;
}

export function getCoverPhoto({album}) {
  const match = album.pictures.filter(picture =>
    picture.filename === album.coverPicture || 
    picture.source   === album.coverPicture
  );
  const picture = match.length > 0 ? match[0] : album.pictures[0];
  return getSource({ album, picture, largestSize: true });
}

