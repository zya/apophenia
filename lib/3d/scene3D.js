'use strict';

var THREE = require('three');
var _ = require('lodash');
var dynamics = require('dynamics.js');
var async = require('async');
// var OrbitControls = require('three-orbit-controls')(THREE);

var generateGeometry = require('./generate3DGeometry');
var renderer = require('./renderer');
var globals = require('../globals');
var colours = require('../colours');
var space = require('../2d/pt').space;
var materials = require('./materials');
var rose = require('./rose');
var aura = require('./aura');
var auraMesh = aura.mesh;

var geometry, mesh, wireframe, camera, group, groupMaterial;
// var controls;
var shouldEmitMouseOnEvent = true;
var shouldEmitMouseOffEvent = false;
var shouldSpin = false;
var isHover = false;
// scene and camera
var scene = new THREE.Scene();

var roseMesh = new THREE.Object3D();
var roseMaterial;
var raycaster = new THREE.Raycaster();

var mouseOffsetX = 0;
var mouseOffsetY = 0;

var spin = {
  speed: 0
};

var loaded = false;

var spinStartCallback = function () {};
var growStartCallback = function () {};
var roseHoverOnCallback = function () {};
var roseHoverOffCallback = function () {};
var roseClickCallback = function () {};

rose.load(function (err, mesh, material) {
  loaded = true;
  roseMesh = mesh;
  // roseMesh.visible = false;
  auraMesh.visible = false;
  roseMaterial = material;
  scene.add(roseMesh);
  scene.add(auraMesh);
});

// main material
var material = materials.shell;

// wire frame material
var wireframeMaterial = materials.wireframe;

// var lightHelper = new THREE.SpotLightHelper(spotLight);
// scene.add(lightHelper);

var redLightIntensityInitial = 0.01;
var redLight = new THREE.PointLight('red');
redLight.intensity = 0;
redLight.distance = 9;
redLight.decay = 0.02;
redLight.position.z = 0.2;
redLight.castShadow = true;
redLight.shadow.mapSize.width = 2048;
redLight.shadow.mapSize.height = 2048;

var blueLightIntensitiInitial = 0.35;
var blueLight = new THREE.PointLight('blue');
blueLight.intensity = 0;
blueLight.distance = 6;
blueLight.decay = 0.03;
blueLight.position.z = 0.3;
// blueLight.shadow.bias = 0.01;
// blueLight.castShadow = true;
// blueLight.shadowMapWidth = 2048;
// blueLight.shadowMapHeight = 2048;

var spotLightForRoseIntensityInitial = 1.4;
var spotLightForRose = new THREE.SpotLight('white');
spotLightForRose.position.set(0, 0, 0.6);
spotLightForRose.intensity = 0;
spotLightForRose.distance = 1;
spotLightForRose.angle = 1.2;
spotLightForRose.penumbra = 1.0;
spotLightForRose.decay = 1.7;
// spotLightForRose.castShadow = true;
// spotLightForRose.shadow.mapSize.width = 2048;
// spotLightForRose.shadow.mapSize.height = 2048;
// spotLightForRose.shadowCameraVisible = true;

var dynamicSpotLightInitialIntensity = 0.2;
var dynamicSpotLight = new THREE.SpotLight('white');
dynamicSpotLight.position.set(-5, 1, 4);
dynamicSpotLight.intensity = dynamicSpotLightInitialIntensity;
dynamicSpotLight.distance = 40;
dynamicSpotLight.angle = 0.9;
dynamicSpotLight.penumbra = 1.0;
dynamicSpotLight.decay = 1.7;
dynamicSpotLight.castShadow = true;
// dynamicSpotLight.shadowCameraVisible = true;
dynamicSpotLight.shadow.mapSize.width = 2048 * 2;
dynamicSpotLight.shadow.mapSize.height = 2048 * 2;
dynamicSpotLight.shadow.bias = -0.0001;
scene.add(dynamicSpotLight);

// var spotLightHelper = new THREE.SpotLightHelper(dynamicSpotLight);
// scene.add(spotLightHelper);

