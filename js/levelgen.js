// Procedural Side-Scrolling Roguelite Stage Generator

import { STAGES } from './data.js?v=20261121a';
import { FinalBoss } from './boss.js?v=20261121a';

export function generateStage(stageIndex, playerLevel = 1) {
  const stageDef = STAGES[Math.min(stageIndex, STAGES.length - 1)];
  const groundY = 470;

  const platforms = [];
  const blocks = []; // Question blocks [?] & breakable bricks
  const pipes = [];
  const springs = [];
  const hazards = []; // Lava pools
  const enemies = [];
  const decorations = [];

  let cursorX = 0;
  // Starting safe zone
  platforms.push({
    x: 0,
    y: groundY,
    w: 580,
    h: 90,
    type: 'ground'
  });

  // Welcome Question Block formation in safe zone
  blocks.push({ x: 240, y: groundY - 115, w: 34, h: 34, type: 'question', loot: 'xp_burst', hits: 1, bumpY: 0 });
  blocks.push({ x: 274, y: groundY - 115, w: 34, h: 34, type: 'brick', loot: 'coin', hits: 1, bumpY: 0 });
  blocks.push({ x: 308, y: groundY - 115, w: 34, h: 34, type: 'question', loot: 'mushroom', hits: 1, bumpY: 0 });
  blocks.push({ x: 342, y: groundY - 115, w: 34, h: 34, type: 'brick', loot: 'coin', hits: 1, bumpY: 0 });

  cursorX = 580;

  const targetLength = stageDef.length;

  while (cursorX < targetLength - 750) {
    const segW = 360 + Math.floor(Math.random() * 280);
    const hasGap = Math.random() < 0.42;
    const gapW = hasGap ? (95 + Math.floor(Math.random() * 55)) : 0;

    if (gapW > 0) {
      // Lava / Abyss Hazard at bottom of gap
      hazards.push({
        x: cursorX,
        y: groundY + 26,
        w: gapW,
        h: 45,
        type: 'lava'
      });
      // Optional floating stepping platform over larger gaps
      if (gapW > 115) {
        platforms.push({
          x: cursorX + gapW * 0.25,
          y: groundY - 65,
          w: 76,
          h: 18,
          type: 'floating',
          moveRange: 45,
          baseX: cursorX + gapW * 0.25,
          speed: 1.8
        });
      }
      cursorX += gapW;
    }

    // Main ground chunk
    platforms.push({
      x: cursorX,
      y: groundY,
      w: segW,
      h: 90,
      type: 'ground'
    });

    // High platform & Question Block formations
    const pattern = Math.floor(Math.random() * 4);
    if (pattern === 0) {
      // Classic 3-5 block row with elevated second tier
      const count = 3 + Math.floor(Math.random() * 3);
      const startBX = cursorX + 60;
      for (let i = 0; i < count; i++) {
        const isQ = (i % 2 === 1);
        const lootRoll = Math.random();
        const loot = lootRoll < 0.14 ? 'star' : (lootRoll < 0.38 ? 'mushroom' : (lootRoll < 0.72 ? 'xp_burst' : 'coin_burst'));
        blocks.push({
          x: startBX + i * 34,
          y: groundY - 115,
          w: 34,
          h: 34,
          type: isQ ? 'question' : 'brick',
          loot: isQ ? loot : 'coin',
          hits: 1,
          bumpY: 0
        });
      }
      if (Math.random() < 0.65) {
        blocks.push({
          x: startBX + 34,
          y: groundY - 215,
          w: 34,
          h: 34,
          type: 'question',
          loot: 'weapon_scroll',
          hits: 1,
          bumpY: 0
        });
      }
    } else if (pattern === 1) {
      // Pipe + Springboard + High Aerial Platform
      const pipeH = 72 + Math.floor(Math.random() * 32);
      const pipeX = cursorX + 85;
      pipes.push({
        x: pipeX,
        y: groundY - pipeH,
        w: 56,
        h: pipeH
      });
      platforms.push({
        x: pipeX,
        y: groundY - pipeH,
        w: 56,
        h: pipeH,
        type: 'pipe_solid'
      });

      if ( stageDef.enemies.includes('piranha') && Math.random() < 0.65) {
        enemies.push(createEnemy('piranha', pipeX + 11, groundY - pipeH - 34, stageIndex, playerLevel));
      }

      springs.push({
        x: pipeX + 85,
        y: groundY - 24,
        w: 32,
        h: 24,
        compress: 0
      });

      platforms.push({
        x: pipeX + 130,
        y: groundY - 175,
        w: 150,
        h: 20,
        type: 'ledge'
      });
    } else if (pattern === 2) {
      // Double Deck Platforms for Stomp Combos
      platforms.push({
        x: cursorX + 50,
        y: groundY - 95,
        w: 140,
        h: 20,
        type: 'ledge'
      });
      platforms.push({
        x: cursorX + 160,
        y: groundY - 180,
        w: 140,
        h: 20,
        type: 'ledge'
      });
      blocks.push({
        x: cursorX + 210,
        y: groundY - 270,
        w: 34,
        h: 34,
        type: 'question',
        loot: 'xp_burst',
        hits: 1,
        bumpY: 0
      });
    } else {
      // Springboard + Moving Sky Platform
      springs.push({
        x: cursorX + 45,
        y: groundY - 24,
        w: 32,
        h: 24,
        compress: 0
      });
      platforms.push({
        x: cursorX + 120,
        y: groundY - 150,
        w: 120,
        h: 20,
        type: 'floating',
        moveRange: 65,
        baseX: cursorX + 120,
        speed: 2.1
      });
    }

    // Spawn 2-4 Enemies in this segment
    const enemyCount = 2 + Math.floor(Math.random() * 2) + (stageIndex >= 2 ? 1 : 0);
    for (let eIdx = 0; eIdx < enemyCount; eIdx++) {
      const pool = stageDef.enemies.filter(t => t !== 'piranha');
      const eType = pool[Math.floor(Math.random() * pool.length)];
      const ex = cursorX + 70 + eIdx * Math.floor((segW - 110) / enemyCount);
      const ey = (eType === 'lakitu') ? groundY - 240 : (eType === 'paratroopa' || eType === 'boo' || eType === 'swooper') ? groundY - 110 : groundY - 40;
      enemies.push(createEnemy(eType, ex, ey, stageIndex, playerLevel));
    }

    cursorX += segW;
  }

  // Final Segment: Either Goal Flagpole + Toad Caravan OR Final Boss Arena
  let boss = null;
  let goalFlag = null;
  let shopTent = null;

  if (stageDef.isBossStage) {
    const arenaW = 920;
    platforms.push({
      x: cursorX,
      y: groundY,
      w: arenaW,
      h: 90,
      type: 'ground'
    });

    // Two tactical side platforms in the Boss Arena for aerial stomp combos & dodging shockwaves!
    platforms.push({
      x: cursorX + 150,
      y: groundY - 115,
      w: 130,
      h: 20,
      type: 'ledge'
    });
    platforms.push({
      x: cursorX + 540,
      y: groundY - 115,
      w: 130,
      h: 20,
      type: 'ledge'
    });

    // Supply blocks before Boss
    blocks.push({ x: cursorX + 60, y: groundY - 115, w: 34, h: 34, type: 'question', loot: 'mushroom', hits: 1, bumpY: 0 });
    blocks.push({ x: cursorX + 94, y: groundY - 115, w: 34, h: 34, type: 'question', loot: 'weapon_scroll', hits: 1, bumpY: 0 });

    boss = new FinalBoss(cursorX + 640, groundY - 96, playerLevel);
    boss.arenaMinX = cursorX + 40;
    boss.arenaMaxX = cursorX + arenaW - 40;
    cursorX += arenaW;
  } else {
    const endW = 700;
    platforms.push({
      x: cursorX,
      y: groundY,
      w: endW,
      h: 90,
      type: 'ground'
    });

    // Classic Staircase before the Flagpole
    for (let step = 0; step < 4; step++) {
      platforms.push({
        x: cursorX + 120 + step * 34,
        y: groundY - (step + 1) * 32,
        w: 34,
        h: (step + 1) * 32,
        type: 'stair'
      });
    }

    // Toad's Caravan Shop Tent before the Goal
    shopTent = {
      x: cursorX + 310,
      y: groundY - 68,
      w: 76,
      h: 68
    };

    // Goal Flagpole
    goalFlag = {
      x: cursorX + 470,
      y: groundY - 260,
      w: 24,
      h: 260,
      reached: false,
      flagY: groundY - 245
    };

    cursorX += endW;
  }

  return {
    stageDef,
    width: cursorX,
    groundY,
    platforms,
    blocks,
    pipes,
    springs,
    hazards,
    enemies,
    decorations,
    shopTent,
    goalFlag,
    boss
  };
}

