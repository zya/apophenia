'use strict';

var _ = require('lodash');

var kick = require('./kick');

var interval = null;

function schedule() {
  var time = _.random(100, 1000);
  setTimeout(function () {
    kick.start();
  }, time);
}

module.exports.start = function () {
  interval = setInterval(function () {
    schedule();
  }, 10000);
};

module.exports.stop = function () {
  window.clearInterval(interval);
};
