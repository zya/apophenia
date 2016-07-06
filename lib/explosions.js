'use strict';

var _ = require('lodash');
var pt = require('./pt');
var colours = require('./colours');
var spotLight = pt.spotLight;
var form = pt.form;

var circles = [];

function addExplosionCircle() {
  var circle = new pt.lib.Circle(spotLight.x, spotLight.y).setRadius(spotLight.radius);
  circle.opacity = 0.4;
  circle.previousIntersected = [];
  circles.push(circle);
}

function drawExplosion(circle) {
  circle.opacity -= 0.006;
  if (circle.opacity < 0 || circle.opacity > 1 || circle.opacity < 0.01) {
    circle.opacity = 0.01;
  }
  circle.radius += 14;
  form.fill(false);
  form.stroke(colours.white, circle.opacity.toFixed(2));
  form.circle(circle);
}

module.exports.add = addExplosionCircle;

module.exports.draw = function() {
  circles.forEach(drawExplosion);
};

module.exports.clean = function() {
  circles = _.reject(circles, function(circle) {
    return circle.radius > 1400;
  });
};
