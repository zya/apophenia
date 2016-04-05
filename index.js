var pt = require('ptjs');
var _ = require('lodash');
var teoria = require('teoria');
var randomInt = require('random-int');
var uuid = require('node-uuid');

var Voice = require('./lib/voice');
var context = require('./lib/context');
var load = require('./lib/load');

var limiter = context.createDynamicsCompressor();
var convolver = context.createConvolver();
var synthGain = context.createGain();

limiter.ratio.value = 40;
limiter.attack.value = 0.01;
limiter.release.value = 0.01;
limiter.threshold.value = -1;

limiter.connect(context.destination);
convolver.connect(limiter);
synthGain.connect(convolver);

load('./assets/ir.mp3', function (buffer) {
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

var dot = new pt.Circle(250, 250).setRadius(space.size.x / 13);
var smallDot = new pt.Circle().setRadius(3);

var g3 = teoria.note('g3');
var scale = g3.scale('minorpentatonic');
var notes = scale.notes();

var currentlyPlaying = [];
var currentPoints = [];

function createPoints(amount) {
  var points = [];
  for (var i = 0; i < amount; i++) {
    var point = new pt.Vector(Math.random() * space.size.x, Math.random() * space.size.y);
    var randomNote = notes[randomInt(0, notes.length - 1)];
    var multipliers = [1, 0.5, 2];

    point.fq = randomNote.fq() * multipliers[randomInt(0, 2)];
    point.id = uuid.v1();
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
      release: 5
    });
    var indexToDelete = currentlyPlaying.indexOf(voice);
    currentlyPlaying.splice(indexToDelete, 1);
  });

  toAdd.forEach(function (point) {
    var voice = new Voice(point.id, point.fq, synthGain);
    voice.start({
      now: context.currentTime,
      peak: 0.03,
      attack: 6
    });
    currentlyPlaying.push(voice);
  });
}

window.addEventListener('resize', function () {
  dot.radius = space.size.x / 13;
  points = createPoints(80);
});

window.addEventListener('mousemove', function (evt) {
  if (evt.target.id !== 'pt') {}
});


var bot = {
  animate: function (time, fs, context) {
    form.fill(backgroundColor).stroke(false);
    form.circle(dot);
    var pointsInsideCircle = [];
    points.forEach(function (pt) {
      pt.set(pt.x + (Math.random() - 0.5), pt.y + (Math.random() - 0.5));
      var intersected = dot.intersectPoint(pt);
      if (intersected) {
        form.fill(red).stroke(false);
        pointsInsideCircle.push(pt);
        form.point(pt, 2);
      } else {
        form.fill(lightBlue).stroke(false);
        form.point(pt, 1);
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
    if (type === 'move') {
      dot.set(x, y);
    }
  },
  onTouchAction: function (type, x, y, evt) {
    if (type === 'move') {
      var offsetX = (window.innerWidth - evt.target.offsetWidth) / 2;
      dot.set(x - offsetX, y);
    }
    evt.preventDefault();
  }
};

space.add(bot);
space.bindMouse();
space.bindTouch();
space.play();
