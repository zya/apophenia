'use strict';

function updateTemporaryPairs(points, temporaryPairs) {
  points.forEach(function(point, index) {
    points.forEach(function(point2, index2) {
      if (index === index2) return;
      var pairN = point.id + point2.id;
      var pairR = point2.id + point.id;
      temporaryPairs.push(pairN);
      temporaryPairs.push(pairR);
    });
  });
}

module.exports = updateTemporaryPairs;
