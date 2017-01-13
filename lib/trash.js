'use strict';

var trash = [];
var moment = require('moment');

setInterval(function () {
  trash.forEach(function (voice, index) {
    if (voice.timestamp.isBefore(moment().subtract(7, 'seconds'))) {
      trash.splice(index, 1);
    }
  });
  // console.log('trash size', trash.length);
}, 10000);

module.exports.push = function (item) {
  trash.push(item);
};
