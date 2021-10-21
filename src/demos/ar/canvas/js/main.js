'use strict';

let windowWidth;
let windowHeight;

let targetRectX;
let targetRectY;
let targetRectWidth;
let targetRectHeight;

function drawTargetRect() {
  let canvas = document.getElementById('overlay');
  if (canvas.getContext) {
    let context = canvas.getContext('2d');

    context.lineWidth = 2;
    context.strokeStyle = "#ff0000";

    targetRectWidth = windowWidth / 2;
    targetRectHeight = windowHeight / 1.5;
    targetRectX = (windowWidth - targetRectWidth) / 2;
    targetRectY = (windowHeight - targetRectHeight) / 2;

    console.log('targetRectX: ' + targetRectX);
    console.log('targetRectY: ' + targetRectY);
    console.log('targetRectWidth: ' + targetRectWidth);
    console.log('targetRectHeight: ' + targetRectHeight);

    context.strokeRect(targetRectX, targetRectY, targetRectWidth, targetRectHeight);
  }
}

function drawMeasure() {
  let canvas = document.getElementById('overlay');
  if (canvas.getContext) {
    let context = canvas.getContext('2d');

    let image = new Image();
    image.src = './image/measure.png';
    image.onload = () => {
      let measureWidth = windowWidth / 4;
      let measureHeight = measureWidth / 4.8;
      let measureX = targetRectX + 2;
      let measureY = (targetRectY + targetRectHeight) - measureHeight;
      context.globalAlpha = 0.5;
      context.drawImage(image, measureX, measureY, measureWidth, measureHeight);
    }
  }
}

window.onload = function() {
  let canvas = document.getElementById('overlay');
  canvas.width = windowWidth = window.innerWidth;
  canvas.height = windowHeight = window.innerHeight;

  drawTargetRect();
  drawMeasure();
}