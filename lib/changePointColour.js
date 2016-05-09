'use strict';

var _ = require('lodash');

var red = '#E71D36';
var lightBlue = '#2EC4B6';
var playingCircleSize = 3.8;

function changePointColour(point) {
  if (_.isEqual(point.colour, red)) point.colour = lightBlue;
  else point.colour = red;

  point.circle.setRadius(playingCircleSize);
  setTimeout(function () {
    point.circle.setRadius(1);
  }, 200);
}

module.exports = changePointColour;
