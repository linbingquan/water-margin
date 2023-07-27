import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

const reg = /Android|webOS|iPhone|iPod|BlackBerry/i;
const isMobile = reg.test(navigator.userAgent);

const app = document.querySelector(".app");
app.classList.add(isMobile ? "mobile" : "pc");
const container = document.querySelector(".container");

const { innerWidth, innerHeight } = window;
const width = isMobile ? innerWidth : innerWidth / 2;
const height = isMobile ? innerHeight / 2 : innerHeight;

const textureLoader = new THREE.TextureLoader();

let selectId = 1;

const scene = new THREE.Scene();
const aspect = width / height;
const camera = new THREE.PerspectiveCamera(75, aspect);
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

function render() {
  renderer.render(scene, camera);
}

const controls = new OrbitControls(camera, renderer.domElement);
controls.addEventListener("change", render);
camera.position.z = 1;

scene.add(new THREE.AmbientLight());

const gltfLoader = new GLTFLoader();
gltfLoader.load("model.gltf", (gltf) => {
  scene.add(gltf.scene);
  render();
});

window.addEventListener("resize", resize);

function resize() {
  const { innerWidth, innerHeight } = window;
  const width = isMobile ? innerWidth : innerWidth / 2;
  const height = isMobile ? innerHeight / 2 : innerHeight;
  renderBySize({ width, height });
}

function renderBySize(options = {}) {
  const { width = window.innerWidth, height = window.innerHeight } = options;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  render();
}

document.querySelectorAll(".imgs img").forEach((item, index) => {
  item.addEventListener("click", async () => {
    const mesh = scene.getObjectByName("model");
    const material = mesh.material;
    selectId = index + 1;
    const texture = await textureLoader.loadAsync(`./imgs/${selectId}.jpg`);
    texture.flipY = false;
    texture.colorSpace = THREE.SRGBColorSpace;
    material.map = texture;
    render();
  });
});

document.querySelector(".button.preview").addEventListener("click", () => {
  container.classList.toggle("hidden");
});

document.querySelector(".button.download").addEventListener("click", () => {
  renderBySize();
  const link = document.createElement("a");
  link.download = `水浒英雄传 ${selectId}.png`;
  link.href = renderer.domElement.toDataURL("image/png");
  link.click();
  resize();
});
