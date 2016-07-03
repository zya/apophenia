'use strict';

var form = require('./pt').form;
var lib = require('./pt').lib;
var drawRandomisedCurves = require('./drawRandomisedCurves');
var colours = require('./colours');

function draw(points, temporaryPairs, ctx) {
  points.forEach(function (point, index) {
    points.forEach(function (point2, index2) {
      if (index === index2) return;

      drawRandomisedCurves({
        from: point,
        to: point2
      }, ctx);

      form.stroke(colours.orange);
      var line = new lib.Line(point).to(point2);
      var pairN = point.id + point2.id;
      var pairR = point2.id + point.id;
      temporaryPairs.push(pairN);
      temporaryPairs.push(pairR);
      form.line(line);
    });
  });
}

module.exports = draw;
