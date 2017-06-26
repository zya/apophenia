'use strict';

var _ = require('lodash');
var async = require('async');
var dynamics = require('dynamics.js');
var lerp = require('lerp');

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
var white = colours.white;
var grey = colours.grey;
var space = pt.space;
var form = pt.form;

var HAS_TRANSITIONED = false;
var SHOUD_DRAW_POINTS = true;
var SHOULD_INTERSECT = true;
var SHOULD_DRAW_CONNECTIONS = true;
var ALREADY_SPECIAL = false;
var SHOULD_DRAW_CONNECTIONS = true;
var IS_INTRO = true;
var STARTED = false;
var SHOUD_FOLLOW_MOUSE = false;
var HAS_FIRED_MIDDLE_EVENT = false;
var HAS_FIRED_MIDDE_2_EVENT = false;
var FIRST = true;
var HAS_PROGRESSED_AT_LEAST_ONCE = false;
var HAS_DISCOVERED_INITIAL_POINTS = false;

var spotLightInitialXPosition = 0;
var spotLightInitialYPosition = 0;

var points = createPoints(config.numberOfRandomPoints);
var special = _.filter(points, ['special', true]);
var introPoints = _.filter(points, ['intro', true]);
var activePoints = [];
connections.createSpecialShape(special);
var currentlyPlaying = [];
var currentPoints = [];
var pairsInsideSpotlight = [];

var specialIntroPoints = connections.getRandomSpecialTriangles();

var specialAndActive = _(specialIntroPoints).concat(activePoints).flatten().value();
points = _.differenceBy(points, specialAndActive, 'id');

var transitionParams = {
  randomMovementRate: 1,
  spotLightSize: 0,
  opacity: 1
};

var spotLighColourParams = {
  t: 0
};

var pointTransitionParams = {
  randomMovementRate: 1
};

function revealPointInTime(point, time, index) {
  (function (point, time, index) {
    setTimeout(function () {
      activePoints.push(point);
    }, time * index);
  })(point, time, index);
}

function displaySpecialIntroPoints() {
  displayIntroSpecialCallback();
  setTimeout(function () {
    specialIntroPoints.forEach(_.partial(revealPointInTime, _, 400));
  }, 3000);
}

function displayAllThePoints() {
  setTimeout(function () {
    points.forEach(_.partial(revealPointInTime, _, 200));
  }, 3000);
}

var stopDrawingCallback = _.noop;
var foundSpecialCallback = _.noop;
var revealedSpecialCallback = _.noop;
var foundFirstConnectionCallback = _.noop;
var displayIntroSpecialCallback = _.noop;
var middleDiscoveryCallback = _.noop;
var middleDiscovery2Callback = _.noop;

function parallaxPoints(point, xOffset, yOffset) {
  if (point.originalRadius > 1.9) {
    point.x -= (xOffset * point.originalRadius) * _.random(0.1, 0.3);
    point.y -= (yOffset * point.originalRadius) * _.random(0.1, 0.3);
  }
}

function explodeSpotlight(done) {
  var duration = 2500;
  SHOULD_INTERSECT = false;
  dynamics.animate(transitionParams, {
    opacity: 0
  }, {
    duration: duration
  });
  ripples.add();
  setTimeout(done, duration);
}

function revealSpotlight(done) {
  var duration = 4000;
  SHOULD_INTERSECT = true;
  dynamics.animate(transitionParams, {
    opacity: 1
  }, {
    duration: duration
  });
  setTimeout(done, duration);
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
  activePoints.forEach(function (point) {
    point.fadeOutSpeed = _.random(0.003, 0.01);
  });

  setTimeout(function () {
    SHOUD_DRAW_POINTS = false;
  }, 9000);

  setTimeout(done, 2500);
}

function changeSpotLightColour(target, duration, cb) {
  dynamics.animate(spotLighColourParams, {
    t: target
  }, {
    duration: duration
  });

  setTimeout(cb, duration);
}

function wait(duration, cb) {
  setTimeout(cb, duration);
}

