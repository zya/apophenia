'use strict';

var _ = require('lodash');
var Beet = require('beet.js');
var markovian = require('markovian');
var teoria = require('teoria');

var kick = require('./kick');
var kickDrum = require('./kickDrum');
var moogKeys = require('./moogKeys');
var guitar = require('./guitar');
var epicPerc = require('./epicPerc');
var epicPerc2 = require('./epicPerc2');
var tom = require('./tom');
var context = require('./context');
var notes = require('./music').notes;
var synthDestination = require('./audio').leadDestination;

var shouldAddDrums = false;
var shouldPlayBackMelody = false;

var beet = new Beet({
  context: context,
  tempo: 95
});

var pattern = beet.pattern('111000000');
var kicksAndHihatsPattern = beet.pattern('100010010');
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
  if (!shouldPlayBackMelody) return;
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

var backMelodyLayer = beet.layer(pattern, on);
beet.add(backMelodyLayer);

var keysMelodyPattern = [notes[0], notes[1], notes[0], notes[0], notes[2], null, notes[4], notes[0]];
var keysLayer = beet.layer(keysPattern, function (time, step) {
  moogKeys.start(keysMelodyPattern[step - 1], time, 0);
}, function (time) {
  moogKeys.start(notes[2], time, 0);
});

beet.add(keysLayer);

var bar = 0;
var kicksLayer = beet.layer(kicksAndHihatsPattern, function (time, step) {
  if (!shouldAddDrums) return;
  if (step !== 5) {
    kick.start(time, 1.75);
    kickDrum.play(time);
  } else if (_.random(0, 100) > 80 && bar > 4) {
    kick.start(time, 1.5);
    kickDrum.play(time);
  }
  if (step === 1) bar++;
}, function (time, step) {
  if (bar > 2 && step === 4) {
    tom.play(teoria.note('c4'), time);
  }

  if (bar > 5 && step === 4 && bar % 4 === 0) {
    epicPerc2.play(teoria.note('c3'), time);
    epicPerc.play(teoria.note('c3'), time);
  }
});

beet.add(kicksLayer);

module.exports.start = function () {
  beet.start();
};

module.exports.addDrums = function () {
  shouldAddDrums = true;
  shouldPlayBackMelody = true;
};
