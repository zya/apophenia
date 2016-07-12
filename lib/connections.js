'use strict';

var _ = require('lodash');
var THREE = require('three');
var randomF = require('random-float');

var updateConnections = require('./updateConnections');
var colours = require('./colours');
var config = require('../config');
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

// three stuff
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
// var camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -5, 5);
camera.position.z = 4.14;

var renderer = new THREE.WebGLRenderer({
  alpha: true
});

renderer.domElement.className = 'test';
renderer.setSize(window.innerWidth, window.innerHeight);

document.getElementById('pt').appendChild(renderer.domElement);

var geometry = new THREE.Geometry();

var material = new THREE.MeshBasicMaterial({
  wireframe: false,
  side: THREE.DoubleSide,
  vertexColors: THREE.FaceColors,
  opacity: 0.01
});

var mesh = new THREE.Mesh(geometry, material);
scene.add(mesh);

mesh.rotation.z = Math.PI;
mesh.rotation.y = Math.PI;
mesh.scale.set(2.32, 2.32, 2.32);

function updateSines() {
  renderer.render(scene, camera);
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
  // mesh.rotation.y += 0.001;
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
  var line = new lib.Line(connection.from).to(connection.to);
  form.stroke(c, width);
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

  var faceIndex = 0;
  specialTriangles.forEach(function (triangle, i) {
    geometry.vertices.push(new THREE.Vector3(triangle[0].x, triangle[0].y, 0));
    geometry.vertices.push(new THREE.Vector3(triangle[1].x, triangle[1].y, 0));
    geometry.vertices.push(new THREE.Vector3(triangle[2].x, triangle[2].y, 0));
    var face = new THREE.Face3(faceIndex + i, faceIndex + i + 1, faceIndex + i + 2);
    var colour = new THREE.Color(Math.random(), Math.random(), Math.random());
    face.color = colour;
    geometry.faces.push(face);
    faceIndex += 2;
  });

  // var ps = points.map(function (point) {
  //   return new THREE.Vector3(point.x, point.y, randomF(-50, 50));
  // });
  //
  // geometry = new THREE.ConvexGeometry(ps);
  geometry.center();
  geometry.normalize();
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
};

module.exports.draw = function (pairsInsideSpotlight) {
  updateSines();

  connections.forEach(function (connection, index) {
    if (_.includes(pairsInsideSpotlight, connection.id)) return;

    drawConnection(connection, colours.darkGrey, config.connectionsOpacity, config.connectionsWidth);

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

  specialConnections.forEach(_.partial(drawConnection, _, colours.orange, 1.0, 1.0));
};

module.exports.drawTriangles = function () {
  triangles.forEach(drawTriangle);
};

module.exports.drawSpecialShape = function () {
  specialConnections.forEach(_.partial(drawConnection, _, colours.orange, 1.0, 1.0));
};
