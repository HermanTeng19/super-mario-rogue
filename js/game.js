// Main Game Engine: Physics, Combat, Weapons, Leveling, Roguelite Perks & Native Dialog UI

import { sfx } from './audio.js?v=20261121a';
import { WEAPONS, PERKS_POOL, STAGES } from './data.js?v=20261121a';
import { drawMarioSprite, drawPortrait, drawEnemySprite, drawStageBackground } from './sprites.js?v=20261121a';
import { generateStage, createEnemy } from './levelgen.js?v=20261121a';
import { getLang, setLang, t, loc, RANK_TITLES, applyDomTranslations } from './i18n.js?v=20261121a';
import { MobileController, isTouchHandheld } from './mobile.js?v=20261121a';

// Fallback for <dialog closedby="any"> per modern-web-guidance dialog rule
if (typeof HTMLDialogElement !== 'undefined' && !('closedBy' in HTMLDialogElement.prototype)) {
  const outside = (e, dialog) => {
    const r = dialog.getBoundingClientRect();
    return e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
  };
  for (const dialog of document.querySelectorAll('dialog[closedby="any"]')) {
    let pressedOutside = false;
    dialog.addEventListener('pointerdown', (e) => { pressedOutside = outside(e, dialog); });
    dialog.addEventListener('pointerup', (e) => { if (pressedOutside && outside(e, dialog)) dialog.close(); });
  }
}

export class MarioRogueGame {
  constructor() {
    this.canvas = document.getElementById('game-canvas');
    this.ctx = this.canvas.getContext('2d');
    this.portraitCanvas = document.getElementById('portrait-canvas');
    this.portraitCtx = this.portraitCanvas.getContext('2d');

    this.width = this.canvas.width;
    this.height = this.canvas.height;

    this.keys = {};
    this.time = 0;
    this.paused = false;
    this.screenShake = 0;
    this.cameraX = 0;
    this.currentPerkChoices = [];
    this.lastEndVictory = false;

    // Dialog references
    this.dlgLevelUp = document.getElementById('dialog-levelup');
    this.dlgShop = document.getElementById('dialog-shop');
    this.dlgArmory = document.getElementById('dialog-armory');
    this.dlgHelp = document.getElementById('dialog-help');
    this.dlgGameOver = document.getElementById('dialog-gameover');
    this.dlgMobileMenu = document.getElementById('dialog-mobile-menu');

    applyDomTranslations();
    this.syncToggleButtonLabels();
    this.resetRun();
    this.restoreRouteStateIfAny();
    this.bindEvents();
    this.mobile = new MobileController(this);
    this.renderCompendium();
    this.updateWeaponDock();
    this.updateAllHUD();

    this.lastTime = performance.now();
    requestAnimationFrame((tNow) => this.loop(tNow));
  }

  saveRouteState() {
    try {
      const p = this.player;
      const snapshot = {
        stageIndex: this.stageIndex,
        score: this.score,
        enemiesKilled: this.enemiesKilled,
        rerollCost: this.rerollCost,
        crtEnabled: document.getElementById('viewport-wrapper')?.classList.contains('crt-enabled') ?? true,
        player: {
          level: p.level,
          xp: p.xp,
          xpToNext: p.xpToNext,
          hp: p.hp,
          maxHp: p.maxHp,
          lives: p.lives,
          coins: p.coins,
          stamina: p.stamina,
          stompDamage: p.stompDamage,
          atkMultiplier: p.atkMultiplier,
          critChance: p.critChance,
          critDamage: p.critDamage,
          speedMultiplier: p.speedMultiplier,
          jumpMultiplier: p.jumpMultiplier,
          cooldownReduction: p.cooldownReduction,
          damageReduction: p.damageReduction,
          bonusProjectiles: p.bonusProjectiles,
          projectileScale: p.projectileScale,
          pickupRadius: p.pickupRadius,
          xpMultiplier: p.xpMultiplier,
          maxJumps: p.maxJumps,
          maxStompCombo: p.maxStompCombo,
          currentWeaponIndex: p.currentWeaponIndex,
          unlockedWeapons: [...p.unlockedWeapons],
          weaponLevels: { ...p.weaponLevels },
          perks: { ...p.perks },
          acquiredPerkIds: p.acquiredPerkList.map((pk) => pk.id)
        }
      };
      sessionStorage.setItem('mario_rogue_route_state', JSON.stringify(snapshot));
    } catch {
      // Ignore storage failures
    }
  }

  restoreRouteStateIfAny() {
    try {
      const raw = sessionStorage.getItem('mario_rogue_route_state');
      if (!raw) return;
      sessionStorage.removeItem('mario_rogue_route_state');
      const snap = JSON.parse(raw);
      if (!snap || !snap.player) return;

      const sp = snap.player;
      const p = this.player;
      this.score = snap.score ?? this.score;
      this.enemiesKilled = snap.enemiesKilled ?? this.enemiesKilled;
      this.rerollCost = snap.rerollCost ?? this.rerollCost;

      Object.assign(p, {
        level: sp.level ?? p.level,
        xp: sp.xp ?? p.xp,
        xpToNext: sp.xpToNext ?? p.xpToNext,
        hp: sp.hp ?? p.hp,
        maxHp: sp.maxHp ?? p.maxHp,
        lives: sp.lives ?? p.lives,
        coins: sp.coins ?? p.coins,
        stamina: sp.stamina ?? p.stamina,
        stompDamage: sp.stompDamage ?? p.stompDamage,
        atkMultiplier: sp.atkMultiplier ?? p.atkMultiplier,
        critChance: sp.critChance ?? p.critChance,
        critDamage: sp.critDamage ?? p.critDamage,
        speedMultiplier: sp.speedMultiplier ?? p.speedMultiplier,
        jumpMultiplier: sp.jumpMultiplier ?? p.jumpMultiplier,
        cooldownReduction: sp.cooldownReduction ?? p.cooldownReduction,
        damageReduction: sp.damageReduction ?? p.damageReduction,
        bonusProjectiles: sp.bonusProjectiles ?? p.bonusProjectiles,
        projectileScale: sp.projectileScale ?? p.projectileScale,
        pickupRadius: sp.pickupRadius ?? p.pickupRadius,
        xpMultiplier: sp.xpMultiplier ?? p.xpMultiplier,
        maxJumps: sp.maxJumps ?? p.maxJumps,
        maxStompCombo: sp.maxStompCombo ?? p.maxStompCombo,
        currentWeaponIndex: sp.currentWeaponIndex ?? p.currentWeaponIndex,
        unlockedWeapons: new Set(sp.unlockedWeapons || ['fire_flower', 'heavy_hammer']),
        weaponLevels: { ...p.weaponLevels, ...(sp.weaponLevels || {}) },
        perks: { ...(sp.perks || {}) },
        acquiredPerkList: (sp.acquiredPerkIds || [])
          .map((id) => PERKS_POOL.find((pk) => pk.id === id))
          .filter(Boolean)
      });

      const wrap = document.getElementById('viewport-wrapper');
      if (wrap && typeof snap.crtEnabled === 'boolean') {
        wrap.classList.toggle('crt-enabled', snap.crtEnabled);
        this.syncToggleButtonLabels();
      }

      if (typeof snap.stageIndex === 'number' && snap.stageIndex !== this.stageIndex) {
        this.loadStage(snap.stageIndex);
      }
    } catch {
      // Ignore invalid snapshot
    }
  }

  syncToggleButtonLabels() {
    const crtBtn = document.getElementById('btn-crt-toggle');
    const wrap = document.getElementById('viewport-wrapper');
    if (crtBtn && wrap) {
      const enabled = wrap.classList.contains('crt-enabled');
      crtBtn.setAttribute('aria-pressed', String(enabled));
      crtBtn.textContent = enabled ? t('crtOn') : t('crtOff');
    }

    const muteBtn = document.getElementById('btn-mute');
    if (muteBtn) {
      const muted = muteBtn.getAttribute('aria-pressed') === 'true';
      muteBtn.textContent = muted ? t('audioMuted') : t('audioOn');
    }
  }

  switchLanguage(lang) {
    if (lang === getLang()) return;
    setLang(lang);
    applyDomTranslations();
    this.syncToggleButtonLabels();
    this.updateWeaponDock();
    this.updateAllHUD();
    this.updateCanvasHUD();
    this.renderCompendium();

    if (this.level && !document.getElementById('stage-banner').hidden) {
      const sd = this.level.stageDef;
      document.getElementById('banner-main').textContent = `${sd.icon} ${loc(sd, 'name')}`;
      document.getElementById('banner-desc').textContent = loc(sd, 'subtitle');
    }
    if (this.dlgShop.open) this.renderShopItems();
    if (this.dlgLevelUp.open) this.renderPerkChoiceButtons();
    if (this.dlgGameOver.open) this.showEndModal(this.lastEndVictory);
  }

  resetRun() {
    this.stageIndex = 0;
    this.score = 0;
    this.enemiesKilled = 0;
    this.rerollCost = 15;

    this.player = {
      x: 110,
      y: 360,
      w: 30,
      h: 36,
      vx: 0,
      vy: 0,
      facing: 1,
      state: 'idle', // idle | run | jump | fall | spin | pound
      grounded: false,
      jumpsUsed: 0,
      maxJumps: 2,
      coyoteTimer: 0,
      animTimer: 0,

      // RPG & Roguelite Stats
      level: 1,
      xp: 0,
      xpToNext: 100,
      hp: 100,
      maxHp: 100,
      lives: 1,
      coins: 30,
      stamina: 100,

      stompDamage: 32,
      atkMultiplier: 1.0,
      critChance: 0.12,
      critDamage: 1.65,
      speedMultiplier: 1.0,
      jumpMultiplier: 1.0,
      cooldownReduction: 0,
      damageReduction: 0,
      bonusProjectiles: 0,
      projectileScale: 1.0,
      pickupRadius: isTouchHandheld() ? 130 : 95,
      xpMultiplier: 1.0,

      // Combos & Timers
      stompCombo: 0,
      maxStompCombo: 0,
      starTimer: 0,
      hurtTimer: 0,
      attackCooldown: 0,
      dashTimer: 0,
      dashCooldown: 0,

      // Weapons & Perks
      unlockedWeapons: new Set(['fire_flower', 'heavy_hammer']),
      weaponLevels: {
        fire_flower: 1,
        heavy_hammer: 1,
        boomerang_star: 1,
        ice_blaster: 1,
        thunder_wand: 1,
        cape_blade: 1
      },
      currentWeaponIndex: 0,
      perks: {},
      acquiredPerkList: []
    };

    this.loadStage(0);
  }

  get currentWeapon() {
    return WEAPONS[this.player.currentWeaponIndex] || WEAPONS[0];
  }

