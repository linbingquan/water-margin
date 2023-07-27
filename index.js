import { AmbientLight, PerspectiveCamera, Scene, SRGBColorSpace, TextureLoader, WebGLRenderer } from "three";
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

const textureLoader = new TextureLoader();

const renderer = new WebGLRenderer({
  antialias: true,
  alpha: true,
  preserveDrawingBuffer: true,
});
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(width, height);
container.appendChild(renderer.domElement);

const aspect = width / height;
const camera = new PerspectiveCamera(50, aspect);
camera.position.z = 1.5;

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.addEventListener("change", requestRender);

const scene = new Scene();
scene.add(new AmbientLight(0xffffff, 3.14));

const gltfLoader = new GLTFLoader();
gltfLoader.load("model.gltf", (gltf) => {
  scene.add(gltf.scene);
  render();
});

function render() {
  renderer.render(scene, camera);
}

function animate() {
  const success = controls.update();
  render();
  if (success === false) {
    renderer.setAnimationLoop(null);
    isAnimating = false;
  }
}

let isAnimating = false;
function requestRender() {
  if (isAnimating === true) return;
  isAnimating = true;
  renderer.setAnimationLoop(animate);
}

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

let selectId = 1;
const fragment = document.createDocumentFragment();
for (let index = 1; index <= 108; index++) {
  const img = document.createElement("img");
  img.src = `./imgs/${index}.jpg`;
  img.addEventListener("click", async () => {
    selectId = index;
    const mesh = scene.getObjectByName("model");
    const material = mesh.material;
    const texture = await textureLoader.loadAsync(`./imgs/${selectId}.jpg`);
    texture.flipY = false;
    texture.colorSpace = SRGBColorSpace;
    material.map = texture;
    render();
  });
  fragment.appendChild(img);
}
document.querySelector(".imgs").appendChild(fragment);

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