module.exports.mousedown = function () {
  // spotLight.setRadius(spotLight.radius - sizeChangeOnClick);
  currentPoints.forEach(pointClickEvent);
  var foundSpecial = connections.update(currentPoints);
  if (currentPoints.length > 0) {
    spotLight.originalRadius -= sizeChangeOnClick;
    setTimeout(function () {
      spotLight.originalRadius += sizeChangeOnClick;
    }, 100);
  }

  if (FIRST) {
    FIRST = false;
  } else if (currentPoints.length > 0) {
    var specialColour = _.random(0, 100) > 50 ? colours.lightBlue : colours.orange;
    var colour = foundSpecial ? specialColour : null;
    ripples.add(colour);
  }

  var numberOfConnectionsDiscovered = connections.getConnectionsLength();

  if (numberOfConnectionsDiscovered >= 3 && numberOfConnectionsDiscovered < 6 && !HAS_PROGRESSED_AT_LEAST_ONCE) {
    console.log('test');
    foundFirstConnectionCallback();
    HAS_PROGRESSED_AT_LEAST_ONCE = true;
  }

  if (numberOfConnectionsDiscovered === 6 && !HAS_DISCOVERED_INITIAL_POINTS) {
    displaySpecialIntroPoints();
    HAS_DISCOVERED_INITIAL_POINTS = true;
  } else if (numberOfConnectionsDiscovered > 15 && IS_INTRO) {
    displayAllThePoints();
    IS_INTRO = false;
  }

  if (foundSpecial) revealedSpecialCallback();

  var discoveryPercentage = connections.getDiscoveryPercentage();
  if (discoveryPercentage > 0.15 && !HAS_FIRED_MIDDLE_EVENT) {
    console.log('middle1');
    middleDiscoveryCallback();
    HAS_FIRED_MIDDLE_EVENT = true;
  }

  if (discoveryPercentage > 0.27 && !HAS_FIRED_MIDDE_2_EVENT) {
    console.log('middle2');
    middleDiscovery2Callback();
    HAS_FIRED_MIDDE_2_EVENT = true;
  }

  return discoveryPercentage;
};

module.exports.transition = function (cb) {
  HAS_TRANSITIONED = true;
  async.series([
    explodeSpotlight,
    slowDownPointMovement,
    fadeAllPointsOut,
    connections.reveal
  ], cb);
};

module.exports.stopDrawingConnections = function (cb) {
  SHOULD_DRAW_CONNECTIONS = false;
  stopDrawingCallback();
  cb();
};

module.exports.display = function () {
  var element = document.getElementById('pt');
  element.style.opacity = 1;
  // revealSpotlight(function () {});
  // cb();
};

module.exports.getSpecialTriangles = connections.getSpecialTriangles;

module.exports.on = function (event, cb) {
  if (event === 'revealStart') connections.on('revealStart', cb);
  if (event === 'revealEnd') connections.on('revealEnd', cb);
  if (event === 'stoppedDrawing') stopDrawingCallback = cb;
  if (event === 'foundSpecial') foundSpecialCallback = cb;
  if (event === 'revealedSpecial') revealedSpecialCallback = cb;
  if (event === 'foundFirstConnection') foundFirstConnectionCallback = cb;
  if (event === 'displayInitialImportantConnections') displayIntroSpecialCallback = cb;
  if (event === 'middleOfDiscovery') middleDiscoveryCallback = cb;
  if (event === 'middleOfDiscovery2') middleDiscovery2Callback = cb;
};

module.exports.setInitialSpotlightParams = function (params) {
  var target = params.radius / spotLight.originalRadius;
  transitionParams.spotLightSize = target;
  spotLightInitialXPosition = params.x + params.radius;
  spotLightInitialYPosition = params.y + params.radius + 9.5;
};

module.exports.addIntro = function () {
  introPoints.forEach(function (point, index) {
    (function (point) {
      setTimeout(function () {
        activePoints.push(point);
      }, 600 * (index + 1));
    })(point);
  });
};

module.exports.startFollowingMouse = function () {
  SHOUD_FOLLOW_MOUSE = true;
  STARTED = true;
  ripples.add();

  async.series([
    async.apply(changeSpotLightColour, 1, 300),
    async.apply(wait, 50),
    async.apply(changeSpotLightColour, 0, 300)
  ]);
};