  loadStage(index) {
    this.stageIndex = Math.max(0, Math.min(index, STAGES.length - 1));
    this.player.currentWeapon = this.currentWeapon;
    this.level = generateStage(this.stageIndex, this.player.level);

    this.player.x = 90;
    this.player.y = this.level.groundY - this.player.h - 10;
    this.player.vx = 0;
    this.player.vy = 0;
    this.player.state = 'idle';
    this.cameraX = 0;

    this.projectiles = [];
    this.enemyProjectiles = [];
    this.pickups = [];
    this.particles = [];
    this.floatingTexts = [];
    this.lightningArcs = [];
    this.afterimages = [];

    this.showStageBanner(this.level.stageDef);
    this.updateWeaponDock();
    this.updateAllHUD();
    this.addLog(t('logStageEnter', this.level.stageDef.code, loc(this.level.stageDef, 'name')));
  }

  showStageBanner(stageDef) {
    const banner = document.getElementById('stage-banner');
    document.getElementById('banner-sub').textContent = stageDef.code;
    document.getElementById('banner-main').textContent = `${stageDef.icon} ${loc(stageDef, 'name')}`;
    document.getElementById('banner-desc').textContent = loc(stageDef, 'subtitle');
    banner.hidden = false;
    clearTimeout(this.bannerTimeout);
    this.bannerTimeout = setTimeout(() => {
      banner.hidden = true;
    }, 2900);
  }

  bindEvents() {
    window.addEventListener('keydown', (e) => {
      if (this.isAnyModalOpen()) return;

      const code = e.code;
      this.keys[code] = true;

      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(code)) {
        e.preventDefault();
      }

      // Jump / Spin Jump
      if (code === 'Space' || code === 'KeyW' || code === 'ArrowUp') {
        this.tryJump(false);
      } else if (code === 'KeyQ') {
        this.tryJump(true);
      }

      // Ground Pound (Midair S or ArrowDown)
      if (code === 'KeyS' || code === 'ArrowDown') {
        this.tryGroundPound();
      }

      // Dash
      if (code === 'KeyK' || code === 'ShiftLeft' || code === 'ShiftRight') {
        this.tryDash();
      }

      // Weapon Switch 1-6 or E
      if (code.startsWith('Digit')) {
        const num = parseInt(code.replace('Digit', ''), 10);
        if (num >= 1 && num <= 6) {
          this.selectWeapon(num - 1);
        }
      } else if (code === 'KeyE') {
        this.cycleWeapon();
      } else if (code === 'KeyB') {
        this.openShopModal();
      }
    });

    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Canvas Mouse Click to Shoot / Right-Click to Dash
    this.canvas.addEventListener('mousedown', (e) => {
      this.canvas.focus();
      if (e.button === 0) {
        this.keys['MouseLeft'] = true;
        this.tryAttack();
      } else if (e.button === 2) {
        this.tryDash();
      }
    });

