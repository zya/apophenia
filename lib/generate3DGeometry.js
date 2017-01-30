'use strict';

var _ = require('lodash');
var work = require('webworkify');
var THREE = require('three');

var worker = work(require('./geometryWorker'));
var space = require('./pt').space;

module.exports = function (triangles, cb) {
  worker.addEventListener('message', function (event) {
    var start = Date.now();
    var data = JSON.parse(event.data);
    var targets = [];

    var geometry = new THREE.Geometry();

    geometry.vertices = data.vertices.map(function (vertex) {
      var target = new THREE.Vector3(0, 0, _.random(-5, 5));
      targets.push(target);
      return new THREE.Vector3(vertex.x, vertex.y, vertex.z);
    });

    geometry.faces = data.faces.map(function (face) {
      return new THREE.Face3(face.a, face.b, face.c);
    });

    geometry.morphTargets.push({
      name: 'test',
      vertices: targets
    });

    data.faceVertexUvs.forEach(function (faceVertexUV) {
      var uvs = [
        new THREE.Vector2(faceVertexUV[0][0], faceVertexUV[0][1]),
        new THREE.Vector2(faceVertexUV[1][0], faceVertexUV[1][1]),
        new THREE.Vector2(faceVertexUV[2][0], faceVertexUV[2][1]),
        new THREE.Vector2(faceVertexUV[3][0], faceVertexUV[3][1])
      ];

      geometry.faceVertexUvs[0].push(uvs);
    });

    geometry.mergeVertices();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();
    geometry.computeMorphNormals();
    geometry.computeBoundingBox();

    console.log('TOOOK', Date.now() - start);
    cb(null, {
      main: geometry,
      wireframe: geometry.clone()
    });
  });

  var message = {
    triangles: triangles,
    space: space
  };

  worker.postMessage(JSON.stringify(message));
};
