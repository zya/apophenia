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

var ripples = [];
var smallRipples = [];
var white = colours.white;
var lighterGrey = colours.lighterGrey;
var red = colours.red;
var collisions = [];

function addrippleCircle() {
  var circle = new pt.lib.Circle(spotLight.x, spotLight.y).setRadius(spotLight.radius);
  circle.opacity = config.rippleStartOpacity;
  circle.previousIntersected = [];
  circle.timestamp = Date.now();
  ripples.push(circle);
}

function addSmallRipple(point) {
  var ripple = new pt.lib.Circle(point).setRadius(point.originalRadius);
  ripple.opacity = config.rippleStartOpacity;
  ripple.timestamp = Date.now();
  smallRipples.push(ripple);
}

function drawRipple(ripple, sizeRate, opacityRate, colour) {
  var delta = globals.getDelta();

  ripple.opacity -= opacityRate * delta;

  if (ripple.opacity < 0 || ripple.opacity > 1 || ripple.opacity < 0.01) {
    ripple.opacity = 0.01;
  }

  ripple.radius += (sizeRate * (ripple.opacity * 2.0)) * delta;

  form.fill(false);
  var c = 'rgba(' + colour.x + ',' + colour.y + ',' + colour.z + ',' + ripple.opacity.toFixed(2) + ')';
  form.stroke(c);
  form.circle(ripple);
}

module.exports.add = addrippleCircle;
module.exports.addSmallRipple = addSmallRipple;

module.exports.draw = function () {
  _.forEach(ripples, _.partial(drawRipple, _, config.rippleRate, config.rippleRateOpacity, white));
  _.forEach(smallRipples, _.partial(drawRipple, _, config.smallRippleRate, config.smallRippleRateOpacity, lighterGrey));

  collisions.forEach(function (collision) {
    collision.point.x += (collision.circle.opacity * (collision.dx * randomF(5, (collision.circle.opacity * 35))));
    collision.point.y += (collision.circle.opacity * (collision.dy * randomF(5, (collision.circle.opacity * 35))));
  });

  //clean up collisions
  collisions = _.filter(collisions, function (collision) {
    return collision.timestamp > Date.now() - 200;
  });

  //clean up ripples
  ripples = _.filter(ripples, function (circle) {
    return circle.timestamp > Date.now() - 3000;
  });

  //clean up small ripples
  smallRipples = _.filter(smallRipples, function (ripple) {
    return ripple.timestamp > Date.now() - 3000;
  });
};

module.exports.detectCollisions = function (points) {
  ripples.forEach(function (circle) {
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
  ripples = _.reject(ripples, function (ripple) {
    return ripple.radius > 1400;
  });

  smallRipples = _.filter(smallRipples, function (ripple) {
    return ripple.timestamp > Date.now() - 3000;
  });
};
