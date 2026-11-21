# 🍄 SUPER MARIO: ROGUE ODYSSEY | 超级马里奥：肉鸽奥德赛

<p align="center">
  <strong>A 16-Bit Pixel-Art Action Roguelite built with Vanilla HTML5 Canvas, Web Audio SFX, and Dedicated Bilingual Routes (<code>/en/</code> &amp; <code>/zh/</code>)</strong><br/>
  <strong>一款 16-Bit 像素风格横版动作肉鸽游戏，原生 HTML5 Canvas + 程序化音效 + 中英文独立路由与专属界面优化</strong>
</p>

<p align="center">
  <a href="https://hermanteng19.github.io/super-mario-rogue/en/">🎮 <strong>Play Online (English /en/)</strong></a> ·
  <a href="https://hermanteng19.github.io/super-mario-rogue/zh/">🎮 <strong>在线试玩（中文旗舰版 /zh/）</strong></a>
</p>

<p align="center">
  <a href="#english">🇺🇸 English</a> ·
  <a href="#简体中文">🇨🇳 简体中文</a>
</p>

---

<a id="english"></a>

## 🇺🇸 English

**SUPER MARIO: ROGUE ODYSSEY** is a zero-dependency, 16-bit pixel-art side-scrolling **Action Roguelite** built with pure HTML5 Canvas, ES Modules, CSS3, and procedural Web Audio chiptune synthesis.

Combine classic **aerial stomp combos**, **Meteor Ground Pounds**, and **Cyclone Spin Jumps** with **6 legendary weapons**, **RPG leveling**, and **24 roguelite blessing synergies** across **5 procedurally generated biome stages**—culminating in a **3-phase battle against Mecha-Crowned Bowser**!

### ✨ Key Features
- **Dedicated Localized Routes (`/en/` & `/zh/`)**:
  - Root `/` defaults to the **English Arcade Edition (`/en/`)**, featuring arcade uppercase rhythm, wider sidebars for Latin labels, and crisp short weapon hotbar tags (`FIRE STAFF`, `WAR MALLET`, `BOOMERANG`, `ICE STORM`, `THUNDER`, `CAPE BLADE`).
  - **Chinese Flagship Edition (`/zh/`)** uses CJK-optimized typography (`PingFang SC` / `Noto Sans SC`), narrower sidebars that unlock a wider 16:9 game viewport, and full Chinese weapon names.
  - **Seamless Cross-Route State Transfer**: Switching between `/en/` and `/zh/` mid-run automatically preserves your current stage, score, HP, coins, weapons, and blessings via `sessionStorage`, paired with native CSS Cross-Document View Transitions (`@view-transition`).
- **6 Legendary Weapons**: Fire Flower Staff, Hammer Bros. Mallet, Boomerang Flower, Ice Storm Blaster, Thunder Star Wand, and Golden Cape Blade (with projectile parry & aerial hover).
- **24 Roguelite Blessings & Synergies**: Chain-lightning stomps, frozen ice-shatter AoE explosions, phantom decoy dashes, twin-star multishot, coin-scaled greed damage, and 1-UP revives.
- **5 Procedural Biome Stages + 3-Phase Final Boss**: Emerald Plains → Crystal Cavern → Gale Sky Ruins → Phantom Ghost Keep → Bowser's Molten Citadel.
- **Mobile Handheld Console & PWA Mode (iOS Safari / Chrome / Edge)**: Opening `/en/` or `/zh/` on a smartphone automatically switches to a full-screen 16:9 landscape handheld console with a multi-touch sliding D-pad, ergonomic Jump / Hold-to-Fire Attack / Dash / Spin / midair-lit Slam buttons, quick weapon cycler, native pause menu, and PWA Home Screen install (`manifest.json`), with zero impact on desktop.
- **Zero Dependencies & Built-in No-Cache Launcher**: Runs out of the box with `./start.sh` (Python 3).

### 🚀 Quick Start

```bash
git clone https://github.com/HermanTeng19/super-mario-rogue.git
cd super-mario-rogue
./start.sh
```

- **English Edition (Default)**: `http://localhost:8090/en/`
- **Chinese Edition**: `http://localhost:8090/zh/`
- Optional flags: `./start.sh 9000` (custom port) · `./start.sh --no-open` (do not auto-open browser)

### 🎮 Controls

| Action | Keys / Input |
| :--- | :--- |
| **Move Left / Right** | `A` / `D` or `←` / `→` |
| **Jump / Double Jump** | `Space` / `W` / `↑` |
| **Cyclone Spin Jump** | `Q` *(multi-hit slash + deflects enemy projectiles)* |
| **Meteor Ground Pound** | Midair `S` or `↓` *(AoE shockwave + shatters blocks)* |
| **Primary Weapon Attack** | `J` / `F` / **Left Click** |
| **Invincible Phantom Dash** | `K` / `Shift` / **Right Click** |
| **Switch Weapons** | `1` – `6` or `E` |
| **Toad's Black Market Shop** | `B` or click **Toad's Shop** in top bar |

### 📁 Project Structure

