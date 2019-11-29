
// SHIM: Avoid a FOUC while loading components
// KUDOS: https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/whenDefined

// function hidePage() {
//   document.documentElement.style.opacity = "0";
// }

function showPage() {
  document.documentElement.style.opacity = null;
}

async function hideUntilDefined() {
  console.log("hideUntilDefined");
  if (!customElements.whenDefined) return;

  console.log("Looking for undefined elements");

  const undefinedElements = document.body.querySelectorAll(":not(:defined)");
  const whenDefinedPromises = [...undefinedElements].map(
    element => customElements.whenDefined(element.localName)
  );

  // SHIM: This is located in a separate script in the <head> element, so it will run sooner
  // hidePage();

  // Wait up to two seconds
  setTimeout(showPage, 2000);

  console.log("Waiting for undefined elements");

  await Promise.all(whenDefinedPromises);
  showPage();

  console.log("hideUntilDefined is done!");
}

hideUntilDefined();
