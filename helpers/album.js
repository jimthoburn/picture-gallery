

function getCombinedAlbumJSON({ album, generatedPictures }) {
  if (generatedPictures && generatedPictures.length > 0) {

    const pictures = album.pictures.map(manuallyEditedPicture => {
      const generatedPicture = generatedPictures.filter(p => p.filename === manuallyEditedPicture.filename);
      if (generatedPicture.length > 0) {
        // Combine and override generated data with manual data
        // https://stackoverflow.com/questions/2454295/how-to-concatenate-properties-from-multiple-javascript-objects#30871719
        return Object.assign(generatedPicture[0], manuallyEditedPicture);
      } else {
        return manuallyEditedPicture;
      }
    });

    return Object.assign(album, {
      pictures
    });

  } else {
    return album;
  }
}


// https://example.com/wildflowers/7/  ==>  wildflowers
// https://example.com/wildflowers/    ==>  wildflowers
// https://example.com/baking/a/3/     ==>  baking/a
// https://example.com/baking/a/       ==>  baking/a
function getAlbumURI({ pageURL, albumNames }) {

  console.log("getAlbumURI")
  console.log("pageURL", pageURL)
  console.log("albumNames", albumNames)

  // https://example.com/wildflowers/7/  ==>  ["example.com", "wildflowers", "7"]
  // https://example.com/baking/a/3/     ==>  ["example.com", "baking", "a", "3"]
  // https://example.com/baking/a/       ==>  ["example.com", "baking", "a"]
  let urlArray = pageURL.split("://").pop().split("?").shift().split("/").filter(bit => bit !== "");
  urlArray.shift(); // Remove the domain and port
  console.log(urlArray);

  let groupMatches = albumNames.filter(name => name === urlArray[0]);
  console.log("groupMatches", groupMatches);
  let matches       = albumNames.filter(name => name === urlArray.slice(0, urlArray.length - 1).join("/"));
  console.log("matches", matches);
  let strongMatches = albumNames.filter(name => name === urlArray.join("/"));
  console.log("strongMatches", strongMatches);

  if (strongMatches.length > 0) {
    return strongMatches[0]
  } else if (matches.length > 0) {
    return matches[0]
  } else if (groupMatches.length > 0) {
    return groupMatches[0]
  }
}



export {
  getCombinedAlbumJSON,
  getAlbumURI
}
