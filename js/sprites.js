// Procedural 16-Bit Pixel Art Sprite Renderer & Background Painter

const SPRITE_CACHE = new Map();

/**
 * Renders a 2D ASCII pixel matrix onto an offscreen canvas for fast blitting,
 * or directly draws crisp pixel blocks.
 */
export function drawPixelGrid(ctx, matrix, palette, x, y, pixelSize = 2, flipX = false) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const key = `${matrix[0]}_${JSON.stringify(palette)}_${pixelSize}_${flipX}`;

  let cached = SPRITE_CACHE.get(key);
  if (!cached) {
    const off = document.createElement('canvas');
    off.width = cols * pixelSize;
    off.height = rows * pixelSize;
    const octx = off.getContext('2d');

    for (let r = 0; r < rows; r++) {
      const rowStr = matrix[r];
      for (let c = 0; c < cols; c++) {
        const ch = rowStr[c];
        if (ch === '.' || !palette[ch]) continue;
        octx.fillStyle = palette[ch];
        const drawCol = flipX ? (cols - 1 - c) : c;
        octx.fillRect(drawCol * pixelSize, r * pixelSize, pixelSize, pixelSize);
      }
    }
    if (SPRITE_CACHE.size > 400) SPRITE_CACHE.clear();
    SPRITE_CACHE.set(key, off);
    cached = off;
  }

  ctx.drawImage(cached, Math.round(x), Math.round(y));
}

// 16x16 Mario Idle/Run/Jump Pixel Matrices
const MARIO_IDLE = [
  '....HHHHH.......',
  '...HHHHHHHHH....',
  '...BBBSSKSSS....',
  '..BSBSSSKSSSS...',
  '..BSBBSSKSSSSS..',
  '..BBSSSSKKKK....',
  '....SSSSSSSS....',
  '...CCCRRCCCCC...',
  '..CCCCRRCCCCCC..',
  '..CCCCRRRRCCCC..',
  '..SSCRRRRRRCSS..',
  '..SSRRRRRRRRSS..',
  '..SSRRRRRRRRSS..',
  '....RRR..RRR....',
  '...BBBB..BBBB...',
  '..BBBBB..BBBBB..'
];

const MARIO_RUN1 = [
  '....HHHHH.......',
  '...HHHHHHHHH....',
  '...BBBSSKSSS....',
  '..BSBSSSKSSSS...',
  '..BSBBSSKSSSSS..',
  '..BBSSSSKKKK....',
  '....SSSSSSSS....',
  '....CCRRCCCC....',
  '..SSCRRRRCCC....',
  '..SSRRRRRRRR....',
  '....RRRRRRRR....',
  '...RRRRRRRRR....',
  '..RRRR....RRR...',
  '.BBBB.....BBBB..',
  '.BBBB......BBBB.',
  '................'
];

const MARIO_JUMP = [
  '....HHHHH..SSS..',
  '...HHHHHHHHHSS..',
  '...BBBSSKSSSCC..',
  '..BSBSSSKSSSSCC.',
  '..BSBBSSKSSSSCC.',
  '..BBSSSSKKKKCCC.',
  '....SSSSSSSSCC..',
  '..CCCCRRCCCCC...',
  '.SSCCRRRRCCCC...',
  '.SSCRRRRRRCCC...',
  '....RRRRRRRR....',
  '...RRRRRRRRRR...',
  '..RRR.....RRRR..',
  '.BBBB......BBBB.',
  'BBBB........BBBB',
  '................'
];

