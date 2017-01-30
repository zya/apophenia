'use strict';

var _ = require('lodash');
var THREE = require('three');

var map = require('./map');

var space;
var ratio;
var colour = new THREE.Color('white');

function mapY(value) {
  return map(value, 0, space.size.y, -1, 1);
}

function mapX(value) {
  return map(value, 0, space.size.x, -1, 1) * ratio;
}

function mapZ(x, y, sphereVertices) {
  var found = _.find(sphereVertices, function (vertex) {
    var tolerance = 0.075;
    return _.inRange(x, vertex.x - tolerance, vertex.x + tolerance) && _.inRange(y, vertex.y - tolerance, vertex.y + tolerance);
  });

  if (!found) return _.random(-0.02, -0.03);

  return found.z;
}

function generateVector3(point, sphereVertices) {
  var x = mapX(point.x);
  var y = mapY(point.y);
  var z = mapZ(x, y, sphereVertices) * -1;
  return {
    x: x,
    y: y,
    z: z
  };
}

function getIndex(vertices, v) {
  var t = _.findIndex(vertices, function (vertex) {
    return vertex.x === v.x && vertex.y === v.y;
  });
  return t;
}

function getIndex3d(vertices, v) {
  var t = _.findIndex(vertices, function (vertex) {
    return vertex.x === v.x && vertex.y === v.y && vertex.z === v.z;
  });
  return t;
}

module.exports = function (self) {
  self.onmessage = function (event) {
    var message = JSON.parse(event.data);
    var triangles = message.triangles;
    space = message.space;
    ratio = space.size.x / space.size.y;

    // var geometry = new THREE.Geometry();
    var vertices = [];
    var faces = [];
    var faceVertexUvs = [];
    var morphTargets = [];

    var allVertices = _.flatten(triangles);
    var max = _.maxBy(allVertices, 'y');
    var min = _.minBy(allVertices, 'y');
    var radius = mapY(max.y) + Math.abs(mapY(min.y)) + 0.25;
    var sphere = new THREE.SphereGeometry(radius / 2, 50, 50);

    triangles.forEach(function (triangle) {

      // add the normal faces
      var v1 = generateVector3(triangle[0], sphere.vertices);
      var v2 = generateVector3(triangle[1], sphere.vertices);
      var v3 = generateVector3(triangle[2], sphere.vertices);

      var v1Index = getIndex(vertices, v1);
      var v2Index = getIndex(vertices, v2);
      var v3Index = getIndex(vertices, v3);

      if (v1Index === -1) {
        vertices.push(v1);
        v1Index = getIndex(vertices, v1);
      }

      if (v2Index === -1) {
        vertices.push(v2);
        v2Index = getIndex(vertices, v2);
      }

      if (v3Index === -1) {
        vertices.push(v3);
        v3Index = getIndex(vertices, v3);
      }

      var face = {
        a: v3Index,
        b: v2Index,
        c: v1Index
      };

      face.normal = [0, 0, -1];

      face.color = colour;
      faces.push(face);

      var faceUV = [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
      ];

      faceVertexUvs.push(faceUV);

      // add the mirrored faces
      var v1Mirror = generateVector3(triangle[2], sphere.vertices);
      var v2Mirror = generateVector3(triangle[1], sphere.vertices);
      var v3Mirror = generateVector3(triangle[0], sphere.vertices);

      v1Mirror.z = v1Mirror.z * -1;
      v2Mirror.z = v2Mirror.z * -1;
      v3Mirror.z = v3Mirror.z * -1;

      var v1MirrorIndex = getIndex3d(vertices, v1Mirror);
      var v2MirrorIndex = getIndex3d(vertices, v2Mirror);
      var v3MirrorIndex = getIndex3d(vertices, v3Mirror);

      if (v1MirrorIndex === -1) {
        vertices.push(v1Mirror);
        v1MirrorIndex = getIndex3d(vertices, v1Mirror);
      }

      if (v2MirrorIndex === -1) {
        vertices.push(v2Mirror);
        v2MirrorIndex = getIndex3d(vertices, v2Mirror);
      }

      if (v3MirrorIndex === -1) {
        vertices.push(v3Mirror);
        v3MirrorIndex = getIndex3d(vertices, v3Mirror);
      }

      var faceMirror = {
        a: v3MirrorIndex,
        b: v2MirrorIndex,
        c: v1MirrorIndex
      };

      faceMirror.normal = [0, 0, 1];
      faceMirror.color = colour;
      faces.push(faceMirror);

      var faceMirrorUV = [
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0]
      ];

      faceVertexUvs.push(faceMirrorUV);
    });

    vertices.forEach(function (vertex) {
      vertex.z += _.random(-0.05, 0.05);
    });

    var targets = [];

    vertices.forEach(function () {
      targets.push({
        x: 0,
        y: 0,
        z: _.random(-5, 5)
      });
    });

    morphTargets = targets;

    self.postMessage(JSON.stringify({
      vertices: vertices,
      targets: morphTargets,
      faces: faces,
      faceVertexUvs: faceVertexUvs
    }));
  };
};