module.exports.render = function () {
  space.clear();
  var delta = globals.getDelta();

  var mouse = globals.getMousePosition();

  if (SHOUD_FOLLOW_MOUSE) {
    spotLight.x += (mouse.x - spotLight.x) * (easingStrength * delta);
    spotLight.y += (mouse.y - spotLight.y) * (easingStrength * delta);
  } else {
    spotLight.x = spotLightInitialXPosition;
    spotLight.y = spotLightInitialYPosition;
  }
  var targetRadius = spotLight.originalRadius * transitionParams.spotLightSize;
  if (targetRadius < 0) targetRadius = 0;

  var spotLightColor = white;
  if (!STARTED) spotLightColor = grey;

  var opacity = transitionParams.opacity;
  var r = lerp(grey.x, white.x, spotLighColourParams.t);
  var g = lerp(grey.y, white.y, spotLighColourParams.t);
  var b = lerp(grey.z, white.z, spotLighColourParams.t);
  var spotLightFinalColour = 'rgba(' + parseInt(r) + ',' + parseInt(g) + ',' + parseInt(b) + ',' + opacity + ')';

  spotLight.setRadius(targetRadius);
  form.fill(spotLightFinalColour, 0.1).stroke(false);
  form.circle(spotLight);

  // draw ripple circles
  ripples.draw();
  // detect collissions
  ripples.detectCollisions(activePoints);

  //draw connections
  if (SHOULD_DRAW_CONNECTIONS) {
    connections.draw(pairsInsideSpotlight);
  }

  //randomise points movements
  if (SHOUD_DRAW_POINTS) {
    activePoints.forEach(_.partial(randomisePoint, _, pointTransitionParams.randomMovementRate));
  }

  if (!HAS_TRANSITIONED) {
    var xOffset = (mouse.x / space.size.x) - 0.5;
    var yOffset = (mouse.y / space.size.y) - 0.5;
    activePoints.forEach(_.partial(parallaxPoints, _, xOffset, yOffset));
  }

  //calculate intersection of spot lights and points
  var pointsInsideCircle = [];

  if (SHOULD_INTERSECT) {
    pointsInsideCircle = intersect(spotLight, activePoints);
  }

  //change cursor
  if (pointsInsideCircle.length > 0) {
    document.body.style.cursor = 'pointer';
  } else {
    document.body.style.cursor = 'auto';
  }

  //draw connections inside the spot light
  var temporaryPairsInsideCircle = [];
  updateTemporaryPairs(pointsInsideCircle, temporaryPairsInsideCircle);
  pairsInsideSpotlight = temporaryPairsInsideCircle;

  //draw points
  if (SHOUD_DRAW_POINTS) {
    activePoints.forEach(drawPoint);
  }

  //calculate change
  if (!_.isEqual(currentPoints, pointsInsideCircle)) {
    var toRemove = _.differenceBy(currentPoints, pointsInsideCircle, 'id');
    var toAdd = _.differenceBy(pointsInsideCircle, currentPoints, 'id');
    var anySpecials = connections.updateInsideConnections(pointsInsideCircle);
    var foundSpecial = false;

    if (!ALREADY_SPECIAL && anySpecials) {
      ALREADY_SPECIAL = true;
      foundSpecialCallback();
    }

    if (!anySpecials) ALREADY_SPECIAL = false;
    if (pointsInsideCircle.length > 0) {
      changeSpotLightColour(1, 300, _.noop());
    } else {
      changeSpotLightColour(0, 300, _.noop());
    }
    change(toAdd, toRemove, currentlyPlaying, foundSpecial);
  }

  //update the current points
  currentPoints = pointsInsideCircle;
};

module.exports.init = function (cb) {
  points = createPoints(config.numberOfRandomPoints);
  special = _.filter(points, ['special', true]);
  introPoints = _.filter(points, ['intro', true]);
  activePoints = [];
  connections.reset();
  connections.createSpecialShape(special);
  specialIntroPoints = connections.getRandomSpecialTriangles();
  specialAndActive = _(specialIntroPoints).concat(activePoints).flatten().value();
  points = _.differenceBy(points, specialAndActive, 'id');
  HAS_TRANSITIONED = false;
  SHOUD_DRAW_POINTS = true;
  SHOULD_INTERSECT = true;
  SHOULD_DRAW_CONNECTIONS = true;
  ALREADY_SPECIAL = false;
  SHOULD_DRAW_CONNECTIONS = true;
  IS_INTRO = true;
  STARTED = false;
  SHOUD_FOLLOW_MOUSE = false;
  HAS_FIRED_MIDDLE_EVENT = false;
  HAS_FIRED_MIDDE_2_EVENT = false;
  FIRST = true;
  HAS_PROGRESSED_AT_LEAST_ONCE = false;
  HAS_DISCOVERED_INITIAL_POINTS = false;
  pointTransitionParams.randomMovementRate = 1;
  revealSpotlight(cb);
};
