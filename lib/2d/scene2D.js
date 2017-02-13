'use strict';

var _ = require('lodash');
var async = require('async');
var dynamics = require('dynamics.js');

var globals = require('../globals');
var config = require('../../config');
var colours = require('../colours');
var change = require('../changeHandler');
var pt = require('./pt');

var createPoints = require('../createPoints');
var ripples = require('./ripples');
var connections = require('./connections');
var randomisePoint = require('./randomisePoint');
var intersect = require('./intersectSpotlightAndPoints');
var updateTemporaryPairs = require('./updateTemporaryPairs');
var drawPoint = require('./drawPoint');
var pointClickEvent = require('../pointClickEvent');

var spotLight = pt.spotLight;
// var spotLightRatio = config.spotLightSizeRatio;
var easingStrength = config.easingStrength;
var sizeChangeOnClick = config.sizeChangeOnClick;
var white = colours.white.hex();
var space = pt.space;
var form = pt.form;

var hasTransitioned = false;
var shouldDrawPoints = true;
var shouldIntersect = true;
var shouldDrawConnections = true;
var alreadyIsSpecial = false;
var shouldDrawConnections = true;

var points = createPoints(config.numberOfRandomPoints);
var special = _.filter(points, ['special', true]);
connections.createSpecialShape(special);
var currentlyPlaying = [];
var currentPoints = [];
var pairsInsideSpotlight = [];

var transitionParams = {
  randomMovementRate: 1,
  spotLightSize: 1,
};

var pointTransitionParams = {
  randomMovementRate: 1
};

function parallaxPoints(point, xOffset, yOffset) {
  if (point.originalRadius > 1.9) {
    point.x -= (xOffset * point.originalRadius) * _.random(0.1, 0.3);
    point.y -= (yOffset * point.originalRadius) * _.random(0.1, 0.3);
  }
}

function explodeSpotlight(done) {
  var duration = 12000;
  setTimeout(function () {
    shouldIntersect = false;
    dynamics.animate(transitionParams, {
      spotLightSize: 0
    }, {
      duration: duration
    });
    done();
  }, 500);
}

function slowDownPointMovement(done) {
  var duration = 2000;

  setTimeout(function () {
    dynamics.animate(pointTransitionParams, {
      randomMovementRate: 0
    }, {
      duration: duration
    });
  }, 100);

  setTimeout(done, duration + 300);
}

function fadeAllPointsOut(done) {
  points.forEach(function (point) {
    point.fadeOutSpeed = _.random(0.003, 0.01);
  });

  setTimeout(function () {
    shouldDrawPoints = false;
  }, 9000);

  setTimeout(done, 2500);
}

module.exports.mousedown = function () {
  spotLight.setRadius(spotLight.radius - sizeChangeOnClick);
  currentPoints.forEach(pointClickEvent);
  connections.update(currentPoints);
  ripples.add();

  var discoveryPercentage = connections.getDiscoveryPercentage();
  return discoveryPercentage;
};

module.exports.transition = function (cb) {
  hasTransitioned = true;
  async.series([
    explodeSpotlight,
    slowDownPointMovement,
    fadeAllPointsOut,
    connections.reveal
  ], cb);
};

module.exports.stopDrawingConnections = function (cb) {
  shouldDrawConnections = false;
  cb();
};

module.exports.mouseup = function () {
  spotLight.setRadius(spotLight.radius + sizeChangeOnClick);
};

module.exports.getSpecialTriangles = connections.getSpecialTriangles;

module.exports.on = function (event, cb) {
  if (event === 'revealStart') connections.on('revealStart', cb);
  if (event === 'revealEnd') connections.on('revealEnd', cb);
};

module.exports.render = function () {
  space.clear();
  var delta = globals.getDelta();

  var mouse = globals.getMousePosition();
  spotLight.x += (mouse.x - spotLight.x) * (easingStrength * delta);
  spotLight.y += (mouse.y - spotLight.y) * (easingStrength * delta);
  form.fill(white, 0.1).stroke(false);
  if (spotLight.radius < 0) spotLight.radius = 0;
  form.circle(spotLight);
  spotLight.setRadius(spotLight.radius * transitionParams.spotLightSize);

  // draw ripple circles
  ripples.draw();
  // detect collissions
  ripples.detectCollisions(points);

  //draw connections
  if (shouldDrawConnections) {
    connections.draw(pairsInsideSpotlight);
  }

  //randomise points movements
  if (shouldDrawPoints) {
    points.forEach(_.partial(randomisePoint, _, pointTransitionParams.randomMovementRate));
  }

  if (!hasTransitioned) {
    var xOffset = (mouse.x / space.size.x) - 0.5;
    var yOffset = (mouse.y / space.size.y) - 0.5;
    points.forEach(_.partial(parallaxPoints, _, xOffset, yOffset));
  }

  //calculate intersection of spot lights and points
  var pointsInsideCircle = [];

  if (shouldIntersect) {
    pointsInsideCircle = intersect(spotLight, points);
  }

  //change cursor
  if (pointsInsideCircle.length > 0) {
    space.space.style.cursor = 'pointer';
  } else {
    space.space.style.cursor = 'auto';
  }

  //draw connections inside the spot light
  var temporaryPairsInsideCircle = [];
  updateTemporaryPairs(pointsInsideCircle, temporaryPairsInsideCircle);
  pairsInsideSpotlight = temporaryPairsInsideCircle;

  //draw points
  if (shouldDrawPoints) {
    points.forEach(drawPoint);
  }

  //calculate change
  if (!_.isEqual(currentPoints, pointsInsideCircle)) {
    var toRemove = _.difference(currentPoints, pointsInsideCircle);
    var toAdd = _.difference(pointsInsideCircle, currentPoints);
    var anySpecials = connections.updateInsideConnections(pointsInsideCircle);
    var foundSpecial = false;

    if (!alreadyIsSpecial && anySpecials) {
      alreadyIsSpecial = true;
      console.log('trigger special event');
    }

    if (!anySpecials) alreadyIsSpecial = false;

    change(toAdd, toRemove, currentlyPlaying, foundSpecial);
  }

  //update the current points
  currentPoints = pointsInsideCircle;
};
