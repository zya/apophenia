'use strict';

var _ = require('lodash');
var Delaunay = require('faster-delaunay');
var randomInt = require('random-int');

var colours = require('../colours');

var findingMargin = 2;

function preparePointsForTriangulation(point) {
  return [point.x, point.y];
}

function isInRange(point, temporaryTriangles, index) {
  var isInXRange = point.x > temporaryTriangles[index][0] - findingMargin && point.x < temporaryTriangles[index][0] + findingMargin;
  var isInYRange = point.y > temporaryTriangles[index][1] - findingMargin && point.y < temporaryTriangles[index][1] + findingMargin;
  return isInXRange && isInYRange;
}

function shouldCreateConnection(pairs, idNormal, idReverse) {
  return !_.includes(pairs, idNormal) || !_.includes(pairs, idReverse);
}

function createConnection(pairs, connections, point1, point2, specialConnections) {
  var pairNormal = point1.id + point2.id;
  var pairReverse = point2.id + point1.id;

  if (shouldCreateConnection(pairs, pairNormal, pairReverse)) {
    var connection = {
      id: pairNormal,
      from: point1,
      to: point2,
      special: false
    };

    if (_.includes(specialConnections, pairNormal) || _.includes(specialConnections, pairReverse)) {
      connection.special = true;
      if (randomInt(0, 10) > 8) {
        connection.colour = colours.orange;
      } else {
        connection.colour = colours.darkerBlue;
      }
    }

    pairs.push(pairNormal);
    pairs.push(pairReverse);
    connections.push(connection);
  }
}

function updateConnections(points, pairs, connections, triangles, specialConnections) {
  if (points.length < 2) return;

  var pointsForTriangulation = points.map(preparePointsForTriangulation);
  var delaunay = new Delaunay(pointsForTriangulation);
  var temporaryTriangles = delaunay.triangulate();

  if (temporaryTriangles.length > 0) {
    for (var i = 0; i < temporaryTriangles.length; i += 3) {
      var anchorIndex = _.findIndex(points, _.partial(isInRange, _, temporaryTriangles, i));
      var firstPointIndex = _.findIndex(points, _.partial(isInRange, _, temporaryTriangles, i + 1));
      var secondPointIndex = _.findIndex(points, _.partial(isInRange, _, temporaryTriangles, i + 2));

      var anchor = points[anchorIndex];
      var firstPoint = points[firstPointIndex];
      var secondPoint = points[secondPointIndex];

      triangles.push([anchor, firstPoint, secondPoint]);

      createConnection(pairs, connections, anchor, firstPoint, specialConnections);
      createConnection(pairs, connections, anchor, secondPoint, specialConnections);
      createConnection(pairs, connections, firstPoint, secondPoint, specialConnections);
    }
  } else {
    createConnection(pairs, connections, points[0], points[1]);
  }

}

module.exports = updateConnections;
