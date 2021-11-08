'use strict';

let windowWidth;
let windowHeight;

let targetRectX;
let targetRectY;
let targetRectWidth;
let targetRectHeight;

let targetWidth;
let targetHeight;
let targetX;
let targetY;

let targetWidthInMM = 479;
let targetHeightInMM = 1270;
let targetAspectRatio = targetWidthInMM / targetHeightInMM;

let measureSizeInMM = 300;

let targetRatio = 1.5;

let fontStyle = "14px sans-serif";

let pixelPerMM;

function drawTargetRect() {
  let canvas = document.getElementById('overlay-target');
  if (canvas.getContext) {
    let context = canvas.getContext('2d');

    context.lineWidth = 2;
    context.strokeStyle = "#ff0000";

    targetRectWidth = windowWidth / 2;
    targetRectHeight = windowHeight / 1.5;
    targetRectX = (windowWidth - targetRectWidth) / 2;
    targetRectY = (windowHeight - targetRectHeight) / 2;

    context.strokeRect(targetRectX, targetRectY, targetRectWidth, targetRectHeight);
  }
}

function drawMeasure() {
  let canvas = document.getElementById('overlay-measure');
  if (canvas.getContext) {
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, windowWidth, windowHeight);

    let image = new Image();
    image.src = './image/measure.png';
    image.onload = () => {
      context.save();
      let measureWidth = measureSizeInMM * pixelPerMM;
      let measureHeight = measureWidth * (image.height / image.width);
      let measureX = targetX;
      let measureY = targetY + targetHeight;
      context.globalAlpha = 0.5;
      context.drawImage(image, measureX, measureY, measureWidth, measureHeight);
      context.restore();

      context.textBaseline = "top";
      context.textAlign = "right";
      drawText(context, Math.ceil(measureSizeInMM / 10) + "cm", measureX + measureWidth, measureY + measureHeight + 2);
      context.restore();
    }
  }
}

function drawTarget() {
  let canvas = document.getElementById('overlay-target');
  if (canvas.getContext) {
    let context = canvas.getContext('2d');
    context.clearRect(0, 0, windowWidth, windowHeight);

    let image = new Image();
    image.src = './image/image_icebox.png';
    image.onload = () => {
      context.save();
      context.globalAlpha = 1.0;
      context.drawImage(image, targetX, targetY, targetWidth, targetHeight);
      context.restore();

      context.textBaseline = "bottom";
      context.textAlign = "right";
      drawText(context, Math.ceil(targetWidthInMM / 10) + "cm", targetX + targetWidth, targetY - 2);
      context.restore();

      context.textBaseline = "top";
      context.textAlign = "left";
      drawText(context, Math.ceil(targetHeightInMM / 10) + "cm", targetX + targetWidth + 2, targetY + 2);
      context.restore();
    }
  }
}

function drawText(context, text, x, y) {
  context.globalAlpha = 1;
  context.font = fontStyle;
  context.shadowColor = "#000000";
  context.shadowOffsetX = 0;
  context.shadowOffsetY = 0;
  context.shadowBlur = 1;
  context.strokeStyle = "#000000";
  context.strokeText(text, x, y);
  context.fillStyle = "#ffffff";
  context.fillText(text, x, y);
}

function zoomIn() {
  console.log('zoomIn');

  targetRatio -= 0.1;
  updateCanvas();
}

function zoomOut() {
  console.log('zoomOut');

  targetRatio += 0.1;
  updateCanvas();
}

function updateCanvas() {
  if (targetAspectRatio < 1) {
    targetHeight = windowHeight / targetRatio;
    targetWidth = targetHeight * targetAspectRatio;
  } else {
    targetWidth = windowWidth / targetRatio;
    targetHeight = targetWidth / targetAspectRatio;
  }
  targetX = (windowWidth - targetWidth) / 2;
  targetY = (windowHeight - targetHeight) / 2;
  pixelPerMM = targetWidth / targetWidthInMM;

  drawTarget();
  drawMeasure();
}

window.onload = function() {
  let canvasTarget = document.getElementById('overlay-target');
  let canvasMeasure = document.getElementById('overlay-measure');
  let divControl = document.getElementById('overlay-control');
  divControl.width = canvasMeasure.width = canvasTarget.width = windowWidth = window.innerWidth;
  divControl.width = canvasMeasure.height =canvasTarget.height = windowHeight = window.innerHeight;

  updateCanvas();
}