'use strict';

var context = require('./context');
var audio = require('./audio');
var load = require('./load');
var mtop = require('./mtop');
var moogKeysBuffer = null;

var destination = audio.keysDestination;

load('./assets/audio/key-moog-01.mp3', function (err, buffer) {
  if (err) return console.log(err);

  moogKeysBuffer = buffer;
});


function MoogKeys() {}

MoogKeys.prototype.start = function (note, startTime, offset) {
  if (!moogKeysBuffer) return;

  var now = startTime || context.currentTime;
  var source = context.createBufferSource();
  source.buffer = moogKeysBuffer;
  var midi = note.midi() + offset;
  source.playbackRate.value = mtop(midi);
  source.connect(destination);
  source.start(now);
};

module.exports.start = function (note, startTime, offset) {
  var keys = new MoogKeys();

  if (!offset) offset = 0;
  keys.start(note, startTime, offset);
};
