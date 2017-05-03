'use strict';

var narrative = [
  {
    hidden: false,
    text: 'THINGS ARE CONNECTED<br>YOU\'LL ONLY SEE<br>WHEN YOU ARE LOOKING'
  },
  {
    hidden: true,
    text: null
  },
  {
    hidden: false,
    text: 'THINGS ARE CONNECTED<br>BUT SOME CONNECTIONS<br>ARE MORE IMPORTANT THAN OTHERS'
  },
  {
    hidden: true
  },
  {
    hidden: false,
    text: 'WITHIN THE CONNECTIONS<br>YOU\'LL START TO SEE SHAPES'
  },
  {
    hidden: true
  },
  {
    hidden: false,
    text: 'AND WITHIN THOSE SHAPES<br>YOU\'LL FIND NEW DIMENSIONS'
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

  if (currentState.hidden) {
    setTimeout(function () {
      lastAnimationStarted = Date.now();
      element.style.opacity = 0;
    }, time);
    return;
  }

  if (delta < 3000) {
    time = 3000;
  }

  setTimeout(function () {
    element.innerHTML = currentState.text;
    lastAnimationStarted = Date.now();
    element.style.opacity = 1;
  }, time);
};
