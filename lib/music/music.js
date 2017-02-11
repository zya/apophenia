'use strict';

var teoria = require('teoria');

var g3 = teoria.note('g3');
var scale = g3.scale('minorpentatonic');
var notes = scale.notes();

module.exports.notes = notes;
