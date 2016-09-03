'use strict';

var context = require('./context');
var load = require('./load');

var limiter = context.createDynamicsCompressor();
var convolver = context.createConvolver();
convolver.normalize = false;
var synthGain = context.createGain();
var leadGain = context.createGain();

limiter.ratio.value = 40;
limiter.attack.value = 0.01;
limiter.release.value = 0.01;
limiter.threshold.value = -1;

limiter.connect(context.destination);
convolver.connect(limiter);
synthGain.connect(convolver);
leadGain.connect(convolver);

synthGain.gain.value = 0.0;
leadGain.gain.value = 0.0;

load('./assets/ir3.mp3', function (buffer) {
  convolver.buffer = buffer;
});

module.exports.synthDestination = synthGain;
module.exports.leadDestination = leadGain;
