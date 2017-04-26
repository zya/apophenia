'use strict';

var _ = require('lodash');
var teoria = require('teoria');

var mtof = require('./mtof');
var globals = require('../globals');
var introKicks = require('./introKicks');
var background = require('./background');
var guitar = require('./guitar');
var epicPerc = require('./epicPerc');
var epicPerc2 = require('./epicPerc2');
var epicRev = require('./epicRev');
var leadSynth = require('./leadSynth');
var sweetPads = require('./sweetPads');
var secondSection = require('./secondSection');
var roseLeadMelody = require('./roseLeadMelody');
// var kick = require('./kick');
var context = require('./context');
var audio = require('./audio');
var notes = require('./music').notes;

var backGroundMelody = [notes[0], notes[2]];

function playBackMelody() {
  if (globals.hasTransitioned()) return;
  var now = context.currentTime;
  backGroundMelody.forEach(function (note, index) {
    sweetPads.play(note, now + (index * _.random(1.9, 2.7)));
  });
}

var backGroundMelodyInterval;

var introStarted = false;

module.exports.startIntroKicks = function () {
  if (!introStarted) {
    introKicks.start();
    introStarted = true;
  }
};

module.exports.stopFirstSection = function (done) {
  introKicks.stop();
  window.clearInterval(backGroundMelodyInterval);
  done();
};

module.exports.startSecondSection = function () {
  secondSection.start();
};

module.exports.playLead = function () {
  var osc = context.createOscillator();
  var gain = context.createGain();
  var now = context.currentTime;

  var note = notes[_.random(0, notes.length - 1, false)];
  var frequency = note.fq() * 6;

  if (_.random(0, 100) > 50) frequency = note.fq() * 8;

  osc.start(now);
  osc.frequency.value = frequency;
  osc.connect(gain);
  gain.gain.value = 0;
  gain.connect(audio.leadDestination);

  gain.gain.cancelScheduledValues(now);
  gain.gain.setTargetAtTime(0, now, 0.5);
  gain.gain.linearRampToValueAtTime(0.2, now + 0.01);
  gain.gain.linearRampToValueAtTime(0, now + 0.2);

  osc.stop(now + 1.5);

  setTimeout(function () {
    gain.disconnect();
  }, 4000);
};

module.exports.playBass = function () {
  var osc = context.createOscillator();
  var gain = context.createGain();
  var now = context.currentTime;

  var note = notes[_.random(0, notes.length - 1, false)];
  var midi = note.midi() - 12;
  var frequency = teoria.note.fromMIDI(midi).fq();

  osc.start(now);
  osc.frequency.value = frequency;
  osc.connect(gain);
  gain.gain.value = 0;
  gain.connect(audio.leadDestination);

  gain.gain.cancelScheduledValues(now);
  gain.gain.setTargetAtTime(0, now, 0.5);
  gain.gain.linearRampToValueAtTime(0.2, now + 3);
  gain.gain.linearRampToValueAtTime(0, now + 4.5);

  osc.stop(now + 5);

  setTimeout(function () {
    gain.disconnect();
  }, 5500);
};

module.exports.startBackground = function () {
  background.start();
};

module.exports.playIntro = function () {
  var now = context.currentTime;
  epicPerc2.play(teoria.note('c2'), now);
  guitar.play(mtof(notes[3].midi() - 12 - 7), now);
  guitar.play(mtof(notes[2].midi() - 12), now + 0.4);
  guitar.play(mtof(notes[0].midi() - 24), now + 1);
  guitar.play(mtof(notes[0].midi() - 24 - 7), now + 1.6);
};

module.exports.proceed = function (amount) {
  background.proceed(amount);
};

module.exports.playLeadGuitar = function (frequency, startTime) {
  guitar.play(frequency, startTime);
};

module.exports.playReveal = function () {
  var now = context.currentTime;
  playBackMelody();
  epicRev.play(notes[0].midi() - 12, now);
  epicRev.play(notes[0].midi() - 12, now + 0.8);
  epicRev.play(notes[3].midi() - 12, now + 1.6);
  _.range(12).forEach(function (n, index) {
    var note = notes[_.random(0, notes.length - 1, false)];
    var fq = note.fq();
    guitar.play(fq / 2, now + (index * _.random(0.15, 0.45)));
  });
};

module.exports.playLeadSynth = function (frequency, startTime) {
  leadSynth.play(frequency, startTime);
};

module.exports.startBackgroundMelody = function () {
  playBackMelody();
  backGroundMelodyInterval = setInterval(playBackMelody, 17000);
};

module.exports.playLastFound = function () {
  var now = context.currentTime;
  epicPerc.play(teoria.note('c4'), now);
  epicPerc2.play(teoria.note('c2'), now);
  epicPerc.play(teoria.note('c2'), now + 0.8);
  epicPerc.play(teoria.note('c3'), now + 1.6);
};

module.exports.playLeadMelody = function () {
  roseLeadMelody.play();
};

module.exports.playDimensionSounds = function () {
  var now = context.currentTime;
  epicPerc2.play(teoria.note('c3'), now);
  epicPerc.play(teoria.note('c3'), now);
};
