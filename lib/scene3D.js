'use strict';

var THREE = require('three');
var dynamics = require('dynamics.js');
var async = require('async');
var OrbitControls = require('three-orbit-controls')(THREE);
// var textureLoader = new THREE.TextureLoader();
window.THREE = THREE;
require('../node_modules/three/examples/js/loaders/OBJLoader');

var generateGeometry = require('./generate3DGeometry');
var globals = require('./globals');
// var sine = require('./sine');
var space = require('./pt').space;
var materials = require('./materials');
var rose = require('./rose');
var aura = require('./aura');

var geometry, mesh, wireframe, camera, controls, sphere, floaters;
var shouldSpin = false;
// scene and camera
var scene = new THREE.Scene();

var roseMesh = new THREE.Object3D();
var raycaster = new THREE.Raycaster();

var loaded = false;

rose.load(function (mesh) {
  loaded = true;
  roseMesh = mesh;
});

// renderer
var renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});

renderer.domElement.className = 'test';
renderer.domElement.style.visibility = 'hidden';
renderer.domElement.style.opacity = 0;

renderer.setSize(window.innerWidth, window.innerHeight);

// main material
var material = materials.shell;

// wire frame material
var wireframeMaterial = materials.wireframe;

// var lightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(lightHelper);

var redLight = new THREE.PointLight('red');
redLight.intensity = 0.03;
redLight.distance = 10;
redLight.decay = 0.02;
redLight.position.z = 0.2;

function scaleUpTo3D(done) {
  async.parallel([
    function morphTo3D(cb) {
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

      dynamics.animate(wireframeMaterial, {
        opacity: 0
      }, {
        duration: 5000
      });

      setTimeout(cb, 3100);
    },
    function revealTheBody(cb) {
      dynamics.animate(material, {
        opacity: 1
      }, {
        duration: 5000
      });
      setTimeout(cb, 5100);
    }
  ], done);
}

function startSpinning(done) {
  setTimeout(function () {
    shouldSpin = true;
    done();
  }, 500);
}

function startPulsing() {
  setInterval(function () {
    dynamics.animate(redLight, {
      intensity: redLight.intensity + 0.1
    }, {
      duration: 1000
    });
    setTimeout(function () {
      dynamics.animate(redLight, {
        intensity: redLight.intensity - 0.1
      }, {
        duration: 1500
      });
    }, 1100);
  }, 4000);

  setInterval(function () {
    dynamics.animate(wireframeMaterial, {
      opacity: 0
    }, {
      duration: 800
    });
    setTimeout(function () {
      dynamics.animate(wireframeMaterial, {
        opacity: 1
      }, {
        duration: 1500
      });
    }, 3000);
    setTimeout(function () {
      dynamics.animate(wireframeMaterial, {
        opacity: 0
      }, {
        duration: 800
      });
    }, 4500);
  }, 7000);
}

// initialise
module.exports.init = function (triangles) {
  var geometries = generateGeometry(triangles);
  var secondary = geometries.secondary;

  geometry = geometries.main;
  var spaceHeight = 2;
  var distance = 5;
  var fov = 2 * Math.atan(spaceHeight / (2 * distance)) * (180 / Math.PI);
  camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.z = distance;
  controls = new OrbitControls(camera);

  mesh = new THREE.Mesh(geometry, material);
  floaters = new THREE.Mesh(secondary, wireframeMaterial);

  mesh.id2 = 'mainMesh';
  wireframe = new THREE.Mesh(geometry, wireframeMaterial);
  wireframe.scale.set(1, 1, 0.00000001);

  var radius = geometry.boundingBox.max.y + Math.abs(geometry.boundingBox.min.y);
  var sphereG = new THREE.SphereGeometry(radius / 4, 10, 10);
  sphere = new THREE.Mesh(sphereG, wireframeMaterial);

  mesh.rotation.z = Math.PI;
  mesh.rotation.y = Math.PI;
  mesh.flipSided = true;
  mesh.doubleSided = true;
  mesh.morphTargetBase = 0;

  wireframe.rotation.copy(mesh.rotation);

  // var h = new THREE.FaceNormalsHelper(mesh);
  // scene.add(h);

  // var edges = new THREE.FaceNormalsHelper(mesh, 2, 0x00ff00, 1);
  // scene.add(edges);

  controls.update();

  var hemishphereLight = new THREE.HemisphereLight(0x00ff57, 0xff004a, 0.3);
  scene.add(hemishphereLight);

  scene.add(wireframe);
  scene.add(mesh);

  setInterval(function () {
    var mouse = globals.getMousePosition();
    var mouseVertex = new THREE.Vector2(((mouse.x / space.size.x) - 0.5) * 2, (((mouse.y / space.size.y) - 0.5) * 2) * -1);
    raycaster.setFromCamera(new THREE.Vector2(mouseVertex.x, mouseVertex.y), camera);
    var intersects = raycaster.intersectObjects([mesh, roseMesh]);

    if (intersects.length > 0 && intersects[0].object.id === roseMesh.id) {
      document.body.style.cursor = 'pointer';
    } else {
      document.body.style.cursor = 'auto';
    }
  }, 100);
};

function addTheInsideMeshes(done) {
  // scene.add(sphere);
  // scene.add(floaters);
  scene.add(roseMesh);
  scene.add(aura);
  scene.add(redLight);
  material.side = THREE.DoubleSide;
  material.transparent = false;
  material.needsUpdate = true;

  startPulsing();
  done();
}

module.exports.render = function () {
  if (shouldSpin) {
    mesh.rotation.y += 0.007;
    sphere.rotation.y -= 0.006;
    floaters.rotation.y += 0.006;
    aura.rotation.y -= 0.006;
    // roseMesh.rotation.y += 0.001;
  }

  mesh.scale.copy(wireframe.scale);
  mesh.scale.sub(new THREE.Vector3(0.001, 0.001, 0.001));
  wireframe.rotation.copy(mesh.rotation);

  wireframeMaterial.needsUpdate = true;
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

module.exports.startTransition = function (done) {
  async.series([
    scaleUpTo3D,
    addTheInsideMeshes,
    startSpinning
  ], done);
};

module.exports.hideCanvas = function () {
  renderer.domElement.style.visibility = 'hidden';
};

module.exports.display = document.getElementById('pt').appendChild(renderer.domElement);
