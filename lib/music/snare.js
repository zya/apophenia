'use strict';

var load = require('./load');
var context = require('./context');
var destination = require('./audio').snareDestination;

var snareBuffer = null;

load('./assets/audio/snare-01.mp3', function (err, buffer) {
  snareBuffer = buffer;
});

module.exports.play = function (startTime) {
  if (!snareBuffer) return;

  var source = context.createBufferSource();
  var gain = context.createGain();
  source.buffer = snareBuffer;
  source.playbackRate.value = 1.0;

  source.connect(gain);
  gain.connect(destination);
  source.start(startTime);
  // source.stop(startTime + snareBuffer.des);
};
