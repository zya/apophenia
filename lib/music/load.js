'use strict';

var context = require('./context');

module.exports = function (path, cb) {
  var request = new XMLHttpRequest();
  request.open('GET', path, true);
  request.responseType = 'arraybuffer';
  request.onload = function () {
    context.decodeAudioData(request.response, function (buffer) {
      cb(null, buffer);
    }, function (err) {
      cb(err);
    });
  };

  request.onerror = function (err) {
    cb(err);
  };

  request.send();
};
