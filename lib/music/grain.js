'use strict';

var _ = require('lodash');

var context = require('./context');

module.exports = function (buffer, destination, attack, release, offset) {
  if (!buffer) return;

  var source = context.createBufferSource();
  var gain = context.createGain();
  source.buffer = buffer;

  source.connect(gain);
  gain.connect(destination);

  var now = context.currentTime;

  var sampleOffset = offset * buffer.duration;
  var randomisedOffset = sampleOffset + _.random(-0.15, 0.15);

  if (randomisedOffset > buffer.duration) {
    randomisedOffset = offset - 0.1;
  } else if (randomisedOffset < 0) {
    randomisedOffset = 0;
  }

  source.start(now, randomisedOffset, now + attack + release);
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(1, now + attack);
  gain.gain.linearRampToValueAtTime(0, now + attack + release);
  source.stop(now + attack + release);

  setTimeout(function () {
    gain.disconnect();
  }, (attack + release + 0.001) * 1000);
};
