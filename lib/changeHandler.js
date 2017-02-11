'use strict';

var _ = require('lodash');
var moment = require('moment');

var context = require('./music/context');
var trash = require('./music/trash');
var Voice = require('./music/voice');

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
    var voice = new Voice(point.id, point.fq);
    voice.start({
      now: context.currentTime,
      peak: 0.02,
      attack: 6
    });
    currentlyPlaying.push(voice);
  });
}

module.exports = change;
