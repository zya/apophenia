var pt = require('ptjs');
var _ = require('lodash');

var backgroundColor = '#FDFFFC';
var darkNavyBlue = '#011627';
var orange = '#FF9F1C';
var lightBlue = '#2EC4B6';
var red = '#E71D36';

var space = new pt.CanvasSpace('canvas', darkNavyBlue).display('#pt', function() {}, true);
space.autoResize(true);


var form = new pt.Form(space);

var dot = new pt.Circle(250, 250).setRadius(space.size.x / 13);
var smallDot = new pt.Circle().setRadius(3);
var points = [];

window.addEventListener('resize', function() {
  dot.radius = space.size.x / 13;
  points.forEach(function(point) {
    point.set(Math.random() * space.size.x, Math.random() * space.size.y);
  });

});

for (var i = 0; i < 100; i++) {
  var point = new pt.Vector(Math.random() * space.size.x, Math.random() * space.size.y);
  points.push(point);
}

var currentPoints = [];
var bot = {
  animate: function(time, fs, context) {
    form.fill(backgroundColor).stroke(false);
    form.circle(dot);
    var pointsInsideCircle = [];
    points.forEach(function(pt) {
      pt.set(pt.x + (Math.random() - 0.5), pt.y + (Math.random() - 0.5));
      var intersected = dot.intersectPoint(pt);
      if (intersected) {
        form.fill(red).stroke(false);
        pointsInsideCircle.push(pt);
        form.point(pt, 2);
      } else {
        form.fill(lightBlue).stroke(false);
        form.point(pt, 1);
      }
    });

    if (pointsInsideCircle.length > 0) {
      space.space.style.cursor = 'pointer';
    } else {
      space.space.style.cursor = 'auto';
    }

    pointsInsideCircle.forEach(function(point, index) {
      pointsInsideCircle.forEach(function(point2, index2) {
        if (index === index2) return;
        form.stroke(orange);
        var line = new pt.Line(point).to(point2);
        form.line(line);
      });
    });

    if (!_.isEqual(currentPoints, pointsInsideCircle)) {
      console.log('CHANGE EVENT', pointsInsideCircle);
    }
    currentPoints = pointsInsideCircle;
  },
  onMouseAction: function(type, x, y) {
    if (type === 'move') {
      dot.set(x, y);
    }
  },
  onTouchAction: function(type, x, y, evt) {
    if (type === 'move') {
      var value = (window.innerWidth - evt.target.offsetWidth) / 2;
      dot.set(x - value, y);
    }

    evt.preventDefault();
  }
}

space.add(bot);
space.bindMouse();
space.bindTouch();
space.play();
