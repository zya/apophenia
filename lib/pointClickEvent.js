'use strict';

var randomFloat = require('random-float');

var context = require('./music/context');
var changePointColour = require('./2d/changePointColour');
var ripples = require('./2d/ripples');
var conductor = require('./music/conductor');

function playLead(point, index) {
  var now = context.currentTime;

  var startTime = now + (index * 0.5);
  if (index > 0) {
    startTime += randomFloat(-0.2, 0.2);
  }

  conductor.playLeadSynth(point.fq, startTime);
  conductor.playLeadGuitar(point.fq, startTime);

  setTimeout(function () {
    changePointColour(point);
    ripples.addSmallRipple(point);
  }, (startTime - context.currentTime) * 1000);
}

module.exports = playLead;
