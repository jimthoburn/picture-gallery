
// SHIM: Avoid a FOUC while loading components
// KUDOS: https://developer.mozilla.org/en-US/docs/Web/API/CustomElementRegistry/whenDefined

function hidePage() {
  document.documentElement.classList.add("custom-elements-loading");
  console.log("📚 Hiding page while custom elements are loading");
}

function showPage() {
  document.documentElement.classList.remove("custom-elements-loading");
  console.log("📚 Showing page");
}

async function showPageWhenDefined() {
  try {
    console.log("📚 Waiting for custom elements to load");
    // const undefinedElements = document.body.querySelectorAll(":not(:defined)");
    const undefinedElements = ["responsive-image"];
    const whenDefinedPromises = [...undefinedElements].map(
      // element => customElements.whenDefined(element.localName)
      element => customElements.whenDefined(element)
    );

    await Promise.all(whenDefinedPromises);
    console.log("📚 All custom elements have loaded");
    showPage();

  } catch(e) {
    showPage();
    console.error(e);
  }
}

if (customElements.whenDefined) {
  try {
    
    // A) Hide the page
    hidePage();

    // B) Show the page after two seconds
    // setTimeout(showPage, 10000);

    // C) Wait for the custom elements to be defined, and then show the page early
    // if (document.readyState === "loading") {
    //   document.addEventListener("DOMContentLoaded", showPageWhenDefined);
    // } else {
      showPageWhenDefined();
    // }
    
  } catch(e) {
    showPage();
    console.error(e);
  }
}