export function drawMarioSprite(ctx, player, time) {
  const { x, y, w, h, facing, state, animTimer, starTimer, hurtTimer } = player;
  if (hurtTimer > 0 && Math.floor(hurtTimer * 20) % 2 === 0) {
    ctx.globalAlpha = 0.45;
  }

  const weaponPalette = player.currentWeapon.palette;
  let hatColor = weaponPalette.hat;
  let shirtColor = weaponPalette.shirt;
  let overallColor = weaponPalette.overalls;

  // Rainbow Star Invincibility cycling
  if (starTimer > 0) {
    const hue = Math.floor((time * 720) % 360);
    hatColor = `hsl(${hue}, 95%, 60%)`;
    shirtColor = `hsl(${(hue + 120) % 360}, 95%, 55%)`;
    overallColor = `hsl(${(hue + 240) % 360}, 95%, 60%)`;
  }

  const palette = {
    H: hatColor,
    C: shirtColor,
    R: overallColor,
    S: '#ffcc99', // Skin
    B: '#4a2511', // Hair/Boots
    K: '#111111'  // Mustache/Eyes
  };

  let matrix = MARIO_IDLE;
  if (state === 'jump' || state === 'fall' || state === 'spin' || state === 'pound') {
    matrix = MARIO_JUMP;
  } else if (Math.abs(player.vx) > 20) {
    matrix = Math.floor(animTimer * 10) % 2 === 0 ? MARIO_RUN1 : MARIO_IDLE;
  }

  ctx.save();
  const cx = x + w / 2;
  const cy = y + h / 2;

  if (state === 'spin' || state === 'pound') {
    ctx.translate(cx, cy);
    ctx.rotate(time * 22 * facing);
    drawPixelGrid(ctx, matrix, palette, -16, -18, 2.25, facing < 0);
  } else {
    drawPixelGrid(ctx, matrix, palette, x - 3, y - 2, 2.25, facing < 0);
  }
  ctx.restore();

  // Draw equipped weapon indicator next to Mario's hand
  const wx = facing > 0 ? x + w - 2 : x - 10;
  const wy = y + 14 + Math.sin(time * 8) * 2;
  ctx.fillStyle = weaponPalette.accent;
  ctx.fillRect(Math.round(wx), Math.round(wy), 8, 8);
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(Math.round(wx), Math.round(wy), 8, 8);

  ctx.globalAlpha = 1;
}

export function drawPortrait(ctx, weapon, starActive, time) {
  ctx.clearRect(0, 0, 64, 64);
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 64, 64);

  const pal = weapon.palette;
  const palette = {
    H: starActive ? `hsl(${(time * 500) % 360}, 90%, 60%)` : pal.hat,
    C: pal.shirt,
    R: pal.overalls,
    S: '#ffcc99',
    B: '#4a2511',
    K: '#111111'
  };
  drawPixelGrid(ctx, MARIO_IDLE, palette, 8, 8, 3, false);
}

