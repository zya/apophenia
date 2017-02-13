'use strict';

var Stats = require('stats.js');
var async = require('async');

var conductor = require('./lib/music/conductor');
var scene2d = require('./lib/2d/scene2D');
var scene3d = require('./lib/3d/scene3D');
var globals = require('./lib/globals');
var config = require('./config');

var stats = new Stats();

var hasTransitioned = false;
var threeD = false;

stats.showPanel(0);
document.body.appendChild(stats.dom);

function initialise3DScene(done) {
  var triangles = scene2d.getSpecialTriangles();
  scene3d.init(triangles, function () {
    setTimeout(function () {
      threeD = true;
      done();
    }, 300);
  });
}

function display3DScene(done) {
  async.series([
    scene3d.displayCanvas,
    scene2d.stopDrawingConnections
  ], done);
}

function transitionTo3D(done) {
  async.series([
    initialise3DScene,
    conductor.stopFirstSection,
    display3DScene,
    scene3d.startTransition,
  ], done);
}

setTimeout(function () {
  async.series([
    scene2d.transition,
    transitionTo3D
  ]);
}, 500);

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

scene2d.on('revealStart', function () {
  console.log('started revealing');
});

scene2d.on('revealEnd', function () {
  console.log('finished revealing');
});

window.addEventListener('mousemove', function (evt) {
  if (evt.target.id !== 'pt') {}
  globals.setMousePosition(evt.clientX, evt.clientY);
});

window.addEventListener('mousedown', function () {
  if (hasTransitioned) return;

  var discoveryPercentage = scene2d.mousedown();
  conductor.proceed(discoveryPercentage);

  if (discoveryPercentage > config.discoveryThreshold && !hasTransitioned) {
    hasTransitioned = true;

    async.series([
      scene2d.transition,
      transitionTo3D
    ]);
  }
});

window.addEventListener('mouseup', function () {
  if (hasTransitioned) return;
  scene2d.mouseup();
});

var play = document.getElementById('play-icon');
var text = document.getElementById('text');
text.style.display = 'none';

play.addEventListener('click', function () {});

function render() {
  stats.begin();
  var now = new Date().getTime();
  globals.setDelta(now);

  scene2d.render();

  if (threeD) {
    scene3d.render();
  }

  stats.end();
  requestAnimationFrame(render);
}

conductor.startIntroKicks();
conductor.startBackground();
requestAnimationFrame(render);
