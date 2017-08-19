'use strict';

var _ = require('lodash');
var Stats = require('stats.js');
var async = require('async');
var bowser = require('bowser');

var conductor = require('./lib/music/conductor');
var scene2d = require('./lib/2d/scene2D');
var scene3d = require('./lib/3d/scene3D');
var globals = require('./lib/globals');
var config = require('./config');
var textHandler = require('./lib/text');

var stats = new Stats();

var HAS_TRANSITIONED = false;
var IS_LIMBO = false;
var SECOND_SECTION_HAS_FINISHED = false;
var HAVE_TRIGGERED_MID_INDICATION_EVENT = false;
var SHOUD_RENDER_3D = false;
var SHOULD_RENDER_2D = true;
var DEBUG = false;
var SHOULD_FINISH = true;
var DELAY_TIME_TO_START = 5000;
var ALREADY_FINISHED = false;
var SPECIALS_FOUND = 0;
var FRAME = 0;
var WARMUP_3D_INTERVAL = 120;

// stats.showPanel(0);
stats.dom.style.top = '';
stats.dom.style.bottom = '0px';
// document.body.appendChild(stats.dom);

function initialise3DScene(done) {
  var triangles = scene2d.getSpecialTriangles();
  scene3d.init(triangles, function () {
    setTimeout(function () {
      SHOUD_RENDER_3D = true;
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
  WARMUP_3D_INTERVAL = 10;
  async.series([
    initialise3DScene,
    conductor.stopFirstSection,
    display3DScene,
    scene3d.startTransition,
  ], done);
}

if (DEBUG) {
  setTimeout(function () {
    async.series([
      scene2d.transition,
      transitionTo3D
    ]);
  }, 500);
}

scene3d.on('spinStart', function () {
  console.log('started spinning');
  conductor.addDrumsToSecondSection();
});

scene3d.on('growStart', function () {
  console.log('started growing');
  conductor.playDimensionSounds();
  conductor.startSecondSection();
});

scene3d.on('growFinish', function () {
  console.log('finished growing');
  conductor.playDimensionSounds();
});

scene3d.on('roseHoverOn', function () {
  conductor.playBass();
  console.log('rose hover on');
});

scene3d.on('roseHoverOff', function () {
  console.log('rose hover off');
});

scene3d.on('roseClick', function () {
  var isRoseCenterVisible = scene3d.isRoseCenterVisible();
  conductor.setShouldFinish(isRoseCenterVisible);

  if (SECOND_SECTION_HAS_FINISHED && SHOULD_FINISH && !IS_LIMBO && isRoseCenterVisible) {
    conductor.endSecondSection(function (p) {
      scene3d.reactToAudio();

      if (p === 1) {
        scene3d.explodeTheMesh();
        scene3d.removeHoverAnimations();
        setTimeout(function () {
          scene3d.explodeTheWireFrame(scene3d.toggleIntersect);
          IS_LIMBO = true;
        }, 2000);
      }
    });
    scene3d.stopMovement();
    return;
  }

  if (IS_LIMBO) {
    var isLastClick = conductor.playLimboMelody(scene3d.reactToAudio);
    if (isLastClick) scene3d.stopFiringClickEvents();
    return;
  }

  conductor.playLeadMelody(scene3d.reactToAudio);
});

scene2d.on('revealStart', function () {
  console.log('started revealing');
  conductor.playReveal();
});

scene2d.on('revealEnd', function () {
  console.log('finished revealing');
  textHandler.proceed();
  setTimeout(function () {
    textHandler.proceed();
  }, 5000);
});

scene2d.on('stoppedDrawing', function () {
  SHOULD_RENDER_2D = false;
  console.log('stopped drawing');
});

scene2d.on('foundSpecial', function () {
  console.log('specials found', SPECIALS_FOUND);
  if (SPECIALS_FOUND === 0) textHandler.proceed();
  SPECIALS_FOUND++;
  console.log('founds a special connection');
});

scene2d.on('revealedSpecial', function () {
  console.log('revealed a special connection');
});

scene2d.on('foundFirstConnection', function () {
  console.log('found first connection');
  textHandler.proceed();
});

scene2d.on('middleOfDiscovery', function () {
  textHandler.proceed();
  setTimeout(function () {
    textHandler.proceed();
  }, 6000);
});

scene2d.on('middleOfDiscovery2', function () {
  textHandler.proceed();
  setTimeout(function () {
    textHandler.proceed();
  }, 6000);
});

scene2d.on('displayInitialImportantConnections', function () {
  conductor.startIntroKicks();
  console.log('displaying initial');
  textHandler.proceed();
});

conductor.on('finish', function () {
  console.log('second section finished');
  SECOND_SECTION_HAS_FINISHED = true;
});

conductor.on('lastNotesPlayed', function (p) {
  if (p < 0.30) {
    conductor.playFinalPercs();
  } else if (p >= 1) {
    scene3d.finish(function () {
      if (ALREADY_FINISHED) return;
      ALREADY_FINISHED = true;
      conductor.cleanUpSecondSection();
      console.log('finished 🍎');
      setTimeout(function () {
        console.log('start showing the last text');
        textHandler.proceed();
      }, 3000);

      setTimeout(function () {
        console.log('start fading the last text');
        textHandler.proceed();
      }, 10000);

      setTimeout(function () {
        scene3d.hideCanvas();
        scene2d.init(function () {
          play.style.display = 'inline';
        });
        textHandler.reset();
        HAS_TRANSITIONED = false;
        IS_LIMBO = false;
        SECOND_SECTION_HAS_FINISHED = false;
        HAVE_TRIGGERED_MID_INDICATION_EVENT = false;
        SHOUD_RENDER_3D = false;
        SHOULD_RENDER_2D = true;
        ALREADY_FINISHED = false;
        SPECIALS_FOUND = 0;
        WARMUP_3D_INTERVAL = 120;
      }, 15000);
    });
  }
});

conductor.on('secondPartProgress', function (progress) {
  scene3d.zoom(progress);
  progressBar2.style.width = Math.min((progress * 100), 100) + '%';
  if (progress > 0.35 && !HAVE_TRIGGERED_MID_INDICATION_EVENT) {
    textHandler.proceed();
    setTimeout(function () {
      textHandler.proceed();
    }, 7000);
    HAVE_TRIGGERED_MID_INDICATION_EVENT = true;
  }
});

window.addEventListener('mousemove', function (evt) {
  if (evt.target.id !== 'pt') {}
  globals.setMousePosition(evt.clientX, evt.clientY);
});

var throttled3DMouseDown = _.throttle(scene3d.mousedown, 500, {
  trailing: false
});

var throttled2DMouseDown = _.throttle(function () {
  var discoveryPercentage = scene2d.mousedown();
  conductor.proceed(discoveryPercentage);
  document.getElementById('progress-bar').style.width = Math.min(((discoveryPercentage / config.discoveryThreshold) * 100), 100) + '%';
  if (discoveryPercentage === 0) progressBar2.style.width = 0 + '%';

  if (discoveryPercentage > config.discoveryThreshold && !HAS_TRANSITIONED) {
    HAS_TRANSITIONED = true;
    globals.setTransitioned = true;
    conductor.playLastFound();
    async.series([
      scene2d.transition,
      transitionTo3D
    ]);
  }
}, 200, {
  trailing: false
});

function mouseDown() {
  throttled3DMouseDown();
  if (HAS_TRANSITIONED) return;
  throttled2DMouseDown();
}

window.addEventListener('mousedown', mouseDown);

var play = document.getElementById('play-icon');
var loading = document.getElementById('loading');
var text = document.getElementById('text');
var progressBar2 = document.getElementById('progress-bar-2');
// text.style.display = 'none';

play.addEventListener('click', start);

function render() {
  stats.begin();
  var now = new Date().getTime();
  globals.setDelta(now);

  if (SHOULD_RENDER_2D) {
    scene2d.render();
    if (FRAME % WARMUP_3D_INTERVAL === 0) {
      scene3d.render();
      console.log('warming up');
      FRAME = 0;
    }
  }

  if (SHOUD_RENDER_3D) scene3d.render();

  FRAME++;
  stats.end();
  requestAnimationFrame(render);
}

function ready() {
  loading.style.display = 'none';
  play.style.display = 'inline';
  var size = play.getBoundingClientRect();

  scene2d.setInitialSpotlightParams({
    radius: size.width / 2,
    x: size.left,
    y: size.top
  });
}

setTimeout(ready, DEBUG ? 0 : DELAY_TIME_TO_START);

function start() {
  text.style.opacity = 0;
  setTimeout(conductor.startBackgroundMelody, 3000);
  play.style.opacity = 0;
  setTimeout(function () {
    play.style.display = 'none';
    text.style.display = 'none';
  }, 3000);
  scene2d.startFollowingMouse();
  conductor.playIntro();
  setTimeout(scene2d.addIntro, 3500);

  setTimeout(function () {
    textHandler.proceed();
  }, 4000);
}

if (!bowser.chrome) {
  document.getElementById('chrome').style.display = 'inline';
}

conductor.startBackground();
requestAnimationFrame(render);
