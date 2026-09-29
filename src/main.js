import * as THREE from 'three';
import { PointerLockControls } from 'three/addons/controls/PointerLockControls.js';
import { HOUSE, PALETTE, rooms, walls, furniture, accentPanels } from './floorplan.js';
import './style.css';

const app = document.querySelector('#app');
app.innerHTML = `
  <div id="startOverlay">
    <div id="startCard">
      <div class="eyebrow">C1 · 143㎡ · 最新 PDF 效果版</div>
      <h1>住宅 3D 第一人称漫游</h1>
      <p>按最新设计 PDF 重做了客厅、餐厨、玄关、卧室、儿童房与书房的家具、材质和灯光。</p>
      <button id="startButton" type="button">进入户型</button>
      <div class="startTips">W/A/S/D 移动 · 鼠标观察 · 滚轮缩放 · 双击复位 · Shift 加速 · Space 跳跃 · ESC 暂停</div>
    </div>
  </div>
  <div id="hud">
    <div id="crosshair" aria-hidden="true"></div>
    <div id="status">未进入漫游</div>
    <div id="roomName">玄关 / 公区</div>
    <div id="help">W/A/S/D 移动 · 鼠标观察 · 滚轮缩放 · 双击复位 · Shift 加速 · Space 跳跃 · ESC 退出鼠标控制</div>
  </div>
`;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xe4e1db);
scene.fog = new THREE.Fog(0xe4e1db, 18, 34);

const DEFAULT_FOV = 68;
const MIN_FOV = 30;
const MAX_FOV = 75;
const camera = new THREE.PerspectiveCamera(DEFAULT_FOV, window.innerWidth / window.innerHeight, 0.05, 80);
let targetFov = DEFAULT_FOV;
scene.add(camera);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.02;
renderer.domElement.style.touchAction = 'none';
app.prepend(renderer.domElement);

const controls = new PointerLockControls(camera, renderer.domElement);
const overlay = document.querySelector('#startOverlay');
const startButton = document.querySelector('#startButton');
const status = document.querySelector('#status');
const roomName = document.querySelector('#roomName');
startButton.addEventListener('click', () => controls.lock());
controls.addEventListener('lock', () => { overlay.classList.add('hidden'); status.textContent = '漫游中'; });
controls.addEventListener('unlock', () => { overlay.classList.remove('hidden'); status.textContent = '已暂停'; });

function setTargetFov(nextFov) {
  targetFov = THREE.MathUtils.clamp(nextFov, MIN_FOV, MAX_FOV);
}
function resetFov() {
  targetFov = DEFAULT_FOV;
}
renderer.domElement.addEventListener('wheel', (event) => {
  event.preventDefault();
  setTargetFov(targetFov + event.deltaY * 0.025);
}, { passive: false });
renderer.domElement.addEventListener('dblclick', (event) => {
  event.preventDefault();
  resetFov();
});

let pinchDistance = null;
function touchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.hypot(dx, dy);
}
renderer.domElement.addEventListener('touchstart', (event) => {
  if (event.touches.length === 2) pinchDistance = touchDistance(event.touches);
}, { passive: false });
renderer.domElement.addEventListener('touchmove', (event) => {
  if (event.touches.length !== 2 || pinchDistance === null) return;
  event.preventDefault();
  const nextDistance = touchDistance(event.touches);
  const delta = nextDistance - pinchDistance;
  setTargetFov(targetFov - delta * 0.06);
  pinchDistance = nextDistance;
}, { passive: false });
renderer.domElement.addEventListener('touchend', (event) => {
  if (event.touches.length < 2) pinchDistance = null;
});

