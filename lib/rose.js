'use strict';

var THREE = require('three');
var _ = require('lodash');
window.THREE = THREE;
require('../node_modules/three/examples/js/loaders/OBJLoader');

var loader = new THREE.OBJLoader();
var scale = 0.028;

var rose = new THREE.Object3D();

var material = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  emissive: 'red',
  // color: 'red',
  emissiveIntensity: 0.05,
  shading: THREE.SmoothShading,
  shininess: 30
});

var geometry;

var initialRotation = (2 * Math.PI) / 4;

module.exports.load = function (cb) {
  var urlPath = location.pathname;

  loader.load(urlPath + 'assets/models/rose.obj', function (object) {
    geometry = object.children[0].geometry;
    geometry.center();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    rose = new THREE.Mesh(geometry, material);
    rose.scale.set(scale, scale, scale);
    rose.rotation.z = initialRotation;
    rose.rotation.y = initialRotation;

    cb(null, rose, material);
  });
};

module.exports.updateRotation = function (x, y) {
  rose.rotation.x -= y * 0.007;
  rose.rotation.y += x * 0.008;

  rose.rotation.y = _.clamp(rose.rotation.y, initialRotation - 0.4, initialRotation + 0.4);
  rose.rotation.x = _.clamp(rose.rotation.x, -0.3, 0.3);
};

module.exports.setSize = function (reference) {
  var scale = reference / (geometry.boundingBox.max.y * 3);
  rose.userData.scale = scale;
  rose.scale.set(scale, scale, scale);
};
