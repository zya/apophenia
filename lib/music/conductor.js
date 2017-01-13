'use strict';

var introKicks = require('./introKicks');

module.exports.startIntroKicks = function () {
  introKicks.start();
};

module.exports.stopFirstSection = function (done) {
  introKicks.stop();
  done();
};
