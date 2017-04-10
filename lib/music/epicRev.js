'use strict';

var context = require('./context');
var audio = require('./audio');
var load = require('./load');
var mtop = require('./mtop');
var epicRev = null;

var destination = audio.revDestination;

load('./assets/audio/epic-rev-01.mp3', function (err, buffer) {
  if (err) return console.log(err);

  epicRev = buffer;
});


function EpicRev() {}

EpicRev.prototype.start = function (midi, startTime) {
  if (!epicRev) return;

  var now = startTime || context.currentTime;
  var source = context.createBufferSource();
  source.buffer = epicRev;
  source.playbackRate.value = mtop(midi);
  source.connect(destination);
  source.start(now);
};

module.exports.play = function (note, startTime) {
  var rev = new EpicRev();
  rev.start(note, startTime);
};
