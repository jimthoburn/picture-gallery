

let keyboardDetected = false;
let prefersReducedMotion = false;


function onKeyboardDetected() {
  keyboardDetected = true;
}


function usingKeyboard() {
  return keyboardDetected;
}


function isBrowser() {
  return (typeof window !== "undefined");
}


if (isBrowser()) {
  // https://developers.google.com/web/updates/2019/03/prefers-reduced-motion
  let mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

  function update() {
    // console.log(mediaQuery.media, mediaQuery.matches);
    prefersReducedMotion = mediaQuery.matches ? true : false;
  }

  // console.log(mediaQuery);

  update();
  mediaQuery.addListener(update);
}


export { isBrowser, usingKeyboard, onKeyboardDetected, prefersReducedMotion }

