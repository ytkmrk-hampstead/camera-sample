'use strict';

import * as THREE from './three/three.module.js';
import { OrbitControls } from './three/jsm/controls/OrbitControls.js';
import { OBJLoader } from './three/jsm/loaders/OBJLoader.js';
import { MTLLoader } from './three/jsm/loaders/MTLLoader.js';


let windowWidth;
let windowHeight;

let targetWidth;
let targetHeight;
let targetDepth;
let targetX;
let targetY;

let targetWidthInMM;
let targetHeightInMM;
let targetDepthInMM;
let targetAspectRatio;
let targetObjectConfiguration;

let measureWidth;
let measureHeight;
let measureDepth;
let measureX;
let measureY;
let measureZ;

let pixelPerMM;

let renderer;
let camera;
let controls;
let scene;
let canvasTarget;
let canvasTargetTop = 0;

let longPushTimer;
let longPushTimerIntervalInMillis = 10;

let video;

const showHelpers = false;

const measureWidthInMM = 300;
const measureHeightInMM = 50;

const targetRatio = 1.5;
const fontStyle = "14px sans-serif";

const productsConfiguration = {
  "T1": { size: { w: 799, h: 295, d: 385 }, object: { path: 'object/T1/' } }, // https://panasonic.jp/aircon/products/21x.html#size
  "T2": { size: { w:1123, h: 682, d: 247 }, object: { path: 'object/T2/' } }, // https://panasonic.jp/viera/p-db/TH-50JX750_spec.html
  "T3": { size: { w: 750, h:1828, d: 745 }, object: { path: 'object/T3/' } }, // https://panasonic.jp/reizo/p-db/NR-F657WPX_spec.html
  "T4": { size: { w: 600, h:1020, d: 715 }, object: { path: 'object/T4/' } }, // https://kadenfan.hitachi.co.jp/wash/lineup/bd-sg100g/spec.html
  "T5": { size: { w: 555, h:1025, d: 650 }, object: { path: 'object/T5/' } }  // https://jp.sharp/sentaku/products/estx8b_spec.html
};

document.querySelector('#open-menu-button').onclick = openMenu;
document.querySelector('#close-menu-button').onclick = closeMenu;
document.querySelector('#close-menu-button-large').onclick = closeMenu;
document.querySelector('#input-product-type').onchange = menuChangeProduct;

initWindow();
initVideo();

function update() {
  init();
  initControls();
  animate();
}

window.addEventListener('orientationchange', function() {
  console.log('orientationchange');

  location.reload();
});

function init() {
  initInfo();
  initSizing();
  updateCanvas();
}

function initWindow() {
  canvasTarget = document.getElementById('overlay-target');
  video = document.querySelector('#screen-video');

  canvasTarget.width = windowWidth = window.innerWidth;
  canvasTarget.height = windowHeight = window.innerHeight;
  console.log('windowWidth: ' + windowWidth + ' windowHeight: ' + windowHeight);
}

function initInfo() {
  document.querySelector('#target-width').textContent = String(targetWidthInMM);
  document.querySelector('#target-height').textContent = String(targetHeightInMM);
  document.querySelector('#target-depth').textContent = String(targetDepthInMM);
}

function initControls() {
  document.querySelector('#zoom-in-button').onmousedown = zoomIn;
  document.querySelector('#zoom-out-button').onmousedown = zoomOut;
  document.querySelector('#move-up-button').onmousedown = moveUp;
  document.querySelector('#move-down-button').onmousedown = moveDown;

  document.querySelector('#zoom-in-button').onmouseup = stopLongPushTimer;
  document.querySelector('#zoom-out-button').onmouseup = stopLongPushTimer;
  document.querySelector('#move-up-button').onmouseup = stopLongPushTimer;
  document.querySelector('#move-down-button').onmouseup = stopLongPushTimer;

  document.querySelector('#zoom-in-button').onmouseleave = stopLongPushTimer;
  document.querySelector('#zoom-out-button').onmouseleave = stopLongPushTimer;
  document.querySelector('#move-up-button').onmouseleave = stopLongPushTimer;
  document.querySelector('#move-down-button').onmouseleave = stopLongPushTimer;

  document.querySelector('#zoom-in-button').ontouchstart = zoomIn;
  document.querySelector('#zoom-out-button').ontouchstart = zoomOut;
  document.querySelector('#move-up-button').ontouchstart = moveUp;
  document.querySelector('#move-down-button').ontouchstart = moveDown;

  document.querySelector('#zoom-in-button').ontouchend = stopLongPushTimer;
  document.querySelector('#zoom-out-button').ontouchend = stopLongPushTimer;
  document.querySelector('#move-up-button').ontouchend = stopLongPushTimer;
  document.querySelector('#move-down-button').ontouchend = stopLongPushTimer;

  document.querySelector('#toggle-pause-button').onclick = togglePause;
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

function initVideo() {
  console.log('initVideo');

  navigator.mediaDevices.getUserMedia({
    audio: false,
    video: {
      width: windowWidth,
      height: windowHeight,
      facingMode: "environment"
    }
  }).then(function(stream) {
    video.srcObject = stream;
    video.onloadedmetadata = function(e) {
      video.play();
      console.log('initVideo: play');
    };
  }).catch(function(err) {
    console.log('initVideo: error: ' + err.name + ' message: ' + err.message);
  });
}

function updateCanvas() {
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
  console.log(window.devicePixelRatio);
  console.log(renderer.getPixelRatio());
  console.log(width);
  console.log(height);
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);

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
  if (targetObjectConfiguration !== null) {
    drawTargetModel();
  } else {
    drawTargetRect();
  }

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

function drawTargetModel() {
  let opMaterial = new THREE.MeshPhongMaterial({
        side: THREE.DoubleSide,
        color: 0xFFFFFF,
        transparent: true,
        opacity: 0.50
      });

  let mtlLoader = new MTLLoader();
  mtlLoader.setPath(targetObjectConfiguration.path);
  mtlLoader.load('model.mtl', function (materials) {
    materials.preload();

    let objLoader = new OBJLoader();
    objLoader.setMaterials(materials);
    objLoader.setPath(targetObjectConfiguration.path);
    objLoader.load('model.obj', function(root) {
      root.traverse(function(node) {
        if (node instanceof THREE.Mesh) {
          node.material = opMaterial;
        }
      });

      let box = new THREE.Box3().setFromObject(root);
      let boxSize = box.getSize(new THREE.Vector3());
      let scaleX = targetWidth / boxSize.x;
      let scaleY = targetHeight / boxSize.y;
      let scaleZ = targetDepth / boxSize.z;

      root.scale.set(scaleX, scaleY, scaleZ);
      console.log('scaleX: ' + scaleX);
      console.log('scaleY: ' + scaleY);
      console.log('scaleZ: ' + scaleZ);

      scene.add(root);
    });
  });
}

function drawTargetRect() {
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
    new THREE.MeshPhongMaterial(materialParam)
  ];
  let geometryTarget = new THREE.BoxGeometry(targetWidth, targetHeight, targetDepth);
  let sphereTarget = new THREE.Mesh(geometryTarget, materialTexture);
  scene.add(sphereTarget);
}

