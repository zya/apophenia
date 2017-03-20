'use strict';

var _ = require('lodash');
var Beet = require('beet.js');
var markovian = require('markovian');

var kick = require('./kick');
var distortedBass = require('./distortedBassKick');
var moogBass = require('./moogBass');
var moogKeys = require('./moogKeys');
var guitar = require('./guitar');
var snare = require('./snare');
var hihat = require('./hihat');
var snare808 = require('./808-snare');
var context = require('./context');
var notes = require('./music').notes;
var synthDestination = require('./audio').leadDestination;
// var kickDestination = require('./audio').kickDestination;

var beet = new Beet({
  context: context,
  tempo: 100
});

var pattern = beet.pattern('111000000');
var leadPattern = beet.pattern('100010000');
var keysPattern = beet.pattern('111110110');

var melodyChain = markovian.create([
  {
    value: notes[0],
    targets: [0, 1, 2, 3, 4],
    probabilities: [0.1, 0.1, 0.4, 0.2, 0.2]
  },
  {
    value: notes[1],
    targets: [0, 1, 2, 3, 4],
    probabilities: [0.1, 0.1, 0.2, 0.30, 0.3]
  },
  {
    value: notes[2],
    targets: [0, 1, 2, 3, 4],
    probabilities: [0.35, 0.15, 0.00, 0.2, 0.3]
  },
  {
    value: notes[3],
    targets: [0, 1, 2, 3, 4],
    probabilities: [0.3, 0.2, 0.1, 0.0, 0.4]
  },
  {
    value: notes[4],
    targets: [0, 1, 2, 3, 4],
    probabilities: [0.15, 0.35, 0.45, 0.05, 0.0]
  }
]);

function on(time) {
  var note = melodyChain.tick();

  var osc = context.createOscillator();
  var gain = context.createGain();

  var multiplier = _.random(0, 100) < 20 ? 2 : 4;
  var frequency = note.fq() * multiplier;
  osc.frequency.value = frequency;
  osc.connect(gain);
  gain.gain.value = 0;
  gain.connect(synthDestination);

  gain.gain.cancelScheduledValues(time);
  gain.gain.setTargetAtTime(0, time, 0.5);
  gain.gain.linearRampToValueAtTime(0.05, time + 0.001);
  gain.gain.linearRampToValueAtTime(0, time + 0.05 + _.random(-0.01, 0.01));
  osc.start(time);

  osc.stop(time + 2);

  guitar.play(frequency / 3, time + _.random(0.01, 0.03));
}

var layer = beet.layer(pattern, on);
beet.add(layer);

var kickChain = markovian.create([
  {
    value: notes[4],
    targets: [0, 1, 2],
    probabilities: [0.2, 0.5, 0.3]
  },
  {
    value: notes[2],
    targets: [0, 1],
    probabilities: [0.8, 0.2]
  },
  {
    value: notes[3],
    targets: [0, 1],
    probabilities: [0.9, 0.1]
  }
]);

// setInterval(function () {
//   kickChain.tick();
// }, 3000);

var bar = 0;

var leadLayer = beet.layer(leadPattern, function (time, step) {
  var note = kickChain.states[kickChain.currentIndex].value;
  if (step === 1) {
    moogBass.start(note, time);
    kickChain.tick();
    // hihat.play(time);
  }
  distortedBass.start(note, time);
}, function (time, step) {
  if (bar % 4 === 0 && step === 9) {
    snare.play(time);
    // snare808.play(time);
    bar = 0;
  }

  if (step === 7) {
    bar++;
    // snare808.play(time);
    return snare.play(time);
  }

  // hihat.play(time);
  // hihat.play(time + 0.125);
  kick.start(time, 0.1, false);
});

beet.add(leadLayer);

var keysMelodyPattern = [notes[0], notes[1], notes[0], notes[0], notes[2], null, notes[4], notes[0]];

var keysLayer = beet.layer(keysPattern, function (time, step) {
  moogKeys.start(keysMelodyPattern[step - 1], time);
}, function (time) {
  moogKeys.start(notes[2], time);
});

beet.add(keysLayer);

module.exports.start = function () {
  beet.start();
};
