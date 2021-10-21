'use strict';

function draw() {
  let canvas = document.getElementById('overlay');
  if (canvas.getContext) {
    let context = canvas.getContext('2d');

    context.lineWidth = 5;
    context.strokeStyle = "#f00";
    context.strokeRect(10, 10, 100, 50);
  }
}

window.onload = function() {
  draw();
}