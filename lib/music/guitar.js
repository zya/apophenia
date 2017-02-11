'use strict';

var _ = require('lodash');
var teoria = require('teoria');

var load = require('./load');
var mtop = require('./mtop');
var context = require('./context');
var destination = require('./audio').guitarDestination;

var guitarBuffer = null;

load('./assets/audio/pluck-c-01.mp3', function (err, buffer) {
  guitarBuffer = buffer;
});

module.exports.play = function (frequency, startTime) {
  if (!guitarBuffer) return;

  var change = _.random(0, 100);
  if (change > 80) {
    frequency = frequency / 2;
  }
  var note = teoria.note.fromFrequency(frequency);
  var midi = note.note.midi();
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
