import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { HOUSE, rooms, walls, furniture } from './floorplan.js';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <div id="startOverlay">
    <div id="startCard">
      <div class="eyebrow">C1 · 143㎡ · 四房两厅两卫</div>
      <h1>户型 3D 第一人称漫游</h1>
      <p>当前为根据户型图建立的第一版空间壳体。点击进入后可像游戏一样自由行走。</p>
      <button id="startButton" type="button">进入户型</button>
      <div class="startTips">W/A/S/D 移动 · 鼠标观察 · Shift 加速 · Space 跳跃 · ESC 暂停</div>
    </div>
  </div>
  <div id="hud">
    <div id="crosshair" aria-hidden="true"></div>
    <div id="status">未进入漫游</div>
    <div id="roomName">玄关 / 公区</div>
    <div id="help">W/A/S/D 移动 · 鼠标观察 · Shift 加速 · Space 跳跃 · ESC 退出鼠标控制</div>
  </div>
`;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd8e3e8);
scene.fog = new THREE.Fog(0xd8e3e8, 18, 36);

const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.05, 80);
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
app.prepend(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
const overlay = document.querySelector('#startOverlay');
const startButton = document.querySelector('#startButton');
const status = document.querySelector('#status');
const roomName = document.querySelector('#roomName');

startButton.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => {
  overlay.classList.add('hidden');
  status.textContent = '漫游中';
});
controls.addEventListener('unlock', () => {
  overlay.classList.remove('hidden');
  status.textContent = '已暂停';
});

scene.add(new THREE.HemisphereLight(0xffffff, 0x7c8790, 1.9));
const sun = new THREE.DirectionalLight(0xffffff, 3.0);
sun.position.set(-7, 13, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -12;
sun.shadow.camera.right = 12;
sun.shadow.camera.top = 12;
sun.shadow.camera.bottom = -12;
scene.add(sun);

const ambientWarm = new THREE.PointLight(0xffead2, 24, 11, 2);
ambientWarm.position.set(0, 2.45, 0);
scene.add(ambientWarm);

const colliders = [];
const wallMat = new THREE.MeshStandardMaterial({ color: 0xf3efe7, roughness: 0.92 });
const ceilingMat = new THREE.MeshStandardMaterial({ color: 0xf7f5ef, roughness: 1.0 });
const floorMat = new THREE.MeshStandardMaterial({ color: 0xb8956e, roughness: 0.78 });
const balconyMat = new THREE.MeshStandardMaterial({ color: 0xb9b7af, roughness: 0.9 });

function worldX(planX) {
  return planX - HOUSE.width / 2;
}

function worldZ(planZ) {
  return planZ - HOUSE.depth / 2;
}

function addBox({ size, position, material, collide = true, castShadow = true, name = '' }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.name = name;
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  scene.add(mesh);
  if (collide) colliders.push(new THREE.Box3().setFromObject(mesh));
  return mesh;
}

function addWallPiece(axis, startX, startZ, length, material = wallMat) {
  if (length <= 0.01) return;
  if (axis === 'x') {
    addBox({
      size: [length, HOUSE.height, HOUSE.wall],
      position: [worldX(startX + length / 2), HOUSE.height / 2, worldZ(startZ)],
      material,
      name: 'wall',
    });
  } else {
    addBox({
      size: [HOUSE.wall, HOUSE.height, length],
      position: [worldX(startX), HOUSE.height / 2, worldZ(startZ + length / 2)],
      material,
      name: 'wall',
    });
  }
}

function addDoorHeader(axis, startX, startZ, localStart, width) {
  const headerHeight = HOUSE.height - HOUSE.doorHeight;
  if (headerHeight <= 0) return;
  const centerLocal = localStart + width / 2;
  if (axis === 'x') {
    addBox({
      size: [width, headerHeight, HOUSE.wall],
      position: [worldX(startX + centerLocal), HOUSE.doorHeight + headerHeight / 2, worldZ(startZ)],
      material: wallMat,
      name: 'door-header',
    });
  } else {
    addBox({
      size: [HOUSE.wall, headerHeight, width],
      position: [worldX(startX), HOUSE.doorHeight + headerHeight / 2, worldZ(startZ + centerLocal)],
      material: wallMat,
      name: 'door-header',
    });
  }
}

function buildWall(wall) {
  const openings = [...(wall.openings ?? [])]
    .map((opening) => ({
      start: Math.max(0, opening.center - opening.width / 2),
      end: Math.min(wall.length, opening.center + opening.width / 2),
    }))
    .sort((a, b) => a.start - b.start);

  let cursor = 0;
  for (const opening of openings) {
    addWallPiece(
      wall.axis,
      wall.axis === 'x' ? wall.x + cursor : wall.x,
      wall.axis === 'z' ? wall.z + cursor : wall.z,
      opening.start - cursor,
    );
    addDoorHeader(wall.axis, wall.x, wall.z, opening.start, opening.end - opening.start);
    cursor = opening.end;
  }

  addWallPiece(
    wall.axis,
    wall.axis === 'x' ? wall.x + cursor : wall.x,
    wall.axis === 'z' ? wall.z + cursor : wall.z,
    wall.length - cursor,
  );
}

// 全屋基础地面与天花。
addBox({
  size: [HOUSE.width, 0.16, HOUSE.depth],
  position: [0, -0.08, 0],
  material: floorMat,
  collide: false,
  castShadow: false,
  name: 'floor',
});
addBox({
  size: [HOUSE.width, 0.1, HOUSE.depth],
  position: [0, HOUSE.height + 0.05, 0],
  material: ceilingMat,
  collide: false,
  castShadow: false,
  name: 'ceiling',
});

// 各功能空间铺装，用轻微高差帮助辨识户型。
for (const room of rooms) {
  const mat = new THREE.MeshStandardMaterial({ color: room.color, roughness: 0.92 });
  addBox({
    size: [room.w - 0.04, 0.025, room.d - 0.04],
    position: [worldX(room.x + room.w / 2), 0.015, worldZ(room.z + room.d / 2)],
    material: room.name.includes('阳台') ? balconyMat : mat,
    collide: false,
    castShadow: false,
    name: `floor-${room.name}`,
  });
}

for (const wall of walls) buildWall(wall);

// 阳台栏杆的简化表达。
const glassMat = new THREE.MeshPhysicalMaterial({
  color: 0xc8d7dd,
  transparent: true,
  opacity: 0.38,
  roughness: 0.15,
  transmission: 0.28,
});
addBox({
  size: [4.4, 1.05, 0.045],
  position: [worldX(8.8), 0.72, worldZ(0.18)],
  material: glassMat,
  collide: true,
  name: 'balcony-glass',
});

for (const item of furniture) {
  const material = new THREE.MeshStandardMaterial({ color: item.color, roughness: 0.82 });
  addBox({
    size: [item.w, item.h, item.d],
    position: [worldX(item.x + item.w / 2), item.h / 2, worldZ(item.z + item.d / 2)],
    material,
    collide: true,
    name: item.name,
  });
}

// 餐椅用几何体占位，后续可替换成 glTF 家具模型。
const chairMat = new THREE.MeshStandardMaterial({ color: 0x4d4944, roughness: 0.8 });
for (const [x, z] of [
  [8.0, 5.9], [9.15, 5.9], [8.0, 7.35], [9.15, 7.35],
]) {
  addBox({
    size: [0.48, 0.72, 0.48],
    position: [worldX(x), 0.36, worldZ(z)],
    material: chairMat,
    name: '餐椅',
  });
}

// 起点设在玄关附近，朝向客餐厅。
const player = {
  radius: 0.32,
  eyeHeight: 1.65,
  baseSpeed: 2.8,
  sprintSpeed: 4.8,
};
camera.position.set(worldX(10.0), player.eyeHeight, worldZ(10.1));
camera.rotation.set(0, Math.PI, 0);

const keys = new Set();
let verticalVelocity = 0;
let onGround = true;

window.addEventListener('keydown', (event) => {
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight', 'Space'].includes(event.code)) {
    event.preventDefault();
  }
  keys.add(event.code);
  if (event.code === 'Space' && onGround && controls.isLocked) {
    verticalVelocity = 4.6;
    onGround = false;
  }
});
window.addEventListener('keyup', (event) => keys.delete(event.code));
window.addEventListener('blur', () => keys.clear());

function isBlocked(x, z) {
  const minY = camera.position.y - player.eyeHeight;
  const maxY = camera.position.y + 0.12;
  for (const box of colliders) {
    if (maxY < box.min.y || minY > box.max.y) continue;
    if (
      x + player.radius > box.min.x &&
      x - player.radius < box.max.x &&
      z + player.radius > box.min.z &&
      z - player.radius < box.max.z
    ) {
      return true;
    }
  }
  return false;
}

function currentRoomName() {
  const px = camera.position.x + HOUSE.width / 2;
  const pz = camera.position.z + HOUSE.depth / 2;
  for (const room of rooms) {
    if (px >= room.x && px <= room.x + room.w && pz >= room.z && pz <= room.z + room.d) {
      return room.name;
    }
  }
  return '过道 / 公区';
}

const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const move = new THREE.Vector3();
const clock = new THREE.Clock();
let roomLabelTimer = 0;

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
  const sprinting = keys.has('ShiftLeft') || keys.has('ShiftRight');
  const speed = sprinting ? player.sprintSpeed : player.baseSpeed;
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

  roomLabelTimer += dt;
  if (roomLabelTimer > 0.15) {
    roomLabelTimer = 0;
    roomName.textContent = currentRoomName();
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
