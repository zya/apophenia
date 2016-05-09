var pt = require('ptjs');
var _ = require('lodash');
var teoria = require('teoria');
var randomInt = require('random-int');
var randomFloat = require('random-float');
var uuid = require('node-uuid');
var moment = require('moment');

var Voice = require('./lib/voice');
var context = require('./lib/context');
var load = require('./lib/load');
var envelope = require('./lib/envelope');

var white = '#FDFFFC';
var darkNavyBlue = '#011627';
var orange = '#FF9F1C';
var lightBlue = '#2EC4B6';
var red = '#E71D36';
var darkGrey = '#353535';
var spotLightColor = white;
var playingCircleSize = 3.8;
var spotLightRatio = 20;
var numberOfRandomPoints = 90;
var currentlyPlaying = [];
var currentPoints = [];
var connections = [];
var pairs = [];
var pairsInsideSpotlight = [];
var trash = [];

var mouseX = 0;
var mouseY = 0;
var easingStrength = 0.18;

// pt stuff
var background = new pt.Color(0.4, 8.6, 15.3).setMode('rgb');
var space = new pt.CanvasSpace('canvas', background.rgb()).display('#pt', function() {}, true);
space.autoResize(true);
var form = new pt.Form(space);
var spotLight = new pt.Circle(250, 250).setRadius(space.size.x / spotLightRatio);
var smallCircle = new pt.Circle(250, 250).setRadius(2);

//music theory stuff
var g3 = teoria.note('g3');
var scale = g3.scale('minorpentatonic');
var notes = scale.notes();

// web audio stuff
var limiter = context.createDynamicsCompressor();
var convolver = context.createConvolver();
convolver.normalize = false;
var synthGain = context.createGain();
var leadGain = context.createGain();

limiter.ratio.value = 40;
limiter.attack.value = 0.01;
limiter.release.value = 0.01;
limiter.threshold.value = -1;

limiter.connect(context.destination);
convolver.connect(limiter);
synthGain.connect(convolver);
leadGain.connect(convolver);

synthGain.gain.value = 0.5;

load('./assets/ir3.mp3', function(buffer) {
  convolver.buffer = buffer;
});

setInterval(function() {
  trash.forEach(function(voice, index) {
    if (voice.timestamp.isBefore(moment().subtract(7, 'seconds'))) {
      trash.splice(index, 1);
    }
  });
  console.log('trash size', trash.length);
}, 5000);

function createPoints(amount) {
  var points = [];
  for (var i = 0; i < amount; i++) {
    var point = createPoint(Math.random() * space.size.x, Math.random() * space.size.y, lightBlue);
    points.push(point);
  }

  var bigCircle = addPoints(30, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 5);

  var mediumCircle = addPoints(18, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 8);

  var smallCircle = addPoints(15, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 15);

  var tinyCircle = addPoints(8, {
    x: space.size.x / 2,
    y: space.size.y / 2
  }, space.size.x / 24);

  return points.concat(bigCircle, smallCircle, mediumCircle, tinyCircle);
}

function createPoint(x, y, colour) {
  var point = new pt.Vector(x, y);
  point.colour = lightBlue;
  var randomNote = notes[randomInt(0, notes.length - 1)];
  var multipliers = [1, 0.5, 2];
  point.fq = randomNote.fq() * multipliers[randomInt(0, 2)];
  point.id = uuid.v1();
  point.colour = lightBlue;
  point.circle = new pt.Circle(250, 250).setRadius(1.1);
  point.connected = false;
  return point;
}

function addPoints(number, origin, r) {
  var points = [];
  for (var i = 0; i < number; i++) {
    var angle = (2 / number) * Math.PI * i;
    var y = origin.y + r * Math.cos(angle);
    var x = origin.x + r * Math.sin(angle);

    var randomX = randomInt(-10, 10);
    var randomY = randomInt(-10, 10);
    var point = createPoint(x + randomX, y + randomY, lightBlue);
    points.push(point);
  }
  return points;
}

var points = createPoints(numberOfRandomPoints);

