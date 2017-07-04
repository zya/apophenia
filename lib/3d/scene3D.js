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
var SHOUD_EMIT_MOUSE_ON_EVENT = true;
var SHOUD_EMIT_MOUSE_OFF_EVENT = false;
var SHOULD_SPIN = false;
var MESH_SHOULD_SPIN = true;
var SHOULD_UPDATE = false;
var IS_HOVER = false;
var LOADED = false;
var INTERSECT_TOGGLED = false;
var SHOULD_INTERSECT = true;
var SHOULD_FIRE_CLICK_EVENTS = true;
var IS_ROSE_CENTER_VISIBLE = false;

function restartGlobalVariables() {
  SHOUD_EMIT_MOUSE_ON_EVENT = true;
  SHOUD_EMIT_MOUSE_OFF_EVENT = false;
  SHOULD_SPIN = false;
  MESH_SHOULD_SPIN = true;
  SHOULD_UPDATE = false;
  IS_HOVER = false;
  INTERSECT_TOGGLED = false;
  SHOULD_INTERSECT = true;
  SHOULD_FIRE_CLICK_EVENTS = true;
  rose.reset();
  aura.reset();
  auraMesh.visible = false;
  camera.position.z = distance;
  material.side = THREE.FrontSide;
  material.needsUpdate = true;
  spotLightForRose.intensity = 0;
  redLight.intensity = 0;
  blueLight.intensity = 0;
}

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

var spinStartCallback = _.noop();
var growStartCallback = _.noop();
var growFinishCallback = _.noop();
var roseHoverOnCallback = _.noop();
var roseHoverOffCallback = _.noop();
var roseClickCallback = _.noop();

