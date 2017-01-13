'use strict';

var _ = require('lodash');

var Kick = require('./kick');
var audio = require('../audio');

var destination = audio.kickDestination;

var interval = null;

function schedule() {
  var kick = new Kick(destination);
  var time = _.random(500, 3000);

  setTimeout(function () {
    kick.start(0);
  }, time);
}

module.exports.start = function () {
  interval = setInterval(schedule, 11000);
};

module.exports.stop = function () {
  window.clearInterval(interval);
};
