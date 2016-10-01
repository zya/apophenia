'use strict';

var THREE = require('three');
window.THREE = THREE;
require('../node_modules/three/examples/js/loaders/OBJLoader');

var loader = new THREE.OBJLoader();
var scale = 0.028;

var material = new THREE.MeshStandardMaterial({
  color: 'red',
  side: THREE.DoubleSide,
  shading: THREE.SmoothShading
});

// roseWireframe = new THREE.Mesh(geo, wireframeMaterial);
// roseWireframe.scale.copy(rose.scale);
// roseWireframe.rotation.copy(rose.rotation);

module.exports.load = function (cb) {
  loader.load('../assets/rose.obj', function (object) {
    var geo = object.children[0].geometry;
    geo.center();

    var rose = new THREE.Mesh(geo, material);
    rose.scale.set(scale, scale, scale);
    rose.rotation.z = (2 * Math.PI) / 4;
    rose.rotation.y = (2 * Math.PI) / 4;

    cb(rose);
  });
};
