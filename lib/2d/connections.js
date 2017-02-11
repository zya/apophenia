'use strict';

var _ = require('lodash');
var dynamics = require('dynamics.js');

var updateConnections = require('./updateConnections');
var colours = require('../colours');
var config = require('../../config');
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
var discoveryPercentage = 0.0;
var shouldReveal = false;

var params = {
  opacityRate: 1
};

var revealStartCallback = function () {};
var revealEndCallback = function () {};

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
  if (connection.revealSpeed) {
    connection.opacity += connection.revealSpeed;
    opacity = connection.opacity;
  }

  var c = 'rgba(' + colour.x + ',' + colour.y + ',' + colour.z + ',' + opacity + ')';
  var line = new lib.Line(connection.from).to(connection.to);
  form.stroke(c, width);
  form.line(line);
}

module.exports.update = function (points) {
  updateConnections(points, pairs, connections, triangles, specialPairs);

  var connectionsLength = _.filter(connections, 'special').length;
  var allSpecialConnectionsLength = specialConnections.length;
  discoveryPercentage = connectionsLength / allSpecialConnectionsLength;
};

module.exports.updateInsideConnections = function (points) {
  connectionsInside = [];
  trianglesInside = [];
  updateConnections(points, [], connectionsInside, trianglesInside, specialPairs);

  return _.some(connectionsInside, ['special', true]);
};

module.exports.createSpecialShape = function (points) {
  updateConnections(points, specialPairs, specialConnections, specialTriangles);
};

module.exports.draw = function (pairsInsideSpotlight) {
  updateSines();

  connections.forEach(function (connection, index) {
    if (_.includes(pairsInsideSpotlight, connection.id)) return;

    drawConnection(connection, colours.darkGrey, config.connectionsOpacity * params.opacityRate, config.connectionsWidth);

    if (connection.special) {
      var sin = sines[index % 10];
      drawConnection(connection, colours.darkerBlue, sin, 1.0);
    }
  });

  connectionsInside.forEach(function (connection) {
    drawConnection(connection, colours.lighterGrey, 1.0, config.connectionsWidth);

    if (connection.special) {
      drawConnection(connection, colours.orange, 1.0, 1.0);
    }
  });

  if (shouldReveal) {
    exports.drawSpecialShape();
  }
};

module.exports.drawTriangles = function () {
  triangles.forEach(drawTriangle);
};

module.exports.drawSpecialShape = function () {
  specialConnections.forEach(_.partial(drawConnection, _, colours.darkerBlue, 0.0, 1.0));
};

module.exports.getDiscoveryPercentage = function () {
  return discoveryPercentage;
};

module.exports.getSpecialTriangles = function () {
  return specialTriangles;
};

function revealConnectionInTime(connection, time) {
  (function (connection) {
    setTimeout(function () {
      connection.opacity = 0;
      connection.revealSpeed = _.random(0.025, 0.05);
    }, time);
  })(connection);
}

module.exports.reveal = function (cb) {
  setTimeout(revealStartCallback, 1500);

  specialConnections.forEach(function (connection, index) {
    if (index % 4 === 0) {
      revealConnectionInTime(connection, _.random(1500, 3000));
    } else if (index % 3 === 0) {
      revealConnectionInTime(connection, _.random(3500, 4500));
    } else {
      revealConnectionInTime(connection, _.random(4800, 6000));
    }
  });

  shouldReveal = true;

  setTimeout(function () {
    dynamics.animate(params, {
      opacityRate: 0
    }, {
      duration: 6000
    });
  }, 2000);

  setTimeout(function () {
    cb();
    revealEndCallback();
  }, 6000);
};

module.exports.on = function (event, cb) {
  if (event === 'revealStart') revealStartCallback = cb;
  if (event === 'revealEnd') revealEndCallback = cb;
};
