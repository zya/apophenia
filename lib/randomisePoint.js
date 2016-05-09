'use strict';

var randomFloat = require('random-float');

function randomisePoint(point) {
  var randomX = point.connected ? randomFloat(-0.3, 0.3) : randomFloat(-0.5, 0.5);
  var randomY = point.connected ? randomFloat(-0.3, 0.3) : randomFloat(-0.5, 0.5);
  point.set(point.x + randomX, point.y + randomY);
  point.circle.set(point.x, point.y);
}

module.exports = randomisePoint;
