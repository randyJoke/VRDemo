// C1 户型（143㎡）空间数据。
// 单位统一为米。总尺寸来自户型图：14.85m × 13.85m。
// 最新视觉基准：用户上传《彭丽-宋丹-12.24.pdf》；未标注精确尺寸的软装按户型比例近似。

export const HOUSE = {
  width: 14.85,
  depth: 13.85,
  height: 2.8,
  wall: 0.2,
  doorHeight: 2.15,
};

export const PALETTE = {
  warmWhite: 0xf2efe9,
  pureWhite: 0xf8f6f2,
  walnut: 0x59473b,
  walnutDark: 0x3f322b,
  charcoal: 0x222222,
  graphite: 0x343434,
  stone: 0x4d4843,
  stoneLight: 0x77706a,
  fabricBlack: 0x1f1f20,
  linen: 0xe7e1d7,
  taupe: 0xb7aa9a,
  accentRed: 0x6e1f19,
  warmWood: 0x7b624f,
  glass: 0xbfc8c9,
};

// 坐标系：户型图左下角为 (0, 0)，x 向右，z 向上。
export const rooms = [
  { name: '主卧', x: 0.25, z: 1.25, w: 3.35, d: 4.35, floor: 'wood' },
  { name: '书房', x: 3.6, z: 1.25, w: 3.0, d: 3.55, floor: 'light' },
  { name: '客厅', x: 6.6, z: 1.2, w: 4.5, d: 4.2, floor: 'stone' },
  { name: '次卧', x: 11.1, z: 1.25, w: 2.95, d: 3.4, floor: 'wood' },
  { name: '卫生间', x: 0.25, z: 5.7, w: 1.9, d: 2.9, floor: 'tile' },
  { name: '儿童房', x: 2.15, z: 5.7, w: 2.65, d: 2.9, floor: 'wood' },
  { name: '厨房', x: 4.8, z: 5.7, w: 2.25, d: 2.9, floor: 'stone' },
  { name: '餐厅', x: 7.05, z: 5.25, w: 4.05, d: 3.7, floor: 'stone' },
  { name: '卫生间', x: 11.1, z: 4.65, w: 1.45, d: 1.85, floor: 'tile' },
  { name: '生活阳台', x: 4.8, z: 8.6, w: 3.2, d: 1.6, floor: 'tile' },
  { name: '玄关/过道', x: 8.0, z: 8.95, w: 4.0, d: 2.1, floor: 'stone' },
  { name: '电梯厅侧', x: 12.0, z: 8.0, w: 2.6, d: 3.1, floor: 'stone' },
];

export const walls = [
  { axis: 'x', x: 0, z: 0, length: 14.85 },
  { axis: 'x', x: 0, z: 13.85, length: 14.85 },
  { axis: 'z', x: 0, z: 0, length: 13.85 },
  { axis: 'z', x: 14.85, z: 0, length: 13.85 },
  { axis: 'z', x: 3.6, z: 1.2, length: 4.55, openings: [{ center: 3.55, width: 0.9 }] },
  { axis: 'z', x: 6.6, z: 1.2, length: 4.25, openings: [{ center: 3.25, width: 1.0 }] },
  { axis: 'z', x: 11.1, z: 1.2, length: 4.3, openings: [{ center: 3.15, width: 0.9 }] },
  { axis: 'x', x: 0, z: 5.65, length: 6.6, openings: [{ center: 3.0, width: 0.95 }, { center: 5.85, width: 0.95 }] },
  { axis: 'x', x: 11.1, z: 4.65, length: 3.0, openings: [{ center: 0.7, width: 0.9 }] },
  { axis: 'z', x: 2.15, z: 5.65, length: 2.95, openings: [{ center: 2.25, width: 0.78 }] },
  { axis: 'z', x: 4.8, z: 5.65, length: 2.95, openings: [{ center: 2.25, width: 0.85 }] },
  { axis: 'z', x: 7.05, z: 5.65, length: 3.05, openings: [{ center: 2.2, width: 0.9 }] },
  { axis: 'x', x: 0, z: 8.6, length: 7.05, openings: [{ center: 5.8, width: 1.15 }] },
  { axis: 'z', x: 11.1, z: 4.65, length: 4.45, openings: [{ center: 2.6, width: 0.95 }] },
  { axis: 'x', x: 11.1, z: 6.5, length: 3.75, openings: [{ center: 2.4, width: 0.9 }] },
  { axis: 'x', x: 7.05, z: 9.0, length: 4.05, openings: [{ center: 3.15, width: 1.0 }] },
  { axis: 'x', x: 4.8, z: 10.2, length: 3.2 },
  { axis: 'z', x: 8.0, z: 8.6, length: 2.6, openings: [{ center: 1.55, width: 0.9 }] },
  { axis: 'x', x: 8.0, z: 11.2, length: 4.0, openings: [{ center: 1.6, width: 1.0 }] },
];

