'use strict';

var Stats = require('stats.js');
var async = require('async');

var conductor = require('./lib/music/conductor');
var scene2d = require('./lib/2d/scene2D');
var scene3d = require('./lib/3d/scene3D');
var globals = require('./lib/globals');
var config = require('./config');
var textHandler = require('./lib/text');

var stats = new Stats();

var hasTransitioned = false;
var threeD = false;
var twoD = true;

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
  warmUp3DRenderInterval = 10;
  async.series([
    initialise3DScene,
    conductor.stopFirstSection,
    display3DScene,
    scene3d.startTransition,
  ], done);
}

// setTimeout(function () {
//   async.series([
//     scene2d.transition,
//     transitionTo3D
//   ]);
// }, 500);

// setInterval(function () {
//   if (!threeD) scene3d.render();
// }, 150);

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

scene2d.on('stoppedDrawing', function () {
  twoD = false;
  console.log('stopped drawing');
});

var specialsFound = 0;
scene2d.on('foundSpecial', function () {
  if (specialsFound === 0) textHandler.proceed();
  specialsFound++;
  console.log('founds a special connection');
});

scene2d.on('revealedSpecial', function () {
  console.log('revealed a special connection');
});

scene2d.on('foundFirstConnection', function () {
  textHandler.proceed();
});

scene2d.on('displayInitialImportantConnections', function () {
  textHandler.proceed();
});

window.addEventListener('mousemove', function (evt) {
  if (evt.target.id !== 'pt') {}
  globals.setMousePosition(evt.clientX, evt.clientY);
});

window.addEventListener('mousedown', function () {
  if (hasTransitioned) return;

  var discoveryPercentage = scene2d.mousedown();
  conductor.proceed(discoveryPercentage);
  document.getElementById('progress-bar').style.width = ((discoveryPercentage / config.discoveryThreshold) * 100) + '%';

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

var frame = 0;
var warmUp3DRenderInterval = 120;

function render() {
  stats.begin();
  var now = new Date().getTime();
  globals.setDelta(now);

  if (twoD) {
    scene2d.render();
    if (frame % warmUp3DRenderInterval === 0) {
      scene3d.render();
      console.log('warming up');
      frame = 0;
    }
  }

  if (threeD) scene3d.render();

  frame++;
  stats.end();
  requestAnimationFrame(render);
}

conductor.startIntroKicks();
conductor.startBackground();
// conductor.startSecondSection();
requestAnimationFrame(render);

setTimeout(function () {
  textHandler.proceed();
}, 2000);
