'use strict';

module.exports = function mtof(midi_note) {
  return Math.pow(2, (midi_note - 69) / 12) * 440;
};