scene.add(new THREE.HemisphereLight(0xfffbf2, 0x72706c, 1.35));
const sun = new THREE.DirectionalLight(0xffffff, 2.45);
sun.position.set(-8, 12, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
sun.shadow.camera.left = -12;
sun.shadow.camera.right = 12;
sun.shadow.camera.top = 12;
sun.shadow.camera.bottom = -12;
scene.add(sun);

const colliders = [];
const materials = new Map();
function mat(color, roughness = 0.8, metalness = 0) {
  const key = `${color}-${roughness}-${metalness}`;
  if (!materials.has(key)) materials.set(key, new THREE.MeshStandardMaterial({ color, roughness, metalness }));
  return materials.get(key);
}
const wallMat = mat(PALETTE.warmWhite, 0.93);
const ceilingMat = mat(PALETTE.pureWhite, 1);
const stoneMat = mat(PALETTE.stone, 0.34, 0.04);
const woodFloorMat = mat(0x8a6f58, 0.62);
const lightFloorMat = mat(0xe6e0d7, 0.92);
const tileMat = mat(0x8c8982, 0.55);
const blackMat = mat(PALETTE.charcoal, 0.5, 0.08);
const chromeMat = mat(0xc9c9c9, 0.22, 0.8);
const glassMat = new THREE.MeshPhysicalMaterial({ color: 0xbfc7c8, transparent: true, opacity: 0.28, roughness: 0.06, transmission: 0.5 });

function worldX(planX) { return planX - HOUSE.width / 2; }
function worldZ(planZ) { return planZ - HOUSE.depth / 2; }

function addBox({ size, position, material, collide = true, castShadow = true, name = '', rotationY = 0 }) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(...size), material);
  mesh.position.set(...position);
  mesh.rotation.y = rotationY;
  mesh.name = name;
  mesh.castShadow = castShadow;
  mesh.receiveShadow = true;
  scene.add(mesh);
  if (collide) colliders.push(new THREE.Box3().setFromObject(mesh));
  return mesh;
}

function addCylinder({ r, h, x, y, z, material, collide = true, radial = 32 }) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, radial), material);
  mesh.position.set(worldX(x), y, worldZ(z));
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  scene.add(mesh);
  if (collide) colliders.push(new THREE.Box3().setFromObject(mesh));
  return mesh;
}

function addWallPiece(axis, startX, startZ, length) {
  if (length <= 0.01) return;
  if (axis === 'x') {
    addBox({ size: [length, HOUSE.height, HOUSE.wall], position: [worldX(startX + length / 2), HOUSE.height / 2, worldZ(startZ)], material: wallMat, name: 'wall' });
  } else {
    addBox({ size: [HOUSE.wall, HOUSE.height, length], position: [worldX(startX), HOUSE.height / 2, worldZ(startZ + length / 2)], material: wallMat, name: 'wall' });
  }
}
function addDoorHeader(axis, startX, startZ, localStart, width) {
  const headerHeight = HOUSE.height - HOUSE.doorHeight;
  const centerLocal = localStart + width / 2;
  if (axis === 'x') addBox({ size: [width, headerHeight, HOUSE.wall], position: [worldX(startX + centerLocal), HOUSE.doorHeight + headerHeight / 2, worldZ(startZ)], material: wallMat });
  else addBox({ size: [HOUSE.wall, headerHeight, width], position: [worldX(startX), HOUSE.doorHeight + headerHeight / 2, worldZ(startZ + centerLocal)], material: wallMat });
}
function buildWall(wall) {
  const openings = [...(wall.openings ?? [])].map(o => ({ start: Math.max(0, o.center - o.width / 2), end: Math.min(wall.length, o.center + o.width / 2) })).sort((a, b) => a.start - b.start);
  let cursor = 0;
  for (const o of openings) {
    addWallPiece(wall.axis, wall.axis === 'x' ? wall.x + cursor : wall.x, wall.axis === 'z' ? wall.z + cursor : wall.z, o.start - cursor);
    addDoorHeader(wall.axis, wall.x, wall.z, o.start, o.end - o.start);
    cursor = o.end;
  }
  addWallPiece(wall.axis, wall.axis === 'x' ? wall.x + cursor : wall.x, wall.axis === 'z' ? wall.z + cursor : wall.z, wall.length - cursor);
}

addBox({ size: [HOUSE.width, 0.16, HOUSE.depth], position: [0, -0.08, 0], material: stoneMat, collide: false, castShadow: false });
addBox({ size: [HOUSE.width, 0.1, HOUSE.depth], position: [0, HOUSE.height + 0.05, 0], material: ceilingMat, collide: false, castShadow: false });
for (const room of rooms) {
  const fm = room.floor === 'wood' ? woodFloorMat : room.floor === 'light' ? lightFloorMat : room.floor === 'tile' ? tileMat : stoneMat;
  addBox({ size: [room.w - 0.04, 0.025, room.d - 0.04], position: [worldX(room.x + room.w / 2), 0.015, worldZ(room.z + room.d / 2)], material: fm, collide: false, castShadow: false, name: `floor-${room.name}` });
}
for (const wall of walls) buildWall(wall);
for (const panel of accentPanels) addBox({ size: [panel.w, panel.h, panel.d], position: [worldX(panel.x + panel.w / 2), panel.h / 2, worldZ(panel.z + panel.d / 2)], material: mat(panel.color, 0.7), collide: false });

