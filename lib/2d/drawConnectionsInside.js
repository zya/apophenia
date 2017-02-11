'use strict';

var Delaunay = require('faster-delaunay');

var pt = require('./pt');
var colours = require('../colours');
var form = pt.form;

function preparePointsForTriangulation(point) {
  return [point.x, point.y];
}

function triangulate(points) {
  var pointsForTriangulation = points.map(preparePointsForTriangulation);
  var delaunay = new Delaunay(pointsForTriangulation);
  var triangles = delaunay.triangulate();
  var trianglesToDraw = [];
  if (triangles.length > 0) {
    for (var i = 0; i < triangles.length; i += 3) {
      var tri = new pt.lib.Triangle(triangles[i]);
      tri.to(triangles[i + 1], triangles[i + 2]);
      trianglesToDraw.push(tri);
    }
  }

  return trianglesToDraw;
}

function drawConnectionsInside(points) {
  if (points.length > 2) {
    // triangulate the points inside the spot light
    var trianglesToDraw = triangulate(points);
    //draw the triangles
    trianglesToDraw.forEach(function (triangle) {
      form.stroke(colours.orange);
      form.triangle(triangle);
    });

  } else {
    points.forEach(function (point1, index1) {
      points.forEach(function (point2, index2) {
        if (index1 === index2) return;
        form.stroke(colours.orange);
        var line = new pt.lib.Line(point1).to(point2);
        form.line(line);
      });
    });
  }
}

module.exports = drawConnectionsInside;
