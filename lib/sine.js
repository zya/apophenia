'use strict';
// f(x) = A sin(wt + p)

function sine(freq, amp, time, phase) {
  return amp * Math.sin((freq * time) + phase);
}

module.exports = sine;
