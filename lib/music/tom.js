'use strict';

var context = require('./context');
var audio = require('./audio');
var load = require('./load');
var mtop = require('./mtop');
var tomBuffer = null;

var destination = audio.tomDestination;

load('./assets/audio/tom-808-01.mp3', function (err, buffer) {
  if (err) return console.log(err);

  tomBuffer = buffer;
});


function Tom() {}

Tom.prototype.start = function (note, startTime) {
  if (!tomBuffer) return;

  var now = startTime || context.currentTime;
  var source = context.createBufferSource();
  source.buffer = tomBuffer;
  var midi = note.midi();
  source.playbackRate.value = mtop(midi);
  source.connect(destination);
  source.start(now);
};

module.exports.play = function (note, startTime) {
  var tom = new Tom();
  tom.start(note, startTime);
};
