// 3-Phase Final Boss: Mecha-Crowned King Bowser (终焉魔王·酷霸王)

import { sfx } from './audio.js?v=20261120b';
import { t } from './i18n.js?v=20261120b';

export class FinalBoss {
  constructor(x, y, playerLevel = 1) {
    this.x = x;
    this.y = y;
    this.w = 86;
    this.h = 88;
    this.vx = 0;
    this.vy = 0;
    this.facing = -1;

    // Scales fairly with player level while remaining an exciting challenge
    this.maxHp = 1350 + (playerLevel - 1) * 180;
    this.hp = this.maxHp;
    this.phase = 1;

    this.state = 'idle'; // idle | fire_breath | leap_slam | shell_spin | meteor_call
    this.stateTimer = 1.6;
    this.attackIndex = 0;

    this.hurtFlash = 0;
    this.frozenTimer = 0;
    this.burnTimer = 0;
    this.grounded = false;
    this.dead = false;

    this.arenaMinX = x - 620;
    this.arenaMaxX = x + 160;
  }

  get phaseName() {
    return t('bossPhaseName')[this.phase];
  }

  get phaseHint() {
    return t('bossPhaseHint')[this.phase];
  }

  update(dt, game) {
    if (this.dead) return;

    const p = game.player;
    if (this.hurtFlash > 0) this.hurtFlash -= dt;
    if (this.frozenTimer > 0) {
      this.frozenTimer -= dt;
      dt *= 0.45; // Boss is slowed rather than permanently stunlocked by ice
    }

    if (this.burnTimer > 0) {
      this.burnTimer -= dt;
      if (Math.random() < dt * 4) {
        this.takeDamage(6 + p.level * 1.5, game, false, t('ftBurn'));
      }
    }

    // Check Phase Transitions
    const hpRatio = this.hp / this.maxHp;
    if (this.phase === 1 && hpRatio <= 0.62) {
      this.phase = 2;
      this.enterPhaseTransition(game, t('bossPhaseLog')[2]);
    } else if (this.phase === 2 && hpRatio <= 0.28) {
      this.phase = 3;
      this.enterPhaseTransition(game, t('bossPhaseLog')[3]);
    }

    // Face Mario when not spinning
    if (this.state !== 'shell_spin') {
      this.facing = (p.x + p.w / 2 < this.x + this.w / 2) ? -1 : 1;
    }

    this.stateTimer -= dt;

    if (this.state === 'idle') {
      // Slow menacing patrol toward Mario
      const dist = (p.x - this.x);
      this.vx = Math.sign(dist) * (this.phase === 3 ? 115 : 80);

      if (this.stateTimer <= 0) {
        this.chooseNextAttack(game);
      }
    } else if (this.state === 'fire_breath') {
      this.vx = 0;
      // Shoot fireballs at intervals during breath state
      if (this.fireCooldown !== undefined) {
        this.fireCooldown -= dt;
        if (this.fireCooldown <= 0) {
          this.fireCooldown = this.phase === 3 ? 0.22 : 0.34;
          this.spawnBossFireball(game);
        }
      }
      if (this.stateTimer <= 0) {
        this.state = 'idle';
        this.stateTimer = this.phase === 3 ? 1.1 : 1.6;
      }
    } else if (this.state === 'leap_slam') {
      // Wait until landing to unleash ground shockwave
      if (this.grounded && this.vy === 0 && this.hasJumped) {
        this.unleashShockwave(game);
        this.state = 'idle';
        this.stateTimer = 1.4;
      }
    } else if (this.state === 'shell_spin') {
      // High speed horizontal ricochet charge
      const speed = this.phase === 3 ? 440 : 350;
      this.vx = this.spinDir * speed;
      if (this.x <= this.arenaMinX + 20) {
        this.spinDir = 1;
        sfx.blockBump();
      } else if (this.x + this.w >= this.arenaMaxX - 20) {
        this.spinDir = -1;
        sfx.blockBump();
      }
      if (Math.random() < dt * 15) {
        game.spawnParticles(this.x + this.w / 2, this.y + this.h - 6, '#f97316', 3);
      }
      if (this.stateTimer <= 0) {
        this.state = 'idle';
        this.vx = 0;
        this.stateTimer = 1.3;
      }
    } else if (this.state === 'meteor_call') {
      this.vx = 0;
      this.meteorTick -= dt;
      if (this.meteorTick <= 0) {
        this.meteorTick = this.phase === 3 ? 0.25 : 0.38;
        const targetX = p.x + (Math.random() - 0.5) * 320;
        game.enemyProjectiles.push({
          x: Math.max(this.arenaMinX, Math.min(this.arenaMaxX, targetX)),
          y: 20,
          w: 22,
          h: 22,
          vx: (Math.random() - 0.5) * 40,
          vy: 330 + this.phase * 40,
          damage: 20,
          color: '#f97316',
          type: 'meteor',
          life: 3.0
        });
        sfx.shootFire();
      }
      if (this.stateTimer <= 0) {
        this.state = 'idle';
        this.stateTimer = 1.4;
      }
    }

    // Apply Gravity & Arena Constraints
    this.vy += 980 * dt;
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    if (this.x < this.arenaMinX) this.x = this.arenaMinX;
    if (this.x + this.w > this.arenaMaxX) this.x = this.arenaMaxX - this.w;

    this.grounded = false;
    for (const plat of game.level.platforms) {
      if (
        this.x + this.w > plat.x &&
        this.x < plat.x + plat.w &&
        this.y + this.h >= plat.y &&
        this.y + this.h - this.vy * dt <= plat.y + 18 &&
        this.vy >= 0
      ) {
        this.y = plat.y - this.h;
        this.vy = 0;
        this.grounded = true;
      }
    }
  }

