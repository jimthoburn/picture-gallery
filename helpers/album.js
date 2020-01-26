
export function getCombinedAlbumJSON({ album, generatedPictures }) {
  if (generatedPictures && generatedPictures.length > 0) {
    const pictures = generatedPictures.map(generatedPicture => {
      const manuallyEditedPicture = album.pictures.filter(p => p.filename === generatedPicture.filename);
      if (manuallyEditedPicture.length > 0) {
        // Combine and override generated data with manual data
        // https://stackoverflow.com/questions/2454295/how-to-concatenate-properties-from-multiple-javascript-objects#30871719
        return Object.assign(generatedPicture, manuallyEditedPicture[0]);
      } else {
        return generatedPicture;
      }
    });

    return Object.assign(album, {
      pictures
    });

  } else {
    return album;
  }
}
