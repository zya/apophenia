'use strict';

var THREE = require('three');

var generateGeometry = require('./generate3DGeometry');

var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 100);
camera.position.z = 4.14;

var geometry, mesh;

var renderer = new THREE.WebGLRenderer({
  alpha: true
});

var material = new THREE.MeshBasicMaterial({
  wireframe: false,
  side: THREE.DoubleSide,
  vertexColors: THREE.FaceColors,
  morphTargets: true
});

renderer.domElement.className = 'test';
renderer.domElement.style.visibility = 'hidden';
renderer.setSize(window.innerWidth, window.innerHeight);

module.exports.display = document.getElementById('pt').appendChild(renderer.domElement);

module.exports.init = function (triangles) {
  geometry = generateGeometry(triangles);

  mesh = new THREE.Mesh(geometry, material);
  mesh.rotation.z = Math.PI;
  mesh.rotation.y = Math.PI;
  mesh.scale.set(2.32, 2.32, 2.32);
  scene.add(mesh);
  mesh.morphTargetBase = 0;
};

module.exports.render = function () {
  mesh.rotation.z += 0.002;
  renderer.render(scene, camera);
};

module.exports.updateMorph = function (value) {
  mesh.morphTargetInfluences[0] = value;
};

module.exports.displayCanvas = function () {
  renderer.domElement.style.visibility = 'visible';
};

module.exports.hideCanvas = function () {
  renderer.domElement.style.visibility = 'hidden';
};
