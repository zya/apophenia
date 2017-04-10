'use strict';

var context = require('./context');
var audio = require('./audio');
var load = require('./load');
var mtop = require('./mtop');
var epicPercBuffer = null;

var destination = audio.percDestination;

load('./assets/audio/epic-perc-01.mp3', function (err, buffer) {
  if (err) return console.log(err);

  epicPercBuffer = buffer;
});


function EpicPerc() {}

EpicPerc.prototype.start = function (note, startTime) {
  if (!epicPercBuffer) return;

  var now = startTime || context.currentTime;
  var source = context.createBufferSource();
  source.buffer = epicPercBuffer;
  var midi = note.midi();
  source.playbackRate.value = mtop(midi);
  source.connect(destination);
  source.start(now);
};

module.exports.play = function (note, startTime) {
  var perc = new EpicPerc();
  perc.start(note, startTime);
};
