'use strict';

var form = require('./pt').form;

var playingCircleSize = 3.8;
var connectedPointSize = 2.2;

function drawPoint(point) {
  form.fill(point.colour).stroke(false);
  if (point.intersected && point.circle.radius < playingCircleSize) {
    point.circle.setRadius(3.0);
  } else if (!point.intersected && point.circle.radius < playingCircleSize) {
    point.circle.setRadius(1.3);
    if (point.connected) {
      point.circle.setRadius(connectedPointSize);
    }
  }
  form.circle(point.circle);
}

module.exports = drawPoint;
