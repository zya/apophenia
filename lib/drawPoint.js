'use strict';

var form = require('./pt').form;
var globals = require('./globals');

var playingCircleSize = 3.8;
var connectedPointSize = 2.2;

function drawPoint(point) {
  var delta = globals.getDelta();

  form.fill(point.colour).stroke(false);
  if (point.intersected && point.circle.radius < playingCircleSize) {
    point.circle.setRadius(3.0);
  } else if (!point.intersected && point.circle.radius < playingCircleSize) {
    point.circle.setRadius(1.3);
    if (point.connected) {
      point.circle.setRadius(connectedPointSize);
    }
  }

  var targetX = (point.originalPosition.x - point.x) * (0.05 * delta);
  var targetY = (point.originalPosition.y - point.y) * (0.05 * delta);

  point.x += targetX;
  point.y += targetY;

  form.circle(point.circle);
}

module.exports = drawPoint;
