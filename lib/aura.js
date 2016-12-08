'use strict';

var THREE = require('three');
var _ = require('lodash');
var dynamics = require('dynamics.js');

var colours = require('./colours');
var scale = 0;

var animatables = {
  morph: 0.6,
  morph2: 0.0
};

var geometry = new THREE.SphereGeometry(0.42, 7, 7);
geometry.mergeVertices();
geometry.computeBoundingBox();

var targets = [];
var targets2 = [];

geometry.vertices.forEach(function (vertex) {
  targets.push(new THREE.Vector3(vertex.x + _.random(-0.11, 0.11), vertex.y + _.random(-0.11, 0.11), vertex.z + _.random(-0.11, 0.11)));
  targets2.push(new THREE.Vector3(vertex.x + _.random(-0.11, 0.11), vertex.y + _.random(-0.11, 0.11), vertex.z + _.random(-0.11, 0.11)));
});

geometry.morphTargets.push({
  name: 'random',
  vertices: targets
});

geometry.morphTargets.push({
  name: 'random2',
  vertices: targets2
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

module.exports.mesh = aura;

module.exports.update = function () {
  aura.morphTargetInfluences[0] = animatables.morph;
  aura.morphTargetInfluences[1] = animatables.morph2;
};

module.exports.expand = function () {
  var duration = 1100;
  dynamics.animate(aura.scale, {
    x: scale * 1.3,
    y: scale * 1.3,
    z: scale * 1.3,
  }, {
    duration: duration
  });
};

module.exports.reduce = function () {
  var duration = 1100;
  dynamics.animate(aura.scale, {
    x: scale,
    y: scale,
    z: scale,
  }, {
    duration: duration
  });
};

module.exports.distort = function () {
  var duration = _.random(150, 260);

  dynamics.animate(animatables, {
    morph: _.random(0.65, 0.75),
    morph2: _.random(0, 0.3)
  }, {
    type: dynamics.easeOut,
    friction: 1,
    duration: duration
  });
  setTimeout(function () {
    dynamics.animate(animatables, {
      morph: 0.6,
      morph2: 0,
    }, {
      type: dynamics.easeOut,
      friction: 1,
      duration: duration
    });
  }, duration + 150);
};

module.exports.setSize = function (reference) {
  scale = reference / (geometry.boundingBox.max.y * 1.55);
  aura.scale.set(scale, scale, scale);
};