function scaleUpTo3D(done) {
  async.parallel([
    function morphTo3D(cb) {
      growStartCallback();
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

      setTimeout(cb, 2900);
    },
    function revealTheBody(cb) {
      dynamics.animate(material, {
        opacity: 1
      }, {
        duration: 800
      });
      setTimeout(cb, 1300);
    }
  ], done);
}

function startSpinning(done) {
  setTimeout(function () {
    shouldSpin = true;
    spinStartCallback();
    dynamics.animate(spin, {
      speed: 0.007
    }, {
      duration: 2000,
      type: dynamics.easeIn,
      friction: 35
    });
    done();
  }, 250);
}

function mouseOn() {
  shouldEmitMouseOnEvent = false;
  shouldEmitMouseOffEvent = true;
  isHover = true;

  dynamics.animate(redLight, {
    intensity: redLightIntensityInitial + 0.3
  }, {
    duration: 1000
  });

  dynamics.animate(dynamicSpotLight, {
    intensity: 0
  }, {
    duration: 1000
  });

  dynamics.animate(blueLight, {
    intensity: blueLightIntensitiInitial - 0.15
  }, {
    duration: 1000
  });

  dynamics.animate(spotLightForRose, {
    intensity: spotLightForRoseIntensityInitial - 0.1
  }, {
    duration: 1000
  });

  if (loaded) {
    dynamics.animate(roseMaterial, {
      emissiveIntensity: roseMaterial.userData.emissiveIntensityInitial + 0.80
    }, {
      duration: 1000
    });

    dynamics.animate(roseMaterial, {
      emissiveIntensity: roseMaterial.userData.emissiveIntensityInitial + 0.80
    }, {
      duration: 1000
    });

    dynamics.animate(groupMaterial, {
      emissiveIntensity: 0.7,
      opacity: 1
    }, {
      duration: 1000
    });

    rose.expand();
    roseHoverOnCallback();
  }

  if (shouldSpin) {
    dynamics.animate(spin, {
      speed: 0.007 / 3
    }, {
      duration: 1000,
      type: dynamics.easeOut,
      friction: 1
    });
  }

  aura.expand();
}

function mouseOff() {
  shouldEmitMouseOnEvent = true;
  shouldEmitMouseOffEvent = false;
  isHover = false;

  dynamics.animate(redLight, {
    intensity: redLightIntensityInitial
  }, {
    duration: 1000
  });

  dynamics.animate(blueLight, {
    intensity: blueLightIntensitiInitial
  }, {
    duration: 1000
  });

  dynamics.animate(roseMaterial, {
    emissiveIntensity: roseMaterial.userData.emissiveIntensityInitial
  }, {
    duration: 1000
  });

  dynamics.animate(spotLightForRose, {
    intensity: spotLightForRoseIntensityInitial
  }, {
    duration: 1000
  });

  dynamics.animate(dynamicSpotLight, {
    intensity: dynamicSpotLightInitialIntensity
  }, {
    duration: 1000
  });

  rose.reduce();

  dynamics.animate(groupMaterial, {
    emissiveIntensity: 0.1,
    opacity: 0
  }, {
    duration: 2000
  });

  if (shouldSpin) {
    dynamics.animate(spin, {
      speed: 0.007
    }, {
      duration: 2000,
      type: dynamics.easeOut,
      friction: 1
    });
  }

  aura.reduce();
  roseHoverOffCallback();
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
  for (var i = 0; i < 1000; i++) {
    var mesh = new THREE.Mesh(geom, groupMaterial);
    mesh.position.set(_.random(-3.5, 3.5, true), _.random(-3.5, 3.5, true), _.random(-8, 8, true));
    group.add(mesh);
  }

  // group.castShadow = true;
  scene.add(group);
}

addSpheres();

renderer.addClickListener(function () {
  if (isHover) {
    rose.distort();
    aura.distort();
    roseClickCallback();
  }
});

var background = new THREE.Color(colours.background.x / 255, colours.background.y / 255, colours.background.z / 255);
scene.fog = new THREE.Fog(background, 0, 16);

scene.add(redLight);
scene.add(blueLight);
scene.add(spotLightForRose);
var hemishphereLight = new THREE.HemisphereLight(0x00ff57, 0xff004a, 0.2);
scene.add(hemishphereLight);

var spaceHeight = 2;
var distance = 5;
var fov = 2 * Math.atan(spaceHeight / (2 * distance)) * (180 / Math.PI);
camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 300);
camera.position.z = distance;

