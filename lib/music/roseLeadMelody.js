'use strict';

var _ = require('lodash');
var teoria = require('teoria');
var markovian = require('markovian');

var piano = require('./piano');
var dream = require('./dream');
var newGuitar = require('./newGuitar');
var notes = require('./music').notes;
var context = require('./context');
var epicPerc2 = require('./epicPerc2');
var epicPerc = require('./epicPerc');
var ms20Bass = require('./ms20Bass');

var melodyChain = markovian.create([
  {
    value: notes[0],
    targets: [0, 1, 2, 3, 4],
    probabilities: [0.1, 0.1, 0.4, 0.2, 0.2]
  },
  {
    value: notes[1],
    targets: [0, 1, 2, 3, 4],
    probabilities: [0.1, 0.1, 0.2, 0.30, 0.3]
  },
  {
    value: notes[2],
    targets: [0, 1, 2, 3, 4],
    probabilities: [0.35, 0.15, 0.00, 0.2, 0.3]
  },
  {
    value: notes[3],
    targets: [0, 1, 2, 3, 4],
    probabilities: [0.3, 0.2, 0.1, 0.0, 0.4]
  },
  {
    value: notes[4],
    targets: [0, 1, 2, 3, 4],
    probabilities: [0.15, 0.35, 0.45, 0.05, 0.0]
  }
]);

var countModel = markovian.create([
  {
    value: 1,
    targets: [1, 2, 3],
    probabilities: [0.05, 0.50, 0.45]
  },
  {
    value: 2,
    targets: [1, 2, 3],
    probabilities: [0.25, 0.25, 0.50]
  },
  {
    value: 3,
    targets: [1, 2, 3],
    probabilities: [0.30, 0.55, 0.15]
  }
]);

module.exports.play = function (cb) {
  var note1 = melodyChain.tick();
  var count = countModel.tick();
  var note2 = count === 2 || count === 3 ? melodyChain.tick() : null;
  var note3 = count === 3 ? melodyChain.tick() : null;
  var now = context.currentTime;

  [note1, note2, note3].forEach(function (note, index) {
    if (!note) return;
    var offset = (index * _.random(0.30, 0.50));
    piano.play(note, now + offset);
    newGuitar.play(note, now + offset);
    dream.play(note, now + offset);

    setTimeout(function () {
      cb(index / (endNotes.length - 1));
    }, offset * 1000);
  });

  if (count === 1) {
    epicPerc.play(teoria.note('c4'), now);
    newGuitar.play(teoria.note('c2'), now);
    epicPerc2.play(teoria.note('c3'), now + 0.2);
    ms20Bass.play(note1, now);
  }
};

var endNotes = [notes[3], notes[2], notes[1], notes[2], notes[0]];
var endTimes = [0, 0.80, 0.75, 0.70, 0.85];

module.exports.playEnd = function (cb) {
  var now = context.currentTime;

  endNotes.forEach(function (note, index) {
    if (!note) return;
    var offset = (index * endTimes[index]);
    piano.play(note, now + offset);
    newGuitar.play(note, now + offset);
    dream.play(note, now + offset);

    if (index >= 3) {
      var n = teoria.note('c3');
      piano.play(n, now + offset);
      newGuitar.play(n, now + offset);
      dream.play(n, now + offset);
    }

    if (index === 4) {
      ms20Bass.play(notes[index], now + offset);
    }

    setTimeout(function () {
      cb(index / (endNotes.length - 1));
    }, offset * 1000);
  });
};
