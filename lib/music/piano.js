'use strict';

var _ = require('lodash');

var context = require('./context');
var audio = require('./audio');
var load = require('./load');
var mtop = require('./mtop');
var pianoBuffer = null;

var destination = audio.pianoDestination;

load('./assets/audio/piano-pad-02.mp3', function (err, buffer) {
  if (err) return console.log(err);

  pianoBuffer = buffer;
});

function play(midi, startTime) {
  var source = context.createBufferSource();
  source.buffer = pianoBuffer;

  source.playbackRate.value = mtop(midi);
  source.connect(destination);
  source.start(startTime);
}

function PianoPad() {}

PianoPad.prototype.play = function (note, startTime) {
  if (!pianoBuffer) return;
  var midi = note.midi();
  var now = startTime || context.currentTime;
  play(midi - 12, now);
  play(midi, now);
  if (_.random(0, 10) > 5) play(midi - 24, now);
  play(midi + 12, now);
};

module.exports.play = function (note, startTime) {
  var piano = new PianoPad();
  piano.play(note, startTime);
};
