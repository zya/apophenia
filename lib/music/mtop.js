'use strict';

module.exports = function mtop(midi) {
  return Math.pow(2, (midi - 60) / 12);
};
