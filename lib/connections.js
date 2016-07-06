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

module.exports.update = function(points) {
  updateConnections(points, pairs, connections, triangles);
};

module.exports.updateInsideConnections = function(points) {
  connectionsInside = [];
  trianglesInside = [];
  updateConnections(points, [], connectionsInside, trianglesInside);
};

module.exports.draw = function(pairsInsideSpotlight) {
  connections.forEach(function(connection) {
    if (_.includes(pairsInsideSpotlight, connection.id)) return;

    form.stroke(colours.darkGrey, 1.0);
    form.fill(false);

    var line = new lib.Line(connection.from).to(connection.to);
    form.line(line);
  });

  connectionsInside.forEach(function(connection) {
    form.stroke(colours.orange, 1.0);
    form.fill(false);

    var line = new lib.Line(connection.from).to(connection.to);
    form.line(line);
  });
};

module.exports.drawTriangles = function() {
  triangles.forEach(function(triplet) {
    var tri = new lib.Triangle(triplet[0]);
    tri.to(triplet[1], triplet[2]);

    form.stroke(false);
    form.fill(colours.orange);
    form.triangle(tri);
  });
};
