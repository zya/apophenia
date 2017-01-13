'use strict';

var Beet = require('beet.js');

var kick = require('./kick');
var context = require('../context');
var notes = require('../music').notes;
var synthDestination = require('../audio').leadDestination;

var beet = new Beet({
  context: context,
  tempo: 100
});

var pattern = beet.pattern(4, 9);

function on(time) {
  kick.start(time, 1.0, false);
}

function off(time, step) {
  if (step > notes.length) step = 0;
  var note = notes[step];

  var osc = context.createOscillator();
  var gain = context.createGain();

  osc.start(time);
  osc.frequency.value = note.fq() * 2;
  osc.connect(gain);
  gain.gain.value = 0;
  gain.connect(synthDestination);

  gain.gain.cancelScheduledValues(time);
  gain.gain.setTargetAtTime(0, time, 0.5);
  gain.gain.linearRampToValueAtTime(0.1, time + 0.001);
  gain.gain.linearRampToValueAtTime(0, time + 0.05);

  osc.stop(time + 1.5);

  setTimeout(function () {
    gain.disconnect();
  }, 4000);
}

var layer = beet.layer(pattern, on, off);
beet.add(layer);

module.exports.start = function () {
  beet.start();
};
