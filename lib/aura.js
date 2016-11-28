'use strict';

var THREE = require('three');
var _ = require('lodash');

var colours = require('./colours');

var geometry = new THREE.SphereGeometry(0.42, 7, 7);
geometry.mergeVertices();

var targets = [];

geometry.vertices.forEach(function (vertex) {
  targets.push(new THREE.Vector3(vertex.x + _.random(-0.11, 0.11), vertex.y + _.random(-0.11, 0.11), vertex.z + _.random(-0.11, 0.11)));
});

geometry.morphTargets.push({
  name: 'random',
  vertices: targets
});

var material = new THREE.MeshPhongMaterial({
  wireframe: true,
  wireframeLinewidth: 0.3,
  color: colours.darkGrey.hex(),
  emissive: colours.darkGrey.hex(),
  emissiveIntensity: 1.0,
  morphTargets: true
});

var aura = new THREE.Mesh(geometry, material);
aura.castShadow = true;
aura.morphTargetInfluences[0] = 0.6;

aura.updateMorph = function () {
  aura.morphTargetInfluences[0] += _.random(-0.05, 0.05);
};

module.exports = aura;

module.exports.setSize = function (reference) {
  var scale = reference / (aura.geometry.boundingBox.max.y * 2.8);
  aura.scale.set(scale, scale, scale);
};
