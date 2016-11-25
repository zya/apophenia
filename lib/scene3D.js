'use strict';

var THREE = require('three');
var _ = require('lodash');
var dynamics = require('dynamics.js');
var async = require('async');
var OrbitControls = require('three-orbit-controls')(THREE);

var generateGeometry = require('./generate3DGeometry');
var globals = require('./globals');
var colours = require('./colours');
var space = require('./pt').space;
var materials = require('./materials');
var rose = require('./rose');
var aura = require('./aura');

var geometry, mesh, wireframe, camera, controls, sphere, group, groupMaterial;
var shouldEmitMouseOnEvent = true;
var shouldEmitMouseOffEvent = false;
var shouldSpin = false;
// scene and camera
var scene = new THREE.Scene();

var roseMesh = new THREE.Object3D();
var roseMaterial;
var raycaster = new THREE.Raycaster();

var mouseOffsetX = 0;
var mouseOffsetY = 0;

var loaded = false;

rose.load(function (err, mesh, material) {
  loaded = true;
  roseMesh = mesh;
  roseMaterial = material;
});

// renderer
var renderer = new THREE.WebGLRenderer({
  alpha: true,
  antialias: true
});

renderer.domElement.className = 'test';
renderer.domElement.style.visibility = 'hidden';
renderer.domElement.style.opacity = 0;

renderer.shadowMapEnabled = true;
renderer.shadowMapType = THREE.PCFSoftShadowMap;

renderer.setSize(window.innerWidth, window.innerHeight);

// main material
var material = materials.shell;

// wire frame material
var wireframeMaterial = materials.wireframe;

// var lightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(lightHelper);

var redLight = new THREE.PointLight('red');
redLight.intensity = 0.01;
redLight.distance = 9;
redLight.decay = 0.02;
redLight.position.z = 0.2;
// redLight.castShadow = true;
redLight.shadowMapWidth = 2048;
redLight.shadowMapHeight = 2048;

var blueLight = new THREE.PointLight('blue');
blueLight.intensity = 0.25;
blueLight.distance = 6;
blueLight.decay = 0.03;
blueLight.position.z = 0.3;
// blueLight.shadow.bias = 0.01;
// blueLight.castShadow = true;
// blueLight.shadowMapWidth = 2048;
// blueLight.shadowMapHeight = 2048;

var spotLightForRose = new THREE.SpotLight('0xffffff');
spotLightForRose.position.set(0, 0, 0.6);
spotLightForRose.intensity = 4.5;
spotLightForRose.distance = 0.7;
spotLightForRose.angle = 1.2;
spotLightForRose.penumbra = 1.0;
spotLightForRose.decay = 1.7;
// spotLightForRose.castShadow = true;
spotLightForRose.shadowMapWidth = 2048;
spotLightForRose.shadowMapHeight = 2048;
// spotLightForRose.shadowCameraVisible = true;

var newSpotLight = new THREE.SpotLight('white');
newSpotLight.position.set(-5, 1, 3);
newSpotLight.intensity = 0.6;
newSpotLight.distance = 12;
newSpotLight.angle = 0.5;
newSpotLight.penumbra = 1.0;
newSpotLight.decay = 1.7;
newSpotLight.castShadow = true;
// newSpotLight.shadowCameraVisible = true;
newSpotLight.shadowMapWidth = 2048;
newSpotLight.shadowMapHeight = 2048;
// newSpotLight.shadow.bias = 0.001;
window.spot = newSpotLight;
scene.add(newSpotLight);
//
// var spotLightHelper = new THREE.SpotLightHelper(newSpotLight);
// scene.add(spotLightHelper);

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

function mouseOn() {
  shouldEmitMouseOnEvent = false;
  shouldEmitMouseOffEvent = true;
  dynamics.animate(redLight, {
    intensity: redLight.intensity + 0.60
  }, {
    duration: 1000
  });

  dynamics.animate(blueLight, {
    intensity: blueLight.intensity - 0.15
  }, {
    duration: 1000
  });

  if (loaded) {
    dynamics.animate(roseMaterial, {
      emissiveIntensity: roseMaterial.emissiveIntensity + 0.25
    }, {
      duration: 1000
    });

    dynamics.animate(roseMesh.scale, {
      x: roseMesh.scale.x + (roseMesh.userData.scale * 0.1),
      y: roseMesh.scale.y + (roseMesh.userData.scale * 0.1),
      z: roseMesh.scale.z + (roseMesh.userData.scale * 0.1)
    }, {
      duration: 1000
    });

    dynamics.animate(groupMaterial, {
      emissiveIntensity: 0.7,
      opacity: 1
    }, {
      duration: 1000
    });
  }
}

function mouseOff() {
  shouldEmitMouseOnEvent = true;
  shouldEmitMouseOffEvent = false;

  dynamics.animate(redLight, {
    intensity: redLight.intensity - 0.60
  }, {
    duration: 1000
  });

  dynamics.animate(blueLight, {
    intensity: blueLight.intensity + 0.15
  }, {
    duration: 1000
  });

  dynamics.animate(roseMaterial, {
    emissiveIntensity: roseMaterial.emissiveIntensity - 0.25
  }, {
    duration: 1000
  });

  dynamics.animate(roseMesh.scale, {
    x: roseMesh.scale.x - (roseMesh.userData.scale * 0.1),
    y: roseMesh.scale.y - (roseMesh.userData.scale * 0.1),
    z: roseMesh.scale.z - (roseMesh.userData.scale * 0.1)
  }, {
    duration: 1000
  });

  dynamics.animate(groupMaterial, {
    emissiveIntensity: 0.1,
    opacity: 0
  }, {
    duration: 2000
  });
}

