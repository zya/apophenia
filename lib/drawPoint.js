'use strict';

var form = require('./pt').form;
var playingCircleSize = 3.8;

function drawPoint(point) {
  form.fill(point.colour).stroke(false);
  if (point.intersected && point.circle.radius < playingCircleSize) {
    point.circle.setRadius(2.2);
  } else if (!point.intersected && point.circle.radius < playingCircleSize) {
    point.circle.setRadius(1.1);
  }
  form.circle(point.circle);
}

module.exports = drawPoint;
