'use strict';

var _ = require('lodash');
var THREE = require('three');
var randomF = require('random-float');

var map = require('./map');
var space = require('./pt').space;
var ratio = space.size.x / space.size.y;

var colour = new THREE.Color('white');

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

function mapX(value) {
  return map(value, 0, space.size.x, -1, 1) * ratio;
}

function mapY(value) {
  return map(value, 0, space.size.y, -1, 1);
}

function mapZ(x, y, sphereVertices) {
  var found = _.find(sphereVertices, function (vertex) {
    var tolerance = 0.075;
    return _.inRange(x, vertex.x - tolerance, vertex.x + tolerance) && _.inRange(y, vertex.y - tolerance, vertex.y + tolerance);
  });

  if (!found) return randomF(-0.02, -0.03);

  return found.z;
}

function generateVector3(point, sphereVertices) {
  var x = mapX(point.x);
  var y = mapY(point.y);
  var z = mapZ(x, y, sphereVertices) * -1;
  return new THREE.Vector3(x, y, z);
}

function generateFaces(a, b, c, normal, vertices, faces) {
  var aIndex = getIndex3d(vertices, a);
  var bIndex = getIndex3d(vertices, b);
  var cIndex = getIndex3d(vertices, c);

  if (aIndex === -1) {
    vertices.push(a);
    aIndex = getIndex3d(vertices, a);
  }

  if (bIndex === -1) {
    vertices.push(b);
    bIndex = getIndex3d(vertices, b);
  }

  if (cIndex === -1) {
    vertices.push(c);
    cIndex = getIndex3d(vertices, c);
  }

  var f = new THREE.Face3(aIndex, bIndex, cIndex);
  f.normal = normal;
  f.color = colour;
  faces.push(f);
}

module.exports = function (triangles) {
  var geometry = new THREE.Geometry();

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

    face.color = colour;
    geometry.faces.push(face);

    var faceUV = [
      new THREE.Vector2(0, 1),
      new THREE.Vector2(1, 1),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(0, 0)
    ];

    geometry.faceVertexUvs[0].push(faceUV);

    // add the mirrored faces
    var v1Mirror = generateVector3(triangle[2], sphere.vertices);
    var v2Mirror = generateVector3(triangle[1], sphere.vertices);
    var v3Mirror = generateVector3(triangle[0], sphere.vertices);

    v1Mirror.z = v1Mirror.z * -1;
    v2Mirror.z = v2Mirror.z * -1;
    v3Mirror.z = v3Mirror.z * -1;

    var v1MirrorIndex = getIndex3d(geometry.vertices, v1Mirror);
    var v2MirrorIndex = getIndex3d(geometry.vertices, v2Mirror);
    var v3MirrorIndex = getIndex3d(geometry.vertices, v3Mirror);

    if (v1MirrorIndex === -1) {
      geometry.vertices.push(v1Mirror);
      v1MirrorIndex = getIndex3d(geometry.vertices, v1Mirror);
    }

    if (v2MirrorIndex === -1) {
      geometry.vertices.push(v2Mirror);
      v2MirrorIndex = getIndex3d(geometry.vertices, v2Mirror);
    }

    if (v3MirrorIndex === -1) {
      geometry.vertices.push(v3Mirror);
      v3MirrorIndex = getIndex3d(geometry.vertices, v3Mirror);
    }

    var faceMirror = new THREE.Face3(v3MirrorIndex, v2MirrorIndex, v1MirrorIndex);
    faceMirror.normal = new THREE.Vector3(0, 0, 1);
    faceMirror.color = colour;
    geometry.faces.push(faceMirror);

    var faceMirrorUV = [
      new THREE.Vector2(0, 1),
      new THREE.Vector2(1, 1),
      new THREE.Vector2(1, 0),
      new THREE.Vector2(0, 0)
    ];

    geometry.faceVertexUvs[0].push(faceMirrorUV);
  });

  geometry.vertices.forEach(function (vertex) {
    vertex.z += randomF(-0.05, 0.05);
  });

  var targets = [];

  geometry.vertices.forEach(function () {
    targets.push(new THREE.Vector3(0, 0, randomF(-5, 5)));
  });

  geometry.morphTargets.push({
    name: 'test',
    vertices: targets
  });

  // geometry.center();
  geometry.mergeVertices();
  // geometry.computeFaceNormals();
  geometry.computeVertexNormals();
  geometry.computeMorphNormals();
  geometry.computeBoundingBox();

  var secondary = new THREE.Geometry();
  var newSphere = new THREE.SphereGeometry(radius / 3.2, 50, 50);

  newSphere.faces.forEach(function (face) {
    var a = newSphere.vertices[face.a];
    var b = newSphere.vertices[face.b];
    var c = newSphere.vertices[face.c];

    var range = _.random(0, 0.50);

    if (_.inRange(a.z, range * -1, range) && randomF(0, 1) > 0.95) {
      generateFaces(a, b, c, face.normal, secondary.vertices, secondary.faces);
    }
  });

  secondary.vertices.forEach(function (vertex) {
    vertex.z += randomF(-0.01, 0.01);
    vertex.x += randomF(-0.01, 0.01);
    vertex.y += randomF(-0.01, 0.01);
  });

  secondary.mergeVertices();
  secondary.computeFaceNormals();
  secondary.computeVertexNormals();
  secondary.computeMorphNormals();
  secondary.computeBoundingBox();

  return {
    main: geometry,
    secondary: secondary
  };
};
