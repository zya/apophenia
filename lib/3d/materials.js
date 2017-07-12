'use strict';

var THREE = require('three');
var textureLoader = new THREE.TextureLoader();

var colours = require('../colours');
var urlPath = location.pathname;
var dotsNormalMap = textureLoader.load(urlPath + 'assets/images/dots-normal-map-resized.jpg');

var shellMaterial = new THREE.MeshStandardMaterial({
  morphTargets: true,
  morphNormals: true,
  shading: THREE.FlatShading,
  side: THREE.FrontSide,
  vertexColors: THREE.FaceColors,
  transparent: true,
  opacity: 0,
  envMapIntensity: 0.2,
  emissive: colours.background.hex(),
  roughness: 0.45,
  metalness: 0.85,
  normalMap: dotsNormalMap,
  normalScale: new THREE.Vector2(0.01, 0.01)
});

var depth = new THREE.ShaderMaterial({
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}',
  fragmentShader: 'varying vec2 vUv;void main() {gl_FragColor = vec4( vec3( vUv, 0. ), 1. );}'
});

var wireframe = new THREE.MeshLambertMaterial({
  wireframe: true,
  wireframeLinewidth: 0.5,
  morphTargets: true,
  transparent: true,
  emissive: colours.darkerBlue.hex(),
  opacity: 1
});

module.exports.shell = shellMaterial;
module.exports.depth = depth;
module.exports.wireframe = wireframe;
module.exports.dotsNormalMap = dotsNormalMap;