    window.addEventListener('mouseup', (e) => {
      if (e.button === 0) this.keys['MouseLeft'] = false;
    });

    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Language Route Links (preserve run state seamlessly across /en/ <-> /zh/)
    document.querySelectorAll('.lang-btn').forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (btn.dataset.lang === getLang()) {
          e.preventDefault();
          return;
        }
        if (btn.tagName === 'A') {
          this.saveRouteState();
        } else {
          sfx.xpGem();
          this.switchLanguage(btn.dataset.lang);
        }
      });
    });

    // Top Header Controls
    document.getElementById('btn-armory').addEventListener('click', () => {
      this.renderCompendium();
      this.dlgArmory.showModal();
    });

    document.getElementById('btn-shop-open').addEventListener('click', () => {
      this.openShopModal();
    });

    document.getElementById('btn-boss-warp').addEventListener('click', () => {
      // Buff Mario slightly if warping straight to Final Boss at LV 1 so it's super fun
      if (this.player.level < 4) {
        this.player.level = 4;
        this.player.maxHp = 150;
        this.player.hp = 150;
        this.player.stompDamage = 48;
        this.player.atkMultiplier = 1.35;
        WEAPONS.forEach(w => this.player.unlockedWeapons.add(w.id));
      }
      this.loadStage(4);
      sfx.bossRoar();
    });

    document.getElementById('btn-crt-toggle').addEventListener('click', (e) => {
      const wrap = document.getElementById('viewport-wrapper');
      const enabled = wrap.classList.toggle('crt-enabled');
      e.currentTarget.setAttribute('aria-pressed', String(enabled));
      e.currentTarget.textContent = enabled ? t('crtOn') : t('crtOff');
    });

    document.getElementById('btn-mute').addEventListener('click', (e) => {
      const muted = sfx.toggleMute();
      e.currentTarget.setAttribute('aria-pressed', String(muted));
      e.currentTarget.textContent = muted ? t('audioMuted') : t('audioOn');
    });

    document.getElementById('volume-slider').addEventListener('input', (e) => {
      sfx.setVolume(Number(e.target.value) / 100);
    });

    document.getElementById('btn-help').addEventListener('click', () => {
      this.dlgHelp.showModal();
    });

    document.getElementById('btn-free-levelup').addEventListener('click', () => {
      this.triggerLevelUp();
    });

    document.getElementById('btn-reroll-perks').addEventListener('click', () => {
      if (this.player.coins >= this.rerollCost) {
        this.player.coins -= this.rerollCost;
        this.rerollCost += 10;
        sfx.coin();
        this.populatePerkChoices();
        this.updateAllHUD();
      } else {
        sfx.blockBump();
      }
    });

    // Quick Stage Jump & Unlock All Weapons buttons
    document.querySelectorAll('.stage-jump-btn[data-stage]').forEach(btn => {
      btn.addEventListener('click', () => {
        const st = Number(btn.dataset.stage);
        this.loadStage(st);
      });
    });

    document.getElementById('btn-unlock-all-weapons').addEventListener('click', () => {
      WEAPONS.forEach(w => {
        this.player.unlockedWeapons.add(w.id);
        this.player.weaponLevels[w.id] = Math.max(3, this.player.weaponLevels[w.id] + 1);
      });
      this.player.coins += 150;
      sfx.powerup();
      this.updateWeaponDock();
      this.updateAllHUD();
      this.addLog(t('logUnlockAll'));
    });

    // Game Over / Victory Dialog close listener (reset returnValue per modern-web-guidance)
    this.dlgGameOver.addEventListener('close', () => {
      const val = this.dlgGameOver.returnValue;
      this.dlgGameOver.returnValue = '';
      if (val === 'revive' && this.player.lives > 0) {
        this.player.lives -= 1;
        this.player.hp = this.player.maxHp;
        this.player.starTimer = 5.0;
        this.player.y = 180;
        this.player.vy = -200;
        sfx.powerup();
        this.addLog(t('logRevive'));
        this.updateAllHUD();
      } else {
        this.resetRun();
      }
    });
  }

  isAnyModalOpen() {
    return (
      this.dlgLevelUp.open ||
      this.dlgShop.open ||
      this.dlgArmory.open ||
      this.dlgHelp.open ||
      this.dlgGameOver.open ||
      Boolean(this.dlgMobileMenu && this.dlgMobileMenu.open)
    );
  }

  // --- Movement & Jump Attack Actions ---
  tryJump(isSpinJump = false) {
    const p = this.player;
    const canGroundJump = p.grounded || p.coyoteTimer > 0;

    if (canGroundJump || p.jumpsUsed < p.maxJumps) {
      if (!canGroundJump) {
        p.jumpsUsed += 1;
        // Ice Nova Step perk on air jump
        if (p.perks.iceJump) {
          this.triggerIceNova(p.x + p.w / 2, p.y + p.h);
        }
      } else {
        p.jumpsUsed = 1;
      }

      p.grounded = false;
      p.coyoteTimer = 0;
      const baseJump = isSpinJump ? -560 : -535;
      p.vy = baseJump * p.jumpMultiplier;
      p.state = isSpinJump ? 'spin' : 'jump';

      if (isSpinJump) {
        sfx.spinJump();
        this.spawnParticles(p.x + p.w / 2, p.y + p.h, '#38bdf8', 10);
      } else {
        sfx.jump(p.jumpsUsed > 1);
        this.spawnParticles(p.x + p.w / 2, p.y + p.h, '#f8fafc', 6);
      }
    }
  }

  tryGroundPound() {
    const p = this.player;
    if (!p.grounded && p.state !== 'pound') {
      p.state = 'pound';
      p.vx *= 0.25;
      p.vy = 780;
      sfx.groundPoundStart();
      this.spawnParticles(p.x + p.w / 2, p.y + p.h / 2, '#facc15', 10);
    }
  }

  tryDash() {
    const p = this.player;
    if (p.dashCooldown > 0 || p.stamina < 30) return;

    p.stamina = Math.max(0, p.stamina - 32);
    p.dashTimer = 0.18;
    p.dashCooldown = 0.55;
    p.hurtTimer = Math.max(p.hurtTimer, 0.22); // Dash grants i-frames!
    p.vx = p.facing * 640;
    p.vy = Math.min(0, p.vy);
    sfx.dash();

    // Shadow Clone Dash Perk
    if (p.perks.shadowDash) {
      const cloneX = p.x;
      const cloneY = p.y;
      this.spawnFloatingText(cloneX, cloneY - 10, t('ftShadowBlast'), '#c084fc', 13);
      setTimeout(() => {
        this.triggerAoEExplosion(cloneX + 16, cloneY + 18, 95, 45 * p.atkMultiplier, '#c084fc');
      }, 360);
    }
  }

  selectWeapon(index) {
    const w = WEAPONS[index];
    if (!w) return;
    if (!this.player.unlockedWeapons.has(w.id)) {
      this.addLog(t('logWeaponLocked', loc(w, 'name')));
      sfx.blockBump();
      return;
    }
    this.player.currentWeaponIndex = index;
    this.player.currentWeapon = w;
    sfx.xpGem();
    this.updateWeaponDock();
    this.updateAllHUD();
  }

  cycleWeapon() {
    const unlockedIndices = WEAPONS.map((w, i) => this.player.unlockedWeapons.has(w.id) ? i : -1).filter(i => i >= 0);
    if (unlockedIndices.length <= 1) return;
    const curPos = unlockedIndices.indexOf(this.player.currentWeaponIndex);
    const nextIdx = unlockedIndices[(curPos + 1) % unlockedIndices.length];
    this.selectWeapon(nextIdx);
  }

  // --- Weapon Firing System ---
  tryAttack(freeDirection = null) {
    const p = this.player;
    const w = this.currentWeapon;
    if (!freeDirection && p.attackCooldown > 0) return;

    const lv = p.weaponLevels[w.id] || 1;
    if (!freeDirection) {
      p.attackCooldown = w.cooldown * (1 - p.cooldownReduction);
    }

    const dir = freeDirection || p.facing;
    const count = 1 + p.bonusProjectiles + (lv >= 3 ? 1 : 0);
    const dmgBase = w.baseDamage * (1 + (lv - 1) * 0.25) * p.atkMultiplier * this.getCoinDamageBonus();

    const originX = dir > 0 ? p.x + p.w : p.x - 12;
    const originY = p.y + 12;

    if (w.id === 'fire_flower') {
      sfx.shootFire();
      for (let i = 0; i < count; i++) {
        this.projectiles.push({
          weaponId: 'fire_flower',
          x: originX,
          y: originY - i * 8,
          w: Math.round(14 * p.projectileScale),
          h: Math.round(14 * p.projectileScale),
          vx: dir * (w.speed + i * 35),
          vy: -90 - i * 55,
          gravity: 880,
          bounces: 3 + (lv >= 2 ? 1 : 0),
          damage: dmgBase,
          color: '#f97316',
          life: 2.6
        });
      }
    } else if (w.id === 'heavy_hammer') {
      sfx.throwHammer();
      for (let i = 0; i < count; i++) {
        this.projectiles.push({
          weaponId: 'heavy_hammer',
          x: originX,
          y: originY - 6,
          w: Math.round(20 * p.projectileScale),
          h: Math.round(20 * p.projectileScale),
          vx: dir * (w.speed - 40 + i * 55),
          vy: -420 - i * 45,
          gravity: 1050,
          pierce: 2,
          armorPierce: true,
          damage: dmgBase,
          color: '#facc15',
          life: 2.4
        });
      }
    } else if (w.id === 'boomerang_star') {
      sfx.throwBoomerang();
      for (let i = 0; i < count; i++) {
        this.projectiles.push({
          weaponId: 'boomerang_star',
          x: originX,
          y: originY + (i - (count - 1) / 2) * 14,
          w: Math.round(18 * p.projectileScale),
          h: Math.round(18 * p.projectileScale),
          vx: dir * w.speed,
          vy: (i - (count - 1) / 2) * 45,
          returnAccel: -dir * 760,
          pierce: 99,
          damage: dmgBase,
          color: '#38bdf8',
          life: 1.9
        });
      }
    } else if (w.id === 'ice_blaster') {
      sfx.shootIce();
      for (let i = 0; i < count; i++) {
        const spread = (i - (count - 1) / 2) * 45;
        this.projectiles.push({
          weaponId: 'ice_blaster',
          x: originX,
          y: originY,
          w: Math.round(16 * p.projectileScale),
          h: Math.round(12 * p.projectileScale),
          vx: dir * w.speed,
          vy: spread,
          freezeDuration: 2.6 * (p.perks.elementalOverload ? 1.6 : 1),
          damage: dmgBase,
          color: '#7dd3fc',
          life: 1.8
        });
      }
    } else if (w.id === 'thunder_wand') {
      sfx.shootLightning();
      for (let i = 0; i < count; i++) {
        this.projectiles.push({
          weaponId: 'thunder_wand',
          x: originX,
          y: originY + (i - (count - 1) / 2) * 12,
          w: Math.round(22 * p.projectileScale),
          h: Math.round(10 * p.projectileScale),
          vx: dir * w.speed,
          vy: 0,
          chainCount: 3 + (lv >= 2 ? 2 : 0),
          damage: dmgBase,
          color: '#fef08a',
          life: 1.4
        });
      }
    } else if (w.id === 'cape_blade') {
      sfx.capeSlash();
      // Slight aerial hover lift when swinging the Golden Cape in midair!
      if (!p.grounded && p.vy > -120) {
        p.vy = -190;
      }
      // Reflect nearby enemy projectiles!
      for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
        const ep = this.enemyProjectiles[i];
        const dist = Math.hypot((ep.x - (p.x + p.w / 2)), (ep.y - (p.y + p.h / 2)));
        if (dist < 110) {
          this.projectiles.push({
            weaponId: 'cape_blade',
            x: ep.x,
            y: ep.y,
            w: 22,
            h: 22,
            vx: -ep.vx * 1.5,
            vy: -ep.vy * 1.2,
            pierce: 4,
            damage: dmgBase * 2.2,
            color: '#facc15',
            life: 2.0
          });
          this.enemyProjectiles.splice(i, 1);
          this.spawnFloatingText(p.x + p.w / 2, p.y - 16, t('ftParry'), '#facc15', 16);
        }
      }

      for (let i = 0; i < count; i++) {
        this.projectiles.push({
          weaponId: 'cape_blade',
          x: originX,
          y: p.y - 4 + i * 8,
          w: Math.round(36 * p.projectileScale),
          h: Math.round(40 * p.projectileScale),
          vx: dir * w.speed,
          vy: 0,
          pierce: 5,
          damage: dmgBase,
          color: '#fde047',
          life: 0.42
        });
      }
    }
  }

  getCoinDamageBonus() {
    if (!this.player.perks.coinDamage) return 1.0;
    return 1 + Math.floor(this.player.coins / 10) * 0.03 * this.player.perks.coinDamage;
  }

  rollCrit(baseDmg) {
    const isCrit = Math.random() < this.player.critChance;
    return {
      damage: isCrit ? baseDmg * this.player.critDamage : baseDmg,
      isCrit
    };
  }

  // --- Main Game Loop ---
  loop(now) {
    const dt = Math.min(0.04, (now - this.lastTime) / 1000);
    this.lastTime = now;

    if (!this.paused && !this.isAnyModalOpen()) {
      this.time += dt;
      this.update(dt);
    }

    this.draw();
    requestAnimationFrame((t) => this.loop(t));
  }

  update(dt) {
    const p = this.player;
    const lvl = this.level;

    // Timers
    if (this.screenShake > 0) this.screenShake = Math.max(0, this.screenShake - dt * 2.2);
    if (p.starTimer > 0) p.starTimer = Math.max(0, p.starTimer - dt);
    if (p.hurtTimer > 0) p.hurtTimer = Math.max(0, p.hurtTimer - dt);
    if (p.attackCooldown > 0) p.attackCooldown = Math.max(0, p.attackCooldown - dt);
    if (p.dashCooldown > 0) p.dashCooldown = Math.max(0, p.dashCooldown - dt);
    if (p.coyoteTimer > 0) p.coyoteTimer = Math.max(0, p.coyoteTimer - dt);

    p.stamina = Math.min(100, p.stamina + 28 * dt);
    p.animTimer += dt;

    // Continuous Attack Input
    if (this.keys['KeyJ'] || this.keys['KeyF'] || this.keys['MouseLeft']) {
      this.tryAttack();
    }

    // Horizontal Input
    if (p.dashTimer > 0) {
      p.dashTimer -= dt;
      if (Math.random() < 0.65) {
        this.afterimages.push({ x: p.x, y: p.y, facing: p.facing, life: 0.22 });
      }
    } else if (p.state !== 'pound') {
      const moveLeft = this.keys['KeyA'] || this.keys['ArrowLeft'];
      const moveRight = this.keys['KeyD'] || this.keys['ArrowRight'];
      const targetSpeed = 275 * p.speedMultiplier;

      if (moveLeft && !moveRight) {
        p.vx = Math.max(-targetSpeed, p.vx - 1600 * dt);
        p.facing = -1;
      } else if (moveRight && !moveLeft) {
        p.vx = Math.min(targetSpeed, p.vx + 1600 * dt);
        p.facing = 1;
      } else {
        p.vx *= Math.pow(0.0008, dt);
        if (Math.abs(p.vx) < 8) p.vx = 0;
      }
    }

    // Gravity
    const grav = (p.state === 'pound') ? 2100 : 1280;
    p.vy = Math.min(920, p.vy + grav * dt);

    // Update Moving Platforms
    for (const plat of lvl.platforms) {
      if (plat.type === 'floating' && plat.moveRange) {
        plat.x = plat.baseX + Math.sin(this.time * plat.speed) * plat.moveRange;
      }
    }

    // Move Mario Horizontally & Resolve Solid Pipe/Block Collisions
    p.x += p.vx * dt;
    if (p.x < 10) p.x = 10;
    if (p.x + p.w > lvl.width - 10) p.x = lvl.width - p.w - 10;

    for (const plat of lvl.platforms) {
      if (plat.type === 'pipe_solid' || plat.type === 'stair') {
        if (this.rectOverlap(p, plat) && p.y + p.h > plat.y + 8) {
          if (p.vx > 0) p.x = plat.x - p.w;
          else if (p.vx < 0) p.x = plat.x + plat.w;
        }
      }
    }

    // Move Mario Vertically & Check Ground / Block Bumps
    const prevBottom = p.y + p.h;
    const prevTop = p.y;
    const wasPounding = (p.state === 'pound');
    p.y += p.vy * dt;

    let landedThisFrame = false;

    for (const plat of lvl.platforms) {
      if (
        p.x + p.w > plat.x + 2 &&
        p.x < plat.x + plat.w - 2 &&
        prevBottom <= plat.y + 14 &&
        p.y + p.h >= plat.y &&
        p.vy >= 0
      ) {
        p.y = plat.y - p.h;
        p.vy = 0;
        landedThisFrame = true;
      }
    }

    // Check Question Blocks & Bricks (Both upward head-bump AND downward Ground-Pound smash!)
    for (let i = lvl.blocks.length - 1; i >= 0; i--) {
      const b = lvl.blocks[i];
      if (b.bumpY < 0) b.bumpY = Math.min(0, b.bumpY + 60 * dt);

      if (this.rectOverlap(p, b)) {
        if (p.vy < 0 && prevTop >= b.y + b.h - 14) {
          // Head Bump from below!
          p.y = b.y + b.h;
          p.vy = 40;
          this.triggerBlockHit(b, i);
        } else if (p.vy >= 0 && prevBottom <= b.y + 14) {
          if (wasPounding && b.hits > 0) {
            // Ground Pound smashes right through Question/Brick blocks!
            this.triggerBlockHit(b, i);
            if (b.type === 'brick') {
              lvl.blocks.splice(i, 1);
              sfx.blockBreak();
              this.spawnParticles(b.x + 17, b.y + 17, '#d97706', 12);
              continue;
            }
          }
          p.y = b.y - p.h;
          p.vy = 0;
          landedThisFrame = true;
        }
      }
    }

    if (landedThisFrame) {
      if (!p.grounded && wasPounding) {
        this.onGroundPoundLand();
      }
      p.grounded = true;
      p.coyoteTimer = 0.11;
      p.jumpsUsed = 0;
      if (p.stompCombo > 0) {
        p.stompCombo = 0;
        this.updateAllHUD();
      }
      if (p.state === 'jump' || p.state === 'fall' || p.state === 'spin' || p.state === 'pound') {
        p.state = 'idle';
      }
    } else {
      if (p.grounded) {
        p.grounded = false;
        p.coyoteTimer = 0.11;
      }
      if (p.state !== 'spin' && p.state !== 'pound') {
        p.state = p.vy < 0 ? 'jump' : 'fall';
      }
    }

    // Springboards
    for (const sp of lvl.springs) {
      if (sp.compress > 0) sp.compress = Math.max(0, sp.compress - dt * 4);
      if (this.rectOverlap(p, sp) && p.vy >= 0) {
        p.vy = -790;
        p.grounded = false;
        p.jumpsUsed = 0;
        p.state = 'spin';
        sp.compress = 1;
        sfx.spinJump();
        this.spawnParticles(sp.x + sp.w / 2, sp.y, '#facc15', 14);
      }
    }

    // Lava / Pit Fall Recovery Bounce
    if (p.y > this.height + 20 || lvl.hazards.some(h => this.rectOverlap(p, h))) {
      p.vy = -660;
      p.y = Math.min(p.y, lvl.groundY - 40);
      this.damagePlayer(18, t('logLavaFall'));
    }

    // Check Toad's Shop Tent Interaction
    if (lvl.shopTent && this.rectOverlap(p, lvl.shopTent)) {
      if (!this.shopPromptCooldown || this.time > this.shopPromptCooldown) {
        this.shopPromptCooldown = this.time + 4.0;
        this.spawnFloatingText(lvl.shopTent.x + 38, lvl.shopTent.y - 16, t('toadPrompt'), '#facc15', 14);
      }
    }

    // Check Goal Flagpole
    if (lvl.goalFlag && !lvl.goalFlag.reached && this.rectOverlap(p, lvl.goalFlag)) {
      lvl.goalFlag.reached = true;
      sfx.victory();
      const bonusCoins = 25 + this.stageIndex * 10;
      p.coins += bonusCoins;
      this.score += 1500;
      this.gainXP(65);
      this.addLog(t('logStageClear', bonusCoins));
      this.spawnFloatingText(lvl.goalFlag.x, lvl.goalFlag.y + 40, `STAGE CLEAR! +${bonusCoins}🪙`, '#facc15', 22);

      setTimeout(() => {
        if (this.stageIndex + 1 < STAGES.length) {
          this.loadStage(this.stageIndex + 1);
        }
      }, 1300);
    }

    // Update Camera smoothly following Mario
    const targetCam = p.x - this.width * 0.34;
    const maxCam = Math.max(0, lvl.width - this.width);
    this.cameraX += (Math.max(0, Math.min(maxCam, targetCam)) - this.cameraX) * Math.min(1, dt * 8);

    // Update Enemies, Boss, Projectiles, Pickups & Visuals
    this.updateEnemies(dt);
    if (lvl.boss && !lvl.boss.dead) {
      lvl.boss.update(dt, this);
      this.checkPlayerBossInteraction(lvl.boss);
    }
    this.updateProjectiles(dt);
    this.updatePickups(dt);
    this.updateEffects(dt);
    this.updateCanvasHUD();
  }

  onGroundPoundLand() {
    const p = this.player;
    sfx.groundPoundImpact();
    this.screenShake = 0.35;

    const radius = p.perks.meteorPound ? 190 : 120;
    const dmg = (p.stompDamage * 1.65 + (p.perks.meteorPound ? 24 : 0)) * p.atkMultiplier;

    this.triggerAoEExplosion(p.x + p.w / 2, p.y + p.h, radius, dmg, '#f97316', t('ftMeteorSlam'));

    // Meteor Ground Pound Perk spawns erupting fire pillars!
    if (p.perks.meteorPound) {
      [-1, 1].forEach(dir => {
        this.projectiles.push({
          weaponId: 'fire_flower',
          x: p.x + p.w / 2,
          y: p.y,
          w: 18,
          h: 18,
          vx: dir * 240,
          vy: -360,
          gravity: 850,
          bounces: 2,
          damage: dmg * 0.6,
          color: '#facc15',
          life: 2.0
        });
      });
    }

    // Shell Summoner Perk
    if (p.perks.poundShell) {
      const shell = createEnemy('koopa', p.x + p.facing * 36, p.y - 4, this.stageIndex, p.level);
      shell.inShell = true;
      shell.shellSpinning = true;
      shell.vx = p.facing * 520;
      this.level.enemies.push(shell);
    }
  }

  triggerBlockHit(b) {
    if (b.hits <= 0) {
      sfx.blockBump();
      return;
    }
    b.hits -= 1;
    b.bumpY = -10;
    b.type = 'empty';
    sfx.blockBump();

    const cx = b.x + b.w / 2;
    const cy = b.y - 14;

    if (b.loot === 'coin') {
      sfx.coin();
      this.player.coins += 3;
      this.score += 100;
      this.gainXP(12);
      this.spawnFloatingText(cx, cy, '+3 🪙', '#facc15', 14);
    } else if (b.loot === 'coin_burst') {
      sfx.coin();
      for (let i = 0; i < 4; i++) {
        this.spawnPickup(cx + (i - 1.5) * 12, cy, 'coin');
      }
    } else if (b.loot === 'xp_burst') {
      sfx.powerup();
      for (let i = 0; i < 4; i++) {
        this.spawnPickup(cx + (i - 1.5) * 14, cy, 'xp');
      }
    } else if (b.loot === 'mushroom') {
      sfx.powerup();
      this.spawnPickup(cx, cy, 'mushroom');
    } else if (b.loot === 'star') {
      sfx.powerup();
      this.spawnPickup(cx, cy, 'star');
    } else if (b.loot === 'weapon_scroll') {
      sfx.powerup();
      this.spawnPickup(cx, cy, 'scroll');
    }
    this.updateAllHUD();
  }

  // --- Enemy AI & Stomp / Shell Physics ---
  updateEnemies(dt) {
    const p = this.player;
    const lvl = this.level;

    for (let i = lvl.enemies.length - 1; i >= 0; i--) {
      const e = lvl.enemies[i];
      if (e.dead) {
        lvl.enemies.splice(i, 1);
        continue;
      }

      // Skip far off-screen enemies
      if (Math.abs(e.x - p.x) > 1050) continue;

      if (e.hurtFlash > 0) e.hurtFlash -= dt;

      if (e.BurnTick === undefined) e.BurnTick = 0;
      if (e.burnTimer > 0) {
        e.burnTimer -= dt;
        e.BurnTick -= dt;
        if (e.BurnTick <= 0) {
          e.BurnTick = 0.45;
          this.damageEnemy(e, 9 + p.level * 2, false, '🔥');
        }
      }

      if (e.frozenTimer > 0) {
        e.frozenTimer -= dt;
      } else {
        // Enemy Type AI Movement
        if (e.inShell) {
          if (e.shellSpinning) {
            e.x += e.vx * dt;
            // Spinning shell mows down other enemies!
            for (const other of lvl.enemies) {
              if (other !== e && !other.dead && this.rectOverlap(e, other)) {
                this.damageEnemy(other, 85, true, t('ftShellRam'));
              }
            }
            // Spinning shell hits Final Boss for massive damage!
            if (lvl.boss && !lvl.boss.dead && this.rectOverlap(e, lvl.boss)) {
              lvl.boss.takeDamage(140, this, true, t('ftShellBreak'));
              e.dead = true;
              this.spawnParticles(e.x, e.y, '#22c55e', 18);
              continue;
            }
          }
        } else if (e.type === 'piranha') {
          e.y = e.baseY + Math.sin(this.time * 2.6 + e.x) * 18;
        } else if (e.type === 'paratroopa') {
          e.x += e.vx * dt;
          e.y = e.baseY + Math.sin(this.time * 4 + e.x * 0.02) * 34;
          if (Math.abs(e.x - p.x) > 360) e.vx = Math.sign(p.x - e.x) * e.speed;
        } else if (e.type === 'lakitu') {
          const targetX = p.x + Math.sin(this.time * 1.8) * 180;
          e.x += Math.sign(targetX - e.x) * e.speed * dt;
          e.y = 95 + Math.sin(this.time * 3) * 14;
          e.attackTimer -= dt;
          if (e.attackTimer <= 0) {
            e.attackTimer = 2.4;
            this.enemyProjectiles.push({
              x: e.x + e.w / 2,
              y: e.y + e.h,
              w: 16,
              h: 16,
              vx: (p.x - e.x) * 0.4,
              vy: 190,
              damage: e.damage,
              color: '#ef4444',
              type: 'spiny_egg',
              life: 3.0
            });
          }
        } else if (e.type === 'boo' || e.type === 'swooper') {
          // Boo turns shy when Mario looks directly at it!
          const lookingAtBoo = (p.facing > 0 && e.x > p.x) || (p.facing < 0 && e.x < p.x);
          e.shy = (e.type === 'boo' && lookingAtBoo);
          if (!e.shy) {
            const angle = Math.atan2(p.y - e.y, p.x - e.x);
            e.vx = Math.cos(angle) * e.speed;
            e.vy = Math.sin(angle) * e.speed;
            e.x += e.vx * dt;
            e.y += e.vy * dt;
          }
        } else {
          // Ground walkers (Goomba, Koopa, Buzzy, Hammer Bro, Magikoopa)
          e.vy += 980 * dt;
          e.x += e.vx * dt;
          e.y += e.vy * dt;

          let onFloor = false;
          for (const plat of lvl.platforms) {
            if (
              e.x + e.w > plat.x &&
              e.x < plat.x + plat.w &&
              e.y + e.h >= plat.y &&
              e.y + e.h - e.vy * dt <= plat.y + 18 &&
              e.vy >= 0
            ) {
              e.y = plat.y - e.h;
              e.vy = 0;
              onFloor = true;
              // Turn around at platform edges (unless spinning shell)
              if (!e.shellSpinning && (e.x <= plat.x + 6 || e.x + e.w >= plat.x + plat.w - 6)) {
                e.vx = -e.vx;
              }
            }
          }

          if (!onFloor && e.y > this.height + 60) {
            e.dead = true;
            continue;
          }

          // Hammer Bro & Magikoopa ranged attacks
          if (e.type === 'hammerbro' || e.type === 'magikoopa') {
            e.attackTimer -= dt;
            if (e.attackTimer <= 0 && Math.abs(e.x - p.x) < 480) {
              e.attackTimer = 1.9 + Math.random() * 0.8;
              const dir = Math.sign(p.x - e.x) || -1;
              e.vx = dir * e.speed;
              this.enemyProjectiles.push({
                x: e.x + e.w / 2,
                y: e.y + 8,
                w: 16,
                h: 16,
                vx: dir * 240,
                vy: e.type === 'hammerbro' ? -340 : (p.y - e.y) * 0.6,
                gravity: e.type === 'hammerbro' ? 820 : 0,
                damage: e.damage,
                color: e.type === 'hammerbro' ? '#94a3b8' : '#c084fc',
                type: e.type,
                life: 2.6
              });
            }
          }
        }
      }

      // Check Mario <-> Enemy Collision (Stomp vs Contact Damage)
      if (this.rectOverlap(p, e)) {
        if (p.starTimer > 0) {
          // Rainbow Star Invincibility instakills on touch!
          this.damageEnemy(e, 999, true, t('ftStarRam'));
          continue;
        }

        const stompMargin = isTouchHandheld() ? 0.66 : 0.58;
        const isFallingOnTop = (p.vy > 0 && (p.y + p.h - p.vy * dt) <= e.y + e.h * stompMargin) || p.state === 'pound' || p.state === 'spin';
        const canStompTarget = !e.spikyTop || p.perks.safeStomp || p.state === 'spin' || p.state === 'pound';

        if (e.inShell && !e.shellSpinning) {
          // Kick stationary shell!
          e.shellSpinning = true;
          e.vx = (p.x + p.w / 2 < e.x + e.w / 2 ? 1 : -1) * 520;
          e.x += Math.sign(e.vx) * 18;
          p.vy = -340;
          sfx.stomp(1);
          this.spawnFloatingText(e.x, e.y - 12, t('ftShellKick'), '#22c55e', 14);
        } else if (isFallingOnTop && canStompTarget) {
          this.performStompOnEnemy(e);
        } else if (e.frozenTimer > 0) {
          // Touching or stomping a frozen enemy shatters them safely!
          this.performStompOnEnemy(e);
        } else {
          this.damagePlayer(e.damage, t('logEnemyHit', e.type));
        }
      }
    }
  }

  performStompOnEnemy(e) {
    const p = this.player;
    p.stompCombo += 1;
    p.maxStompCombo = Math.max(p.maxStompCombo, p.stompCombo);
    p.jumpsUsed = 0; // Aerial stomp refreshes double jumps!

    const bounceVel = p.state === 'pound' ? -460 : (-450 - (p.perks.comboMaster ? Math.min(120, p.stompCombo * 18) : 0));
    p.vy = bounceVel;
    p.y = e.y - p.h - 2;
    if (p.state === 'pound') p.state = 'jump';

    sfx.stomp(p.stompCombo);

    const comboScale = p.perks.comboMaster ? 0.45 : 0.25;
    const rawStomp = p.stompDamage * (1 + (p.stompCombo - 1) * comboScale) * this.getCoinDamageBonus();
    const { damage, isCrit } = this.rollCrit(rawStomp);

    // Check Frozen Ice Shatter Synergy (300% AOE Damage!)
    if (e.frozenTimer > 0) {
      e.frozenTimer = 0;
      sfx.iceShatter();
      this.triggerAoEExplosion(e.x + e.w / 2, e.y + e.h / 2, 125, damage * 2.5, '#38bdf8', t('ftIceShatter'));
    }

    // Koopa / Paratroopa turns into a kickable shell on stomp if it survives or first stomp
    if ((e.type === 'koopa' || e.type === 'paratroopa') && !e.inShell) {
      e.inShell = true;
      e.shellSpinning = false;
      e.vx = 0;
      e.h = 28;
      this.damageEnemy(e, damage * 0.7, isCrit, t('ftStompCombo', p.stompCombo), true);
    } else {
      this.damageEnemy(e, damage, isCrit, t('ftStompCombo', p.stompCombo), true);
    }

    // Roguelite Stomp Perks:
    // 1. Thunder Boots Chain Lightning
    if (p.perks.thunderBoots) {
      this.triggerChainLightning(e.x + e.w / 2, e.y + e.h / 2, 35 * p.perks.thunderBoots * p.atkMultiplier, 3);
    }

    // 2. Stomp Barrage (Fire current weapon left & right!)
    if (p.perks.stompBarrage) {
      this.tryAttack(-1);
      this.tryAttack(1);
    }

    this.updateAllHUD();
  }

  checkPlayerBossInteraction(boss) {
    const p = this.player;
    if (!this.rectOverlap(p, boss)) return;

    if (p.starTimer > 0) {
      boss.takeDamage(28, this, true, t('ftStarRam'));
      p.vy = -420;
      return;
    }

    const isStomp = (p.vy > 0 && (p.y + p.h - p.vy * 0.016) <= boss.y + 34) || p.state === 'spin' || p.state === 'pound';
    const canStompSpinningShell = boss.state !== 'shell_spin' || p.perks.safeStomp || p.state === 'spin';

    if (isStomp && canStompSpinningShell) {
      p.stompCombo += 1;
      p.maxStompCombo = Math.max(p.maxStompCombo, p.stompCombo);
      p.jumpsUsed = 0;
      p.vy = -510;
      p.vx = (p.x < boss.x + boss.w / 2 ? -1 : 1) * 220;
      p.y = boss.y - p.h - 4;
      sfx.stomp(p.stompCombo);

      const stompDmg = p.stompDamage * (1 + (p.stompCombo - 1) * 0.3) * 1.25;
      const { damage, isCrit } = this.rollCrit(stompDmg);
      boss.takeDamage(damage, this, isCrit, t('ftBossStomp', p.stompCombo), true);

      if (p.perks.thunderBoots) {
        boss.takeDamage(30 * p.perks.thunderBoots, this, false, t('ftThunderBoots'));
      }
      if (p.perks.stompBarrage) {
        this.tryAttack(-1);
        this.tryAttack(1);
      }
      this.updateAllHUD();
    } else {
      this.damagePlayer(22, t('logBossHit'));
    }
  }

  spawnMinionForBoss(x, y) {
    const minion = createEnemy('koopa', x, y, this.stageIndex, this.player.level);
    this.level.enemies.push(minion);
  }

  damageEnemy(e, amount, isCrit = false, tag = '', isStomp = false) {
    if (e.dead) return;
    const dmg = Math.max(1, Math.round(amount));
    e.hp -= dmg;
    e.hurtFlash = 0.12;

    const label = tag ? `${tag} -${dmg}` : (isCrit ? `💥${dmg}!` : `-${dmg}`);
    this.spawnFloatingText(e.x + e.w / 2, e.y - 8, label, isCrit ? '#facc15' : '#ffffff', isCrit ? 16 : 13);
    this.spawnParticles(e.x + e.w / 2, e.y + e.h / 2, isCrit ? '#facc15' : '#f87171', 6);

    if (e.hp <= 0) {
      e.dead = true;
      this.enemiesKilled += 1;
      this.score += e.scoreValue;

      // Vampiric Stomp Heal
      if (isStomp && this.player.perks.vampStomp) {
        const heal = 8 * this.player.perks.vampStomp;
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
        this.spawnFloatingText(this.player.x, this.player.y - 16, `+${heal} HP🩸`, '#4ade80', 13);
      }

      // Super Star Overdrive on every 12 kills
      if (this.player.perks.starOnKills && this.enemiesKilled % 12 === 0) {
        this.player.starTimer = Math.max(this.player.starTimer, 4.5);
        sfx.powerup();
        this.addLog(t('logStarKills'));
      }

      // Drop XP Gem & Coins
      this.spawnPickup(e.x + e.w / 2, e.y + 8, 'xp', e.xpValue);
      if (Math.random() < 0.78) {
        this.spawnPickup(e.x + e.w / 2 + 8, e.y + 4, 'coin', e.coinValue);
      }
      this.updateAllHUD();
    }
  }

  damagePlayer(rawAmount, reason = '') {
    const p = this.player;
    if (p.hurtTimer > 0 || p.starTimer > 0) return;

    const dmg = Math.max(1, Math.round(rawAmount * (1 - p.damageReduction)));
    p.hp = Math.max(0, p.hp - dmg);
    p.hurtTimer = 1.05;
    p.stompCombo = 0;
    this.screenShake = 0.3;
    sfx.hurt();

    this.spawnFloatingText(p.x + p.w / 2, p.y - 12, `-${dmg} HP`, '#ef4444', 16);
    if (reason) this.addLog(`⚠️ ${reason} (-${dmg} HP)`);

    // Thorns Shell Perk counter-attack
    if (p.perks.thornsShell) {
      [-1, -0.5, 0.5, 1].forEach(dir => {
        this.projectiles.push({
          weaponId: 'heavy_hammer',
          x: p.x + p.w / 2,
          y: p.y + 10,
          w: 16,
          h: 16,
          vx: dir * 340,
          vy: -260,
          gravity: 750,
          pierce: 3,
          armorPierce: true,
          damage: 38 * p.atkMultiplier,
          color: '#4ade80',
          life: 1.8
        });
      });
    }

    this.updateAllHUD();

    if (p.hp <= 0) {
      this.onPlayerDefeated();
    }
  }

  // --- Projectiles, Chain Lightning & AOE ---
  updateProjectiles(dt) {
    const p = this.player;
    const lvl = this.level;

    // Player Projectiles
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const pr = this.projectiles[i];
      pr.life -= dt;
      if (pr.life <= 0) {
        this.projectiles.splice(i, 1);
        continue;
      }

      // Boomerang return acceleration & item magnet
      if (pr.returnAccel) {
        pr.vx += pr.returnAccel * dt;
        for (const pk of this.pickups) {
          if (Math.hypot(pk.x - pr.x, pk.y - pr.y) < 90) {
            pk.x += (p.x - pk.x) * dt * 7;
            pk.y += (p.y - pk.y) * dt * 7;
          }
        }
      }

      // Homing Spores Perk
      if (p.perks.homing && lvl.enemies.length > 0) {
        let nearest = null;
        let bestD = 260;
        for (const e of lvl.enemies) {
          if (e.dead) continue;
          const d = Math.hypot(e.x - pr.x, e.y - pr.y);
          if (d < bestD) { bestD = d; nearest = e; }
        }
        if (nearest) {
          pr.vy += Math.sign((nearest.y + nearest.h / 2) - pr.y) * 420 * dt;
        }
      }

      if (pr.gravity) {
        pr.vy += pr.gravity * dt;
      }

      pr.x += pr.vx * dt;
      pr.y += pr.vy * dt;

      // Bouncing Fireballs on platforms
      if (pr.bounces !== undefined) {
        for (const plat of lvl.platforms) {
          if (
            pr.x + pr.w > plat.x &&
            pr.x < plat.x + plat.w &&
            pr.y + pr.h >= plat.y &&
            pr.y <= plat.y + 16 &&
            pr.vy > 0
          ) {
            pr.y = plat.y - pr.h;
            pr.vy = -250;
            pr.bounces -= 1;
            this.spawnParticles(pr.x, pr.y, '#fb923c', 3);
            if (pr.bounces < 0) pr.life = 0;
          }
        }
      }

      // Hit Enemies
      for (const e of lvl.enemies) {
        if (e.dead || !this.rectOverlap(pr, e)) continue;

        if (e.fireproof && pr.weaponId === 'fire_flower') {
          this.spawnFloatingText(e.x, e.y - 10, t('ftFireproof'), '#94a3b8', 12);
          pr.life = 0;
          break;
        }

        const { damage, isCrit } = this.rollCrit(pr.damage);
        if (pr.weaponId === 'fire_flower') {
          e.burnTimer = 3.0;
        } else if (pr.weaponId === 'ice_blaster') {
          e.frozenTimer = pr.freezeDuration || 2.5;
        } else if (pr.weaponId === 'thunder_wand') {
          this.triggerChainLightning(e.x + e.w / 2, e.y + e.h / 2, damage * 0.65, pr.chainCount || 3, e);
        }

        // Kick stationary shell with weapon hit!
        if (e.inShell && !e.shellSpinning) {
          e.shellSpinning = true;
          e.vx = Math.sign(pr.vx || 1) * 520;
        }

        this.damageEnemy(e, damage, isCrit);

        if (pr.pierce && pr.pierce > 1) {
          pr.pierce -= 1;
        } else {
          pr.life = 0;
          break;
        }
      }

      // Hit Final Boss
      if (pr.life > 0 && lvl.boss && !lvl.boss.dead && this.rectOverlap(pr, lvl.boss)) {
        const { damage, isCrit } = this.rollCrit(pr.damage);
        if (pr.weaponId === 'fire_flower') lvl.boss.burnTimer = 2.5;
        if (pr.weaponId === 'ice_blaster') lvl.boss.frozenTimer = 1.8;
        lvl.boss.takeDamage(damage, this, isCrit);
        if (!pr.pierce || pr.pierce <= 1) {
          pr.life = 0;
        } else {
          pr.pierce -= 1;
          pr.x += Math.sign(pr.vx) * 24;
        }
      }
    }

    // Enemy Projectiles
    for (let i = this.enemyProjectiles.length - 1; i >= 0; i--) {
      const ep = this.enemyProjectiles[i];
      ep.life -= dt;
      if (ep.gravity) ep.vy += ep.gravity * dt;
      ep.x += ep.vx * dt;
      ep.y += ep.vy * dt;

      if (ep.life <= 0 || ep.y > this.height + 40) {
        this.enemyProjectiles.splice(i, 1);
        continue;
      }

      if (this.rectOverlap(p, ep)) {
        if (p.state === 'spin') {
          // Spin Jump deflects enemy projectiles!
          ep.life = 0;
          sfx.stomp(1);
          this.spawnFloatingText(p.x, p.y - 10, t('ftSpinParry'), '#38bdf8', 14);
        } else {
          ep.life = 0;
          this.damagePlayer(ep.damage, t('logProjectileHit'));
        }
      }
    }
  }

  triggerChainLightning(x, y, dmg, maxTargets = 3, excludeEnemy = null) {
    sfx.shootLightning();
    let curX = x;
    let curY = y;
    const hitSet = new Set(excludeEnemy ? [excludeEnemy] : []);

    for (let c = 0; c < maxTargets; c++) {
      let closest = null;
      let minDist = 230;
      for (const e of this.level.enemies) {
        if (e.dead || hitSet.has(e)) continue;
        const d = Math.hypot((e.x + e.w / 2) - curX, (e.y + e.h / 2) - curY);
        if (d < minDist) {
          minDist = d;
          closest = e;
        }
      }
      if (!closest) break;
      hitSet.add(closest);
      const nx = closest.x + closest.w / 2;
      const ny = closest.y + closest.h / 2;
      this.lightningArcs.push({ x1: curX, y1: curY, x2: nx, y2: ny, life: 0.22 });
      this.damageEnemy(closest, dmg, false, t('ftChainLight'));
      curX = nx;
      curY = ny;
    }
  }

  triggerIceNova(x, y) {
    sfx.shootIce();
    this.spawnParticles(x, y, '#7dd3fc', 16);
    for (const e of this.level.enemies) {
      if (!e.dead && Math.hypot((e.x + e.w / 2) - x, (e.y + e.h / 2) - y) < 135) {
        e.frozenTimer = 2.6;
        this.damageEnemy(e, 14, false, t('ftFrost'));
      }
    }
  }

  triggerAoEExplosion(x, y, radius, damage, color = '#f97316', tag = null) {
    const resolvedTag = tag ?? t('ftBlast');
    this.spawnParticles(x, y, color, 24);
    for (const e of this.level.enemies) {
      if (!e.dead && Math.hypot((e.x + e.w / 2) - x, (e.y + e.h / 2) - y) <= radius) {
        this.damageEnemy(e, damage, true, resolvedTag);
      }
    }
    if (this.level.boss && !this.level.boss.dead) {
      const b = this.level.boss;
      if (Math.hypot((b.x + b.w / 2) - x, (b.y + b.h / 2) - y) <= radius + 35) {
        b.takeDamage(damage, this, true, resolvedTag);
      }
    }
  }

  // --- Pickups & Level-Up Progression ---
  spawnPickup(x, y, type, value = 1) {
    this.pickups.push({
      x,
      y,
      w: 18,
      h: 18,
      vx: (Math.random() - 0.5) * 140,
      vy: -220 - Math.random() * 90,
      type, // coin | xp | mushroom | star | scroll
      value,
      life: 18
    });
  }

  updatePickups(dt) {
    const p = this.player;
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      pk.life -= dt;
      if (pk.life <= 0) {
        this.pickups.splice(i, 1);
        continue;
      }

      // Magnet pull toward Mario
      const dx = (p.x + p.w / 2) - pk.x;
      const dy = (p.y + p.h / 2) - pk.y;
      const dist = Math.hypot(dx, dy);
      if (dist < p.pickupRadius) {
        pk.x += (dx / Math.max(1, dist)) * 390 * dt;
        pk.y += (dy / Math.max(1, dist)) * 390 * dt;
      } else {
        pk.vy += 680 * dt;
        pk.x += pk.vx * dt;
        pk.y += pk.vy * dt;
        for (const plat of this.level.platforms) {
          if (pk.x + pk.w > plat.x && pk.x < plat.x + plat.w && pk.y + pk.h >= plat.y && pk.y <= plat.y + 16 && pk.vy > 0) {
            pk.y = plat.y - pk.h;
            pk.vy = -pk.vy * 0.35;
            pk.vx *= 0.7;
          }
        }
      }

      if (this.rectOverlap(p, pk)) {
        if (pk.type === 'coin') {
          sfx.coin();
          p.coins += pk.value;
          this.score += pk.value * 50;
          this.spawnFloatingText(pk.x, pk.y, `+${pk.value}🪙`, '#facc15', 13);
        } else if (pk.type === 'xp') {
          sfx.xpGem();
          this.gainXP(pk.value);
        } else if (pk.type === 'mushroom') {
          sfx.powerup();
          p.hp = Math.min(p.maxHp, p.hp + 40);
          this.spawnFloatingText(pk.x, pk.y, '+40 HP 🍄', '#4ade80', 15);
        } else if (pk.type === 'star') {
          sfx.powerup();
          p.starTimer = 7.0;
          this.spawnFloatingText(pk.x, pk.y, t('ftRainbowStar'), '#facc15', 16);
        } else if (pk.type === 'scroll') {
          sfx.powerup();
          const wId = this.currentWeapon.id;
          p.weaponLevels[wId] = (p.weaponLevels[wId] || 1) + 1;
          this.spawnFloatingText(pk.x, pk.y, `⚔️${loc(this.currentWeapon, 'name')} LV+1!`, '#38bdf8', 15);
          this.updateWeaponDock();
        }
        this.pickups.splice(i, 1);
        this.updateAllHUD();
      }
    }
  }

  gainXP(rawAmount) {
    const p = this.player;
    const gain = Math.round(rawAmount * p.xpMultiplier);
    p.xp += gain;
    this.spawnFloatingText(p.x + p.w / 2, p.y - 18, `+${gain} EXP⭐`, '#c084fc', 13);

    if (p.xp >= p.xpToNext) {
      p.xp -= p.xpToNext;
      p.level += 1;
      p.xpToNext = Math.round(p.xpToNext * 1.28);
      p.maxHp += 15;
      p.hp = Math.min(p.maxHp, p.hp + 25);
      p.stompDamage += 5;
      this.triggerLevelUp();
    }
    this.updateAllHUD();
  }

  triggerLevelUp() {
    sfx.levelUp();
    document.getElementById('modal-new-level').textContent = String(this.player.level);
    document.getElementById('reroll-cost').textContent = String(this.rerollCost);
    this.populatePerkChoices();
    if (!this.dlgLevelUp.open) {
      this.dlgLevelUp.showModal();
    }
  }

  populatePerkChoices() {
    // Pick 3 distinct random perks from PERKS_POOL
    this.currentPerkChoices = [...PERKS_POOL].sort(() => Math.random() - 0.5).slice(0, 3);
    this.renderPerkChoiceButtons();
  }

  renderPerkChoiceButtons() {
    const container = document.getElementById('perk-choices-container');
    container.innerHTML = '';
    const rarityLabel = t('rarity');

    this.currentPerkChoices.forEach((perk, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `perk-card-btn rarity-${perk.rarity}`;
      if (idx === 0) btn.autofocus = true;
      btn.innerHTML = `
        <span class="perk-icon" aria-hidden="true">${perk.icon}</span>
        <span class="perk-rarity-tag">${rarityLabel[perk.rarity]}</span>
        <strong class="perk-title">${loc(perk, 'name')}</strong>
        <p class="perk-desc">${loc(perk, 'desc')}</p>
        <span class="perk-choose-hint">${t('perkChooseHint')}</span>
      `;
      btn.addEventListener('click', () => {
        perk.apply(this.player);
        this.player.acquiredPerkList.push(perk);
        sfx.powerup();
        this.addLog(t('logPerkGain', perk.icon, loc(perk, 'name')));
        this.dlgLevelUp.close();
        this.updateWeaponDock();
        this.updateAllHUD();
      });
      container.appendChild(btn);
    });
  }

  // --- Toad's Black Market Shop Modal ---
  openShopModal() {
    this.renderShopItems();
    if (!this.dlgShop.open) {
      this.dlgShop.showModal();
    }
  }

  renderShopItems() {
    const p = this.player;
    document.getElementById('shop-modal-coins').textContent = String(p.coins);
    const grid = document.getElementById('shop-items-grid');
    grid.innerHTML = '';

    // 1. Locked Weapons or Weapon Upgrades
    WEAPONS.forEach((w, idx) => {
      const unlocked = p.unlockedWeapons.has(w.id);
      const lv = p.weaponLevels[w.id] || 1;
      const cost = unlocked ? (30 + lv * 20) : w.cost;
      const wName = loc(w, 'name');

      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <div class="shop-item-icon" aria-hidden="true">${w.icon}</div>
        <div class="shop-item-title">${wName} ${unlocked ? `(LV.${lv})` : t('shopLockedTag')}</div>
        <p class="shop-item-desc">${loc(w, 'desc')}</p>
        <button type="button" class="pixel-btn ${unlocked ? 'btn-primary' : 'btn-gold'}">
          ${unlocked ? t('shopUpgradeBtn', lv + 1, cost) : t('shopUnlockBtn', cost)}
        </button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        if (p.coins >= cost) {
          p.coins -= cost;
          if (!unlocked) {
            p.unlockedWeapons.add(w.id);
            this.selectWeapon(idx);
            this.addLog(t('logShopUnlock', wName));
          } else {
            p.weaponLevels[w.id] = lv + 1;
            this.addLog(t('logShopUpgrade', wName, lv + 1));
          }
          sfx.powerup();
          this.renderShopItems();
          this.updateWeaponDock();
          this.updateAllHUD();
        } else {
          sfx.blockBump();
        }
      });
      grid.appendChild(card);
    });

    // 2. Super Mushroom Full Heal & 1-UP Relic
    const supplyDefs = t('shopSupplies');
    const supplyEffects = [
      () => {
        p.maxHp += 15;
        p.hp = Math.min(p.maxHp, p.hp + 75);
      },
      () => {
        this.dlgShop.close();
        this.triggerLevelUp();
      },
      () => {
        p.lives += 1;
      }
    ];

    supplyDefs.forEach((item, idx) => {
      const card = document.createElement('div');
      card.className = 'shop-item-card';
      card.innerHTML = `
        <div class="shop-item-icon" aria-hidden="true">${item.icon}</div>
        <div class="shop-item-title">${item.title}</div>
        <p class="shop-item-desc">${item.desc}</p>
        <button type="button" class="pixel-btn btn-secondary">${t('shopBuyBtn', item.cost)}</button>
      `;
      card.querySelector('button').addEventListener('click', () => {
        if (p.coins >= item.cost) {
          p.coins -= item.cost;
          sfx.powerup();
          supplyEffects[idx]();
          this.renderShopItems();
          this.updateAllHUD();
        } else {
          sfx.blockBump();
        }
      });
      grid.appendChild(card);
    });
  }

  renderCompendium() {
    const wGrid = document.getElementById('compendium-weapons');
    wGrid.innerHTML = '';
    WEAPONS.forEach((w, idx) => {
      const unlocked = this.player.unlockedWeapons.has(w.id);
      const div = document.createElement('div');
      div.className = 'comp-card';
      div.innerHTML = `
        <strong>${w.icon} [${w.key}] ${loc(w, 'name')} (LV.${this.player.weaponLevels[w.id]})</strong>
        <p>${loc(w, 'desc')}</p>
        <button type="button" class="pixel-btn ${unlocked ? 'btn-primary' : 'btn-gold'}">
          ${unlocked ? t('armoryEquipBtn') : t('armoryUnlockEquipBtn')}
        </button>
      `;
      div.querySelector('button').addEventListener('click', () => {
        this.player.unlockedWeapons.add(w.id);
        this.selectWeapon(idx);
        this.dlgArmory.close();
      });
      wGrid.appendChild(div);
    });

    const pGrid = document.getElementById('compendium-perks');
    pGrid.innerHTML = '';
    const rarityLabel = t('rarity');
    PERKS_POOL.forEach(pk => {
      const div = document.createElement('div');
      div.className = 'comp-card';
      div.innerHTML = `
        <strong>${pk.icon} ${loc(pk, 'name')} <small>[${rarityLabel[pk.rarity]}]</small></strong>
        <p>${loc(pk, 'desc')}</p>
      `;
      pGrid.appendChild(div);
    });
  }

  // --- Boss Victory & Game Over Handlers ---
  onBossDefeated(boss) {
    sfx.victory();
    this.screenShake = 0.8;
    this.score += 10000;
    this.spawnParticles(boss.x + boss.w / 2, boss.y + boss.h / 2, '#facc15', 60);
    this.addLog(t('logBossDefeated'));

    setTimeout(() => {
      this.showEndModal(true);
    }, 1100);
  }

  onPlayerDefeated() {
    this.showEndModal(false);
  }

  showEndModal(isVictory) {
    this.lastEndVictory = isVictory;
    const p = this.player;
    const st = t('summaryStats');
    document.getElementById('gameover-kicker').textContent = isVictory ? t('victoryKicker') : t('defeatKicker');
    document.getElementById('gameover-title').textContent = isVictory
      ? t('victoryTitle')
      : t('defeatTitle', loc(this.level.stageDef, 'name'));
    document.getElementById('gameover-subtitle').textContent = isVictory
      ? t('victorySubtitle')
      : (p.lives > 0 ? t('defeatReviveSubtitle') : t('defeatRetrySubtitle'));

    const reviveBtn = document.getElementById('btn-revive-run');
    reviveBtn.hidden = isVictory || p.lives <= 0;
    reviveBtn.textContent = t('btnRevive', p.lives);

    const statsEl = document.getElementById('gameover-stats');
    statsEl.innerHTML = `
      <div class="summary-stat-box"><dt>${st.score}</dt><dd>${this.score}</dd></div>
      <div class="summary-stat-box"><dt>${st.level}</dt><dd>LV.${p.level}</dd></div>
      <div class="summary-stat-box"><dt>${st.combo}</dt><dd>${t('comboUnit', p.maxStompCombo)}</dd></div>
      <div class="summary-stat-box"><dt>${st.kills}</dt><dd>${this.enemiesKilled}</dd></div>
      <div class="summary-stat-box"><dt>${st.perks}</dt><dd>${p.acquiredPerkList.length}</dd></div>
      <div class="summary-stat-box"><dt>${st.coins}</dt><dd>${p.coins} 🪙</dd></div>
    `;

    if (!this.dlgGameOver.open) {
      this.dlgGameOver.showModal();
    }
  }

  // --- Visual Effects & HUD Updates ---
  spawnParticles(x, y, color, count = 8) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 60 + Math.random() * 220;
      this.particles.push({
        x,
        y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 60,
        size: 3 + Math.floor(Math.random() * 4),
        color,
        life: 0.35 + Math.random() * 0.3
      });
    }
  }

  spawnFloatingText(x, y, text, color = '#fff', size = 14) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      size,
      vy: -55,
      life: 0.85
    });
  }

  updateEffects(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const pt = this.particles[i];
      pt.life -= dt;
      pt.vy += 480 * dt;
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      if (pt.life <= 0) this.particles.splice(i, 1);
    }

    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.life -= dt;
      ft.y += ft.vy * dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    for (let i = this.lightningArcs.length - 1; i >= 0; i--) {
      this.lightningArcs[i].life -= dt;
      if (this.lightningArcs[i].life <= 0) this.lightningArcs.splice(i, 1);
    }

    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].life -= dt;
      if (this.afterimages[i].life <= 0) this.afterimages.splice(i, 1);
    }
  }

  updateWeaponDock() {
    const container = document.getElementById('weapon-slots');
    container.innerHTML = '';
    const p = this.player;

    WEAPONS.forEach((w, idx) => {
      const unlocked = p.unlockedWeapons.has(w.id);
      const isCurrent = p.currentWeaponIndex === idx;
      const lv = p.weaponLevels[w.id] || 1;

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `weapon-slot-btn ${isCurrent ? 'active' : ''} ${unlocked ? '' : 'locked'}`;
      btn.title = loc(w, 'name');
      const dockName = getLang() === 'en' ? (w.shortNameEn || w.nameEn) : w.nameZh;
      btn.innerHTML = `
        <div class="slot-top">
          <span class="slot-key">[${w.key}] ${w.icon}</span>
          <span class="slot-lv">${unlocked ? `LV.${lv}` : `🔒${w.cost}🪙`}</span>
        </div>
        <div class="slot-name">${dockName}</div>
        <div class="slot-sub">${unlocked ? t('slotPower', Math.round(w.baseDamage * (1 + (lv - 1) * 0.25) * p.atkMultiplier)) : t('slotUnlockHint')}</div>
      `;
      btn.addEventListener('click', () => {
        if (unlocked) {
          this.selectWeapon(idx);
        } else {
          this.openShopModal();
        }
      });
      container.appendChild(btn);
    });
  }

  updateAllHUD() {
    const p = this.player;
    const ranks = RANK_TITLES[getLang()] || RANK_TITLES.en;
    document.getElementById('ui-level').textContent = String(p.level);
    document.getElementById('ui-title-rank').textContent = ranks[Math.min(p.level - 1, ranks.length - 1)];

    const hpPct = Math.max(0, Math.min(100, Math.round((p.hp / p.maxHp) * 100)));
    document.getElementById('ui-hp-text').textContent = `${Math.ceil(p.hp)} / ${p.maxHp}`;
    document.getElementById('ui-hp-fill').style.setProperty('--fill-pct', `${hpPct}%`);

    const xpPct = Math.max(0, Math.min(100, Math.round((p.xp / p.xpToNext) * 100)));
    document.getElementById('ui-xp-text').textContent = `${p.xp} / ${p.xpToNext}`;
    document.getElementById('ui-xp-fill').style.setProperty('--fill-pct', `${xpPct}%`);

    document.getElementById('stat-coins').textContent = String(p.coins);
    document.getElementById('shop-coin-badge').textContent = String(p.coins);
    document.getElementById('stat-stomp').textContent = String(Math.round(p.stompDamage * this.getCoinDamageBonus()));
    document.getElementById('stat-atk').textContent = `${Math.round(p.atkMultiplier * this.getCoinDamageBonus() * 100)}%`;
    document.getElementById('stat-crit').textContent = `${Math.round(p.critChance * 100)}%`;
    document.getElementById('stat-jumps').textContent = t('jumpsUnit', p.maxJumps);
    document.getElementById('stat-max-combo').textContent = t('comboUnit', p.maxStompCombo);

    // Active Perks Sidebar
    document.getElementById('ui-perk-count').textContent = String(p.acquiredPerkList.length);
    const perkListEl = document.getElementById('ui-active-perks');
    if (p.acquiredPerkList.length > 0) {
      perkListEl.innerHTML = '';
      const counts = new Map();
      p.acquiredPerkList.forEach(pk => {
        counts.set(pk.id, { perk: pk, count: (counts.get(pk.id)?.count || 0) + 1 });
      });
      counts.forEach(({ perk, count }) => {
        const li = document.createElement('li');
        li.className = 'perk-mini-item';
        li.innerHTML = `<span>${perk.icon} ${loc(perk, 'name')}</span><span class="perk-stack">x${count}</span>`;
        perkListEl.appendChild(li);
      });
    } else {
      perkListEl.innerHTML = `<li class="empty-hint">${t('emptyPerksHint')}</li>`;
    }
  }

  updateCanvasHUD() {
    const p = this.player;
    const lvl = this.level;

    // Stamina Bar & Star status
    const stamPct = Math.round(p.stamina);
    document.getElementById('ui-stamina-text').textContent = `${stamPct}%`;
    document.getElementById('ui-stamina-fill').style.setProperty('--fill-pct', `${stamPct}%`);
    document.getElementById('ui-star-status').hidden = p.starTimer <= 0;

    // Stage progress
    document.getElementById('hud-biome-icon').textContent = lvl.stageDef.icon;
    document.getElementById('hud-stage-name').textContent = `${lvl.stageDef.code} · ${loc(lvl.stageDef, 'name')}`;
    const progPct = Math.min(100, Math.max(0, Math.round((p.x / (lvl.width - 200)) * 100)));
    document.getElementById('hud-stage-progress').style.setProperty('--stage-pct', `${progPct}%`);
    document.getElementById('hud-score').textContent = String(this.score).padStart(6, '0');

    // Combo Badge
    const comboBadge = document.getElementById('hud-combo-badge');
    if (p.stompCombo >= 2) {
      comboBadge.hidden = false;
      document.getElementById('hud-combo-num').textContent = String(p.stompCombo);
    } else {
      comboBadge.hidden = true;
    }

    // Boss HUD
    const bossHud = document.getElementById('boss-hud');
    if (lvl.boss && !lvl.boss.dead) {
      bossHud.hidden = false;
      const b = lvl.boss;
      document.getElementById('boss-name-label').textContent = b.phaseName;
      document.getElementById('boss-phase-badge').textContent = `PHASE ${b.phase} / 3`;
      const bPct = Math.max(0, Math.round((b.hp / b.maxHp) * 100));
      document.getElementById('boss-hp-fill').style.setProperty('--boss-hp', `${bPct}%`);
      document.getElementById('boss-attack-hint').textContent = b.phaseHint;
    } else {
      bossHud.hidden = true;
    }

    drawPortrait(this.portraitCtx, this.currentWeapon, p.starTimer > 0, this.time);
    this.mobile?.syncHUD();
  }

  addLog(msg) {
    const log = document.getElementById('combat-log');
    const li = document.createElement('li');
    li.textContent = msg;
    log.prepend(li);
    while (log.children.length > 14) {
      log.removeChild(log.lastChild);
    }
  }

  rectOverlap(a, b) {
    return (
      a.x < b.x + b.w &&
      a.x + a.w > b.x &&
      a.y < b.y + b.h &&
      a.y + a.h > b.y
    );
  }

  // --- Master Canvas Renderer ---
  draw() {
    const ctx = this.ctx;
    const lvl = this.level;
    const p = this.player;

    ctx.save();

    // Screen Shake
    if (this.screenShake > 0) {
      const mag = this.screenShake * 12;
      ctx.translate((Math.random() - 0.5) * mag, (Math.random() - 0.5) * mag);
    }

    // 1. Parallax Pixel Background
    drawStageBackground(ctx, lvl.stageDef, this.cameraX, this.width, this.height, this.time);

    ctx.translate(-Math.round(this.cameraX), 0);

    // 2. Lava Hazards
    for (const h of lvl.hazards) {
      ctx.fillStyle = '#ea580c';
      ctx.fillRect(h.x, h.y, h.w, h.h);
      ctx.fillStyle = '#fde047';
      const waveOffset = Math.floor(this.time * 8) % 16;
      for (let lx = h.x; lx < h.x + h.w - 8; lx += 16) {
        ctx.fillRect(lx + (waveOffset % 6), h.y, 10, 5);
      }
    }

    // 3. Platforms & Ground Tiles
    for (const plat of lvl.platforms) {
      if (plat.type === 'pipe_solid') continue; // Drawn by pipe renderer
      if (plat.x + plat.w < this.cameraX - 50 || plat.x > this.cameraX + this.width + 50) continue;

      ctx.fillStyle = lvl.stageDef.groundFill;
      ctx.fillRect(Math.round(plat.x), Math.round(plat.y), plat.w, plat.h);

      // Top Grass / Crystal / Stone Trim
      ctx.fillStyle = lvl.stageDef.groundTop;
      ctx.fillRect(Math.round(plat.x), Math.round(plat.y), plat.w, 8);

      // Pixel Grid Lines
      ctx.strokeStyle = 'rgba(0,0,0,0.45)';
      ctx.lineWidth = 2;
      ctx.strokeRect(Math.round(plat.x), Math.round(plat.y), plat.w, plat.h);
    }

    // 4. Warp Pipes
    for (const pipe of lvl.pipes) {
      ctx.fillStyle = '#15803d';
      ctx.fillRect(pipe.x + 4, pipe.y + 18, pipe.w - 8, pipe.h - 18);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(pipe.x, pipe.y, pipe.w, 20);
      // Specular highlight stripe
      ctx.fillStyle = '#86efac';
      ctx.fillRect(pipe.x + 10, pipe.y + 2, 8, pipe.h - 4);
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 2;
      ctx.strokeRect(pipe.x, pipe.y, pipe.w, 20);
      ctx.strokeRect(pipe.x + 4, pipe.y + 18, pipe.w - 8, pipe.h - 18);
    }

    // 5. Question Blocks [?] & Bricks
    for (const b of lvl.blocks) {
      const by = Math.round(b.y + (b.bumpY || 0));
      if (b.type === 'question') {
        const pulse = Math.floor(this.time * 5) % 2 === 0;
        ctx.fillStyle = pulse ? '#facc15' : '#eab308';
        ctx.fillRect(b.x, by, b.w, b.h);
        ctx.strokeStyle = '#713f12';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, by, b.w, b.h);
        ctx.fillStyle = '#713f12';
        ctx.font = 'bold 18px monospace';
        ctx.fillText('?', b.x + 11, by + 24);
      } else if (b.type === 'brick') {
        ctx.fillStyle = lvl.stageDef.brickColor;
        ctx.fillRect(b.x, by, b.w, b.h);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(b.x, by, b.w, b.h);
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(b.x, by + 16, b.w, 2);
      } else {
        ctx.fillStyle = '#475569';
        ctx.fillRect(b.x, by, b.w, b.h);
        ctx.strokeRect(b.x, by, b.w, b.h);
      }
    }

    // 6. Springboards
    for (const sp of lvl.springs) {
      const ch = sp.compress * 8;
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(sp.x, sp.y + ch, sp.w, 8);
      ctx.fillStyle = '#facc15';
      ctx.fillRect(sp.x + 6, sp.y + 8 + ch, sp.w - 12, sp.h - 8 - ch);
    }

    // 7. Toad's Caravan Tent & Goal Flagpole
    if (lvl.shopTent) {
      const tent = lvl.shopTent;
      ctx.fillStyle = '#dc2626';
      ctx.fillRect(tent.x, tent.y, tent.w, tent.h);
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(tent.x + 12, tent.y + 8, 16, 16);
      ctx.fillRect(tent.x + tent.w - 28, tent.y + 8, 16, 16);
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(tent.x + 24, tent.y + 32, 28, 36);
      ctx.fillStyle = '#facc15';
      ctx.font = 'bold 11px monospace';
      ctx.fillText(t('toadShopCanvas'), tent.x + 8, tent.y - 6);
    }

    if (lvl.goalFlag) {
      const g = lvl.goalFlag;
      ctx.fillStyle = '#e2e8f0';
      ctx.fillRect(g.x + 8, g.y, 6, g.h);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(g.x + 11, g.y, 10, 0, Math.PI * 2);
      ctx.fill();
      // Pennant Flag
      ctx.fillStyle = g.reached ? '#22c55e' : '#ef4444';
      ctx.fillRect(g.x - 36, g.y + 14, 44, 28);
      ctx.fillStyle = '#fff';
      ctx.font = 'bold 12px monospace';
      ctx.fillText('★', g.x - 20, g.y + 32);
    }

    // 8. Pickups
    for (const pk of this.pickups) {
      if (pk.type === 'coin') {
        ctx.fillStyle = '#facc15';
        ctx.fillRect(pk.x, pk.y, 14, 18);
        ctx.strokeStyle = '#854d0e';
        ctx.strokeRect(pk.x, pk.y, 14, 18);
      } else if (pk.type === 'xp') {
        ctx.fillStyle = '#c084fc';
        ctx.fillRect(pk.x, pk.y, 14, 14);
        ctx.strokeStyle = '#fff';
        ctx.strokeRect(pk.x, pk.y, 14, 14);
      } else if (pk.type === 'mushroom') {
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(pk.x, pk.y, 20, 12);
        ctx.fillStyle = '#fde68a';
        ctx.fillRect(pk.x + 4, pk.y + 12, 12, 8);
      } else if (pk.type === 'star') {
        ctx.fillStyle = '#fde047';
        ctx.fillRect(pk.x, pk.y, 20, 20);
      } else if (pk.type === 'scroll') {
        ctx.fillStyle = '#38bdf8';
        ctx.fillRect(pk.x, pk.y, 18, 18);
      }
    }

    // 9. Enemies & Final Boss
    for (const e of lvl.enemies) {
      if (!e.dead && Math.abs(e.x - p.x) < 900) {
        drawEnemySprite(ctx, e, this.time);
      }
    }
    if (lvl.boss && !lvl.boss.dead) {
      lvl.boss.draw(ctx, this.time);
    }

    // 10. Dash Afterimages & Mario Protagonist
    for (const ai of this.afterimages) {
      ctx.globalAlpha = ai.life * 1.8;
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(ai.x, ai.y, p.w, p.h);
    }
    ctx.globalAlpha = 1;
    drawMarioSprite(ctx, p, this.time);

    // 11. Player & Enemy Projectiles + Chain Lightning Arcs
    for (const pr of this.projectiles) {
      ctx.fillStyle = pr.color;
      ctx.fillRect(Math.round(pr.x), Math.round(pr.y), pr.w, pr.h);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(Math.round(pr.x), Math.round(pr.y), pr.w, pr.h);
    }

    for (const ep of this.enemyProjectiles) {
      ctx.fillStyle = ep.color;
      ctx.fillRect(Math.round(ep.x), Math.round(ep.y), ep.w, ep.h);
      ctx.strokeStyle = '#000';
      ctx.strokeRect(Math.round(ep.x), Math.round(ep.y), ep.w, ep.h);
    }

    for (const arc of this.lightningArcs) {
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(arc.x1, arc.y1);
      ctx.lineTo((arc.x1 + arc.x2) / 2 + (Math.random() - 0.5) * 20, (arc.y1 + arc.y2) / 2 + (Math.random() - 0.5) * 20);
      ctx.lineTo(arc.x2, arc.y2);
      ctx.stroke();
    }

    // 12. Particles & Floating Combat Text
    for (const pt of this.particles) {
      ctx.fillStyle = pt.color;
      ctx.fillRect(Math.round(pt.x), Math.round(pt.y), pt.size, pt.size);
    }

    for (const ft of this.floatingTexts) {
      ctx.font = `900 ${ft.size}px 'Courier New', monospace`;
      ctx.fillStyle = '#000';
      ctx.fillText(ft.text, Math.round(ft.x) + 2, Math.round(ft.y) + 2);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, Math.round(ft.x), Math.round(ft.y));
    }

    ctx.restore();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  window.marioGame = new MarioRogueGame();
});
