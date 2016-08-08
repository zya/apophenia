'use strict';

var randomFloat = require('random-float');

var audio = require('./audio');
var context = require('./context');
var envelope = require('./envelope');
var changePointColour = require('./changePointColour');
var ripples = require('./ripples');

function playLead(point, index) {
  var osc = context.createOscillator();
  var gain = context.createGain();
  var now = context.currentTime;

  var startTime = now + (index * 0.5);
  if (index > 0) {
    startTime += randomFloat(-0.2, 0.2);
  }
  osc.start(startTime);
  osc.frequency.value = point.fq * 4;
  osc.connect(gain);
  gain.connect(audio.leadDestination);
  envelope(gain.gain, startTime, {
    start: 0,
    peak: 0.02,
    attack: 0.01,
    type: 'linear',
    release: 0.4
  });
  osc.stop(startTime + 1.5);
  setTimeout(function () {
    gain.disconnect();
  }, 4000);

  setTimeout(function () {
    changePointColour(point);
    ripples.addSmallRipple(point);
  }, (startTime - context.currentTime) * 1000);
}

module.exports = playLead;
