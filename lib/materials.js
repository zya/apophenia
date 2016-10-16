'use strict';

var THREE = require('three');
var textureLoader = new THREE.TextureLoader();

var darkNavyBlue = require('./colours').darkNavyBlue;
var stoneBumpMap = textureLoader.load('../assets/images/stone-bump-map-01.jpg');
var stoneNormalMap = textureLoader.load('../assets/images/stone-normal-map-01.jpg');

var path = '../assets/images/skybox/';
var format = '.jpg';
var urls = [
	path + 'px' + format,
  path + 'nx' + format,
	path + 'py' + format,
  path + 'ny' + format,
	path + 'pz' + format,
  path + 'nz' + format
];

var reflectionCube = new THREE.CubeTextureLoader().load(urls);
reflectionCube.format = THREE.RGBFormat;

var shellMaterial = new THREE.MeshStandardMaterial({
  morphTargets: true,
  morphNormals: true,
  shading: THREE.FlatShading,
  side: THREE.FrontSide,
  vertexColors: THREE.FaceColors,
  transparent: true,
  opacity: 0,
  envMap: reflectionCube,
  envMapIntensity: 1.0,
  emissive: 0x1c00499,
  emissiveIntensity: 0.03,
  roughness: 0.6,
  metalness: 0.9,
  color: new THREE.Color(darkNavyBlue.x / 255, darkNavyBlue.y / 255, darkNavyBlue.z / 255),
  emissiveMap: stoneBumpMap,
  normalMap: stoneNormalMap,
  normalScale: new THREE.Vector2(0.05, 0.05)
    // combine: THREE.MixOperation,
    // reflectivity: 0.25,
    // specular: 0xaa0000,
    // refractionRatio: 0.3
    // normalScale: new THREE.Vector2(0, 0)
});

var depth = new THREE.ShaderMaterial({
  vertexShader: 'varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}',
  fragmentShader: 'varying vec2 vUv;void main() {gl_FragColor = vec4( vec3( vUv, 0. ), 1. );}'
});

var wireframe = new THREE.MeshNormalMaterial({
  morphTargets: true,
  side: THREE.FrontSide,
  wireframe: true,
  transparent: true,
  wireframeLinewidth: 1.4,
  opacity: 0
});

module.exports.shell = shellMaterial;
module.exports.depth = depth;
module.exports.wireframe = wireframe;