// 家具朝向 rotation 单位为弧度（绕 Y 轴）。
export const furniture = [
  // 客厅：PDF p3-p7，黑色沙发 + 圆形茶几 + 红棕色单椅 + 电视墙。
  { type: 'sofa', name: '客厅黑色沙发', x: 7.15, z: 2.05, w: 2.65, d: 0.86, h: 0.76, color: PALETTE.fabricBlack },
  { type: 'roundTable', name: '白黑圆形茶几', x: 8.55, z: 3.42, r: 0.48, h: 0.39, top: PALETTE.pureWhite, base: PALETTE.charcoal },
  { type: 'roundTable', name: '酒红边几', x: 7.72, z: 3.18, r: 0.25, h: 0.53, top: PALETTE.accentRed, base: PALETTE.accentRed },
  { type: 'loungeChair', name: '红棕单椅', x: 10.15, z: 3.25, w: 0.62, d: 0.72, h: 0.82, color: 0x8a3b2d, rotation: -0.25 },
  { type: 'acrylicStool', name: '透明边几', x: 7.0, z: 3.45, w: 0.42, d: 0.38, h: 0.48 },
  { type: 'rug', name: '客厅地毯', x: 7.0, z: 2.75, w: 3.55, d: 2.15, color: 0xd8d0c5 },
  { type: 'tvWall', name: '客厅电视墙', x: 10.62, z: 1.62, w: 0.3, d: 2.7, h: 2.25, color: PALETTE.warmWhite },

  // 餐厨：PDF p3-p7，深色柜体、镜面/石材背板、黑色岛台/餐桌、白色座椅。
  { type: 'cabinet', name: '餐厅木饰面高柜', x: 7.12, z: 6.0, w: 0.55, d: 2.35, h: 2.48, color: PALETTE.walnutDark },
  { type: 'cabinet', name: '厨房深色柜体', x: 5.0, z: 5.92, w: 0.62, d: 2.35, h: 2.35, color: PALETTE.graphite },
  { type: 'island', name: '黑色餐岛台', x: 8.0, z: 6.18, w: 2.0, d: 0.86, h: 0.79, color: PALETTE.charcoal },
  { type: 'diningChair', name: '餐椅1', x: 8.1, z: 5.82, color: PALETTE.linen, rotation: Math.PI },
  { type: 'diningChair', name: '餐椅2', x: 9.0, z: 5.82, color: PALETTE.linen, rotation: Math.PI },
  { type: 'diningChair', name: '餐椅3', x: 8.1, z: 7.12, color: PALETTE.linen, rotation: 0 },
  { type: 'diningChair', name: '餐椅4', x: 9.0, z: 7.12, color: PALETTE.linen, rotation: 0 },

  // 玄关：PDF p2，深木饰面 + 黑框玻璃/格栅 + 黑色台面。
  { type: 'cabinet', name: '玄关木饰面柜', x: 8.2, z: 9.25, w: 0.48, d: 1.8, h: 2.5, color: PALETTE.walnutDark },
  { type: 'console', name: '玄关黑色台面', x: 9.05, z: 10.25, w: 1.55, d: 0.36, h: 0.82, color: PALETTE.charcoal },
  { type: 'screen', name: '玄关黑框玻璃', x: 9.85, z: 9.35, w: 1.15, d: 0.08, h: 2.45 },

  // 主卧：PDF p8-p10，深色软包床头、浅色床品、白色整墙柜 + 木色书桌。
  { type: 'bed', name: '主卧床', x: 0.72, z: 2.15, w: 1.82, d: 2.05, h: 1.05, headColor: 0x34312e, bedding: 0xe8e2d8 },
  { type: 'nightstand', name: '主卧床头柜左', x: 0.5, z: 2.58, w: 0.38, d: 0.4, h: 0.45, color: PALETTE.graphite },
  { type: 'nightstand', name: '主卧床头柜右', x: 2.78, z: 2.58, w: 0.38, d: 0.4, h: 0.45, color: PALETTE.graphite },
  { type: 'wardrobeDesk', name: '主卧衣柜书桌一体', x: 0.42, z: 4.75, w: 2.92, d: 0.54, h: 2.45, color: PALETTE.pureWhite, wood: PALETTE.warmWood },

  // 儿童房：PDF p11，白柜、长书桌、浅色椅、儿童地毯。
  { type: 'cabinet', name: '儿童房白柜', x: 2.2, z: 5.9, w: 0.55, d: 2.35, h: 2.4, color: PALETTE.pureWhite },
  { type: 'desk', name: '儿童房书桌', x: 2.85, z: 7.55, w: 1.62, d: 0.5, h: 0.73, color: PALETTE.warmWood },
  { type: 'diningChair', name: '儿童椅', x: 3.65, z: 7.0, color: 0xd0c5ba, rotation: Math.PI },
  { type: 'roundRug', name: '儿童圆毯', x: 3.6, z: 7.1, r: 0.68, color: 0xd9805d },

  // 书房：PDF p12，白色高柜、黑灰单椅、弧形落地灯、大幅艺术画。
  { type: 'cabinet', name: '书房高柜', x: 5.82, z: 1.45, w: 0.62, d: 2.55, h: 2.42, color: PALETTE.pureWhite },
  { type: 'loungeChair', name: '书房黑灰单椅', x: 4.15, z: 2.4, w: 0.78, d: 0.82, h: 0.9, color: 0x45413f, rotation: 0.4 },
  { type: 'arcLamp', name: '书房弧形灯', x: 3.9, z: 3.6, h: 2.0, color: 0x171717 },
  { type: 'artPanel', name: '书房艺术画', x: 5.0, z: 1.5, w: 1.05, h: 1.75, color: 0xb4aaa0 },

  // 次卧：PDF p13，浅色软包床、白色高柜、暖木飘窗/墙面。
  { type: 'bed', name: '次卧床', x: 11.72, z: 1.8, w: 1.45, d: 1.95, h: 0.92, headColor: 0xbcb1a5, bedding: 0xe4ded5 },
  { type: 'cabinet', name: '次卧白柜', x: 11.18, z: 1.42, w: 0.52, d: 2.45, h: 2.4, color: PALETTE.pureWhite },
  { type: 'windowBench', name: '次卧飘窗', x: 13.45, z: 2.0, w: 0.48, d: 1.75, h: 0.5, color: PALETTE.warmWood },
];

export const accentPanels = [
  { x: 6.72, z: 1.28, w: 0.12, d: 2.75, h: 2.55, color: PALETTE.walnutDark },
  { x: 7.04, z: 5.52, w: 0.12, d: 2.9, h: 2.55, color: PALETTE.walnutDark },
  { x: 0.3, z: 1.45, w: 0.12, d: 2.7, h: 2.35, color: PALETTE.warmWood },
  { x: 13.8, z: 1.35, w: 0.12, d: 2.3, h: 2.4, color: PALETTE.warmWood },
];
