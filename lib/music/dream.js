'use strict';

// var _ = require('lodash');

var context = require('./context');
var audio = require('./audio');
var load = require('./load');
var mtop = require('./mtop');
var dreamBuffer = null;

var destination = audio.pianoDestination;

load('./assets/audio/key-dream-01.mp3', function (err, buffer) {
  if (err) return console.log(err);

  dreamBuffer = buffer;
});

function play(midi, startTime) {
  var source = context.createBufferSource();
  source.buffer = dreamBuffer;

  source.playbackRate.value = mtop(midi);
  source.connect(destination);
  source.start(startTime);
}

function DreamKey() {}

DreamKey.prototype.play = function (note, startTime) {
  if (!dreamBuffer) return;
  var midi = note.midi() + 12;
  var now = startTime || context.currentTime;
  play(midi, now);
};

module.exports.play = function (note, startTime) {
  var dream = new DreamKey();
  dream.play(note, startTime);
};