export function createEnemy(type, x, y, stageIndex = 0, playerLevel = 1) {
  const scale = 1 + stageIndex * 0.28 + (playerLevel - 1) * 0.12;
  const baseStats = {
    goomba:     { w: 32, h: 32, hp: 36, speed: 68,  dmg: 14, xp: 24, coins: 2, score: 150 },
    koopa:      { w: 32, h: 38, hp: 48, speed: 82,  dmg: 16, xp: 32, coins: 3, score: 220 },
    paratroopa: { w: 34, h: 40, hp: 52, speed: 90,  dmg: 16, xp: 36, coins: 3, score: 260 },
    buzzy:      { w: 32, h: 32, hp: 68, speed: 75,  dmg: 18, xp: 40, coins: 4, score: 300, fireproof: true },
    piranha:    { w: 34, h: 38, hp: 50, speed: 0,   dmg: 18, xp: 35, coins: 3, score: 250, spikyTop: true },
    hammerbro:  { w: 34, h: 44, hp: 82, speed: 65,  dmg: 20, xp: 52, coins: 5, score: 420 },
    lakitu:     { w: 38, h: 38, hp: 60, speed: 120, dmg: 16, xp: 48, coins: 5, score: 400 },
    boo:        { w: 34, h: 34, hp: 58, speed: 95,  dmg: 18, xp: 44, coins: 4, score: 350 },
    swooper:    { w: 32, h: 30, hp: 44, speed: 135, dmg: 16, xp: 34, coins: 3, score: 280 },
    magikoopa:  { w: 34, h: 44, hp: 76, speed: 50,  dmg: 22, xp: 58, coins: 6, score: 480 }
  };

  const st = baseStats[type] || baseStats.goomba;
  const maxHp = Math.round(st.hp * scale);

  return {
    type,
    x,
    y,
    baseY: y,
    w: st.w,
    h: st.h,
    vx: -st.speed,
    vy: 0,
    speed: st.speed,
    hp: maxHp,
    maxHp,
    damage: st.dmg,
    xpValue: st.xp,
    coinValue: st.coins,
    scoreValue: st.score,
    fireproof: Boolean(st.fireproof),
    spikyTop: Boolean(st.spikyTop),
    inShell: false,
    shellSpinning: false,
    shy: false,
    attackTimer: 1.2 + Math.random() * 1.4,
    frozenTimer: 0,
    burnTimer: 0,
    hurtFlash: 0,
    dead: false
  };
}