function buildBed(i) {
  addBox({ size: [i.w, 0.34, i.d], position: [worldX(i.x + i.w / 2), 0.34, worldZ(i.z + i.d / 2)], material: mat(i.bedding, 0.95), name: i.name });
  addBox({ size: [i.w, i.h, 0.16], position: [worldX(i.x + i.w / 2), i.h / 2, worldZ(i.z + 0.1)], material: mat(i.headColor, 0.94), collide: true });
  addBox({ size: [i.w * 0.82, 0.12, 0.48], position: [worldX(i.x + i.w / 2), 0.58, worldZ(i.z + 0.43)], material: mat(0xf4f0e8, 1), collide: false });
}
function buildSofa(i) {
  const m = mat(i.color, 0.96);
  addBox({ size: [i.w, 0.42, i.d], position: [worldX(i.x + i.w / 2), 0.27, worldZ(i.z + i.d / 2)], material: m, name: i.name });
  addBox({ size: [i.w, 0.58, 0.2], position: [worldX(i.x + i.w / 2), 0.69, worldZ(i.z + 0.14)], material: m });
  addBox({ size: [0.18, 0.52, i.d], position: [worldX(i.x + 0.09), 0.48, worldZ(i.z + i.d / 2)], material: m });
  addBox({ size: [0.18, 0.52, i.d], position: [worldX(i.x + i.w - 0.09), 0.48, worldZ(i.z + i.d / 2)], material: m });
}
function buildRoundTable(i) {
  addCylinder({ r: i.r * 0.45, h: i.h, x: i.x, y: i.h / 2, z: i.z, material: mat(i.base, 0.5), collide: true });
  addCylinder({ r: i.r, h: 0.08, x: i.x, y: i.h, z: i.z, material: mat(i.top, 0.45), collide: true });
}
function buildLounge(i) {
  const m = mat(i.color, 0.92);
  addBox({ size: [i.w, 0.2, i.d], position: [worldX(i.x), 0.38, worldZ(i.z)], material: m, rotationY: i.rotation ?? 0 });
  addBox({ size: [i.w, i.h * 0.72, 0.16], position: [worldX(i.x), i.h * 0.58, worldZ(i.z - i.d * 0.34)], material: m, rotationY: i.rotation ?? 0 });
}
function buildDiningChair(i) {
  const m = mat(i.color, 0.9);
  addBox({ size: [0.46, 0.14, 0.46], position: [worldX(i.x), 0.48, worldZ(i.z)], material: m, rotationY: i.rotation ?? 0 });
  addBox({ size: [0.46, 0.56, 0.12], position: [worldX(i.x), 0.82, worldZ(i.z - 0.18)], material: m, rotationY: i.rotation ?? 0 });
  for (const sx of [-0.17, 0.17]) for (const sz of [-0.17, 0.17]) addBox({ size: [0.05, 0.46, 0.05], position: [worldX(i.x + sx), 0.23, worldZ(i.z + sz)], material: blackMat, collide: false });
}
function buildCabinet(i) { addBox({ size: [i.w, i.h, i.d], position: [worldX(i.x + i.w / 2), i.h / 2, worldZ(i.z + i.d / 2)], material: mat(i.color, 0.76), name: i.name }); }
function buildDesk(i) {
  addBox({ size: [i.w, 0.08, i.d], position: [worldX(i.x + i.w / 2), i.h, worldZ(i.z + i.d / 2)], material: mat(i.color, 0.65) });
  addBox({ size: [0.08, i.h, i.d], position: [worldX(i.x + 0.06), i.h / 2, worldZ(i.z + i.d / 2)], material: mat(i.color, 0.7) });
  addBox({ size: [0.08, i.h, i.d], position: [worldX(i.x + i.w - 0.06), i.h / 2, worldZ(i.z + i.d / 2)], material: mat(i.color, 0.7) });
}
function buildIsland(i) {
  addBox({ size: [i.w, i.h, i.d], position: [worldX(i.x + i.w / 2), i.h / 2, worldZ(i.z + i.d / 2)], material: mat(i.color, 0.48, 0.05), name: i.name });
  addBox({ size: [i.w + 0.08, 0.08, i.d + 0.08], position: [worldX(i.x + i.w / 2), i.h + 0.04, worldZ(i.z + i.d / 2)], material: blackMat });
}
function buildTvWall(i) {
  addBox({ size: [i.w, i.h, i.d], position: [worldX(i.x + i.w / 2), i.h / 2, worldZ(i.z + i.d / 2)], material: mat(i.color, 0.9), collide: false });
  addBox({ size: [0.08, 1.18, 1.92], position: [worldX(i.x + i.w * 0.42), 1.48, worldZ(i.z + i.d / 2)], material: mat(0x111111, 0.35), collide: false });
  addBox({ size: [0.22, 0.36, 2.25], position: [worldX(i.x + i.w * 0.15), 0.38, worldZ(i.z + i.d / 2)], material: mat(PALETTE.graphite, 0.65) });
}
function buildScreen(i) {
  addBox({ size: [i.w, i.h, i.d], position: [worldX(i.x + i.w / 2), i.h / 2, worldZ(i.z + i.d / 2)], material: glassMat, collide: true });
  for (let n = 0; n <= 4; n++) addBox({ size: [0.025, i.h, i.d + 0.02], position: [worldX(i.x + (i.w * n / 4)), i.h / 2, worldZ(i.z + i.d / 2)], material: blackMat, collide: false });
}
function buildWardrobeDesk(i) {
  addBox({ size: [i.w * 0.58, i.h, i.d], position: [worldX(i.x + i.w * 0.71), i.h / 2, worldZ(i.z + i.d / 2)], material: mat(i.color, 0.85) });
  addBox({ size: [i.w * 0.38, i.h * 0.68, i.d], position: [worldX(i.x + i.w * 0.19), i.h * 0.34, worldZ(i.z + i.d / 2)], material: mat(i.wood, 0.75) });
  addBox({ size: [i.w * 0.42, 0.08, 0.56], position: [worldX(i.x + i.w * 0.21), 0.78, worldZ(i.z + i.d / 2)], material: mat(i.wood, 0.62) });
}
function buildArcLamp(i) {
  addCylinder({ r: 0.13, h: 0.05, x: i.x, y: 0.025, z: i.z, material: blackMat, collide: false });
  addBox({ size: [0.035, i.h * 0.78, 0.035], position: [worldX(i.x), i.h * 0.39, worldZ(i.z)], material: blackMat, collide: false });
  addBox({ size: [0.9, 0.03, 0.03], position: [worldX(i.x + 0.42), i.h * 0.78, worldZ(i.z)], material: blackMat, collide: false, rotationY: -0.15 });
  addCylinder({ r: 0.22, h: 0.18, x: i.x + 0.82, y: i.h * 0.73, z: i.z, material: mat(0xf2efe9, 0.82), collide: false });
}
function buildArt(i) { addBox({ size: [0.05, i.h, i.w], position: [worldX(i.x), i.h / 2 + 0.42, worldZ(i.z)], material: mat(i.color, 0.9), collide: false }); }
function buildAcrylic(i) { addBox({ size: [i.w, i.h, i.d], position: [worldX(i.x), i.h / 2, worldZ(i.z)], material: glassMat, collide: true }); }
function buildRug(i, round = false) {
  if (round) addCylinder({ r: i.r, h: 0.025, x: i.x, y: 0.03, z: i.z, material: mat(i.color, 1), collide: false });
  else addBox({ size: [i.w, 0.025, i.d], position: [worldX(i.x + i.w / 2), 0.03, worldZ(i.z + i.d / 2)], material: mat(i.color, 1), collide: false, castShadow: false });
}

