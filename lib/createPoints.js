'use strict';

var _ = require('lodash');

var pt = require('./2d/pt');
var lib = pt.lib;
var space = pt.space;
var colours = require('./colours');
var lightBlue = colours.lightBlue;
var grey = colours.grey;
var randomInt = require('random-int');
var randomFloat = require('random-float');
var uuid = require('node-uuid');

var notes = require('./music/music').notes;

function createPoint(x, y) {
  var point = new lib.Vector(x, y);
  var randomNote = notes[randomInt(0, notes.length - 1)];
  var multipliers = [1, 0.5, 2];
  point.fq = randomNote.fq() * multipliers[randomInt(0, 2)];
  point.id = uuid.v1();
  point.circle = new lib.Circle(250, 250).setRadius(1.1);
  point.connected = false;
  point.originalPosition = new lib.Vector(x, y);
  var xRatio = space.size.x / 1250;
  if (xRatio < 0.7) {
    xRatio = 0.7;
  }
  point.originalRadius = randomFloat(0.95, 2.56) * xRatio;
  point.originalBrightness = xRatio;
  var colour = new lib.Color(grey.x + _.random(-15, 15), grey.y + _.random(-15, 15), grey.z + _.random(-15, 15));
  point.colour = grey;
  point.originalColour = colour;

  point.opacity = 1;
  point.fadeOutSpeed = 0;
  return point;
}

function addCircularPoints(number, origin, r) {
  var points = [];
  for (var i = 0; i < number; i++) {
    if (_.random(0, 10) > 3) {
      var angle = (2 / number) * Math.PI * i;
      var y = origin.y + r * Math.cos(angle);
      var x = origin.x + r * Math.sin(angle);

      var randomX = randomInt(-12, 12);
      var randomY = randomInt(-12, 12);
      var point = createPoint(x + randomX, y + randomY, lightBlue);

      point.special = true;

      points.push(point);
    }
  }
  return points;
}

function createIntroBasicPoints() {
  var distance = space.size.x / 15;
  // var centerX = space.size.x / 2;
  var centerY = space.size.y / 2;
  var randomOffsetY = 5;
  var point1 = createPoint(distance + distance, centerY + _.random(-randomOffsetY, randomOffsetY));
  var point2 = createPoint(distance + (distance * 2), centerY + _.random(-randomOffsetY, randomOffsetY));
  var point3 = createPoint(distance * 2.5, centerY - (distance / 1.3));
  point1.intro = true;
  point2.intro = true;
  point3.intro = true;
  var point4 = createPoint(space.size.x - (distance * 2), centerY + _.random(-randomOffsetY, randomOffsetY));
  var point5 = createPoint(space.size.x - (distance * 3), centerY + _.random(-randomOffsetY, randomOffsetY));
  var point6 = createPoint(space.size.x - (distance * 2.5), centerY + (distance / 1.3));
  point4.intro = true;
  point5.intro = true;
  point6.intro = true;
  return [point1, point2, point3, point4, point5, point6];
}

function between(x, min, max) {
  return x >= min && x <= max;
}

function isCenter(point) {
  var cx = space.size.x / 2;
  var cy = space.size.y / 2;
  var tolerance = cx / 5;
  var x = between(point.x, cx - tolerance, cx + tolerance);
  var y = between(point.y, cy - tolerance, cy + tolerance);
  return x && y;
}

function createPoints(amount) {
  var points = createIntroBasicPoints();

  for (var i = 0; i < amount; i++) {
    var point = createPoint(Math.random() * space.size.x, Math.random() * space.size.y, lightBlue);

    if (isCenter(point)) {
      point.special = true;
    }

    points.push(point);
  }

  var bigCircle = addCircularPoints(55, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 6);

  var mediumCircle = addCircularPoints(20, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 7.5);

  var smallCircle = addCircularPoints(17, {
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