// initialise
module.exports.init = function (triangles, done) {
  generateGeometry(triangles, function (err, geometries) {
    var start = Date.now();
    geometry = geometries.main;

    mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    mesh.id2 = 'mainMesh';
    wireframe = new THREE.Mesh(geometry, wireframeMaterial);

    // wireframe.castShadow = true;
    wireframe.scale.set(1, 1, 0.01);

    rose.setSize(geometry.boundingBox.max.x);
    aura.setSize(geometry.boundingBox.max.x);

    mesh.rotation.z = Math.PI;
    mesh.rotation.y = Math.PI;
    mesh.flipSided = true;
    mesh.doubleSided = true;
    mesh.morphTargetBase = 0.00001;

    wireframe.rotation.copy(mesh.rotation);

    scene.add(wireframe);
    scene.add(mesh);

    setInterval(raycast, 100);
    setInterval(updateMousePosition, 100);

    console.log(Date.now() - start, 'Scene Start');
    renderer.init(scene, camera, done);
  });
};

function updateMousePosition() {
  var mouse = globals.getMousePosition();
  var mouseVertex = new THREE.Vector2(((mouse.x / space.size.x) - 0.5) * 2, (((mouse.y / space.size.y) - 0.5) * 2) * -1);
  mouseOffsetX = mouseVertex.x;
  mouseOffsetY = mouseVertex.y;
}

function addInsideMeshes(done) {
  rose.reveal();

  spotLightForRose.intensity = spotLightForRoseIntensityInitial;
  redLight.intensity = redLightIntensityInitial;
  blueLight.intensity = blueLightIntensitiInitial;

  auraMesh.visible = true;
  material.side = THREE.DoubleSide;

  done();
}

module.exports.render = function () {
  if (shouldSpin) {
    mesh.rotation.y += spin.speed;
    // sphere.rotation.y -= 0.006;
    auraMesh.rotation.y -= 0.006;
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
  dynamicSpotLight.lookAt(roseMesh.position);

  wireframeMaterial.needsUpdate = true;
  groupMaterial.needsUpdate = true;

  rose.updateRotation(mouseOffsetX, mouseOffsetY);
  // console.log(mouseOffsetX, mouseOffsetY, redLight.position.x, redLight.position.y);

  // spotLight.x += (mouseX - spotLight.x) * (easingStrength * delta);
  // blueLight.position.x += (mouseOffsetX - blueLight.position.x) * 0.1;
  // redLight.position.x += (mouseOffsetX - redLight.position.x) * 0.1;
  // redLight.position.y += (mouseOffsetY - redLight.position.y) * 0.1;
  // redLight.position.y += (mouseOffsetY - redLight.position.y) * 0.1;
  dynamicSpotLight.position.x += ((mouseOffsetX * 3) - dynamicSpotLight.position.x) * 0.03;
  dynamicSpotLight.position.y += ((mouseOffsetY * 2) - dynamicSpotLight.position.y) * 0.03;
  redLight.position.x += (((mouseOffsetX * 0.5) - redLight.position.x) * 0.1);
  // redLight.position.y += (((mouseOffsetY * 1.3) - redLight.position.y) * 0.1) * -1;

  rose.update();
  aura.update();
  renderer.render(scene, camera);
};

module.exports.updateMorph = function (value) {
  mesh.morphTargetInfluences[0] = value;
  wireframe.morphTargetInfluences[0] = value;
  // material.bumpScale = value * 10;
};

module.exports.displayCanvas = function (done) {
  renderer.display(done);
};

module.exports.startTransition = function (done) {
  async.series([
    scaleUpTo3D,
    addInsideMeshes,
    startSpinning
    // startMovingLights
  ], done);
};

module.exports.hideCanvas = function () {
  renderer.hide();
};

module.exports.on = function (event, cb) {
  if (event === 'spinStart') spinStartCallback = cb;
  if (event === 'growStart') growStartCallback = cb;
  if (event === 'roseHoverOn') roseHoverOnCallback = cb;
  if (event === 'roseHoverOff') roseHoverOffCallback = cb;
  if (event === 'roseClick') roseClickCallback = cb;
};
