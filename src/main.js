import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <div id="startOverlay">
    <div id="startCard">
      <h1>3D 第一人称漫游</h1>
      <p>点击进入场景后，使用 WASD 移动，鼠标控制视角，Shift 加速，空格跳跃，ESC 释放鼠标。</p>
      <button id="startButton" type="button">进入场景</button>
    </div>
  </div>
  <div id="hud">
    <div id="crosshair" aria-hidden="true"></div>
    <div id="status">未进入漫游</div>
    <div id="help">W/A/S/D 移动 · 鼠标观察 · Shift 加速 · Space 跳跃 · ESC 退出鼠标控制</div>
  </div>
`;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbfd7ea);
scene.fog = new THREE.Fog(0xbfd7ea, 20, 42);

const camera = new THREE.PerspectiveCamera(72, window.innerWidth / window.innerHeight, 0.05, 100);
camera.position.set(-5.5, 1.65, 3.8);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
app.prepend(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
const overlay = document.querySelector('#startOverlay');
const startButton = document.querySelector('#startButton');
const status = document.querySelector('#status');

startButton.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => {
  overlay.classList.add('hidden');
  status.textContent = '漫游中';
});
controls.addEventListener('unlock', () => {
  overlay.classList.remove('hidden');
  status.textContent = '已暂停';
});

scene.add(new THREE.HemisphereLight(0xffffff, 0x6b7280, 2.0));

const sun = new THREE.DirectionalLight(0xffffff, 3.2);
sun.position.set(-6, 12, 4);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -15;
sun.shadow.camera.right = 15;
sun.shadow.camera.top = 15;
sun.shadow.camera.bottom = -15;
scene.add(sun);

const warmLight = new THREE.PointLight(0xffe4bf, 35, 12, 2);
warmLight.position.set(4, 2.5, 1);
warmLight.castShadow = true;
scene.add(warmLight);

const colliders = [];
const room = { width: 18, depth: 14, height: 3.2, wall: 0.22 };

const mats = {
  wall: new THREE.MeshStandardMaterial({ color: 0xf4f0e7, roughness: 0.9 }),
  accent: new THREE.MeshStandardMaterial({ color: 0xb7a58d, roughness: 0.88 }),
  floor: new THREE.MeshStandardMaterial({ color: 0xb7946a, roughness: 0.78 }),
  dark: new THREE.MeshStandardMaterial({ color: 0x31363f, roughness: 0.72 }),
  sofa: new THREE.MeshStandardMaterial({ color: 0x7f8c8d, roughness: 0.95 }),
  wood: new THREE.MeshStandardMaterial({ color: 0x765640, roughness: 0.82 }),
  plant: new THREE.MeshStandardMaterial({ color: 0x55745d, roughness: 0.9 }),
};

function addBox({ name = '', size, position, material = mats.wall, collide = true, castShadow = true }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.name = name;
  mesh.position.set(...position);
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  scene.add(mesh);
  if (collide) {
    colliders.push(new THREE.Box3().setFromObject(mesh));
  }
  return mesh;
}

function addCylinder({ radius = 0.25, height = 1, position, material = mats.dark, collide = true }) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, height, 24), material);
  mesh.position.set(...position);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  if (collide) colliders.push(new THREE.Box3().setFromObject(mesh));
  return mesh;
}

// Floor and ceiling.
addBox({ size: [room.width, 0.18, room.depth], position: [0, -0.09, 0], material: mats.floor, collide: false, castShadow: false });
addBox({ size: [room.width, 0.12, room.depth], position: [0, room.height + 0.06, 0], material: mats.wall, collide: false, castShadow: false });

// Outer walls.
addBox({ size: [room.width, room.height, room.wall], position: [0, room.height / 2, -room.depth / 2], material: mats.wall });
addBox({ size: [room.width, room.height, room.wall], position: [0, room.height / 2, room.depth / 2], material: mats.wall });
addBox({ size: [room.wall, room.height, room.depth], position: [-room.width / 2, room.height / 2, 0], material: mats.wall });
addBox({ size: [room.wall, room.height, room.depth], position: [room.width / 2, room.height / 2, 0], material: mats.wall });

// Interior divider with a 1.5 m doorway.
addBox({ size: [room.wall, room.height, 5.1], position: [0, room.height / 2, -4.45], material: mats.accent });
addBox({ size: [room.wall, room.height, 4.4], position: [0, room.height / 2, 4.8], material: mats.accent });
addBox({ size: [room.wall, 0.85, 1.5], position: [0, 2.775, -0.95], material: mats.accent });

// Living zone: sofa, coffee table, TV cabinet.
addBox({ size: [3.4, 0.72, 1.0], position: [-5.3, 0.36, -2.6], material: mats.sofa });
addBox({ size: [3.4, 0.72, 0.28], position: [-5.3, 0.9, -3.0], material: mats.sofa });
addBox({ size: [1.9, 0.42, 0.9], position: [-5.2, 0.21, -0.55], material: mats.wood });
addBox({ size: [0.32, 0.58, 0.32], position: [-5.9, 0.29, -0.55], material: mats.dark });
addBox({ size: [0.32, 0.58, 0.32], position: [-4.5, 0.29, -0.55], material: mats.dark });
addBox({ size: [0.5, 0.58, 3.6], position: [-8.35, 0.29, -1.4], material: mats.dark });
addBox({ size: [0.12, 1.65, 2.8], position: [-8.48, 1.55, -1.4], material: mats.dark, collide: false });

// Dining zone.
addBox({ size: [2.5, 0.12, 1.15], position: [4.1, 0.78, 1.5], material: mats.wood });
addBox({ size: [0.18, 0.78, 0.18], position: [3.2, 0.39, 1.1], material: mats.dark });
addBox({ size: [0.18, 0.78, 0.18], position: [5.0, 0.39, 1.1], material: mats.dark });
addBox({ size: [0.18, 0.78, 0.18], position: [3.2, 0.39, 1.9], material: mats.dark });
addBox({ size: [0.18, 0.78, 0.18], position: [5.0, 0.39, 1.9], material: mats.dark });

for (const [x, z] of [[2.75, 0.55], [4.1, 0.55], [5.45, 0.55], [2.75, 2.45], [4.1, 2.45], [5.45, 2.45]]) {
  addBox({ size: [0.52, 0.72, 0.52], position: [x, 0.36, z], material: mats.dark });
}

// Low cabinet and decorative plant.
addBox({ size: [3.7, 0.82, 0.48], position: [6.4, 0.41, -5.95], material: mats.wood });
addCylinder({ radius: 0.36, height: 0.48, position: [7.8, 0.24, 5.5], material: mats.dark });
const plant = new THREE.Mesh(new THREE.SphereGeometry(0.7, 20, 14), mats.plant);
plant.scale.y = 1.45;
plant.position.set(7.8, 1.15, 5.5);
plant.castShadow = true;
scene.add(plant);

// Rug adds visual orientation but no collision.
addBox({ size: [4.6, 0.025, 3.2], position: [-5.1, 0.02, -1.55], material: new THREE.MeshStandardMaterial({ color: 0xd7d0c5, roughness: 1 }), collide: false, castShadow: false });

const keys = new Set();
window.addEventListener('keydown', (event) => {
  if (["KeyW", "KeyA", "KeyS", "KeyD", "ShiftLeft", "ShiftRight", "Space"].includes(event.code)) event.preventDefault();
  keys.add(event.code);
  if (event.code === 'Space' && onGround && controls.isLocked) {
    verticalVelocity = 4.8;
    onGround = false;
  }
});
window.addEventListener('keyup', (event) => keys.delete(event.code));
window.addEventListener('blur', () => keys.clear());

const player = {
  radius: 0.34,
  eyeHeight: 1.65,
  baseSpeed: 3.2,
  sprintSpeed: 5.4,
};

let verticalVelocity = 0;
let onGround = true;

function isBlocked(x, z) {
  const minY = camera.position.y - player.eyeHeight;
  const maxY = camera.position.y + 0.15;
  for (const box of colliders) {
    if (maxY < box.min.y || minY > box.max.y) continue;
    if (
      x + player.radius > box.min.x &&
      x - player.radius < box.max.x &&
      z + player.radius > box.min.z &&
      z - player.radius < box.max.z
    ) return true;
  }
  return false;
}

const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const move = new THREE.Vector3();
const clock = new THREE.Clock();

function updatePlayer(dt) {
  if (!controls.isLocked) return;

  camera.getWorldDirection(forward);
  forward.y = 0;
  forward.normalize();
  right.crossVectors(forward, camera.up).normalize();

  move.set(0, 0, 0);
  if (keys.has('KeyW')) move.add(forward);
  if (keys.has('KeyS')) move.sub(forward);
  if (keys.has('KeyD')) move.add(right);
  if (keys.has('KeyA')) move.sub(right);

  if (move.lengthSq() > 0) move.normalize();
  const speed = keys.has('ShiftLeft') || keys.has('ShiftRight') ? player.sprintSpeed : player.baseSpeed;
  const dx = move.x * speed * dt;
  const dz = move.z * speed * dt;

  const targetX = camera.position.x + dx;
  if (!isBlocked(targetX, camera.position.z)) camera.position.x = targetX;

  const targetZ = camera.position.z + dz;
  if (!isBlocked(camera.position.x, targetZ)) camera.position.z = targetZ;

  verticalVelocity -= 11.5 * dt;
  camera.position.y += verticalVelocity * dt;
  if (camera.position.y <= player.eyeHeight) {
    camera.position.y = player.eyeHeight;
    verticalVelocity = 0;
    onGround = true;
  }
}

function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  updatePlayer(dt);
  renderer.render(scene, camera);
}
animate();

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
