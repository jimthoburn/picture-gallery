
function closest(element, tagName) {

  // If the element is the target
  if (element.nodeName.toLowerCase() === tagName) return element;

  var ancestor = element;
  while ((ancestor = ancestor.parentElement) && ancestor.nodeName && ancestor.nodeName.toLowerCase() !== tagName);
  if (ancestor && ancestor.nodeName && ancestor.nodeName.toLowerCase() === tagName) {
    return ancestor;
  }
}

export {
  closest
};
