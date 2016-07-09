'use strict';

var _ = require('lodash');
var pt = require('./pt');
var colours = require('./colours');
var globals = require('./globals');
var config = require('../config');
var spotLight = pt.spotLight;
var form = pt.form;

var circles = [];
var white = colours.white;

function addExplosionCircle() {
  var circle = new pt.lib.Circle(spotLight.x, spotLight.y).setRadius(spotLight.radius);
  circle.opacity = config.explosionStartOpacity;
  circle.previousIntersected = [];
  circles.push(circle);
}

function drawExplosion(circle) {
  var delta = globals.getDelta();

  circle.opacity -= config.explosionRateOpacity * delta;
  if (circle.opacity < 0 || circle.opacity > 1 || circle.opacity < 0.01) {
    circle.opacity = 0.01;
  }

  circle.radius += config.explosionRate * delta;

  form.fill(false);
  var c = 'rgba(' + white.x + ',' + white.y + ',' + white.z + ',' + circle.opacity.toFixed(2) + ')';
  form.stroke(c);
  form.circle(circle);
}

module.exports.add = addExplosionCircle;

module.exports.draw = function () {
  circles.forEach(drawExplosion);
};

module.exports.clean = function () {
  circles = _.reject(circles, function (circle) {
    return circle.radius > 1400;
  });
};;
