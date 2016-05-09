'use strict';

var _ = require('lodash');
var moment = require('moment');

var context = require('./context');
var trash = require('./trash');
var Voice = require('./voice');
var audio = require('./audio');

function change(toAdd, toRemove, currentlyPlaying) {
  var intersected = _.intersectionBy(currentlyPlaying, toRemove, 'id');

  intersected.forEach(function (voice) {
    voice.stop({
      now: context.currentTime,
      release: 3
    });

    var indexToDelete = currentlyPlaying.indexOf(voice);
    voice.timestamp = moment();
    trash.push(voice);
    currentlyPlaying.splice(indexToDelete, 1);
  });

  toAdd.forEach(function (point) {
    var voice = new Voice(point.id, point.fq, audio.synthDestination);
    voice.start({
      now: context.currentTime,
      peak: 0.02,
      attack: 6
    });
    currentlyPlaying.push(voice);
  });
}

module.exports = change;
