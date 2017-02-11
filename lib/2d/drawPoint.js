'use strict';

var form = require('./pt').form;
var globals = require('../globals');
var colours = require('../colours');

function drawPoint(point) {
  var delta = globals.getDelta();
  var newSize = point.originalRadius + 1.7;
  newSize = newSize < 2.2 ? newSize = 2.2 : newSize;
  if (point.intersected) {
    point.circle.setRadius(newSize);
  } else if (!point.intersected) {
    point.circle.setRadius(point.originalRadius);
    if (point.connected) {
      point.circle.setRadius(newSize);
    }
  }

  if (point.intersected && !point.connected) {
    point.colour = colours.lightBlue;
  } else if (!point.intersected && !point.connected) {
    point.colour = point.originalColour;
  }

  var targetX = (point.originalPosition.x - point.x) * (0.05 * delta);
  var targetY = (point.originalPosition.y - point.y) * (0.05 * delta);

  point.x += targetX;
  point.y += targetY;

  point.opacity -= point.fadeOutSpeed;
  var c = 'rgba(' + point.colour.x + ',' + point.colour.y + ',' + point.colour.z + ',' + point.opacity + ')';
  form.fill(c).stroke(false);
  form.circle(point.circle);
}

module.exports = drawPoint;
