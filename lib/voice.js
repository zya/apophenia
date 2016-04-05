var context = require('./context');
var envelope = require('./envelope');

function Voice(id, frequency, destination){
  this.id = id;

  var osc = context.createOscillator();
  osc.frequency.value = frequency;
  var gain = context.createGain();
  osc.connect(gain);
  gain.connect(destination);

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
  this.gain.gain.setValueAtTime(that.gain.gain.value, opts.now);
  this.gain.gain.linearRampToValueAtTime(0.000001, opts.now + opts.release);
  this.gain.gain.setValueAtTime(0.0, opts.now + opts.release + 0.1);
  this.osc.stop(opts.now + opts.release + 2);
  // setTimeout(function () {
  //   that.gain.disconnect();
  // }, 7000);
};

module.exports = Voice;
