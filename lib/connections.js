'use strict';

var _ = require('lodash');

var updateConnections = require('./updateConnections');
var colours = require('./colours');
var form = require('./pt').form;
var lib = require('./pt').lib;

var connections = [];
var pairs = [];
var connectionsInside = [];
var triangles = [];
var trianglesInside = [];

var specialTriangles = [];
var specialConnections = [];
var specialPairs = [];

var sines = [];

function updateSines() {
  var now = Date.now();

  sines[0] = Math.abs(Math.sin(now * 0.0005)) * 0.6;
  sines[1] = Math.abs(Math.sin(now * 0.00015));
  sines[2] = Math.abs(Math.sin(now * 0.00039));
  sines[3] = Math.abs(Math.sin(now * 0.0006)) * 0.9;
  sines[4] = Math.abs(Math.sin(now * 0.0005));
  sines[5] = Math.abs(Math.sin(now * 0.0006));
  sines[6] = Math.abs(Math.sin(now * 0.0007));
  sines[7] = Math.abs(Math.sin(now * 0.0008));
  sines[8] = Math.abs(Math.sin(now * 0.0009));
  sines[9] = Math.abs(Math.sin(now * 0.0007)) * 0.7;
}

function drawTriangle(triplet) {
  var tri = new lib.Triangle(triplet[0]);
  tri.to(triplet[1], triplet[2]);

  form.stroke(false);
  form.fill(colours.orange);
  form.triangle(tri);
}

function drawConnection(connection, colour, opacity, width) {
  var c = 'rgba(' + colour.x + ',' + colour.y + ',' + colour.z + ',' + opacity + ')';
  form.stroke(c, width);
  form.fill(false);

  var line = new lib.Line(connection.from).to(connection.to);
  form.line(line);
}

module.exports.update = function (points) {
  updateConnections(points, pairs, connections, triangles, specialPairs);
};

module.exports.updateInsideConnections = function (points) {
  connectionsInside = [];
  trianglesInside = [];
  updateConnections(points, [], connectionsInside, trianglesInside, specialPairs);
};

module.exports.createSpecialShape = function (points) {
  updateConnections(points, specialPairs, specialConnections, specialTriangles);
};

module.exports.draw = function (pairsInsideSpotlight) {
  updateSines();

  connections.forEach(function (connection, index) {
    if (_.includes(pairsInsideSpotlight, connection.id)) return;

    drawConnection(connection, colours.darkGrey, 0.6, 1.0);

    if (connection.special) {
      var sin = sines[index % 10];
      drawConnection(connection, colours.darkerBlue, sin, 1.0);
    }
  });

  connectionsInside.forEach(function (connection) {
    drawConnection(connection, colours.lighterGrey, 1.0, 0.9);

    if (connection.special) {
      drawConnection(connection, colours.orange, 1.0, 1.0);
    }
  });
};

module.exports.drawTriangles = function () {
  triangles.forEach(drawTriangle);
};

module.exports.drawSpecialShape = function () {
  specialConnections.forEach(_.partial(drawConnection, _, 'red', 0.3));
};
