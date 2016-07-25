'use strict';

var _ = require('lodash');
var THREE = require('three');
var randomF = require('random-float');

function getIndex(vertices, v) {
  var t = _.findIndex(vertices, function (vertex) {
    return vertex.x === v.x && vertex.y === v.y;
  });
  return t;
}

module.exports = function (triangles) {
  var geometry = new THREE.Geometry();

  triangles.forEach(function (triangle) {
    var v1 = new THREE.Vector3(triangle[0].x, triangle[0].y, 0);
    var v2 = new THREE.Vector3(triangle[1].x, triangle[1].y, 0);
    var v3 = new THREE.Vector3(triangle[2].x, triangle[2].y, 0);

    var v1Index = getIndex(geometry.vertices, v1);
    var v2Index = getIndex(geometry.vertices, v2);
    var v3Index = getIndex(geometry.vertices, v3);

    if (v1Index === -1) {
      geometry.vertices.push(v1);
      v1Index = getIndex(geometry.vertices, v1);
    }

    if (v2Index === -1) {
      geometry.vertices.push(v2);
      v2Index = getIndex(geometry.vertices, v2);
    }

    if (v3Index === -1) {
      geometry.vertices.push(v3);
      v3Index = getIndex(geometry.vertices, v3);
    }

    var face = new THREE.Face3(v1Index, v2Index, v3Index);
    var colour = new THREE.Color(randomF(0.2, 1.0), randomF(0, 0.1), 0);
    face.color = colour;
    geometry.faces.push(face);
  });

  var targets = [];

  geometry.vertices.forEach(function () {
    targets.push(new THREE.Vector3(0, 0, randomF(-5, 15)));
  });

  geometry.morphTargets.push({
    name: 'test',
    vertices: targets
  });

  geometry.center();
  geometry.normalize();
  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
  geometry.computeMorphNormals();

  return geometry;
};
