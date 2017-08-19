'use strict';

var colours = require('./colours');

var orange = 'rgb(' + colours.orange.x + ',' + colours.orange.y + ',' + colours.orange.z + ')';
var blue = 'rgb(' + colours.lightBlue.x + ',' + colours.lightBlue.y + ',' + colours.lightBlue.z + ')';
var red = 'rgb(' + colours.red.x + ',' + colours.red.y + ',' + colours.red.z + ')';

var narrative = [
  {
    hidden: false,
    text: 'THINGS ARE CONNECTED.<br>YOU\'LL ONLY SEE<br>WHEN YOU ARE LOOKING.'
  },
  {
    hidden: true,
    text: null
  },
  {
    hidden: false,
    text: 'THINGS ARE CONNECTED.<br>BUT SOME CONNECTIONS<br>ARE MORE <span style="color: orange; text-shadow: 0px 0px 0px grey;">IMPORTANT</span> THAN OTHERS.'.replace('orange', orange)
  },
  {
    hidden: true
  },
  {
    hidden: false,
    text: 'WITHIN THE CONNECTIONS,<br>YOU\'LL START TO SEE <span style="color: blue; text-shadow: 0px 0px 0px grey;">SHAPES</span>.'.replace('blue', blue)
  },
  {
    hidden: true
  },
  {
    hidden: false,
    text: 'AND IF YOU KEEP ON LOOKING...'
  },
  {
    hidden: true
  },
  {
    hidden: false,
    text: 'YOU\'LL FIND<br>NEW <span style="color: red; text-shadow: 0px 0px 0px grey;">DIMENSIONS</span>.'.replace('red', red)
  },
  {
    hidden: true
  },
  {
    hidden: false,
    text: 'EXPLORE YOUR FINDINGS.<br>THEY WON\'T LAST LONG.'.replace('red', red)
  },
  {
    hidden: true
  },
  {
    hidden: false,
    text: 'THINGS ARE CONNECTED.<br>YOU ARE THE CONNECTION.'
  },
  {
    hidden: true
  }
];

var element = document.getElementById('narrative');

var currentIndex = 0;
var lastAnimationStarted = 0;

module.exports.proceed = function () {
  var currentState = narrative[currentIndex];
  if (!currentState) return;
  currentIndex++;

  var delta = Date.now() - lastAnimationStarted;
  var time = 1000;
  var animationDuration = 3500;

  if (currentState.hidden) {
    setTimeout(function () {
      lastAnimationStarted = Date.now();
      element.style.opacity = 0;
      setTimeout(function () {
        element.innerHTML = '';
        element.style.visibility = 'hidden';
      }, animationDuration);
    }, time);
    return;
  }

  if (delta < 3000) {
    time = 3000;
  }

  setTimeout(function () {
    element.innerHTML = currentState.text;
    lastAnimationStarted = Date.now();
    element.style.visibility = 'visible';
    element.style.opacity = 1;
  }, time);
};

module.exports.reset = function () {
  currentIndex = 0;
};
