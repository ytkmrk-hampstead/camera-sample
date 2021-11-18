'use strict';

import * as THREE from './three/three.module.js';
import { OrbitControls } from './three/jsm/controls/OrbitControls.js';
// import { OBJLoader } from './three/jsm/loaders/OBJLoader.js';
// import { MTLLoader } from './three/jsm/loaders/MTLLoader.js';

let showHelpers = false;

let windowWidth;
let windowHeight;

let targetWidth;
let targetHeight;
let targetDepth;
let targetX;
let targetY;

let targetWidthInMM = 798;
let targetHeightInMM = 295;
let targetDepthInMM = 370;
let targetAspectRatio = targetWidthInMM / targetHeightInMM;

let measureWidth;
let measureHeight;
let measureDepth;
let measureX;
let measureY;
let measureZ;

let measureWidthInMM = 300;
let measureHeightInMM = 50;

let targetRatio = 1.5;

let fontStyle = "14px sans-serif";

let pixelPerMM;

let renderer;
let camera;
let controls;
let scene;
let canvasTarget;
let canvasTargetTop = 0;

init();

animate();

initControls();

function init() {
  canvasTarget = document.getElementById('overlay-target');
  canvasTarget.width = windowWidth = window.innerWidth;
  canvasTarget.height = windowHeight = window.innerHeight;

  initSizing();

  updateCanvas();
}

function initControls() {
  document.querySelector('#zoom-in-button').onclick = zoomIn;
  document.querySelector('#zoom-out-button').onclick = zoomOut;
  document.querySelector('#move-up-button').onclick = moveUp;
  document.querySelector('#move-down-button').onclick = moveDown;
}

function initSizing() {
  if (targetAspectRatio < 1) {
    targetHeight = windowHeight / targetRatio;
    pixelPerMM = targetHeight / targetHeightInMM;
    targetWidth = targetWidthInMM * pixelPerMM;
    targetDepth = targetDepthInMM * pixelPerMM;
  } else {
    targetWidth = windowWidth / targetRatio;
    pixelPerMM = targetWidth / targetWidthInMM;
    targetHeight = targetHeightInMM * pixelPerMM;
    targetDepth = targetDepthInMM * pixelPerMM;
  }
  targetX = (windowWidth - targetWidth) / 2;
  targetY = (windowHeight - targetHeight) / 2;
  console.log('targetWidth: ' + targetWidth + ', targetHeight: ' + targetHeight + ', targetDepth: ' + targetDepth);

  measureWidth = measureWidthInMM * pixelPerMM;
  measureHeight = measureHeightInMM * pixelPerMM;
  measureDepth = 1;
  console.log('measureWidth: ' + measureWidth + ', measureHeight: ' + measureHeight + ', measureDepth: ' + measureDepth);

  measureX = 0 - ((targetWidth - measureWidth) / 2);
  measureY = 0 - ((targetHeight + measureHeight) / 2);
  measureZ = 0 - (targetDepth / 2);
  console.log('measureX: ' + measureX + ', measureY: ' + measureY + ', measureZ: ' + measureZ);
}

function updateCanvas() {
  // draw3DModel();
  drawTarget();
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

function drawTarget() {
  let width = window.innerWidth;
  let height = window.innerHeight;
  renderer = new THREE.WebGLRenderer({
    alpha: true,
    canvas: canvasTarget,
    antialias: true
  });

  // Scene
  scene = new THREE.Scene();

  // Camera
  camera = new THREE.PerspectiveCamera(45, width / height);
  camera.position.set(0, 0, +1000);

  // Light
  let light = new THREE.HemisphereLight(0xFFFFFF, 0x404040, 1.0);
  light.position.set(-1, 2, 4);
  scene.add(light);

  // Target
  let loader = new THREE.TextureLoader();
  let materialParam = {
    side: THREE.DoubleSide,
    color: 0xFFFFFF,
    transparent: true,
    opacity: 0.75
  };
  let materialTexture = [
    new THREE.MeshPhongMaterial(materialParam),
    new THREE.MeshPhongMaterial(materialParam),
    new THREE.MeshPhongMaterial(materialParam),
    new THREE.MeshPhongMaterial(materialParam),
    new THREE.MeshPhongMaterial(materialParam),
    // new THREE.MeshBasicMaterial(Object.assign(materialParam, {
    //   map: loader.load( './image/air-conditioner.png' )
    // })),
    new THREE.MeshPhongMaterial(materialParam)
  ];
  let geometryTarget = new THREE.BoxGeometry(targetWidth, targetHeight, targetDepth);
  let sphereTarget = new THREE.Mesh(geometryTarget, materialTexture);
  scene.add(sphereTarget);

  // Measure
  let texture = new THREE.TextureLoader().load('./image/measure.png', function(texture) {
    let geometry = new THREE.PlaneGeometry(1, 1);
    let material = new THREE.MeshPhongMaterial({ map: texture, transparent: true, opacity: 0.5 });
    let sphere = new THREE.Mesh(geometry, material);

    sphere.scale.set(measureWidth, measureHeight, measureDepth);
    sphere.position.set(measureX, measureY, measureZ);

    scene.add(sphere);
  });

  // Controls
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = false;
  controls.screenSpacePanning = false;
  controls.enableZoom = false;

  // Helpers
  if (showHelpers) {
    // Axes
    let axesHelper = new THREE.AxesHelper(1000);
    scene.add(axesHelper);
    // Camera
    let cameraHelper = new THREE.CameraHelper(camera);
    scene.add(cameraHelper);
    // Grid
    let gridHelper = new THREE.GridHelper(10, 10);
    scene.add(gridHelper);
  }

  render();
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  render();
}

function render() {
  renderer.render(scene, camera);
}

function zoomIn() {
  console.log('zoomIn');

  camera.fov = zoom(getFov(), "zoomIn");
  camera.updateProjectionMatrix();
}

function zoomOut() {
  console.log('zoomOut');

  camera.fov = zoom(getFov(), "zoomOut");
  camera.updateProjectionMatrix();
}

function moveUp() {
  console.log('moveUp');

  moveVertical(-10);
}

function moveDown() {
  console.log('moveDown');

  moveVertical(10);
}

function zoom(value, zoomType) {
  let ret = value;
  if (value >= 20 && zoomType === 'zoomIn') {
    ret =  value - 5;
  } else if (value <= 75 && zoomType === 'zoomOut') {
    ret = value + 5;
  }
  console.log('fov: ' + ret);

  return ret;
}

function getFov() {
  return Math.floor((2 * Math.atan(camera.getFilmHeight() / 2 / camera.getFocalLength()) * 180) / Math.PI);
}

function moveVertical(inc) {
  canvasTargetTop += inc;
  canvasTarget.style.setProperty('top', String(canvasTargetTop) + 'px');
}