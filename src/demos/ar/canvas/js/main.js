/*
 *  Copyright (c) 2015 The WebRTC project authors. All Rights Reserved.
 *
 *  Use of this source code is governed by a BSD-style license
 *  that can be found in the LICENSE file in the root of the source
 *  tree.
 */

'use strict';

// Put variables in global scope to make them available to the browser console.
const video = document.querySelector('video');
const canvas = window.canvas = document.querySelector('canvas');
// canvas.width = 500;
// canvas.height = 400;

const constraints = {
  audio: false,
  video: { facingMode: "environment"}
};

function handleSuccess(stream) {
  window.stream = stream; // make stream available to browser console
  video.srcObject = stream;
}

function handleError(error) {
  console.log('navigator.MediaDevices.getUserMedia error: ', error.message, error.name);
}

navigator.mediaDevices.getUserMedia(constraints).then(handleSuccess).catch(handleError);

video.addEventListener("play", function () {
  console.log("HTMLMediaElement: play");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
});

video.addEventListener("canplay", function () {
  console.log("HTMLMediaElement: canplay");

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
});

function startDemoInterval() {
  setInterval(function() {
    drawVideoToCanvas();
    drawMeasure();
    drawTarget();
  }, 1000 / 30);
}

function startDemoEvent() {
  video.addEventListener("progress", function () {
    drawVideoToCanvas();
    drawMeasure();
    drawTarget();
  });
}

function startDemoCapture() {
  drawVideoToCanvas();
  drawMeasure();
  drawTarget();
}

function drawVideoToCanvas() {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
}

function drawMeasure() {
  let context = canvas.getContext("2d");
  context.fillStyle = "rgb(0, 0, 255, 0.5)";
  context.fillRect(0, 0, 50, 50);
  context.stroke();
}

function drawTarget() {
  let context = canvas.getContext("2d");
  context.beginPath();
  context.strokeStyle = "rgb(255, 0, 0, 1.0)";
  context.rect(0, 0, 150, 150);
  context.stroke();
}