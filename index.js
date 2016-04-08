var pt = require('ptjs');
var _ = require('lodash');
var teoria = require('teoria');
var randomInt = require('random-int');
var randomFloat = require('random-float');
var uuid = require('node-uuid');

var Voice = require('./lib/voice');
var context = require('./lib/context');
var load = require('./lib/load');
var envelope = require('./lib/envelope');

var limiter = context.createDynamicsCompressor();
var convolver = context.createConvolver();
convolver.normalize = false;
var synthGain = context.createGain();

limiter.ratio.value = 40;
limiter.attack.value = 0.01;
limiter.release.value = 0.01;
limiter.threshold.value = -1;

limiter.connect(context.destination);
convolver.connect(limiter);
synthGain.connect(convolver);

load('./assets/ir3.mp3', function (buffer) {
  convolver.buffer = buffer;
});

var backgroundColor = '#FDFFFC';
var darkNavyBlue = '#011627';
var orange = '#FF9F1C';
var lightBlue = '#2EC4B6';
var red = '#E71D36';

var space = new pt.CanvasSpace('canvas', darkNavyBlue).display('#pt', function () {}, true);
space.autoResize(true);
var form = new pt.Form(space);

var spotLight = new pt.Circle(250, 250).setRadius(space.size.x / 21);
var smallCircle = new pt.Circle(250, 250).setRadius(2);

var g3 = teoria.note('g3');
var scale = g3.scale('minorpentatonic');
var notes = scale.notes();

var currentlyPlaying = [];
var currentPoints = [];
var trash = [];

function createPoints(amount) {
  var points = [];
  for (var i = 0; i < amount; i++) {
    var point = new pt.Vector(Math.random() * space.size.x, Math.random() * space.size.y);
    var randomNote = notes[randomInt(0, notes.length - 1)];
    var multipliers = [1, 0.5, 2];

    point.fq = randomNote.fq() * multipliers[randomInt(0, 2)];
    point.id = uuid.v1();
    point.colour = lightBlue;
    point.circle = new pt.Circle(250, 250).setRadius(1.1);
    points.push(point);
  }
  return points;
}

var points = createPoints(80);

function change(toAdd, toRemove) {
  var intersected = _.intersectionBy(currentlyPlaying, toRemove, 'id');

  intersected.forEach(function (voice) {
    voice.stop({
      now: context.currentTime,
      release: 3
    });

    var indexToDelete = currentlyPlaying.indexOf(voice);
    currentlyPlaying.splice(indexToDelete, 1);
  });

  toAdd.forEach(function (point) {
    var voice = new Voice(point.id, point.fq, synthGain);
    voice.start({
      now: context.currentTime,
      peak: 0.02,
      attack: 6
    });
    currentlyPlaying.push(voice);
  });
}

function playLead(point, index) {
  var osc = context.createOscillator();
  var gain = context.createGain();
  var now = context.currentTime;

  var startTime = now + (index * 0.5);
  if (index > 0) {
    startTime += randomFloat(-0.2, 0.2);
  }
  osc.start(startTime);
  osc.frequency.value = point.fq * 4;
  osc.connect(gain);
  gain.connect(synthGain);
  envelope(gain.gain, startTime, {
    start: 0,
    peak: 0.02,
    attack: 0.01,
    type: 'exponential',
    release: 0.4
  });
  osc.stop(startTime + 1.5);
  setTimeout(function(){
    gain.disconnect();
  }, 4000);

  setTimeout(function(){
    if (_.isEqual(point.colour, red)) point.colour = lightBlue;
    else point.colour = red;
  }, (startTime - context.currentTime) * 1000);
}

var bot = {
  animate: function (time, fs, context) {
    form.fill(backgroundColor).stroke(false);
    form.circle(spotLight);

    var pointsInsideCircle = [];
    points.forEach(function (pt) {

      pt.set(pt.x + (Math.random() - 0.5), pt.y + (Math.random() - 0.5));
      pt.circle.set(pt.x, pt.y);

      var intersected = spotLight.intersectPoint(pt);
      if (intersected) {
        form.fill(pt.colour).stroke(false);
        pointsInsideCircle.push(pt);
        pt.circle.setRadius(2.2);
        form.circle(pt.circle);
      } else {
        form.fill(pt.colour).stroke(false);
        pt.circle.setRadius(1.1);
        form.circle(pt.circle);
      }
    });

    if (pointsInsideCircle.length > 0) {
      space.space.style.cursor = 'pointer';
    } else {
      space.space.style.cursor = 'auto';
    }

    pointsInsideCircle.forEach(function (point, index) {
      pointsInsideCircle.forEach(function (point2, index2) {
        if (index === index2) return;
        form.stroke(orange);
        var line = new pt.Line(point).to(point2);
        form.line(line);
      });
    });

    if (!_.isEqual(currentPoints, pointsInsideCircle)) {
      var toRemove = _.difference(currentPoints, pointsInsideCircle);
      var toAdd = _.difference(pointsInsideCircle, currentPoints);
      change(toAdd, toRemove);
    }
    currentPoints = pointsInsideCircle;
  },
  onMouseAction: function (type, x, y) {
    switch (type) {
      case 'move':
        spotLight.set(x, y);
        break;
      case 'down':
        spotLight.setRadius(spotLight.radius - 2);
        currentPoints.forEach(playLead);
        break;
        case 'up':
          spotLight.setRadius(spotLight.radius + 1.5);
        break;
    }
  },
  onTouchAction: function (type, x, y, evt) {
    if (type === 'move') {
      var offsetX = (window.innerWidth - evt.target.offsetWidth) / 2;
      spotLight.set(x - offsetX, y);
    }
    evt.preventDefault();
  }
};

window.addEventListener('resize', function () {
  spotLight.radius = space.size.x / 15;
  points = createPoints(80);
});

window.addEventListener('mousemove', function (evt) {
  if (evt.target.id !== 'pt') {}
});

space.add(bot);
space.bindMouse();
space.bindTouch();
space.play();
