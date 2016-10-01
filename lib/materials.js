'use strict';

var THREE = require('three');

var darkNavyBlue = require('./colours').darkNavyBlue;

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
  side: THREE.Frontide,
  vertexColors: THREE.FaceColors,
  transparent: true,
  opacity: 0,
  envMap: reflectionCube,
  envMapIntensity: 1.3,
  roughness: 0.6,
  metalness: 0.9,
  color: new THREE.Color(darkNavyBlue.x / 255, darkNavyBlue.y / 255, darkNavyBlue.z / 255)
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
  color: 'white',
  transparent: true,
  wireframeLinewidth: 1.4,
  opacity: 0
});

module.exports.shell = shellMaterial;
module.exports.depth = depth;
module.exports.wireframe = wireframe;