```text
super-mario-rogue/
├── index.html            # Root entry (redirects to /en/)
├── en/index.html         # English Arcade Edition route (/en/)
├── zh/index.html         # Chinese Flagship Edition route (/zh/)
├── style.css             # Shared 16-bit UI, modals & @view-transition
├── styles/
│   ├── locale-en.css     # English layout & typography optimizations
│   └── locale-zh.css     # Chinese CJK layout & viewport optimizations
├── js/
│   ├── game.js           # Core physics, combat loop, HUD & route state sync
│   ├── i18n.js           # Route-aware EN/ZH localization engine
│   ├── data.js           # 6 weapons, 24 roguelite perks & 5 biome stages
│   ├── boss.js           # 3-Phase Mecha-Crowned Bowser AI
│   ├── levelgen.js       # Procedural stage & enemy generator
│   ├── sprites.js        # Procedural 16-bit pixel-art sprite renderer
│   └── audio.js          # Web Audio API chiptune SFX synthesizer
└── start.sh              # One-click no-cache local server launcher
```

---

<a id="简体中文"></a>

## 🇨🇳 简体中文

**《超级马里奥：肉鸽奥德赛》(SUPER MARIO: ROGUE ODYSSEY)** 是一款零外部依赖、16-Bit 像素风格的横版动作肉鸽（Action Roguelite）游戏，基于原生 HTML5 Canvas、ES Modules 与 Web Audio 程序化芯片音效构建。

游戏融合了经典的**空中连踩连击、陨石重锤下砸、旋风弹反跳**以及**6 大传奇武器系统、RPG 等级成长、24 种肉鸽赐福词条协同**，带你穿越 **5 大随机生成生态关卡**，最终迎战**三阶段终焉魔王·机甲酷霸王 (Mecha-Crowned Bowser)**！

### ✨ 核心亮点
- **中英文独立路由与专属界面优化（`/en/` 与 `/zh/`）**：
  - 根路径 `/` 默认跳转至**英文街机版（`/en/`）**，针对拉丁字符优化了侧栏宽度与武器槽街机短名（零截断）。
  - **中文旗舰版（`/zh/`）** 采用 `PingFang SC / Noto Sans SC` 清晰汉字栈与宽松行高，并利用中文词条紧凑的优势收窄两侧边栏，为中央 16:9 游戏画布释放更大视野。
  - **跨路由进度无缝继承**：游玩途中随时点击顶部 `EN /en` ↔ `中文 /zh` 切换路由，会自动保留当前关卡、得分、生命值、金币、武器等级与肉鸽赐福，并配合原生跨文档视图转场动画（`@view-transition`）。
- **6 大传奇武器**：烈焰花法杖、重装战锤、旋风回旋花、极寒冰晶炮、雷霆星辉杖、黄金披风旋刃（支持弹反敌方弹幕与空中滑翔）。
- **24 种肉鸽赐福词条**：雷霆踏云靴、猩红嗜血铁靴、熔核陨石震地、冰爆碎裂、双子星辉散射、幻影残像冲刺、1-UP 翠绿神菇复活等流派协同。
- **5 大生态关卡 + 三阶段终焉 Boss**：蘑菇翡翠平原 → 幽暗水晶地窟 → 云端疾风遗迹 → 幻影幽灵古堡 → 酷霸王终焉熔岩魔城。
- **手机全屏掌机模式 & PWA 支持（iOS Safari / Chrome / Edge）**：手机端访问 `/en/` 或 `/zh/` 自动切换为全屏 16:9 横屏掌机布局，内置左手连续滑动方向键、右手多点触控按键（跳跃 / 长按连发攻击 / 冲刺 / 旋风 / 空中高亮下砸）、一键切武器与掌机暂停菜单，支持“添加到主屏幕”全屏运行，桌面端零影响。
- **一键无缓存启动脚本**：运行 `./start.sh` 即可在本地启动并自动打开游戏。

### 🚀 快速启动

```bash
git clone https://github.com/HermanTeng19/super-mario-rogue.git
cd super-mario-rogue
./start.sh
```

- **英文街机版（默认）**：`http://localhost:8090/en/`
- **中文旗舰版**：`http://localhost:8090/zh/`
- 支持可选参数：`./start.sh 9000`（自定义端口） · `./start.sh --no-open`（仅启服务不自动开浏览器）

### 🎮 操作指南

| 动作 | 按键 / 输入 |
| :--- | :--- |
| **左右移动** | `A` / `D` 或 `←` / `→` |
| **跳跃 / 二段跳** | `Space` / `W` / `↑` |
| **旋风切割跳 (Spin Jump)** | `Q`（多段伤害 + 弹反敌方子弹） |
| **陨石重锤下砸 (Ground Pound)** | 空中按 `S` 或 `↓`（范围冲击波 + 震碎强化砖块） |
| **主武器攻击** | `J` / `F` / **鼠标左键** |
| **无敌幻影冲刺 (Dash)** | `K` / `Shift` / **鼠标右键** |
| **切换武器** | 数字键 `1` ~ `6` 或 `E` 键循环切换 |
| **奇诺比奥流亡黑市** | `B` 键或点击顶部【奇诺比奥商店】按钮 |
