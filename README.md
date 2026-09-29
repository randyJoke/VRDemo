# VRDemo

一个基于 Three.js + Vite 的浏览器第一人称 3D 漫游 Demo。

## 已实现

- WASD 第一人称移动
- 鼠标控制视角（Pointer Lock）
- Shift 加速
- Space 跳跃 + 基础重力
- ESC 释放鼠标
- 墙体与家具基础碰撞
- 房间、门洞、客厅/餐厅与基础家具几何体
- 基础灯光、阴影、雾化与 HUD

## 本地运行

```bash
npm install
npm run dev
```

打开终端输出的本地地址后，点击「进入场景」即可开始漫游。

## 构建

```bash
npm run build
npm run preview
```

## 下一步

当前版本以程序化几何体为主，适合作为真实室内 VR 漫游的基础框架。后续可以继续加入：

1. 按真实户型尺寸生成墙体、门窗与房间布局
2. 导入 Blender / SketchUp / 3ds Max 输出的 GLB/GLTF 家具与硬装模型
3. PBR 材质、HDR 环境光、烘焙光照和更真实的阴影
4. 门、灯光、柜门、家具材质切换等交互
5. 移动端虚拟摇杆与触摸视角
6. 小地图、房间导航和热点跳转

## 技术栈

- Three.js
- Vite
- WebGL
