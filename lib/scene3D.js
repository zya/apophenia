'use strict';

var THREE = require('three');
var dynamics = require('dynamics.js');
var OrbitControls = require('three-orbit-controls')(THREE);
// var textureLoader = new THREE.TextureLoader();

var generateGeometry = require('./generate3DGeometry');
var globals = require('./globals');
var sine = require('./sine');
var space = require('./pt').space;

var geometry, mesh, wireframe, camera, controls;

// scene and camera
var scene = new THREE.Scene();


var raycaster = new THREE.Raycaster();

// renderer
var renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});

renderer.domElement.className = 'test';
renderer.domElement.style.visibility = 'hidden';
renderer.domElement.style.opacity = 0;

renderer.setSize(window.innerWidth, window.innerHeight);

// var normalMap = textureLoader.load('/assets/images/normal-map.jpg');
// var textureMap = textureLoader.load('../assets/images/normal-map.jpg');
// var displacementMap = textureLoader.load('../assets/images/displacement.jpg');

// main material
var material = new THREE.MeshPhongMaterial({
  morphTargets: true,
  morphNormals: true,
  shading: THREE.FlatShading,
  side: THREE.DoubleSide,
  vertexColors: THREE.FaceColors,
  transparent: true,
  opacity: 0
    // normalMap: normalMap,
    // normalScale: new THREE.Vector2(0, 0)
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
scene.add(new THREE.AmbientLight('white', 0.04));

// spot light
var spotLight = new THREE.SpotLight(0xffc60f);
spotLight.position.set(0, 1, 0);
spotLight.castShadow = true;
spotLight.angle = 0.3;
spotLight.penumbra = 0.1;
spotLight.decay = 0.8;
spotLight.distance = 8;
spotLight.intensity = 0.5;
spotLight.shadow.mapSize.width = 512;
spotLight.shadow.mapSize.height = 512;
scene.add(spotLight);

// var lightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(lightHelper);

// point light
var pointLight = new THREE.PointLight(0x390fff);
pointLight.intensity = 0.5;
pointLight.distance = 2;
pointLight.decay = 0.25;
pointLight.position.z = 0.2;
scene.add(pointLight);
// var c = new THREE.Mesh(new THREE.SphereGeometry(0.01, 0.01, 0.01));

var directionalLight = new THREE.DirectionalLight(0xffffff, 0.3);
directionalLight.position.set(1.5, 1, 2);
// scene.add(directionalLight);

// var pointLightHelper = new THREE.PointLightHelper(pointLight, 1);
// scene.add(pointLightHelper);

// var directionalLightHelper = new THREE.DirectionalLightHelper(directionalLight, 10);
// scene.add(directionalLightHelper);

// initialise
module.exports.init = function (triangles) {
  geometry = generateGeometry(triangles);
  var spaceHeight = 2;
  var distance = 5;
  var fov = 2 * Math.atan(spaceHeight / (2 * distance)) * (180 / Math.PI);
  camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.z = distance;
  controls = new OrbitControls(camera);

  mesh = new THREE.Mesh(geometry, material);

  mesh.id2 = 'mainMesh';
  wireframe = new THREE.Mesh(geometry, wireframeMaterial);
  wireframe.scale.set(1, 1, 0);


  // var radius = geometry.boundingBox.max.y + Math.abs(geometry.boundingBox.min.y);
  // var sphereG = new THREE.SphereGeometry(radius / 2, 10, 10, 0, -3);
  // var sphere = new THREE.Mesh(sphereG, wireframeMaterial);

  setTimeout(function () {
    dynamics.animate(wireframe.scale, {
      z: 1.0,
      x: 1.1,
      y: 1.1
    }, {
      duration: 3000
    });

    dynamics.animate(mesh.scale, {
      z: 1.0,
      x: 1.1,
      y: 1.1
    }, {
      duration: 3000
    });

  }, 5000);

  mesh.rotation.z = Math.PI;
  mesh.rotation.y = Math.PI;
  mesh.flipSided = true;
  mesh.doubleSided = true;
  mesh.morphTargetBase = 0;

  wireframe.rotation.copy(mesh.rotation);
  spotLight.target = mesh;
  directionalLight.target = mesh;

  pointLight.target = mesh;
  pointLight.lookAt(new THREE.Vector3(0, 0, -10));

  // var h = new THREE.FaceNormalsHelper(mesh);
  // scene.add(h);
  scene.add(wireframe);
  scene.add(mesh);

  // var edges = new THREE.FaceNormalsHelper(mesh, 2, 0x00ff00, 1);
  //
  // scene.add(edges);

  // scene.add(sphere);
  controls.update();
  setTimeout(function () {
    dynamics.animate(material, {
      opacity: 1
    }, {
      duration: 3000
    });
  }, 2000);
};

module.exports.render = function () {
  var mouse = globals.getMousePosition();

  mesh.scale.copy(wireframe.scale);

  spotLight.position.x = sine(0.7, 0.35, Date.now() * 0.001, 0) * 2;
  spotLight.position.y = 4.5 + sine(1.5, 0.2, Date.now() * 0.001, 0.5) * 8;

  var mouseVertex = new THREE.Vector2(((mouse.x / space.size.x) - 0.5) * 2, (((mouse.y / space.size.y) - 0.5) * 2) * -1);
  pointLight.position.x = mouseVertex.x;
  pointLight.position.y = mouseVertex.y;

  spotLight.lookAt(mesh.position);
  // mesh.rotation.y += mouseVertex.x * 0.001;
  // mesh.rotation.x -= mouseVertex.y * 0.001;
  wireframe.rotation.copy(mesh.rotation);

  // var op = map(sine(2, 1, Date.now() * 0.001, 0), -1, 1, -0.4, 0.1);
  wireframeMaterial.opacity = 1;
  // material.normalScale.x = op;
  // material.normalScale.y = op;

  raycaster.setFromCamera(new THREE.Vector2(mouseVertex.x, mouseVertex.y), camera);
  var intersects = raycaster.intersectObject(mesh);

  mesh.geometry.faces.forEach(function (face) {
    face.color.copy(new THREE.Color('white'));
  });

  document.body.style.cursor = 'auto';
  if (intersects.length > 0) {
    intersects.forEach(function (intersect) {
      if (intersect.object.id2 === 'mainMesh') {
        document.body.style.cursor = 'pointer';
        mesh.geometry.faces[intersect.faceIndex].color.copy(new THREE.Color('red'));
        mesh.geometry.colorsNeedUpdate = true;
      }
    });
  }

  renderer.render(scene, camera);
};

module.exports.updateMorph = function (value) {
  mesh.morphTargetInfluences[0] = value;
  wireframe.morphTargetInfluences[0] = value;
  // material.bumpScale = value * 10;
};

module.exports.displayCanvas = function () {
  renderer.domElement.style.visibility = 'visible';
  dynamics.animate(renderer.domElement, {
    opacity: 1
  }, {
    duration: 3000
  });
};

module.exports.hideCanvas = function () {
  renderer.domElement.style.visibility = 'hidden';
};

module.exports.display = document.getElementById('pt').appendChild(renderer.domElement);
