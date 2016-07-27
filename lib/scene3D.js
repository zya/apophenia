'use strict';

var THREE = require('three');

var generateGeometry = require('./generate3DGeometry');
var globals = require('./globals');
var sine = require('./sine');
var map = require('./map');
var space = require('./pt').space;
var ratio = space.size.x / space.size.y;

var geometry, mesh, wireframe;

// scene and camera
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 0.75;

// renderer
var renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});

renderer.domElement.className = 'test';
renderer.domElement.style.visibility = 'hidden';
renderer.setSize(window.innerWidth, window.innerHeight);

// main material
var material = new THREE.MeshStandardMaterial({
  morphTargets: true,
  morphNormals: true,
  shading: THREE.FlatShading,
  side: THREE.FrontSide,
  metalness: 0.5,
  roughness: 0.2
});

// wire frame material
var wireframeMaterial = new THREE.MeshNormalMaterial({
  morphTargets: true,
  side: THREE.FrontSide,
  wireframe: true,
  transparent: true,
  opacity: 0
});

// ambient light
scene.add(new THREE.AmbientLight('white', 0.01));

// spot light
var spotLight = new THREE.SpotLight(0xffc60f);
spotLight.position.set(0, 4.5, -2);
spotLight.castShadow = true;
spotLight.angle = 0.3;
spotLight.penumbra = 0.1;
spotLight.decay = 0.8;
spotLight.distance = 8;
spotLight.intensity = 0.4;
spotLight.shadow.mapSize.width = 512;
spotLight.shadow.mapSize.height = 512;
scene.add(spotLight);
// var lightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(lightHelper);

// point light
var pointLight = new THREE.PointLight(0x390fff);
pointLight.intensity = 0.5;
pointLight.distance = 100;
pointLight.decay = 0.1;
pointLight.position.z = 0.2;
scene.add(pointLight);
// var c = new THREE.Mesh(new THREE.SphereGeometry(0.01, 0.01, 0.01));
// scene.add(c);

// initialise
module.exports.init = function (triangles) {
  geometry = generateGeometry(triangles);

  mesh = new THREE.Mesh(geometry, material);
  wireframe = new THREE.Mesh(geometry, wireframeMaterial);

  mesh.rotation.z = Math.PI;
  mesh.rotation.y = Math.PI;
  mesh.flipSided = true;
  mesh.doubleSided = true;
  mesh.morphTargetBase = 0;

  wireframe.rotation.copy(mesh.rotation);

  spotLight.target = mesh;
  spotLight.lookAt(mesh.position);

  pointLight.target = mesh;
  pointLight.lookAt(new THREE.Vector3(0, 0, -10));

  // var h = new THREE.FaceNormalsHelper(mesh);
  // scene.add(h);
  scene.add(wireframe);
  scene.add(mesh);
};


module.exports.render = function () {
  var mouse = globals.getMousePosition();

  spotLight.position.x = sine(0.7, 0.35, Date.now() * 0.001, 0) * 2;
  spotLight.position.y = 4.5 + sine(1.5, 0.2, Date.now() * 0.001, 0.5) * 8;

  pointLight.position.x = ((mouse.x / space.size.x) - 0.5) * 1 * ratio;
  pointLight.position.y = (((mouse.y / space.size.y) - 0.5) * 1) * -1;

  spotLight.lookAt(mesh.position);

  wireframeMaterial.opacity = map(sine(2, 1, Date.now() * 0.001, 0), -1, 1, -0.4, 0.1);

  renderer.render(scene, camera);
};

module.exports.updateMorph = function (value) {
  mesh.morphTargetInfluences[0] = value;
  wireframe.morphTargetInfluences[0] = value;
};

module.exports.displayCanvas = function () {
  renderer.domElement.style.visibility = 'visible';
};

module.exports.hideCanvas = function () {
  renderer.domElement.style.visibility = 'hidden';
};

module.exports.display = document.getElementById('pt').appendChild(renderer.domElement);
