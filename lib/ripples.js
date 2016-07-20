'use strict';

var _ = require('lodash');
var randomF = require('random-float');
var pt = require('./pt');
var colours = require('./colours');
var globals = require('./globals');
var config = require('../config');
var spotLight = pt.spotLight;
var form = pt.form;
var space = pt.space;

var circles = [];
var white = colours.white;
var collisions = [];

function addrippleCircle() {
  var circle = new pt.lib.Circle(spotLight.x, spotLight.y).setRadius(spotLight.radius);
  circle.opacity = config.rippleStartOpacity;
  circle.previousIntersected = [];
  circle.timestamp = Date.now();
  circles.push(circle);
}

function drawripple(circle) {
  var delta = globals.getDelta();

  circle.opacity -= config.rippleRateOpacity * delta;
  if (circle.opacity < 0 || circle.opacity > 1 || circle.opacity < 0.01) {
    circle.opacity = 0.01;
  }

  circle.radius += (config.rippleRate * (circle.opacity * 2.0)) * delta;

  form.fill(false);
  var c = 'rgba(' + white.x + ',' + white.y + ',' + white.z + ',' + circle.opacity.toFixed(2) + ')';
  form.stroke(c);
  form.circle(circle);
}

module.exports.add = addrippleCircle;

module.exports.draw = function () {
  circles.forEach(drawripple);
  collisions.forEach(function (collision) {
    collision.point.x += (collision.circle.opacity * (collision.dx * randomF(2, (collision.circle.opacity * 35))));
    collision.point.y += (collision.circle.opacity * (collision.dy * randomF(2, (collision.circle.opacity * 35))));
  });

  //clean up collisions
  collisions = _.filter(collisions, function (collision) {
    return collision.timestamp > Date.now() - 200;
  });

  //clean up circles
  circles = _.filter(circles, function (circle) {
    return circle.timestamp > Date.now() - 3000;
  });
};

module.exports.detectCollisions = function (points) {
  circles.forEach(function (circle) {
    points.forEach(function (point) {
      var dx = circle.x - point.circle.x;
      var dy = circle.y - point.circle.y;
      var distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < circle.radius + point.circle.radius && distance > (circle.radius - 10) + point.circle.radius) {
        collisions.push({
          circle: circle,
          point: point,
          dx: (dx / space.size.x) * -1,
          dy: (dy / space.size.y) * -1,
          timestamp: Date.now()
        });
      }
    });
  });
};

module.exports.clean = function () {
  circles = _.reject(circles, function (circle) {
    return circle.radius > 1400;
  });
};
