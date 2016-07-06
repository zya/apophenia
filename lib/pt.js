'use strict';

var pt = require('ptjs');
var spotLightRatio = 18;

var background = new pt.Color(0.4, 8.6, 15.3).setMode('rgb');
var space = new pt.CanvasSpace('canvas', background.rgb()).display('#pt', function() {}, true);
space.autoResize(true);
var form = new pt.Form(space);
var spotLight = new pt.Circle(250, 250).setRadius(space.size.x / spotLightRatio);

module.exports.space = space;
module.exports.form = form;
module.exports.spotLight = spotLight;
module.exports.spotLightRatio = 20;
module.exports.lib = pt;
