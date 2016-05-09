'use strict';

var pt = require('./pt');
var lib = pt.lib;
var space = pt.space;
var lightBlue = '#2EC4B6';
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
  return point;
}

function addPoints(number, origin, r) {
  var points = [];
  for (var i = 0; i < number; i++) {
    var angle = (2 / number) * Math.PI * i;
    var y = origin.y + r * Math.cos(angle);
    var x = origin.x + r * Math.sin(angle);

    var randomX = randomInt(-10, 10);
    var randomY = randomInt(-10, 10);
    var point = createPoint(x + randomX, y + randomY, lightBlue);
    points.push(point);
  }
  return points;
}


function createPoints(amount) {
  var points = [];
  for (var i = 0; i < amount; i++) {
    var point = createPoint(Math.random() * space.size.x, Math.random() * space.size.y, lightBlue);
    points.push(point);
  }

  var bigCircle = addPoints(30, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 5);

  var mediumCircle = addPoints(18, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 8);

  var smallCircle = addPoints(15, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 15);

  var tinyCircle = addPoints(8, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 24);

  return points.concat(bigCircle, smallCircle, mediumCircle, tinyCircle);
}

module.exports = createPoints;
