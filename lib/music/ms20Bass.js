'use strict';

var context = require('./context');
var audio = require('./audio');
var load = require('./load');
var mtop = require('./mtop');
var bassBuffer = null;

var destination = audio.bassMSDestination;

load('./assets/audio/bass-ms20-01.mp3', function (err, buffer) {
  if (err) return console.log(err);

  bassBuffer = buffer;
});

function play(midi, startTime) {
  var source = context.createBufferSource();
  source.buffer = bassBuffer;

  source.playbackRate.value = mtop(midi);
  source.connect(destination);
  source.start(startTime);
}

function BassMS20() {}

BassMS20.prototype.play = function (note, startTime) {
  if (!bassBuffer) return;
  var midi = note.midi();
  var now = startTime || context.currentTime;
  play(midi, now);
};

module.exports.play = function (note, startTime) {
  var bass = new BassMS20();
  bass.play(note, startTime);
};
