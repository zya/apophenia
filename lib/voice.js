'use strict';

var context = require('./context');

function Voice(id, frequency, destination) {
  this.id = id;

  var osc = context.createOscillator();
  osc.frequency.value = frequency;
  var gain = context.createGain();
  osc.connect(gain);
  gain.connect(destination);
  gain.gain.value = 0;
  this.osc = osc;
  this.gain = gain;
  this.startTime = 0;
  this.timeDelta = 0;
}

Voice.prototype.start = function (opts) {
  var that = this;
  this.osc.start(0);
  this.peak = opts.peak;
  this.attack = opts.attack;
  this.unit = this.peak / this.attack;
  that.startTime = Date.now();
  that.gain.gain.setValueAtTime(0, opts.now, 0.5);
  that.gain.gain.linearRampToValueAtTime(opts.peak, opts.now + opts.attack);
};

Voice.prototype.stop = function (opts) {
  var that = this;

  // time elapesed since start of the note in seconds
  this.timeDelta = (Date.now() - this.startTime) / 1000;

  var currentValue = this.unit * this.timeDelta;

  if (currentValue >= this.peak) {
    currentValue = this.peak;
  }

  this.gain.gain.cancelScheduledValues(opts.now);
  this.gain.gain.setValueAtTime(currentValue, opts.now, 0.5);
  this.gain.gain.linearRampToValueAtTime(0, opts.now + opts.release);
  this.gain.gain.setValueAtTime(0.0, opts.now + opts.release + 0.1, 0.5);
  this.osc.stop(opts.now + opts.release + 2);

  setTimeout(function () {
    that.gain.disconnect();
  }, (opts.release + 3) * 1000);
};

module.exports = Voice;
