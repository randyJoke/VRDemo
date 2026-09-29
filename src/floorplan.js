// C1 户型（143㎡）第一版空间数据。
// 单位统一为米。已知总尺寸来自户型图：14.85m × 13.85m。
// 局部尺寸未在原图明确标注的位置采用近似值，后续可按施工图继续校正。

export const HOUSE = {
  width: 14.85,
  depth: 13.85,
  height: 2.8,
  wall: 0.2,
  doorHeight: 2.15,
};

// 坐标系：户型图左下角为 (0, 0)，x 向右，z 向上。
// main.js 会把它转换成 Three.js 以房屋中心为原点的坐标。
export const rooms = [
  { name: '主卧', x: 0.25, z: 1.25, w: 3.35, d: 4.35, color: 0xd7cbbd },
  { name: '杂物间', x: 3.6, z: 1.25, w: 3.0, d: 3.55, color: 0xd8d2c8 },
  { name: '客厅', x: 6.6, z: 1.2, w: 4.5, d: 4.2, color: 0xe4ddd2 },
  { name: '卧室', x: 11.1, z: 1.25, w: 2.95, d: 3.4, color: 0xd7cbbd },

  { name: '卫生间', x: 0.25, z: 5.7, w: 1.9, d: 2.9, color: 0xcfd8d8 },
  { name: '卧室', x: 2.15, z: 5.7, w: 2.65, d: 2.9, color: 0xd7cbbd },
  { name: '厨房', x: 4.8, z: 5.7, w: 2.25, d: 2.9, color: 0xd9d3c8 },
  { name: '餐厅', x: 7.05, z: 5.25, w: 4.05, d: 3.7, color: 0xe4ddd2 },
  { name: '卫生间', x: 11.1, z: 4.65, w: 1.45, d: 1.85, color: 0xcfd8d8 },

  { name: '生活阳台', x: 4.8, z: 8.6, w: 3.2, d: 1.6, color: 0xd8d5cf },
  { name: '玄关/过道', x: 8.0, z: 8.95, w: 4.0, d: 2.1, color: 0xe1ddd5 },
  { name: '电梯厅侧', x: 12.0, z: 8.0, w: 2.6, d: 3.1, color: 0xd6d1c9 },
];

// 墙段：axis='x' 表示沿 x 方向延伸，axis='z' 表示沿 z 方向延伸。
// openings: [{ center, width }]，center 是墙段局部坐标（从墙段起点算起）。
export const walls = [
  // 外墙
  { axis: 'x', x: 0, z: 0, length: 14.85 },
  { axis: 'x', x: 0, z: 13.85, length: 14.85 },
  { axis: 'z', x: 0, z: 0, length: 13.85 },
  { axis: 'z', x: 14.85, z: 0, length: 13.85 },

  // 下半区：主卧 / 杂物间 / 客厅 / 右卧室
  { axis: 'z', x: 3.6, z: 1.2, length: 4.55, openings: [{ center: 3.55, width: 0.9 }] },
  { axis: 'z', x: 6.6, z: 1.2, length: 4.25, openings: [{ center: 3.25, width: 1.0 }] },
  { axis: 'z', x: 11.1, z: 1.2, length: 4.3, openings: [{ center: 3.15, width: 0.9 }] },
  { axis: 'x', x: 0, z: 5.65, length: 6.6, openings: [{ center: 3.0, width: 0.95 }, { center: 5.85, width: 0.95 }] },
  { axis: 'x', x: 11.1, z: 4.65, length: 3.0, openings: [{ center: 0.7, width: 0.9 }] },

  // 上半区：卫浴 / 次卧 / 厨房 / 餐厅
  { axis: 'z', x: 2.15, z: 5.65, length: 2.95, openings: [{ center: 2.25, width: 0.78 }] },
  { axis: 'z', x: 4.8, z: 5.65, length: 2.95, openings: [{ center: 2.25, width: 0.85 }] },
  { axis: 'z', x: 7.05, z: 5.65, length: 3.05, openings: [{ center: 2.2, width: 0.9 }] },
  { axis: 'x', x: 0, z: 8.6, length: 7.05, openings: [{ center: 5.8, width: 1.15 }] },

  // 餐客厅与右侧功能区
  { axis: 'z', x: 11.1, z: 4.65, length: 4.45, openings: [{ center: 2.6, width: 0.95 }] },
  { axis: 'x', x: 11.1, z: 6.5, length: 3.75, openings: [{ center: 2.4, width: 0.9 }] },
  { axis: 'x', x: 7.05, z: 9.0, length: 4.05, openings: [{ center: 3.15, width: 1.0 }] },

  // 北侧生活阳台 / 玄关轮廓（按户型图近似）
  { axis: 'x', x: 4.8, z: 10.2, length: 3.2 },
  { axis: 'z', x: 8.0, z: 8.6, length: 2.6, openings: [{ center: 1.55, width: 0.9 }] },
  { axis: 'x', x: 8.0, z: 11.2, length: 4.0, openings: [{ center: 1.6, width: 1.0 }] },
];

export const furniture = [
  // 主卧床
  { type: 'box', name: '主卧床', x: 0.75, z: 2.0, w: 1.9, d: 2.1, h: 0.52, color: 0xc8b8a6 },
  { type: 'box', name: '主卧衣柜', x: 0.4, z: 5.0, w: 2.5, d: 0.5, h: 2.25, color: 0x8a765f },

  // 次卧床
  { type: 'box', name: '次卧床', x: 2.55, z: 6.05, w: 1.55, d: 2.0, h: 0.48, color: 0xc8b8a6 },

  // 右卧室
  { type: 'box', name: '右卧床', x: 11.65, z: 1.75, w: 1.55, d: 2.0, h: 0.48, color: 0xc8b8a6 },

  // 客厅
  { type: 'box', name: '沙发', x: 7.05, z: 2.0, w: 2.7, d: 0.92, h: 0.72, color: 0x8e9290 },
  { type: 'box', name: '茶几', x: 8.05, z: 3.45, w: 1.45, d: 0.72, h: 0.4, color: 0x7a604d },
  { type: 'box', name: '电视柜', x: 10.55, z: 1.75, w: 0.42, d: 2.45, h: 0.5, color: 0x5b5148 },

  // 餐厅
  { type: 'box', name: '餐桌', x: 8.1, z: 6.25, w: 2.0, d: 0.95, h: 0.76, color: 0x7a604d },

  // 厨房操作台
  { type: 'box', name: '厨房台面', x: 5.05, z: 6.0, w: 0.6, d: 2.15, h: 0.9, color: 0xb9afa2 },
];
