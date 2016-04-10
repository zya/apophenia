var context = require('./context');
var envelope = require('./envelope');

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
}

Voice.prototype.start = function(opts) {
  var that = this;
  this.osc.start(0);

  envelope(that.gain.gain, opts.now, {
    start: 0,
    peak: opts.peak,
    attack: opts.attack,
    type: 'exponential'
  });
};

Voice.prototype.stop = function(opts) {
  var that = this;
  this.gain.gain.cancelScheduledValues(opts.now);
  this.gain.gain.setTargetAtTime(that.gain.gain.value, opts.now, 0.5);
  this.gain.gain.linearRampToValueAtTime(0, opts.now + opts.release);
  this.gain.gain.setTargetAtTime(0.0, opts.now + opts.release + 0.1, 0.5);
  this.osc.stop(opts.now + opts.release + 2);
  setTimeout(function() {
    that.gain.disconnect();
  }, (opts.release + 3) * 1000);
};

module.exports = Voice;