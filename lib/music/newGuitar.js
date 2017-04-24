'use strict';

var _ = require('lodash');

var load = require('./load');
var mtop = require('./mtop');
var context = require('./context');
var destination = require('./audio').guitarDestination;

var guitarBuffer = null;

load('./assets/audio/guitar-new-01.mp3', function (err, buffer) {
  guitarBuffer = buffer;
});

module.exports.play = function (note, startTime) {
  if (!guitarBuffer) return;

  var midi = note.midi() - 12 - 7;
  var rate = mtop(midi);

  var source = context.createBufferSource();
  source.playbackRate.value = rate;
  var gain = context.createGain();
  source.buffer = guitarBuffer;

  source.connect(gain);
  gain.connect(destination);
  source.start(startTime + _.random(0, 0.01));
  // source.stop(startTime + guitarBuffer.des);
};
