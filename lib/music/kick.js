'use strict';

var _ = require('lodash');
var teoria = require('teoria');

var context = require('../context');
var notes = require('../music').notes;
var audio = require('../audio');
var load = require('./load');
var mtop = require('./mtop');
var kickBuffer = null;
var shouldUseSample = false;

var destination = audio.kickDestination;

load('./assets/audio/kick-808-01.mp3', function (err, buffer) {
  if (err) return console.log(err);

  kickBuffer = buffer;
});

function playKickSample(note, now) {
  if (!kickBuffer && !shouldUseSample) return;
  var source = context.createBufferSource();
  source.buffer = kickBuffer;
  source.playbackRate.value = mtop(note.midi());
  source.connect(destination);
  source.start(now);
}

function Kick() {
  this.osc = context.createOscillator();
  this.osc.frequency.value = 400;
  this.env = context.createGain();
  this.env.gain.value = 0;
  this.osc.connect(this.env);
  this.env.connect(destination);
}

Kick.prototype.start = function (startTime, decay, random) {
  var that = this;

  var randomNote = notes[_.random(0, notes.length - 1, false)];
  var midi = randomNote.midi() - 24;
  var frequency = teoria.note.fromMIDI(midi).fq();

  if (frequency > 80 || !frequency || random === false) {
    frequency = teoria.note.fromMIDI(notes[0].midi() - 24).fq();
  }

  var now = startTime || context.currentTime;
  this.osc.frequency.setValueAtTime(400, now);
  this.osc.frequency.linearRampToValueAtTime(frequency, now + 0.005);
  this.env.gain.setValueAtTime(that.env.gain.value, now);
  this.env.gain.linearRampToValueAtTime(1, now + 0.005);
  this.decayTime = decay ? now + decay : now + _.random(3, 7);
  this.env.gain.linearRampToValueAtTime(0, that.decayTime);

  this.osc.start(now);
  this.osc.stop(now + (this.decayTime + 1));

  setTimeout(function () {
    that.env.disconnect(0);
  }, (that.decayTime + 2) * 1000);

  // playKickSample(randomNote, now);
};

module.exports.start = function (startTime, decay, random) {
  var kick = new Kick();
  kick.start(startTime, decay, random);
};
