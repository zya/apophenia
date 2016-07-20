'use strict';

var _ = require('lodash');

var pt = require('./lib/pt');
var colours = require('./lib/colours');

var createPoints = require('./lib/createPoints');
var updateTemporaryPairs = require('./lib/updateTemporaryPairs');
var randomisePoint = require('./lib/randomisePoint');
var intersect = require('./lib/intersectSpotlightAndPoints');
var change = require('./lib/changeHandler');
var playLead = require('./lib/playLead');
var drawPoint = require('./lib/drawPoint');
var connections = require('./lib/connections');
var explosions = require('./lib/explosions');
var globals = require('./lib/globals');
var config = require('./config');

var space = pt.space;
var form = pt.form;
var spotLight = pt.spotLight;
var spotLightRatio = config.spotLightSizeRatio;

var points = createPoints(config.numberOfRandomPoints);
var currentlyPlaying = [];
var currentPoints = [];
var pairsInsideSpotlight = [];

var mouseX = 0;
var mouseY = 0;
var easingStrength = config.easingStrength;
var sizeChangeOnClick = config.sizeChangeOnClick;
var white = colours.white.hex();

var special = _.filter(points, ['special', true]);
connections.createSpecialShape(special);

var sketch = {
  animate: function () {
    var now = new Date().getTime();
    globals.setDelta(now);

    // draw explosion circles
    explosions.draw();
    // clean up the explosion circles
    explosions.clean();
    // detect collissions
    explosions.detectCollisions(points);

    //draw spotlight
    var delta = globals.getDelta();
    spotLight.x += (mouseX - spotLight.x) * (easingStrength * delta);
    spotLight.y += (mouseY - spotLight.y) * (easingStrength * delta);
    form.fill(white, 0.1).stroke(false);
    form.circle(spotLight);

    //draw connections
    connections.draw(pairsInsideSpotlight);

    //randomise points movements
    points.forEach(randomisePoint);

    //calculate intersection of spot lights and points
    var pointsInsideCircle = intersect(spotLight, points);

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
    points.forEach(drawPoint);

    //calculate change
    if (!_.isEqual(currentPoints, pointsInsideCircle)) {
      var toRemove = _.difference(currentPoints, pointsInsideCircle);
      var toAdd = _.difference(pointsInsideCircle, currentPoints);
      change(toAdd, toRemove, currentlyPlaying);
      connections.updateInsideConnections(pointsInsideCircle);
    }

    //update the current points
    currentPoints = pointsInsideCircle;
  },
  onMouseAction: function (type, x, y) {
    switch (type) {
    case 'move':
      mouseX = x;
      mouseY = y;
      break;
    case 'down':
      spotLight.setRadius(spotLight.radius - sizeChangeOnClick);
      currentPoints.forEach(playLead);
      connections.update(currentPoints);
      explosions.add();
      break;
    case 'up':
      spotLight.setRadius(spotLight.radius + sizeChangeOnClick);
      break;
    }
  },
  onTouchAction: function (type, x, y, evt) {
    if (type === 'move' || type === 'down') {
      var offsetX = (window.innerWidth - evt.target.offsetWidth) / 2;
      mouseX = x - offsetX;
      mouseY = y;
    }

    if (type === 'down') {
      spotLight.setRadius(spotLight.radius - sizeChangeOnClick);
      currentPoints.forEach(playLead);
      connections.update(currentPoints);
      explosions.add();
    } else if (type === 'up') {
      spotLight.setRadius(spotLight.radius + sizeChangeOnClick);
    }

    evt.preventDefault();
  }
};

window.addEventListener('resize', function () {
  spotLight.radius = space.size.x / spotLightRatio;
  points = createPoints(config.numberOfRandomPoints);
});

window.addEventListener('mousemove', function (evt) {
  if (evt.target.id !== 'pt') {}
});

space.add(sketch);
space.bindMouse();
space.bindTouch();
space.play();