// --- Enemy Pixel Art Renderers ---
export function drawEnemySprite(ctx, e, time) {
  const { x, y, w, h, type, vx, frozenTimer, hurtFlash } = e;
  ctx.save();

  const flip = vx > 0;
  const step = Math.floor(time * 6) % 2;

  if (type === 'goomba') {
    // Classic Chestnut Goomba
    ctx.fillStyle = hurtFlash > 0 ? '#fff' : '#854d0e';
    ctx.beginPath();
    ctx.arc(x + w / 2, y + h / 2 - 2, w / 2, Math.PI, 0, false);
    ctx.lineTo(x + w, y + h - 6);
    ctx.lineTo(x, y + h - 6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Stem
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(x + 7, y + h - 9, w - 14, 6);

    // Angry Eyes
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 6, y + 8, 5, 7);
    ctx.fillRect(x + w - 11, y + 8, 5, 7);
    ctx.fillStyle = '#000';
    ctx.fillRect(x + 8, y + 10, 3, 5);
    ctx.fillRect(x + w - 11, y + 10, 3, 5);

    // Walking Feet
    ctx.fillStyle = '#111';
    ctx.fillRect(x + (step ? 2 : 5), y + h - 5, 9, 5);
    ctx.fillRect(x + w - (step ? 14 : 11), y + h - 5, 9, 5);
  } else if (type === 'koopa' || type === 'paratroopa') {
    if (e.inShell) {
      // Spinning Green Shell
      ctx.fillStyle = hurtFlash > 0 ? '#fff' : '#16a34a';
      ctx.fillRect(x + 2, y + 4, w - 4, h - 6);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 4, y + 6, w - 8, h - 10);
      // Shell hexagons
      ctx.fillStyle = '#14532d';
      const spinOffset = Math.floor(time * 20) % 12;
      ctx.fillRect(x + 6 + (spinOffset % 8), y + 9, 8, 8);
    } else {
      // Head
      const hx = flip ? x + w - 12 : x + 2;
      ctx.fillStyle = '#facc15';
      ctx.fillRect(hx, y + 2, 11, 11);
      ctx.fillStyle = '#000';
      ctx.fillRect(hx + (flip ? 6 : 2), y + 4, 3, 4);

      // Shell
      ctx.fillStyle = hurtFlash > 0 ? '#fff' : (type === 'paratroopa' ? '#ef4444' : '#22c55e');
      ctx.fillRect(x + 5, y + 10, w - 10, h - 14);
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 2;
      ctx.strokeRect(x + 5, y + 10, w - 10, h - 14);

      // Wings for Paratroopa
      if (type === 'paratroopa') {
        ctx.fillStyle = '#fff';
        const wingY = y + 4 + (step ? -4 : 2);
        ctx.fillRect(x + w / 2 - 4, wingY, 10, 8);
        ctx.strokeStyle = '#38bdf8';
        ctx.strokeRect(x + w / 2 - 4, wingY, 10, 8);
      }

      // Boots
      ctx.fillStyle = '#eab308';
      ctx.fillRect(x + (step ? 4 : 8), y + h - 5, 8, 5);
      ctx.fillRect(x + w - (step ? 12 : 8), y + h - 5, 8, 5);
    }
  } else if (type === 'buzzy') {
    // Fireproof Armored Buzzy Beetle
    ctx.fillStyle = hurtFlash > 0 ? '#fff' : '#1e293b';
    ctx.fillRect(x + 2, y + 4, w - 4, h - 8);
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 4, w - 4, h - 8);
    // Glowing red eyes under dark helmet
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(flip ? x + w - 9 : x + 5, y + 12, 4, 4);
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(x + 6, y + h - 4, 7, 4);
    ctx.fillRect(x + w - 13, y + h - 4, 7, 4);
  } else if (type === 'piranha') {
    // Snapping Red & White Spotted Piranha Plant
    ctx.fillStyle = '#15803d';
    ctx.fillRect(x + w / 2 - 5, y + 18, 10, h - 18);
    ctx.fillStyle = hurtFlash > 0 ? '#fff' : '#dc2626';
    ctx.fillRect(x + 2, y, w - 4, 20);
    // White spots
    ctx.fillStyle = '#fff';
    ctx.fillRect(x + 5, y + 4, 5, 5);
    ctx.fillRect(x + w - 10, y + 10, 5, 5);
    // Jaws & Teeth
    ctx.fillStyle = '#fef08a';
    const jawOpen = step ? 4 : 1;
    ctx.fillRect(x + 4, y - jawOpen, w - 8, 4);
  } else if (type === 'hammerbro') {
    // Elite Hammer Bro
    ctx.fillStyle = hurtFlash > 0 ? '#fff' : '#15803d';
    ctx.fillRect(x + 4, y + 8, w - 8, h - 12);
    // Helmet
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(x + 3, y, w - 6, 10);
    // Beak & Eyes
    ctx.fillStyle = '#facc15';
    ctx.fillRect(flip ? x + w - 6 : x - 2, y + 8, 8, 6);
    ctx.fillStyle = '#000';
    ctx.fillRect(flip ? x + w - 10 : x + 6, y + 5, 4, 4);
    // Raised Hammer
    ctx.fillStyle = '#334155';
    const hy = y - 8 + (step ? 0 : 4);
    ctx.fillRect(x + w / 2 - 6, hy, 12, 7);
  } else if (type === 'lakitu') {
    // Cloud Rider Lakitu
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 8, y, w - 16, 14);
    // Goggles
    ctx.fillStyle = '#0284c7';
    ctx.fillRect(x + 10, y + 4, w - 20, 5);
    // Fluffy Cloud
    ctx.fillStyle = hurtFlash > 0 ? '#fca5a5' : '#f8fafc';
    ctx.fillRect(x, y + 12, w, h - 12);
    ctx.strokeStyle = '#94a3b8';
    ctx.strokeRect(x, y + 12, w, h - 12);
  } else if (type === 'boo' || type === 'swooper') {
    // Haunted Ghost Boo / Swooper
    ctx.fillStyle = hurtFlash > 0 ? '#f43f5e' : (e.shy ? 'rgba(226, 232, 240, 0.55)' : '#f8fafc');
    ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 2;
    ctx.strokeRect(x + 2, y + 2, w - 4, h - 4);
    // Eyes & Red Tongue
    if (!e.shy) {
      ctx.fillStyle = '#000';
      ctx.fillRect(flip ? x + w - 12 : x + 6, y + 8, 4, 5);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(flip ? x + w - 12 : x + 6, y + 16, 7, 5);
    } else {
      // Covering face hands
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(x + 8, y + 8, w - 16, 10);
    }
  } else if (type === 'magikoopa') {
    // Kamek Wizard
    ctx.fillStyle = hurtFlash > 0 ? '#fff' : '#2563eb';
    ctx.fillRect(x + 4, y + 8, w - 8, h - 8);
    // Pointed Hat
    ctx.beginPath();
    ctx.moveTo(x + w / 2, y - 8);
    ctx.lineTo(x + w, y + 10);
    ctx.lineTo(x, y + 10);
    ctx.closePath();
    ctx.fill();
    // Glasses & Wand
    ctx.fillStyle = '#facc15';
    ctx.fillRect(x + 6, y + 10, w - 12, 5);
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(flip ? x + w + 2 : x - 8, y + 12, 6, 6);
  }

  // Frozen Ice Block Overlay
  if (frozenTimer > 0) {
    ctx.fillStyle = 'rgba(56, 189, 248, 0.52)';
    ctx.fillRect(x - 3, y - 3, w + 6, h + 6);
    ctx.strokeStyle = '#e0f2fe';
    ctx.lineWidth = 2;
    ctx.strokeRect(x - 3, y - 3, w + 6, h + 6);
  }

  // Burn Indicator
  if (e.burnTimer > 0) {
    ctx.fillStyle = '#f97316';
    ctx.fillRect(x + (step ? 4 : w - 10), y - 6, 6, 6);
  }

  // Enemy HP Mini Bar (when damaged)
  if (e.hp < e.maxHp && e.hp > 0) {
    const bw = w + 6;
    ctx.fillStyle = 'rgba(0,0,0,0.75)';
    ctx.fillRect(x - 3, y - 10, bw, 5);
    ctx.fillStyle = frozenTimer > 0 ? '#38bdf8' : '#ef4444';
    ctx.fillRect(x - 2, y - 9, Math.max(2, (bw - 2) * (e.hp / e.maxHp)), 3);
  }

  ctx.restore();
}

