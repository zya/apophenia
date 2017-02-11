'use strict';

var context = require('./context');
var destination = require('./audio').leadDestination;

module.exports.play = function (frequency, startTime) {
  var osc = context.createOscillator();
  var gain = context.createGain();
  osc.start(startTime);
  osc.frequency.value = frequency * 4;
  osc.connect(gain);
  gain.gain.value = 0;
  gain.connect(destination);

  gain.gain.cancelScheduledValues(startTime);
  gain.gain.setTargetAtTime(0, startTime, 0.5);
  gain.gain.linearRampToValueAtTime(0.2, startTime + 0.01);
  gain.gain.linearRampToValueAtTime(0, startTime + 0.2);

  osc.stop(startTime + 1.5);

  setTimeout(function () {
    gain.disconnect();
  }, 4000);
};
