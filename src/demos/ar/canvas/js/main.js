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

    let image = new Image();
    image.src = './image/measure.png';
    image.onload = () => {
      let measureWidth = measureSizeInMM * pixelPerMM;
      let measureHeight = measureWidth * (image.height / image.width);
      let measureX = targetX;
      let measureY = targetY + targetHeight;
      context.globalAlpha = 0.5;
      context.drawImage(image, measureX, measureY, measureWidth, measureHeight);

      console.log(measureX);
      console.log(measureY);
      console.log(measureWidth);
      console.log(measureHeight);
    }
  }
}

function drawBottle() {
  let canvas = document.getElementById('overlay-target');
  if (canvas.getContext) {
    let context = canvas.getContext('2d');

    let image = new Image();
    image.src = './image/plastic_bottle_01.png';
    image.onload = () => {
      let measureWidth = windowWidth / 10;
      let measureHeight = measureWidth / 0.32;
      let measureX = targetRectX + 2;
      let measureY = (targetRectY + targetRectHeight) - measureHeight;
      context.globalAlpha = 0.5;
      context.drawImage(image, measureX, measureY, measureWidth, measureHeight);
    }
  }
}

function drawTarget() {
  let canvas = document.getElementById('overlay-target');
  if (canvas.getContext) {
    let context = canvas.getContext('2d');

    let image = new Image();
    image.src = './image/image_icebox.png';
    image.onload = () => {
      context.globalAlpha = 1.0;
      context.drawImage(image, targetX, targetY, targetWidth, targetHeight);
    }
  }
}


window.onload = function() {
  let canvasTarget = document.getElementById('overlay-target');
  let canvasMeasure = document.getElementById('overlay-measure');
  canvasMeasure.width = canvasTarget.width = windowWidth = window.innerWidth;
  canvasMeasure.height =canvasTarget.height = windowHeight = window.innerHeight;

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