// --- Parallax Pixel Art Background Renderer ---
export function drawStageBackground(ctx, stage, cameraX, canvasW, canvasH, time) {
  // Sky Gradient
  const grad = ctx.createLinearGradient(0, 0, 0, canvasH);
  grad.addColorStop(0, stage.skyTop);
  grad.addColorStop(1, stage.skyBottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, canvasW, canvasH);

  // Far Stars / Embers
  ctx.fillStyle = stage.isBossStage ? 'rgba(251, 146, 60, 0.55)' : 'rgba(255, 255, 255, 0.45)';
  for (let i = 0; i < 28; i++) {
    const sx = ((i * 173 - cameraX * 0.12) % canvasW + canvasW) % canvasW;
    const sy = (i * 67) % (canvasH * 0.65);
    const sz = (i % 2 === 0) ? 3 : 2;
    ctx.fillRect(Math.round(sx), Math.round(sy), sz, sz);
  }

  // Distant Pixel Hills / Castle Towers (Parallax 0.25)
  ctx.fillStyle = stage.hillColor;
  for (let i = 0; i < 8; i++) {
    const hx = ((i * 260 - cameraX * 0.25) % (canvasW + 300) + (canvasW + 300)) % (canvasW + 300) - 150;
    const hh = 110 + (i % 3) * 45;
    const hy = canvasH - 60 - hh;
    if (stage.index === 3 || stage.index === 4) {
      // Gothic / Fortress Battlements
      ctx.fillRect(Math.round(hx), Math.round(hy), 96, hh + 60);
      for (let b = 0; b < 4; b++) {
        ctx.fillRect(Math.round(hx + b * 26), Math.round(hy - 14), 16, 14);
      }
    } else {
      // Classic Stepped Pixel Hills
      ctx.fillRect(Math.round(hx), Math.round(hy + 30), 140, hh + 30);
      ctx.fillRect(Math.round(hx + 20), Math.round(hy + 12), 100, 20);
      ctx.fillRect(Math.round(hx + 40), Math.round(hy), 60, 14);
    }
  }

  // Midground Pixel Clouds / Floating Crystals (Parallax 0.45)
  for (let i = 0; i < 7; i++) {
    const cx = ((i * 280 - cameraX * 0.45) % (canvasW + 240) + (canvasW + 240)) % (canvasW + 240) - 120;
    const cy = 65 + (i % 3) * 52 + Math.sin(time * 1.5 + i) * 4;
    if (stage.index === 1) {
      // Glowing Crystal Cluster
      ctx.fillStyle = 'rgba(56, 189, 248, 0.25)';
      ctx.fillRect(Math.round(cx), Math.round(cy), 48, 22);
    } else if (stage.index === 4) {
      // Dark Ash Clouds
      ctx.fillStyle = 'rgba(127, 29, 29, 0.45)';
      ctx.fillRect(Math.round(cx), Math.round(cy), 88, 24);
    } else {
      // Smiling Super Mario Pixel Cloud
      ctx.fillStyle = 'rgba(255, 255, 255, 0.78)';
      ctx.fillRect(Math.round(cx), Math.round(cy), 76, 24);
      ctx.fillRect(Math.round(cx + 12), Math.round(cy - 10), 52, 12);
      ctx.fillStyle = '#334155';
      ctx.fillRect(Math.round(cx + 26), Math.round(cy + 4), 4, 8);
      ctx.fillRect(Math.round(cx + 46), Math.round(cy + 4), 4, 8);
    }
  }
}
