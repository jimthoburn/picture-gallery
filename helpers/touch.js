
function getTouchPosition(e) {
  var point = {};

  if (e.targetTouches) {
    point.x = e.targetTouches[0].clientX;
    point.y = e.targetTouches[0].clientY;
  }

  return point;
}

function multiTouch(e) {
  return (e.touches && e.touches.length > 1);
}

export {
  getTouchPosition,
  multiTouch
};
