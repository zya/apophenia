'use strict';

var _ = require('lodash');
var dynamics = require('dynamics.js');
var Stats = require('stats.js');
var randomF = require('random-float');

var stats = new Stats();

var pt = require('./lib/pt');
var colours = require('./lib/colours');

var createPoints = require('./lib/createPoints');
var updateTemporaryPairs = require('./lib/updateTemporaryPairs');
var scene3d = require('./lib/scene3D');
var randomisePoint = require('./lib/randomisePoint');
var intersect = require('./lib/intersectSpotlightAndPoints');
var change = require('./lib/changeHandler');
var playLead = require('./lib/playLead');
var drawPoint = require('./lib/drawPoint');
var connections = require('./lib/connections');
var ripples = require('./lib/ripples');
var globals = require('./lib/globals');
var config = require('./config');
var sine = require('./lib/sine');
var map = require('./lib/map');

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

var hasTransitioned = false;
var shouldDrawPoints = true;
var shouldIntersect = true;
var shouldMorph = false;
var threeD = false;

var transitionParams = {
  randomMovementRate: 1,
  insideConnectionsOpacity: 1,
  spotLightSize: 0,
  outSideConnectionOpacityRate: 1
};

function fadeAllPointsOut() {
  points.forEach(function (point) {
    point.fadeOutSpeed = randomF(0.003, 0.01);
  });

  setTimeout(function () {
    shouldDrawPoints = false;
  }, 3000);
}


function transitionTo3D() {
  scene3d.init(connections.getSpecialTriangles());
  threeD = true;
  setTimeout(function () {
    scene3d.displayCanvas(); //commented out for now
  }, 300);

  setTimeout(function () {
    shouldMorph = true;
  }, 5000);
}

stats.showPanel(0);
document.body.appendChild(stats.dom);

// initialise stuff
var special = _.filter(points, ['special', true]);
connections.createSpecialShape(special);

function slowDownPointMovement() {
  var duration = 3000;

  setTimeout(function () {
    dynamics.animate(transitionParams, {
      randomMovementRate: 0
    }, {
      duration: duration
    });
  }, 500);

  return duration;
}

function slowDownInsideConnectionsOpacity() {
  var duration = 3000;

  setTimeout(function () {
    dynamics.animate(transitionParams, {
      insideConnectionsOpacity: 0,
      outSideConnectionOpacityRate: 0
    }, {
      duration: duration
    });
  }, 500);
}

function explodeSpotlight() {
  var duration = 12000;
  setTimeout(function () {
    shouldIntersect = false;
    dynamics.animate(transitionParams, {
      spotLightSize: 3000
    }, {
      duration: duration
    });
  }, 500);
}

var sketch = {
  animate: function () {
    stats.begin();
    var now = new Date().getTime();
    globals.setDelta(now);

    //draw spotlight
    var delta = globals.getDelta();
    spotLight.x += (mouseX - spotLight.x) * (easingStrength * delta);
    spotLight.y += (mouseY - spotLight.y) * (easingStrength * delta);
    form.fill(white, 0.1).stroke(false);
    form.circle(spotLight);
    spotLight.setRadius(spotLight.radius + transitionParams.spotLightSize);

    // draw ripple circles
    ripples.draw();
    // detect collissions
    ripples.detectCollisions(points);

    //draw connections
    connections.draw(pairsInsideSpotlight, transitionParams.insideConnectionsOpacity, transitionParams.outSideConnectionOpacityRate);

    //randomise points movements
    if (shouldDrawPoints) {
      points.forEach(_.partial(randomisePoint, _, transitionParams.randomMovementRate));
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

    // 3d stuff - commente out for now
    if (threeD) {
      scene3d.render();
      if (shouldMorph) {
        var m = map(sine(1.5, 1, Date.now() * 0.0005, 0), -1, 1, -0.005, -0.03);
        scene3d.updateMorph(m);
      }
    }
    // scene3d.render();

    stats.end();
  },
  onMouseAction: function (type, x, y) {
    switch (type) {
    case 'move':
      mouseX = x;
      mouseY = y;
      break;
    case 'down':
      if (hasTransitioned) return;
      spotLight.setRadius(spotLight.radius - sizeChangeOnClick);
      currentPoints.forEach(playLead);
      connections.update(currentPoints);
      ripples.add();

      var discoveryPercentage = connections.getDiscoveryPercentage();
      if (discoveryPercentage > 0.70 && !hasTransitioned) {
        hasTransitioned = true;
        var duration = slowDownPointMovement();
        setTimeout(function () {
          slowDownInsideConnectionsOpacity();
          fadeAllPointsOut();
        }, duration + 2000);
        setTimeout(explodeSpotlight, duration + 4000);
        setTimeout(transitionTo3D, duration + 5000);
        return;
      }
      break;
    case 'up':
      if (hasTransitioned) return;
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
      ripples.add();
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
  globals.setMousePosition(evt.clientX, evt.clientY);
});

space.add(sketch);
space.bindMouse();
space.bindTouch();
space.play();
