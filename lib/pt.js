'use strict';

var pt = require('ptjs');
var config = require('../config');
var colours = require('./colours');
var spotLightRatio = config.spotLightSizeRatio;

var background = colours.background.rgb();
var space = new pt.CanvasSpace('#pt').setup({
  bgcolor: background,
  retina: true
});
space.autoResize(true);
var form = new pt.Form(space);
var spotLight = new pt.Circle(250, 250).setRadius(space.size.x / spotLightRatio);

module.exports.space = space;
module.exports.form = form;
module.exports.spotLight = spotLight;
module.exports.spotLightRatio = spotLightRatio;
module.exports.lib = pt;