for (const i of furniture) {
  if (i.type === 'bed') buildBed(i);
  else if (i.type === 'sofa') buildSofa(i);
  else if (i.type === 'roundTable') buildRoundTable(i);
  else if (i.type === 'loungeChair') buildLounge(i);
  else if (i.type === 'diningChair') buildDiningChair(i);
  else if (i.type === 'cabinet') buildCabinet(i);
  else if (i.type === 'desk') buildDesk(i);
  else if (i.type === 'island') buildIsland(i);
  else if (i.type === 'tvWall') buildTvWall(i);
  else if (i.type === 'screen') buildScreen(i);
  else if (i.type === 'wardrobeDesk') buildWardrobeDesk(i);
  else if (i.type === 'arcLamp') buildArcLamp(i);
  else if (i.type === 'artPanel') buildArt(i);
  else if (i.type === 'acrylicStool') buildAcrylic(i);
  else if (i.type === 'rug') buildRug(i, false);
  else if (i.type === 'roundRug') buildRug(i, true);
  else if (i.type === 'console' || i.type === 'nightstand' || i.type === 'windowBench') buildCabinet(i);
}

// PDF 风格的线性灯和局部暖光。
for (const [x, z, len] of [[8.5, 4.9, 2.3], [8.45, 6.65, 2.0], [1.85, 3.8, 1.7]]) {
  addBox({ size: [len, 0.025, 0.025], position: [worldX(x), HOUSE.height - 0.16, worldZ(z)], material: mat(0x202020, 0.5), collide: false, castShadow: false });
}
for (const [x, z, intensity] of [[8.4, 3.2, 13], [8.55, 6.5, 14], [1.8, 3.1, 9], [3.5, 7.2, 8]]) {
  const light = new THREE.PointLight(0xffd7ad, intensity, 4.2, 2.2);
  light.position.set(worldX(x), 2.35, worldZ(z));
  scene.add(light);
}

