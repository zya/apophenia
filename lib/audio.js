'use strict';

var context = require('./context');
var load = require('./load');

var limiter = context.createDynamicsCompressor();
var convolver = context.createConvolver();
convolver.normalize = false;
var synthGain = context.createGain();
var leadGain = context.createGain();
var kickGain = context.createGain();
var bgGain = context.createGain();
var guitarGain = context.createGain();

limiter.ratio.value = 20;
limiter.attack.value = 0.01;
limiter.release.value = 0.01;
limiter.threshold.value = -1;

limiter.connect(context.destination);
convolver.connect(limiter);
synthGain.connect(convolver);
leadGain.connect(convolver);
guitarGain.connect(convolver);
kickGain.connect(limiter);
bgGain.connect(limiter);

synthGain.gain.value = 0.13;
leadGain.gain.value = 0.12;
kickGain.gain.value = 0.25;
bgGain.gain.value = 0.07;
guitarGain.gain.value = 0.03;
// synthGain.gain.value = 0;
// leadGain.gain.value = 0;
// kickGain.gain.value = 0;

load('./assets/audio/ir3.mp3', function (buffer) {
  convolver.buffer = buffer;
});

module.exports.synthDestination = synthGain;
module.exports.leadDestination = leadGain;
module.exports.kickDestination = kickGain;
module.exports.bgDestination = bgGain;
module.exports.guitarDestination = guitarGain;
