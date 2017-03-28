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
  }
];
var element = document.getElementById('narrative');

var currentIndex = 0;
module.exports.proceed = function () {
  var currentState = narrative[currentIndex];
  if (!currentState) return;
  currentIndex++;

  if (currentState.hidden) {
    setTimeout(function () {
      element.style.opacity = 0;
    }, 1000);
    return;
  }

  setTimeout(function () {
    element.style.opacity = 1;
  }, 1000);
  element.innerHTML = currentState.text;
};
