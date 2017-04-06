'use strict';

var timeAtPreviousFrame;
var delta = 1;
var mouse = {
  x: 0,
  y: 0
};

var hasTransitioned = false;

module.exports.setDelta = function (now) {
  var dt = now - (timeAtPreviousFrame || now);
  timeAtPreviousFrame = now;
  delta = dt / 16;
};

module.exports.getDelta = function () {
  return delta;
};

module.exports.setMousePosition = function (x, y) {
  mouse.x = x;
  mouse.y = y;
};

module.exports.getMousePosition = function () {
  return mouse;
};

module.exports.setTransitioned = function (transitioned) {
  hasTransitioned = transitioned;
};

module.exports.hasTransitioned = function () {
  return hasTransitioned;
};
