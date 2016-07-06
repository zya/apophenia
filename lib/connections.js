'use strict';

var _ = require('lodash');

var updateConnections = require('./updateConnections');
var colours = require('./colours');
var form = require('./pt').form;
var lib = require('./pt').lib;

var connections = [];
var pairs = [];
var connectionsInside = [];

module.exports.update = function(points) {
  updateConnections(points, pairs, connections);
};

module.exports.updateInsideConnections = function(points) {
  connectionsInside = [];
  updateConnections(points, [], connectionsInside);
};

module.exports.draw = function(pairsInsideSpotlight) {
  connections.forEach(function(connection) {
    if (_.includes(pairsInsideSpotlight, connection.id)) return;

    form.stroke(colours.darkGrey);
    form.fill(false);

    var line = new lib.Line(connection.from).to(connection.to);
    form.line(line);
  });

  connectionsInside.forEach(function(connection) {
    form.stroke(colours.orange);
    form.fill(false);

    var line = new lib.Line(connection.from).to(connection.to);
    form.line(line);
  });
};
