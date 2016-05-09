'use strict';

window.AudioContext = (window.AudioContext || window.webkitAudioContext || window.mozAudioContext || window.msAudioContext);
module.exports = new window.AudioContext();
