'use strict';

function intersectSpotlightAndPoints(spotLight, points) {
  var intersectedPoints = [];
  points.forEach(function (point) {
    var intersected = spotLight.intersectPoint(point);
    if (intersected) {
      point.intersected = true;
      intersectedPoints.push(point);
    } else {
      point.intersected = false;
    }
  });
  return intersectedPoints;
}

module.exports = intersectSpotlightAndPoints;
