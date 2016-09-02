'use strict';

var _ = require('lodash');
var THREE = require('three');
var randomF = require('random-float');

var map = require('./map');
var space = require('./pt').space;
var ratio = space.size.x / space.size.y;

function getIndex(vertices, v) {
  var t = _.findIndex(vertices, function (vertex) {
    return vertex.x === v.x && vertex.y === v.y;
  });
  return t;
}

function mapX(value) {
  return map(value, 0, space.size.x, -1, 1) * ratio;
}

function mapY(value) {
  return map(value, 0, space.size.y, -1, 1);
}

module.exports = function (triangles) {
  var geometry = new THREE.Geometry();

  triangles.forEach(function (triangle) {
    var v1 = new THREE.Vector3(mapX(triangle[0].x), mapY(triangle[0].y), 0);
    var v2 = new THREE.Vector3(mapX(triangle[1].x), mapY(triangle[1].y), 0);
    var v3 = new THREE.Vector3(mapX(triangle[2].x), mapY(triangle[2].y), 0);

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

    var face = new THREE.Face3(v3Index, v2Index, v1Index);
    face.normal = new THREE.Vector3(0, 0, -1);
    var colour = new THREE.Color('white');
    face.color = colour;
    geometry.faces.push(face);

    var faceuv = [
      new THREE.Vector2(0, 1),
      new THREE.Vector2(1, 1),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(0, 0)
    ];

    geometry.faceVertexUvs[0].push(faceuv);
  });

  var targets = [];

  geometry.vertices.forEach(function () {
    targets.push(new THREE.Vector3(0, 0, randomF(-5, 5)));
  });

  geometry.morphTargets.push({
    name: 'test',
    vertices: targets
  });

  geometry.computeFaceNormals();
  geometry.computeVertexNormals();
  geometry.computeMorphNormals();
  geometry.computeBoundingBox();

  return geometry;
};
