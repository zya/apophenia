'use strict';

var THREE = require('three');
var dynamics = require('dynamics.js');

var _camera, _scene;

var renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});

renderer.domElement.className = 'test';
renderer.domElement.style.visibility = 'hidden';
renderer.domElement.style.opacity = 0;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.shadowMap.cullFace = THREE.CullFaceBack;
renderer.shadowMap.renderReverseSided = false;
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('pt').appendChild(renderer.domElement);

module.exports.init = function (scene, camera) {
  _camera = camera;
  _scene = scene;
};

module.exports.render = function (scene, camera) {
  renderer.render(scene, camera);
};

module.exports.addClickListener = function (cb) {
  renderer.domElement.addEventListener('click', cb);
};

module.exports.display = function () {
  renderer.domElement.style.visibility = 'visible';
  dynamics.animate(renderer.domElement, {
    opacity: 1
  }, {
    duration: 3000
  });
};

module.exports.hide = function () {
  renderer.domElement.style.visibility = 'hidden';
};