function animate() {
  requestAnimationFrame(animate);
  controls.update();

  // If needed animation.
  render();
}

function render() {
  renderer.render(scene, camera);
}

function zoomIn(e) {
  console.log('zoomIn');

  e.preventDefault();

  longPushTimer = setInterval(function() {
    camera.fov = zoom(camera.fov, "zoomIn");
    camera.updateProjectionMatrix();
    render();
  }, longPushTimerIntervalInMillis);
}

function zoomOut(e) {
  console.log('zoomOut');

  e.preventDefault();

  longPushTimer = setInterval(function() {
    camera.fov = zoom(camera.fov, "zoomOut");
    camera.updateProjectionMatrix();
    render();
  }, longPushTimerIntervalInMillis);
}

function moveUp(e) {
  console.log('moveUp');

  e.preventDefault();

  longPushTimer = setInterval(function() {
    moveVertical(-2);
  }, longPushTimerIntervalInMillis);
}

function moveDown(e) {
  console.log('moveDown');

  e.preventDefault();

  longPushTimer = setInterval(function() {
    moveVertical(2);
  }, longPushTimerIntervalInMillis);
}

function zoom(value, zoomType) {
  let ret = value;
  if (value > 10 && zoomType === 'zoomIn') {
    ret =  value / 1.01;
  } else if (value < 150 && zoomType === 'zoomOut') {
    ret = value * 1.01;
  }

  return ret;
}

function moveVertical(inc) {
  canvasTargetTop += inc;
  canvasTarget.style.setProperty('top', String(canvasTargetTop) + 'px');
}

function stopLongPushTimer() {
  if (longPushTimer) {
    clearInterval(longPushTimer);
  }
}

function togglePause() {
  let toggleButton = document.querySelector('#toggle-pause-button');
  if (video.paused) {
    toggleButton.className = 'fas fa-pause-circle control';
    video.play();
  } else {
    toggleButton.className = 'fas fa-play-circle control';
    video.pause();
  }
}

function openMenu() {
  console.log('openMenu');

  let menu = document.querySelector('#overlay-menu');
  menu.style.display = 'block';
}


function closeMenu() {
  console.log('closeMenu');

  let menu = document.querySelector('#overlay-menu');
  menu.style.display = 'none';

  let width = document.querySelector('#input-target-width').value;
  let height = document.querySelector('#input-target-height').value;
  let depth = document.querySelector('#input-target-depth').value;

  if (!isNaN(width) && !isNaN(height) && !isNaN(depth)) {
    targetWidthInMM = parseInt(width);
    targetHeightInMM = parseInt(height);
    targetDepthInMM = parseInt(depth);

    if (targetWidthInMM > 0 && targetHeightInMM > 0 && targetDepthInMM > 0) {
      targetAspectRatio = targetWidthInMM / targetHeightInMM;

      update();
    }
  }
}

function menuChangeProduct() {
  console.log('menuChangeProduct');

  let width = "";
  let height = "";
  let depth = "";

  let productType = document.querySelector('#input-product-type').value;
  if (productType !== 'custom') {
    let size = productsConfiguration[productType].size;
    console.log(size);
    width = String(size.w);
    height = String(size.h);
    depth = String(size.d);
    targetObjectConfiguration = productsConfiguration[productType].object;
  } else {
    targetObjectConfiguration = null;
  }

  document.querySelector('#input-target-width').value = width;
  document.querySelector('#input-target-height').value = height;
  document.querySelector('#input-target-depth').value = depth;
}

// Show default object
document.querySelector('#input-product-type').selectedIndex = 1;
menuChangeProduct();
closeMenu();