function raycast() {
  if (!shouldSpin) return;
  raycaster.setFromCamera(new THREE.Vector2(mouseOffsetX, mouseOffsetY), camera);
  var intersects = raycaster.intersectObjects([mesh, roseMesh]);
  if (intersects.length > 0 && intersects[0].object.id === roseMesh.id) {
    document.body.style.cursor = 'pointer';
    if (shouldEmitMouseOnEvent) {
      mouseOn();
    }
  } else {
    document.body.style.cursor = 'auto';
    if (shouldEmitMouseOffEvent) {
      mouseOff();
    }
  }
}

function addSpheres() {
  var geom = new THREE.SphereGeometry(0.005);
  groupMaterial = new THREE.MeshStandardMaterial({
    metalness: 0.5,
    roughness: 0.5,
    // color: new THREE.Color(colours.lightBlue.r, colours.lightBlue.g, colours.lightBlue.b),
    emissive: 'red',
    emissiveIntensity: 0.1,
    transparent: true,
    opacity: 0,
    normalMap: materials.dotsNormalMap
  });


  group = new THREE.Group();
  for (var i = 0; i < 700; i++) {
    var mesh = new THREE.Mesh(geom, groupMaterial);
    mesh.position.set(_.random(-3.5, 3.5, true), _.random(-3.5, 3.5, true), _.random(-8, 8, true));
    group.add(mesh);
  }

  group.castShadow = true;
  scene.add(group);
}

// initialise
module.exports.init = function (triangles) {
  var background = new THREE.Color(colours.background.x / 255, colours.background.y / 255, colours.background.z / 255);
  scene.fog = new THREE.Fog(background, -1, 16);
  var geometries = generateGeometry(triangles);
  geometry = geometries.main;

  var spaceHeight = 2;
  var distance = 5;
  var fov = 2 * Math.atan(spaceHeight / (2 * distance)) * (180 / Math.PI);
  camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 300);
  camera.position.z = distance;
  controls = new OrbitControls(camera);

  mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;

  mesh.id2 = 'mainMesh';
  wireframe = new THREE.Mesh(geometry, wireframeMaterial);
  wireframe.castShadow = true;
  wireframe.scale.set(1, 1, 0.00000001);

  var radius = geometry.boundingBox.max.y + Math.abs(geometry.boundingBox.min.y);

  var sphereG = new THREE.SphereGeometry(radius / 4, 10, 10);
  sphere = new THREE.Mesh(sphereG, wireframeMaterial);

  rose.setSize(geometry.boundingBox.max.y);

  mesh.rotation.z = Math.PI;
  mesh.rotation.y = Math.PI;
  mesh.flipSided = true;
  mesh.doubleSided = true;
  mesh.morphTargetBase = 0;

  wireframe.rotation.copy(mesh.rotation);

  controls.update();

  var hemishphereLight = new THREE.HemisphereLight(0x00ff57, 0xff004a, 0.2);
  scene.add(hemishphereLight);

  scene.add(wireframe);
  scene.add(mesh);

  addSpheres();

  setInterval(raycast, 100);
  setInterval(updateMousePosition, 200);
};

function updateMousePosition() {
  var mouse = globals.getMousePosition();
  var mouseVertex = new THREE.Vector2(((mouse.x / space.size.x) - 0.5) * 2, (((mouse.y / space.size.y) - 0.5) * 2) * -1);
  mouseOffsetX = mouseVertex.x;
  mouseOffsetY = mouseVertex.y;
}

function addTheInsideMeshes(done) {
  scene.add(roseMesh);
  scene.add(aura);
  scene.add(redLight);
  scene.add(blueLight);
  scene.add(spotLightForRose);
  material.side = THREE.DoubleSide;
  material.transparent = false;
  material.needsUpdate = true;

  // startPulsing();
  done();
}

module.exports.render = function () {
  if (shouldSpin) {
    mesh.rotation.y += 0.007;
    sphere.rotation.y -= 0.006;
    aura.rotation.y -= 0.006;
    group.rotation.y -= 0.003;
    group.rotation.x -= 0.001;
  }

  if (loaded) {
    roseMaterial.needsUpdate = true;
  }

  mesh.scale.copy(wireframe.scale);
  mesh.scale.sub(new THREE.Vector3(0.001, 0.001, 0.001));
  wireframe.rotation.copy(mesh.rotation);

  spotLightForRose.lookAt(roseMesh);
  newSpotLight.lookAt(mesh);

  wireframeMaterial.needsUpdate = true;
  groupMaterial.needsUpdate = true;

  rose.updateRotation(mouseOffsetX, mouseOffsetY);
  // console.log(mouseOffsetX, mouseOffsetY, redLight.position.x, redLight.position.y);

  // spotLight.x += (mouseX - spotLight.x) * (easingStrength * delta);
  // blueLight.position.x += (mouseOffsetX - blueLight.position.x) * 0.1;
  // redLight.position.x += (mouseOffsetX - redLight.position.x) * 0.1;
  // redLight.position.y += (mouseOffsetY - redLight.position.y) * 0.1;
  // redLight.position.y += (mouseOffsetY - redLight.position.y) * 0.1;

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
