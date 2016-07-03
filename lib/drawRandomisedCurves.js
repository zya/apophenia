'use strict';

var randomF = require('random-float');
var randomInt = require('random-int');
var Noise = require('simplex-noise');
var noise = new Noise();
var colours = require('./colours');

function drawRandomisedCurves(connection, ctx) {
  ctx.beginPath();
  ctx.strokeStyle = colours.lightGrey;
  ctx.lineWidth = 0.3;
  ctx.moveTo(connection.from.x, connection.from.y);

  var distX = connection.to.x - connection.from.x;
  var distY = connection.to.y - connection.from.y;

  var interations = randomInt(2, 4);

  var unitX = distX / interations;
  var unitY = distY / interations;

  for (var i = 1; i < interations; i++) {
    var randomX = randomF(-2, 2);
    var randomY = randomF(-2, 2);

    var nextDestX = connection.from.x + (unitX * i) + randomX;
    var nextDestY = connection.from.y + (unitY * i) + randomY;

    var n = noise.noise2D(nextDestX, nextDestY) * 2;
    ctx.quadraticCurveTo(nextDestX + randomF(-10, 10), nextDestY + randomF(-10, 10), nextDestX + n, nextDestY + n);
  }

  ctx.quadraticCurveTo(connection.to.x + randomF(-10, 10), connection.to.y + randomF(-10, 10), connection.to.x, connection.to.y);
  ctx.stroke();
}

module.exports = drawRandomisedCurves;
