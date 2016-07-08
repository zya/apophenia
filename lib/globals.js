'use strict';

var timeAtPreviousFrame;
var delta = 1;

module.exports.setDelta = function (now) {
  var dt = now - (timeAtPreviousFrame || now);
  timeAtPreviousFrame = now;
  delta = dt / 16;
};

module.exports.getDelta = function () {
  return delta;
};
