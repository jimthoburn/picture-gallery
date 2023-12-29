
function formatPageTitle({ imageNumber, imageCaption, albumTitle }) {
  return `Picture ${ imageNumber }.${ imageCaption ? ` ${imageCaption}` : "" } / ${albumTitle}`;
}

export {
  formatPageTitle,
}
