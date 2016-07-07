'use strict';

var _ = require('lodash');
var randomInt = require('random-int');

var colours = require('./colours');

var playingCircleSize = 4.5;
var connectedPointSize = 2.5;

var orange = colours.orange.hex();
var red = colours.red.hex();
var lightBlue = colours.lightBlue.hex();

function changePointColour(point) {
  if (_.isEqual(point.colour, orange) || _.isEqual(point.colour, red)) point.colour = lightBlue;
  else point.colour = randomInt(0, 10) > 5 ? orange : red;

  point.circle.setRadius(playingCircleSize);
  point.connected = true;
  setTimeout(function () {
    point.circle.setRadius(connectedPointSize);
  }, 200);
}

module.exports = changePointColour;
