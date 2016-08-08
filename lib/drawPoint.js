'use strict';

var form = require('./pt').form;
var globals = require('./globals');

function drawPoint(point) {
  var delta = globals.getDelta();

  form.fill(point.colour).stroke(false);
  var newSize = point.originalRadius + 1;
  newSize = newSize < 2.2 ? newSize = 2.2 : newSize;

  if (point.intersected) {
    point.circle.setRadius(newSize);
  } else if (!point.intersected) {
    point.circle.setRadius(point.originalRadius);
    if (point.connected) {
      point.circle.setRadius(newSize);
    }
  }

  var targetX = (point.originalPosition.x - point.x) * (0.05 * delta);
  var targetY = (point.originalPosition.y - point.y) * (0.05 * delta);

  point.x += targetX;
  point.y += targetY;

  form.circle(point.circle);
}

module.exports = drawPoint;
