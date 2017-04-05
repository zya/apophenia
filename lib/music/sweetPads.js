'use strict';

var _ = require('lodash');

var load = require('./load');
var mtop = require('./mtop');
var context = require('./context');
var destination = require('./audio').backMelodyDestination;

var sweetPadsBuffer = null;

load('./assets/audio/pad-dream-01.mp3', function (err, buffer) {
  sweetPadsBuffer = buffer;
});

module.exports.play = function (note, startTime) {
  if (!sweetPadsBuffer) return;

  var midi = note.midi();
  var rate = mtop(midi);

  var source = context.createBufferSource();
  source.playbackRate.value = rate;
  var gain = context.createGain();
  gain.gain.value = 0;
  gain.gain.linearRampToValueAtTime(1, startTime + 1);
  source.buffer = sweetPadsBuffer;

  source.connect(gain);
  gain.connect(destination);
  source.start(startTime + _.random(0, 0.01));
  // source.stop(startTime + sweetPadsBuffer.des);
};