function change(toAdd, toRemove) {
  var intersected = _.intersectionBy(currentlyPlaying, toRemove, 'id');

  intersected.forEach(function(voice) {
    voice.stop({
      now: context.currentTime,
      release: 3
    });

    var indexToDelete = currentlyPlaying.indexOf(voice);
    voice.timestamp = moment();
    trash.push(voice);
    currentlyPlaying.splice(indexToDelete, 1);
  });

  toAdd.forEach(function(point) {
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
  gain.connect(leadGain);
  envelope(gain.gain, startTime, {
    start: 0,
    peak: 0.02,
    attack: 0.01,
    type: 'linear',
    release: 0.4
  });
  osc.stop(startTime + 1.5);
  setTimeout(function() {
    gain.disconnect();
  }, 4000);

  setTimeout(function() {
    if (_.isEqual(point.colour, red)) point.colour = lightBlue;
    else point.colour = red;

    point.circle.setRadius(playingCircleSize);
    setTimeout(function() {
      point.circle.setRadius(1);
    }, 200);
  }, (startTime - context.currentTime) * 1000);
}

function setConnectedToTrue(point) {
  point.connected = true;
}

function updateConnections(points) {
  if (points.length < 2) return;
  points.forEach(setConnectedToTrue);
  points.forEach(function(point, index) {
    points.forEach(function(point2, index2) {
      if (index === index2) return;
      var pairN = point.id + point2.id;
      var pairR = point2.id + point.id;
      if (_.includes(pairs, pairN) || _.includes(pairs, pairR)) return;
      pairs.push(pairN);
      connections.push({
        id: pairN,
        from: point,
        to: point2
      });
    });
  });
}

function drawPoint(point) {
  form.fill(point.colour).stroke(false);
  if (point.intersected && point.circle.radius < playingCircleSize) {
    point.circle.setRadius(2.2);
  } else if (!point.intersected && point.circle.radius < playingCircleSize) {
    point.circle.setRadius(1.1);
  }
  form.circle(point.circle);
}

function randomisePoint(point) {
  var randomX = point.connected ? randomFloat(-0.3, 0.3) : randomFloat(-0.5, 0.5);
  var randomY = point.connected ? randomFloat(-0.3, 0.3) : randomFloat(-0.5, 0.5);
  point.set(point.x + randomX, point.y + randomY);
  point.circle.set(point.x, point.y);
}

function intersectSpotlightAndPoints(spotLight, points) {
  var intersectedPoints = [];
  points.forEach(function(point) {
    var intersected = spotLight.intersectPoint(point);
    if (intersected) {
      point.intersected = true;
      intersectedPoints.push(point);
    } else {
      point.intersected = false;
    }
  });
  return intersectedPoints;
}

var sketch = {
  animate: function(time, fs, ctx) {
    spotLight.x += (mouseX - spotLight.x) * easingStrength;
    spotLight.y += (mouseY - spotLight.y) * easingStrength;

    //draw spotlight
    form.fill(spotLightColor).stroke(false);
    form.circle(spotLight);

    //draw connections
    connections.forEach(function(connection) {
      if (_.includes(pairsInsideSpotlight, connection.id)) return;

      form.stroke(darkGrey);
      form.fill(false);

      var line = new pt.Line(connection.from).to(connection.to);
      form.line(line);
    });

    points.forEach(randomisePoint);

    var pointsInsideCircle = intersectSpotlightAndPoints(spotLight, points);

    //change cursor
    if (pointsInsideCircle.length > 0) {
      space.space.style.cursor = 'pointer';
    } else {
      space.space.style.cursor = 'auto';
    }

    // draw inside lines
    var temporaryPairsInsideCircle = [];
    pointsInsideCircle.forEach(function(point, index) {
      pointsInsideCircle.forEach(function(point2, index2) {
        if (index === index2) return;
        form.stroke(orange);
        var line = new pt.Line(point).to(point2);
        var pairN = point.id + point2.id;
        var pairR = point2.id + point.id;
        temporaryPairsInsideCircle.push(pairN);
        temporaryPairsInsideCircle.push(pairR);
        form.line(line);
      });
    });

    pairsInsideSpotlight = temporaryPairsInsideCircle;

    //draw points
    points.forEach(drawPoint);

    if (!_.isEqual(currentPoints, pointsInsideCircle)) {
      var toRemove = _.difference(currentPoints, pointsInsideCircle);
      var toAdd = _.difference(pointsInsideCircle, currentPoints);
      change(toAdd, toRemove);
    }

    currentPoints = pointsInsideCircle;
  },
  onMouseAction: function(type, x, y) {
    switch (type) {
      case 'move':
        mouseX = x;
        mouseY = y;
        break;
      case 'down':
        spotLight.setRadius(spotLight.radius - 2);
        currentPoints.forEach(playLead);
        updateConnections(currentPoints);
        break;
      case 'up':
        spotLight.setRadius(spotLight.radius + 1.9);
        break;
    }
  },
  onTouchAction: function(type, x, y, evt) {
    if (type === 'move' || type === 'down') {
      var offsetX = (window.innerWidth - evt.target.offsetWidth) / 2;
      mouseX = x - offsetX;
      mouseY = y;
    }

    if (type === 'down') {
      currentPoints.forEach(playLead);
      updateConnections(currentPoints);
    }
    evt.preventDefault();
  }
};

window.addEventListener('resize', function() {
  spotLight.radius = space.size.x / spotLightRatio;
  points = createPoints(50);
});

window.addEventListener('mousemove', function(evt) {
  if (evt.target.id !== 'pt') {}
});

space.add(sketch);
space.bindMouse();
space.bindTouch();
space.play();