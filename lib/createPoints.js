'use strict';

var pt = require('./pt');
var lib = pt.lib;
var space = pt.space;
var colours = require('./colours');
var lightBlue = colours.lightBlue.hex();
var randomInt = require('random-int');
var uuid = require('node-uuid');

var notes = require('./music').notes;

function createPoint(x, y) {
  var point = new lib.Vector(x, y);
  point.colour = lightBlue;
  var randomNote = notes[randomInt(0, notes.length - 1)];
  var multipliers = [1, 0.5, 2];
  point.fq = randomNote.fq() * multipliers[randomInt(0, 2)];
  point.id = uuid.v1();
  point.colour = lightBlue;
  point.circle = new lib.Circle(250, 250).setRadius(1.1);
  point.connected = false;
  point.originalPosition = new lib.Vector(x, y);
  return point;
}

function addCircularPoints(number, origin, r) {
  var points = [];
  for (var i = 0; i < number; i++) {
    var angle = (2 / number) * Math.PI * i;
    var y = origin.y + r * Math.cos(angle);
    var x = origin.x + r * Math.sin(angle);

    var randomX = randomInt(-10, 10);
    var randomY = randomInt(-10, 10);
    var point = createPoint(x + randomX, y + randomY, lightBlue);

    point.special = true;

    points.push(point);
  }
  return points;
}

function between(x, min, max) {
  return x >= min && x <= max;
}

function isCenter(point) {
  var cx = space.size.x / 2;
  var cy = space.size.y / 2;
  var x = between(point.x, cx - 200, cx + 200);
  var y = between(point.y, cy - 200, cy + 200);
  return x && y;
}

function createPoints(amount) {
  var points = [];
  for (var i = 0; i < amount; i++) {
    var point = createPoint(Math.random() * space.size.x, Math.random() * space.size.y, lightBlue);

    if (isCenter(point)) {
      point.special = true;
    }

    points.push(point);
  }

  var bigCircle = addCircularPoints(50, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 5);

  var mediumCircle = addCircularPoints(18, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 8);

  var smallCircle = addCircularPoints(15, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 15);

  var tinyCircle = addCircularPoints(8, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 24);

  return points.concat(bigCircle, smallCircle, mediumCircle, tinyCircle);
}

module.exports = createPoints;
