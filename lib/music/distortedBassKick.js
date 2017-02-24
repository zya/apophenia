'use strict';

var context = require('./context');
var audio = require('./audio');
var load = require('./load');
var mtop = require('./mtop');
var kickBuffer = null;

var destination = audio.kickDestination;

load('./assets/audio/kick-808-01.mp3', function (err, buffer) {
  if (err) return console.log(err);

  kickBuffer = buffer;
});


function Kick() {}

Kick.prototype.start = function (note, startTime) {
  if (!kickBuffer) return;

  var now = startTime || context.currentTime;
  var source = context.createBufferSource();
  source.buffer = kickBuffer;
  var midi = note.midi();
  source.playbackRate.value = mtop(midi);
  source.connect(destination);
  source.start(now);
};

module.exports.start = function (note, startTime) {
  var kick = new Kick();
  kick.start(note, startTime);
};
