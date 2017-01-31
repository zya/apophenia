'use strict';

var _ = require('lodash');
var dynamics = require('dynamics.js');
var Stats = require('stats.js');
var randomF = require('random-float');
var async = require('async');

var stats = new Stats();

var pt = require('./lib/pt');
var colours = require('./lib/colours');
var conductor = require('./lib/music/conductor');

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
var shouldDrawConnections = true;
var threeD = false;

var transitionParams = {
  randomMovementRate: 1,
  spotLightSize: 1,
};

var pointTransitionParams = {
  randomMovementRate: 1
};


scene3d.on('spinStart', function () {
  console.log('started spinning');
  conductor.startSecondSection();
});

scene3d.on('growStart', function () {
  console.log('started growing');
});

scene3d.on('roseHoverOn', function () {
  conductor.playBass();
  console.log('rose hover on');
});

scene3d.on('roseHoverOff', function () {
  console.log('rose hover off');
});

scene3d.on('roseClick', function () {
  conductor.playLead();
  console.log('rose click');
});

connections.on('revealStart', function () {
  console.log('started revealing');
});

connections.on('revealEnd', function () {
  console.log('finished revealing');
});

function fadeAllPointsOut(done) {
  points.forEach(function (point) {
    point.fadeOutSpeed = randomF(0.003, 0.01);
  });

  setTimeout(function () {
    shouldDrawPoints = false;
  }, 9000);

  setTimeout(done, 2500);
}

function initialise3DScene(done) {
  scene3d.init(connections.getSpecialTriangles(), function () {
    setTimeout(function () {
      threeD = true;
      done();
    }, 300);
  });
}

function display3DScene(done) {
  scene3d.displayCanvas(function () {
    shouldDrawConnections = false;
    done();
  });
}

function stopDrawingConnections(done) {
  setTimeout(function () {
    shouldDrawConnections = false;
    done();
  }, 5100);
}


function transitionTo3D(done) {
  async.series([
    initialise3DScene,
    conductor.stopFirstSection,
    display3DScene,
    scene3d.startTransition,
    stopDrawingConnections,
  ], done);
}

// setTimeout(function () {
//   transitionTo3D();
//   fadeAllPointsOut();
// }, 500);

stats.showPanel(0);
document.body.appendChild(stats.dom);

// initialise stuff
var special = _.filter(points, ['special', true]);
connections.createSpecialShape(special);

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

function parallaxPoints(point, xOffset, yOffset) {
  if (point.originalRadius > 1.9) {
    point.x -= (xOffset * point.originalRadius) * _.random(0.1, 0.3);
    point.y -= (yOffset * point.originalRadius) * _.random(0.1, 0.3);
  }
}

var alreadyIsSpecial = false;

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
      var xOffset = (mouseX / space.size.x) - 0.5;
      var yOffset = (mouseY / space.size.y) - 0.5;
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

    // 3d stuff - commente out for now
    if (threeD) {
      scene3d.render();
    }

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
        if (discoveryPercentage > 0.10 && !hasTransitioned) {
          hasTransitioned = true;

          async.series([
          explodeSpotlight,
          slowDownPointMovement,
          fadeAllPointsOut,
          connections.reveal,
          transitionTo3D
        ]);

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

var play = document.getElementById('play-icon');
var text = document.getElementById('text');
text.style.display = 'none';

play.addEventListener('click', function () {
  // space.play();
});

conductor.startIntroKicks();
