'use strict';

var _ = require('lodash');
var teoria = require('teoria');

var context = require('../context');
var notes = require('../music').notes;

function Kick(destination) {
  this.osc = context.createOscillator();
  this.osc.frequency.value = 400;
  this.env = context.createGain();
  this.env.gain.value = 0;
  this.osc.connect(this.env);
  this.env.connect(destination);
}

Kick.prototype.start = function (startTime) {
  var that = this;

  var now = context.currentTime + startTime;

  var randomNote = notes[_.random(0, notes.length - 1, false)];
  var midi = randomNote.midi() - 24;
  var frequency = teoria.note.fromMIDI(midi).fq();

  if (frequency > 80 || !frequency) {
    frequency = teoria.note.fromMIDI(notes[0].midi() - 24).fq();
  }

  that.osc.start(now);
  that.osc.frequency.setValueAtTime(that.osc.frequency.value, now);
  that.osc.frequency.linearRampToValueAtTime(frequency, now + 0.005);
  that.env.gain.setValueAtTime(that.env.gain.value, now);
  that.env.gain.linearRampToValueAtTime(1, now + 0.005);
  this.decayTime = now + _.random(3, 7);
  that.env.gain.linearRampToValueAtTime(0, this.decayTime);

  that.osc.stop(now + (this.decayTime + 1));
};

module.exports = Kick;
