'use strict';

var _ = require('lodash');

var updateConnections = require('./updateConnections');
var drawRandomisedCurves = require('./drawRandomisedCurves');

var colours = require('./colours');
var form = require('./pt').form;
var lib = require('./pt').lib;

var connections = [];
var pairs = [];

module.exports.update = function (points) {
  updateConnections(points, pairs, connections);
};

module.exports.draw = function (pairsInsideSpotlight, ctx) {
  connections.forEach(function (connection) {
    if (_.includes(pairsInsideSpotlight, connection.id)) return;

    drawRandomisedCurves(connection, ctx);

    form.stroke(colours.darkGrey);
    form.fill(false);

    var line = new lib.Line(connection.from).to(connection.to);
    form.line(line);


  });
};