  enterPhaseTransition(game, msg) {
    sfx.bossRoar();
    game.screenShake = 0.55;
    game.addLog(msg);
    game.spawnFloatingText(this.x + this.w / 2, this.y - 24, `PHASE ${this.phase}!`, '#facc15', 22);
    game.spawnParticles(this.x + this.w / 2, this.y + this.h / 2, '#f43f5e', 36);

    // Drop helpful recovery / ammo pickups on phase change
    game.spawnPickup(this.x, this.y - 20, 'mushroom');
    for (let i = 0; i < 6; i++) {
      game.spawnPickup(this.x + (i - 3) * 25, this.y - 10, 'coin');
    }
  }

  chooseNextAttack(game) {
    this.attackIndex = (this.attackIndex + 1) % 4;
    sfx.bossRoar();

    if (this.attackIndex === 0) {
      // Sweeping Fire Breath
      this.state = 'fire_breath';
      this.stateTimer = 1.6;
      this.fireCooldown = 0.1;
    } else if (this.attackIndex === 1) {
      // Colossus Jump & Shockwave Slam
      this.state = 'leap_slam';
      this.vy = -610;
      const dx = game.player.x - this.x;
      this.vx = Math.max(-260, Math.min(260, dx * 0.85));
      this.grounded = false;
      this.hasJumped = true;
      this.stateTimer = 2.5;
    } else if (this.attackIndex === 2) {
      if (this.phase >= 2) {
        // Spiked Shell Charge
        this.state = 'shell_spin';
        this.spinDir = this.facing;
        this.stateTimer = 2.6;
      } else {
        // Summon Koopa Helper (can be stomped and kicked into Bowser!)
        game.spawnMinionForBoss(this.x + this.facing * 60, this.y - 20);
        this.state = 'fire_breath';
        this.stateTimer = 1.2;
        this.fireCooldown = 0.2;
      }
    } else {
      if (this.phase >= 2) {
        // Meteor Rain + Minion
        this.state = 'meteor_call';
        this.stateTimer = 2.2;
        this.meteorTick = 0.1;
        game.spawnMinionForBoss(this.x - 120, this.y - 40);
      } else {
        this.state = 'leap_slam';
        this.vy = -580;
        this.vx = this.facing * 180;
        this.grounded = false;
        this.hasJumped = true;
        this.stateTimer = 2.5;
      }
    }
  }

  spawnBossFireball(game) {
    sfx.shootFire();
    const p = game.player;
    const sx = this.facing > 0 ? this.x + this.w : this.x - 18;
    const sy = this.y + 28;
    const angle = Math.atan2((p.y + p.h / 2) - sy, (p.x + p.w / 2) - sx);
    const count = this.phase === 3 ? 3 : (this.phase === 2 ? 2 : 1);

    for (let i = 0; i < count; i++) {
      const spread = (i - (count - 1) / 2) * 0.22;
      const spd = 330 + this.phase * 35;
      game.enemyProjectiles.push({
        x: sx,
        y: sy,
        w: 20,
        h: 14,
        vx: Math.cos(angle + spread) * spd,
        vy: Math.sin(angle + spread) * spd,
        damage: 18,
        color: this.phase === 3 ? '#c084fc' : '#f97316',
        type: 'boss_fire',
        life: 3.5
      });
    }
  }

  unleashShockwave(game) {
    sfx.groundPoundImpact();
    game.screenShake = 0.4;
    game.spawnParticles(this.x + this.w / 2, this.y + this.h, '#fb923c', 26);

    // Left and Right ground shockwaves
    [-1, 1].forEach(dir => {
      game.enemyProjectiles.push({
        x: this.x + this.w / 2,
        y: this.y + this.h - 18,
        w: 26,
        h: 18,
        vx: dir * (320 + this.phase * 45),
        vy: 0,
        damage: 22,
        color: '#facc15',
        type: 'shockwave',
        life: 2.2
      });
    });
  }

