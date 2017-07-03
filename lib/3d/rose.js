'use strict';

var THREE = require('three');
var _ = require('lodash');
var dynamics = require('dynamics.js');
window.THREE = THREE;
require('../../node_modules/three/examples/js/loaders/OBJLoader');

var textureLoader = new THREE.TextureLoader();
var urlPath = location.pathname;
var dotsNormalMap = textureLoader.load(urlPath + 'assets/images/dots-normal-map-resized.jpg');

var loader = new THREE.OBJLoader();
var scale = 0.028;

var rose = new THREE.Object3D();
var animatables = {
  morph: 0
};

var material = new THREE.MeshPhongMaterial({
  side: THREE.DoubleSide,
  emissive: 'red',
  // color: 'red',
  emissiveIntensity: 0.1,
  shading: THREE.SmoothShading,
  vertexColors: THREE.FaceColors,
  shininess: 30,
  normalMap: dotsNormalMap,
  normalScale: new THREE.Vector3(0.1, 0.1),
  morphTargets: true,
  transparent: true,
  opacity: 0
});

material.userData = {
  emissiveIntensityInitial: 0.05
};

var geometry;

var initialRotation = (2 * Math.PI) / 4;

module.exports.load = function (cb) {
  var urlPath = location.pathname;

  loader.load(urlPath + 'assets/models/rose.obj', function (object) {
    geometry = new THREE.Geometry().fromBufferGeometry(object.children[0].geometry);
    geometry.center();
    geometry.computeFaceNormals();
    geometry.computeVertexNormals();

    var targets = [];

    geometry.vertices.forEach(function (vertex) {
      targets.push(new THREE.Vector3(vertex.x + _.random(-0.6, 0.6), vertex.y + _.random(-0.6, 0.6), vertex.z + _.random(-0.6, 0.6)));
    });

    geometry.morphTargets.push({
      name: 'random',
      vertices: targets
    });

    geometry.faces.forEach(function (face) {
      face.color = new THREE.Color(_.random(0.6, 1.0), _.random(0.4, 1.0), _.random(0.4, 0.9));
      // face.color = new THREE.Color(_.random(0.1, 0.4), _.random(0.1, 0.2), _.random(0.1, 0.3));
    });

    rose = new THREE.Mesh(geometry, material);
    rose.scale.set(scale, scale, scale);
    rose.rotation.z = initialRotation;
    rose.rotation.y = initialRotation;
    rose.castShadow = true;
    rose.receiveShadow = true;

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
  scale = reference / (geometry.boundingBox.max.y * 3);
  rose.userData.scale = scale;
  rose.scale.set(0, 0, 0);
};

module.exports.update = function () {
  rose.morphTargetInfluences[0] = animatables.morph;
};

module.exports.distort = function () {
  var duration = _.random(270, 450);

  dynamics.animate(animatables, {
    morph: _.random(1, 2.3)
  }, {
    type: dynamics.easeOut,
    friction: 1,
    duration: duration
  });
  setTimeout(function () {
    dynamics.animate(animatables, {
      morph: 0
    }, {
      type: dynamics.easeOut,
      friction: 1,
      duration: duration
    });
  }, duration + 100);
};

module.exports.expand = function () {
  var duration = 1000;
  dynamics.animate(rose.scale, {
    x: scale * 1.2,
    y: scale * 1.2,
    z: scale * 1.2,
  }, {
    duration: duration
  });
};

module.exports.reduce = function () {
  var duration = 1000;
  dynamics.animate(rose.scale, {
    x: scale,
    y: scale,
    z: scale,
  }, {
    duration: duration
  });
};

module.exports.reveal = function () {
  material.opacity = 1;
  material.transparent = false;
  material.needsUpdate = true;
  rose.scale.set(scale, scale, scale);
};

module.exports.fadeOut = function (cb) {
  var duration = 4000;
  material.transparent = true;
  material.needsUpdate = true;
  dynamics.animate(material, {
    opacity: 0
  }, {
    duration: 4000
  });

  setTimeout(function () {
    material.visible = false;
    cb();
  }, duration);
};

module.exports.reset = function () {
  material.needsUpdate = true;
  material.visible = true;
  material.opacity = 1;
  rose.scale.set(scale, scale, scale);
};
