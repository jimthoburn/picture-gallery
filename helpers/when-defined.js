// SHIM: Avoid a FOUC while loading components
// KUDOS: https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/whenDefined

async function hideUntilDefined() {
  if (!customElements.whenDefined) return;
  
  const undefinedElements = document.body.querySelectorAll(":not(:defined)");
  const promises = [...undefinedElements].map(
    element => customElements.whenDefined(element.localName)
  );

  document.documentElement.style.opacity = "0";
  setTimeout(() => {
    document.documentElement.style = "";
  }, 600);

  // Wait for all the children to be upgraded, 
  // then remove the placeholder.
  await Promise.all(promises);
  document.documentElement.style = "";
}

hideUntilDefined();
