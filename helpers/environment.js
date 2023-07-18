

let keyboardDetected = false;
let prefersReducedMotion = false;


function onKeyboardDetected() {
  keyboardDetected = true;
}


function usingKeyboard() {
  return keyboardDetected;
}


function isBrowser() {
  return (
    // Browser or Deno
    typeof globalThis.window !== "undefined"

    &&

    // Deno
    typeof globalThis.Deno === "undefined"

    &&

    // Node
    typeof globalThis.process === "undefined"
  );
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
  mediaQuery.addEventListener("change", update);
}


export { isBrowser, usingKeyboard, onKeyboardDetected, prefersReducedMotion }

