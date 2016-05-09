'use strict';

var _ = require('lodash');

function setConnectedToTrue(point) {
  point.connected = true;
}

function updateConnections(points, pairs, connections) {
  if (points.length < 2) return;
  points.forEach(setConnectedToTrue);
  points.forEach(function (point, index) {
    points.forEach(function (point2, index2) {
      if (index === index2) return;
      var pairN = point.id + point2.id;
      var pairR = point2.id + point.id;
      if (_.includes(pairs, pairN) || _.includes(pairs, pairR)) return;
      pairs.push(pairN);
      connections.push({
        id: pairN,
        from: point,
        to: point2
      });
    });
  });
}

module.exports = updateConnections;