  takeDamage(amount, game, isCrit = false, label = '', isStomp = false) {
    if (this.dead) return;
    let dmg = Math.max(1, Math.round(amount));
    if (this.frozenTimer > 0 && isStomp) {
      dmg = Math.round(dmg * 2.2);
      this.frozenTimer = 0;
      sfx.iceShatter();
      game.spawnFloatingText(this.x + this.w / 2, this.y - 30, t('ftIceBreak', dmg), '#38bdf8', 20);
    } else {
      const txt = label ? `${label} -${dmg}` : (isCrit ? `💥CRIT -${dmg}!` : `-${dmg}`);
      const col = isCrit ? '#facc15' : '#f8fafc';
      game.spawnFloatingText(this.x + this.w / 2 + (Math.random() - 0.5) * 40, this.y, txt, col, isCrit ? 18 : 14);
    }

    this.hp = Math.max(0, this.hp - dmg);
    this.hurtFlash = 0.12;

    if (this.hp <= 0) {
      this.dead = true;
      game.onBossDefeated(this);
    }
  }

  draw(ctx, time) {
    const { x, y, w, h, facing, phase, state, hurtFlash } = this;
    ctx.save();

    // Phase Aura
    if (phase >= 2) {
      ctx.fillStyle = phase === 3 ? 'rgba(168, 85, 247, 0.28)' : 'rgba(239, 68, 68, 0.22)';
      const pulse = Math.sin(time * 10) * 6;
      ctx.fillRect(x - 8 - pulse / 2, y - 8 - pulse / 2, w + 16 + pulse, h + 16 + pulse);
    }

    if (state === 'shell_spin') {
      // Giant Spinning Spiked Koopa Shell
      ctx.fillStyle = hurtFlash > 0 ? '#fff' : (phase === 3 ? '#581c87' : '#14532d');
      ctx.fillRect(x + 6, y + 18, w - 12, h - 22);
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.strokeRect(x + 6, y + 18, w - 12, h - 22);
      // Spikes
      ctx.fillStyle = '#fef08a';
      for (let i = 0; i < 4; i++) {
        const sx = x + 16 + i * 16;
        ctx.fillRect(sx, y + 6, 10, 12);
      }
      ctx.restore();
      return;
    }

    // Main Spiked Shell on Back
    const shellX = facing < 0 ? x + 22 : x + 4;
    ctx.fillStyle = hurtFlash > 0 ? '#fff' : (phase === 3 ? '#3b0764' : '#15803d');
    ctx.fillRect(shellX, y + 18, 60, 56);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 3;
    ctx.strokeRect(shellX, y + 18, 60, 56);

    // Golden Shell Spikes
    ctx.fillStyle = '#fde047';
    for (let i = 0; i < 3; i++) {
      const sy = y + 24 + i * 16;
      const spikeX = facing < 0 ? x + w - 4 : x - 8;
      ctx.fillRect(spikeX, sy, 12, 10);
    }

    // Muscular Body & Belly
    ctx.fillStyle = hurtFlash > 0 ? '#fff' : (phase === 2 ? '#b91c1c' : '#eab308');
    ctx.fillRect(x + 14, y + 24, w - 28, h - 32);
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(facing < 0 ? x + 12 : x + 36, y + 32, 28, 36);

    // Fierce Dragon Head & Snout
    const headX = facing < 0 ? x - 4 : x + w - 42;
    ctx.fillStyle = hurtFlash > 0 ? '#fff' : '#16a34a';
    ctx.fillRect(headX, y + 4, 46, 34);

    // Fiery Red Mane & Horns
    ctx.fillStyle = '#dc2626';
    ctx.fillRect(headX + 10, y - 8, 26, 12);
    ctx.fillStyle = '#fef3c7';
    ctx.fillRect(headX + 4, y - 12, 8, 14);
    ctx.fillRect(headX + 32, y - 12, 8, 14);

    // Phase 3 Omega Mecha Crown
    if (phase === 3) {
      ctx.fillStyle = '#facc15';
      ctx.fillRect(headX + 8, y - 22, 30, 12);
      ctx.fillStyle = '#38bdf8';
      ctx.fillRect(headX + 19, y - 19, 8, 6);
    }

    // Glowing Crimson Eyes
    ctx.fillStyle = '#ef4444';
    const eyeX = facing < 0 ? headX + 8 : headX + 30;
    ctx.fillRect(eyeX, y + 12, 8, 8);
    ctx.fillStyle = '#fff';
    ctx.fillRect(eyeX + 2, y + 14, 3, 3);

    // Open Fire-Breathing Maw
    if (state === 'fire_breath') {
      ctx.fillStyle = '#fb923c';
      ctx.fillRect(facing < 0 ? headX - 6 : headX + 38, y + 22, 14, 12);
    }

    // Spiked Cuffs & Heavy Claws
    ctx.fillStyle = '#111827';
    ctx.fillRect(x + 12, y + h - 12, 24, 12);
    ctx.fillRect(x + w - 36, y + h - 12, 24, 12);

    ctx.restore();
  }
}
