'use strict';

var dynamics = require('dynamics.js');
var colours = require('../colours');

var THREE = require('three');
window.THREE = THREE;
require('./allTheNodes');
require('../../node_modules/three/examples/js/shaders/CopyShader');
require('../../node_modules/three/examples/js/shaders/BokehShader');
require('../../node_modules/three/examples/js/shaders/ConvolutionShader');
require('../../node_modules/three/examples/js/shaders/LuminosityHighPassShader');
require('../../node_modules/three/examples/js/shaders/FXAAShader');
require('../../node_modules/three/examples/js/postprocessing/EffectComposer');
require('../../node_modules/three/examples/js/postprocessing/RenderPass');
require('../../node_modules/three/examples/js/postprocessing/ShaderPass');
require('../../node_modules/three/examples/js/postprocessing/UnrealBloomPass');
require('../../node_modules/three/examples/js/postprocessing/BokehPass');
require('../../node_modules/three/examples/js/nodes/postprocessing/NodePass');

var camera, scene;

var renderer = new THREE.WebGLRenderer({
  alpha: true
});

var dpr = 1;
if (window.devicePixelRatio !== undefined) {
  dpr = window.devicePixelRatio === 2 ? 1.3 : window.devicePixelRatio;
}

renderer.setClearColor(colours.background.hex(), 1);

renderer.domElement.className = 'test';
renderer.domElement.style.visibility = 'hidden';
renderer.domElement.style.opacity = 0;

renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
// renderer.shadowMap.cullFace = THREE.CullFaceBack;
renderer.shadowMap.renderReverseSided = false;
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('pt').appendChild(renderer.domElement);

// var parameters = {
//   minFilter: THREE.LinearFilter,
//   magFilter: THREE.LinearFilter,
//   format: THREE.RGBAFormat,
//   stencilBuffer: false
// };

// var renderTarget = new THREE.WebGLRenderTarget(window.innerWidth, window.innerHeight, parameters);

var composer = new THREE.EffectComposer(renderer);
composer.renderTarget1.texture.format = THREE.RGBAFormat;
composer.renderTarget2.texture.format = THREE.RGBAFormat;
composer.setSize(window.innerWidth * dpr, window.innerHeight * dpr);

module.exports.init = function (_scene, _camera, done) {
  var start = Date.now();
  camera = _camera;
  scene = _scene;

  var renderPass = new THREE.RenderPass(scene, camera);
  renderPass.clearAlpha = 0;
  composer.addPass(renderPass);

  var fxaa = new THREE.ShaderPass(THREE.FXAAShader);
  fxaa.uniforms.resolution.value.set(1 / (window.innerWidth * dpr), 1 / (window.innerHeight * dpr));
  composer.addPass(fxaa);

  var bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.9, 0.7, 0.5);
  composer.addPass(bloomPass);

  var screen = new THREE.ScreenNode();
  var saturation = new THREE.FloatNode(1.0);
  var satNode = new THREE.ColorAdjustmentNode(screen, saturation, THREE.ColorAdjustmentNode.SATURATION);
  var contrast = new THREE.FloatNode(1.0);
  var contrastNode = new THREE.ColorAdjustmentNode(satNode, contrast, THREE.ColorAdjustmentNode.CONTRAST);

  var nodepass = new THREE.NodePass();
  nodepass.value = contrastNode;
  nodepass.build();
  composer.addPass(nodepass);

  var copyShader = new THREE.ShaderPass(THREE.CopyShader);
  copyShader.renderToScreen = true;
  composer.addPass(copyShader);

  // var bokehPass = new THREE.BokehPass(scene, camera, {
  //   focus: 1.0,
  //   aperture: 0.1,
  //   maxblur: 3.0,
  //   width: window.innerWidth,
  //   height: window.innerHeight
  // });
  // bokehPass.renderToScreen = true;
  // composer.addPass(bokehPass);

  done();
  console.log(Date.now() - start, 'Renderer Init');
};

module.exports.render = function (scene, camera) {
  composer.render();
  // renderer.render(scene, camera);
};

module.exports.addClickListener = function (cb) {
  renderer.domElement.addEventListener('click', cb);
};

module.exports.display = function (done) {
  renderer.domElement.style.visibility = 'visible';

  var duration = 5000;
  setTimeout(function () {
    dynamics.animate(renderer.domElement, {
      opacity: 1
    }, {
      duration: duration
    });

    setTimeout(done, duration);
  }, 50);
};

module.exports.hide = function () {
  renderer.domElement.style.visibility = 'hidden';
};
