'use strict';

var load = require('./load');
var context = require('./context');
var destination = require('./audio').kickDrumDestination;

var kickBuffer = null;

load('./assets/audio/kick-02.mp3', function (err, buffer) {
  kickBuffer = buffer;
});

module.exports.play = function (startTime) {
  if (!kickBuffer) return;

  var source = context.createBufferSource();
  var gain = context.createGain();
  source.buffer = kickBuffer;
  source.playbackRate.value = 1.5;

  source.connect(gain);
  gain.connect(destination);
  source.start(startTime);
};