rose.load(function (err, mesh, material) {
  LOADED = true;
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

var blueLightIntensitiInitial = 0.25;
var blueLight = new THREE.PointLight('blue');
blueLight.intensity = 0;
blueLight.distance = 6;
blueLight.decay = 0.03;
blueLight.position.z = 0.3;
// blueLight.shadow.bias = 0.01;
// blueLight.castShadow = true;
// blueLight.shadowMapWidth = 2048;
// blueLight.shadowMapHeight = 2048;

var spotLightForRoseIntensityInitial = 1.25;
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

var dynamicSpotLightInitialIntensity = 0.25;
var dynamicSpotLight = new THREE.SpotLight('blue');
dynamicSpotLight.position.set(-5, 1, 4);
dynamicSpotLight.intensity = 0;
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
  var duration = 5500;
  async.parallel([
    function morphTo3D(cb) {
      growStartCallback();
      dynamics.animate(wireframe.scale, {
        z: 1.0,
        x: 1.1,
        y: 1.1
      }, {
        duration: duration
      });

      dynamics.animate(mesh.scale, {
        z: 1.0,
        x: 1.1,
        y: 1.1
      }, {
        duration: duration
      });

      dynamics.animate(dynamicSpotLight, {
        intensity: dynamicSpotLightInitialIntensity
      }, {
        duration: duration
      });

      setTimeout(cb, duration);
    },
    function revealTheBody(cb) {
      dynamics.animate(material, {
        opacity: 1
      }, {
        duration: 800
      });
      setTimeout(cb, 1300);
    }
  ], function () {
    growFinishCallback();
    done();
  });
}

function startSpinning(done) {
  setTimeout(function () {
    SHOULD_SPIN = true;
    spinStartCallback();
    dynamics.animate(spin, {
      speed: 0.007
    }, {
      duration: 2000,
      type: dynamics.easeIn,
      friction: 35
    });
    done();
  }, 2000);
}

function mouseOn() {
  SHOUD_EMIT_MOUSE_ON_EVENT = false;
  SHOUD_EMIT_MOUSE_OFF_EVENT = true;
  IS_HOVER = true;

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

  if (LOADED) {
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

  if (SHOULD_SPIN) {
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
  SHOUD_EMIT_MOUSE_ON_EVENT = true;
  SHOUD_EMIT_MOUSE_OFF_EVENT = false;
  IS_HOVER = false;

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

  if (SHOULD_SPIN) {
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
  if (!SHOULD_SPIN || !SHOULD_INTERSECT) return;
  raycaster.setFromCamera(new THREE.Vector2(mouseOffsetX, mouseOffsetY), camera);
  var objects = INTERSECT_TOGGLED ? [roseMesh] : [mesh, roseMesh];
  var intersects = raycaster.intersectObjects(objects);
  if (intersects.length > 0 && intersects[0].object.id === roseMesh.id) {
    document.body.style.cursor = 'pointer';
    if (SHOUD_EMIT_MOUSE_ON_EVENT) {
      mouseOn();
    }
  } else {
    document.body.style.cursor = 'auto';
    if (SHOUD_EMIT_MOUSE_OFF_EVENT) {
      mouseOff();
    }
  }
}

function isRoseCenterVisible() {
  if (!SHOULD_SPIN || !SHOULD_INTERSECT) return;
  raycaster.setFromCamera(new THREE.Vector2(-0.3, 0), camera);
  var objects = [mesh, roseMesh];
  var intersects = raycaster.intersectObjects(objects);
  if (intersects.length > 0 && intersects[0].object.id === roseMesh.id) {
    IS_ROSE_CENTER_VISIBLE = true;
  } else {
    IS_ROSE_CENTER_VISIBLE = false;
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

function scaleGroup() {
  var target = _.random(1.05, 1.12);
  dynamics.animate(group.scale, {
    x: target + _.random(-0.03, 0.03),
    y: target + _.random(-0.03, 0.03),
    z: target + _.random(-0.03, 0.03)
  }, {
    duration: 500
  });

  setTimeout(function () {
    dynamics.animate(group.scale, {
      x: 1,
      y: 1,
      z: 1
    }, {
      duration: 800
    });
  }, 500);
}

addSpheres();

module.exports.mousedown = function () {
  if (IS_HOVER && LOADED && SHOULD_FIRE_CLICK_EVENTS) {
    rose.distort();
    aura.distort();
    roseClickCallback();
    scaleGroup();
  }
};

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

renderer.init(scene, camera, _.noop);

// initialise
module.exports.init = function (triangles, done) {
  restartGlobalVariables();
  generateGeometry(triangles, function (err, geometries) {
    // var start = Date.now();
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
    spotLightForRose.position.set(0, 0, geometry.boundingBox.max.z / 1.5);
    dynamicSpotLight.position.set(-5, 1, geometry.boundingBox.max.z * 5);
    blueLight.position.set(0, 0, geometry.boundingBox.max.z / 2.5);

    mesh.rotation.z = Math.PI;
    mesh.rotation.y = Math.PI;
    mesh.flipSided = true;
    mesh.doubleSided = true;
    mesh.morphTargetBase = 0.00001;

    wireframe.rotation.copy(mesh.rotation);
    wireframeMaterial.opacity = 1;

    scene.add(wireframe);
    setTimeout(function () {
      scene.add(mesh);
    }, 1000);

    setInterval(raycast, 100);
    setInterval(updateMousePosition, 100);
    setInterval(isRoseCenterVisible, 100);

    SHOULD_UPDATE = true;
    done();
  });
};

function updateMousePosition() {
  if (!SHOULD_INTERSECT) return;
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
  if (SHOULD_SPIN) {
    if (MESH_SHOULD_SPIN) mesh.rotation.y += spin.speed;

    auraMesh.rotation.y -= 0.006;
    group.rotation.y -= 0.003;
    group.rotation.x -= 0.001;
  }

  if (LOADED) {
    roseMaterial.needsUpdate = true;
  }

  if (SHOULD_UPDATE) {
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
  }

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
  if (event === 'growFinish') growFinishCallback = cb;
  if (event === 'roseHoverOn') roseHoverOnCallback = cb;
  if (event === 'roseHoverOff') roseHoverOffCallback = cb;
  if (event === 'roseClick') roseClickCallback = cb;
};

module.exports.explode = function () {
  console.log('exploding the 3D objects');
};

module.exports.explodeTheMesh = function () {
  var duration = 3000;

  dynamics.animate(material, {
    opacity: 0
  }, {
    duration: duration
  });

  setTimeout(function () {
    scene.remove(mesh);
  }, duration + 100);
};

module.exports.explodeTheWireFrame = function (cb) {
  var duration = 3000;

  dynamics.animate(wireframeMaterial, {
    opacity: 0
  }, {
    duration: duration
  });

  setTimeout(function () {
    scene.remove(wireframe);
    cb();
  }, duration + 100);
};

module.exports.removeHoverAnimations = function () {

};

module.exports.stopMovement = function () {
  dynamics.animate(spin, {
    speed: 0
  }, {
    duration: 2000,
    type: dynamics.easeIn,
    friction: 35
  });

  setTimeout(function () {
    MESH_SHOULD_SPIN = false;
  }, 2100);
};

module.exports.zoom = function (progress) {
  var maxZ = geometry.boundingBox.max.z;
  var distance = Math.abs(maxZ - camera.position.z);
  if (progress > 0.1 && distance > maxZ * 4) {
    camera.position.z -= (progress - 0.1) * 0.02;
  }
};

module.exports.reactToAudio = function () {
  aura.distort();
};

module.exports.toggleIntersect = function () {
  INTERSECT_TOGGLED = true;
};

module.exports.stopFiringClickEvents = function () {
  SHOULD_FIRE_CLICK_EVENTS = false;
};

module.exports.finish = function (cb) {
  SHOULD_INTERSECT = false;
  document.body.style.cursor = 'auto';

  async.series([
    aura.fadeOut,
    rose.fadeOut
  ], function () {
    mouseOff();
    cb();
  });
};

module.exports.isRoseCenterVisible = function () {
  return IS_ROSE_CENTER_VISIBLE;
};