const player = { radius: 0.32, eyeHeight: 1.65, baseSpeed: 2.8, sprintSpeed: 4.8 };
camera.position.set(worldX(10.0), player.eyeHeight, worldZ(10.1));
camera.rotation.set(0, Math.PI, 0);

const keys = new Set();
let verticalVelocity = 0;
let onGround = true;
window.addEventListener('keydown', (event) => {
  if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ShiftLeft', 'ShiftRight', 'Space'].includes(event.code)) event.preventDefault();
  keys.add(event.code);
  if (event.code === 'Space' && onGround && controls.isLocked) { verticalVelocity = 4.6; onGround = false; }
});
window.addEventListener('keyup', (event) => keys.delete(event.code));
window.addEventListener('blur', () => keys.clear());

function isBlocked(x, z) {
  const minY = camera.position.y - player.eyeHeight;
  const maxY = camera.position.y + 0.12;
  for (const box of colliders) {
    if (maxY < box.min.y || minY > box.max.y) continue;
    if (x + player.radius > box.min.x && x - player.radius < box.max.x && z + player.radius > box.min.z && z - player.radius < box.max.z) return true;
  }
  return false;
}
function currentRoomName() {
  const px = camera.position.x + HOUSE.width / 2;
  const pz = camera.position.z + HOUSE.depth / 2;
  for (const room of rooms) if (px >= room.x && px <= room.x + room.w && pz >= room.z && pz <= room.z + room.d) return room.name;
  return '过道 / 公区';
}

const forward = new THREE.Vector3();
const right = new THREE.Vector3();
const move = new THREE.Vector3();
const clock = new THREE.Clock();
let roomLabelTimer = 0;
function updatePlayer(dt) {
  if (!controls.isLocked) return;
  camera.getWorldDirection(forward); forward.y = 0; forward.normalize();
  right.crossVectors(forward, camera.up).normalize();
  move.set(0, 0, 0);
  if (keys.has('KeyW')) move.add(forward);
  if (keys.has('KeyS')) move.sub(forward);
  if (keys.has('KeyD')) move.add(right);
  if (keys.has('KeyA')) move.sub(right);
  if (move.lengthSq() > 0) move.normalize();
  const speed = (keys.has('ShiftLeft') || keys.has('ShiftRight')) ? player.sprintSpeed : player.baseSpeed;
  const dx = move.x * speed * dt, dz = move.z * speed * dt;
  const targetX = camera.position.x + dx; if (!isBlocked(targetX, camera.position.z)) camera.position.x = targetX;
  const targetZ = camera.position.z + dz; if (!isBlocked(camera.position.x, targetZ)) camera.position.z = targetZ;
  verticalVelocity -= 11.5 * dt; camera.position.y += verticalVelocity * dt;
  if (camera.position.y <= player.eyeHeight) { camera.position.y = player.eyeHeight; verticalVelocity = 0; onGround = true; }
  roomLabelTimer += dt;
  if (roomLabelTimer > 0.15) { roomLabelTimer = 0; roomName.textContent = currentRoomName(); }
}
function updateZoom(dt) {
  const nextFov = THREE.MathUtils.damp(camera.fov, targetFov, 11, dt);
  if (Math.abs(nextFov - camera.fov) > 0.0001) {
    camera.fov = nextFov;
    camera.updateProjectionMatrix();
  }
}
function animate() {
  requestAnimationFrame(animate);
  const dt = Math.min(clock.getDelta(), 0.05);
  updatePlayer(dt);
  updateZoom(dt);
  renderer.render(scene, camera);
}
animate();
window.addEventListener('resize', () => { camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix(); renderer.setSize(window.innerWidth, window.innerHeight); });
