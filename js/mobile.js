// Mobile Handheld Console Controller (Multi-Touch Gamepad, HUD Sync, PWA Fullscreen & iOS Audio Unlock)

import { sfx } from './audio.js?v=20261121a';
import { getLang, t, loc } from './i18n.js?v=20261121a';

export function isTouchHandheld() {
  return window.matchMedia('(pointer: coarse) and (max-width: 1180px), (hover: none) and (max-width: 1180px)').matches;
}

export class MobileController {
  constructor(game) {
    this.game = game;
    this.dpadPointerId = null;
    this.atkPointers = new Set();
    this.dlgMobileMenu = document.getElementById('dialog-mobile-menu');

    this.setupAudioUnlock();
    this.bindSlidingDPad();
    this.bindActionButtons();
    this.bindMobileHudAndMenu();
    this.bindPortraitGate();
    this.syncHUD();
  }

  vibrate(ms = 12) {
    if (typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function') {
      try {
        navigator.vibrate(ms);
      } catch {
        // Ignore blocked haptics
      }
    }
  }

  /**
   * iOS Safari & Mobile Chrome require resuming AudioContext synchronously inside a user gesture
   */
  setupAudioUnlock() {
    const unlockOnce = () => {
      sfx.unlock();
      window.removeEventListener('pointerdown', unlockOnce);
      window.removeEventListener('touchstart', unlockOnce);
    };
    window.addEventListener('pointerdown', unlockOnce, { passive: true });
    window.addEventListener('touchstart', unlockOnce, { passive: true });
  }

  /**
   * Continuous sliding Left/Right D-Pad:
   * Players can glide their left thumb back & forth without lifting!
   */
  bindSlidingDPad() {
    const zone = document.getElementById('touch-dpad-zone');
    const btnLeft = document.getElementById('touch-btn-left');
    const btnRight = document.getElementById('touch-btn-right');
    if (!zone || !btnLeft || !btnRight) return;

    const updateDirection = (clientX) => {
      const rect = zone.getBoundingClientRect();
      const midX = rect.left + rect.width * 0.5;
      const deadZone = 8;
      const goLeft = clientX < midX - deadZone;
      const goRight = clientX > midX + deadZone;

      this.game.keys['ArrowLeft'] = goLeft;
      this.game.keys['ArrowRight'] = goRight;
      btnLeft.classList.toggle('is-pressed', goLeft);
      btnRight.classList.toggle('is-pressed', goRight);
    };

    const releaseDpad = () => {
      this.dpadPointerId = null;
      this.game.keys['ArrowLeft'] = false;
      this.game.keys['ArrowRight'] = false;
      btnLeft.classList.remove('is-pressed');
      btnRight.classList.remove('is-pressed');
    };

    zone.addEventListener('pointerdown', (e) => {
      if (this.game.isAnyModalOpen()) return;
      e.preventDefault();
      sfx.unlock();
      this.dpadPointerId = e.pointerId;
      try {
        zone.setPointerCapture(e.pointerId);
      } catch {
        // Ignore if capture unsupported
      }
      updateDirection(e.clientX);
    });

    zone.addEventListener('pointermove', (e) => {
      if (e.pointerId !== this.dpadPointerId) return;
      e.preventDefault();
      updateDirection(e.clientX);
    });

    const onEnd = (e) => {
      if (e.pointerId === this.dpadPointerId) {
        releaseDpad();
      }
    };
    zone.addEventListener('pointerup', onEnd);
    zone.addEventListener('pointercancel', onEnd);
    window.addEventListener('blur', releaseDpad);
  }

  /**
   * Multi-touch right-hand action cluster: Jump, Hold-to-Fire Attack, Dash, Spin, Midair Ground Pound, Quick Weapon Cycle
   */
  bindActionButtons() {
    const jumpBtn = document.getElementById('touch-btn-jump');
    const atkBtn = document.getElementById('touch-btn-atk');
    const dashBtn = document.getElementById('touch-btn-dash');
    const spinBtn = document.getElementById('touch-btn-spin');
    const slamBtn = document.getElementById('touch-btn-slam');
    const weaponBtn = document.getElementById('touch-weapon-pill');

    const bindTapAction = (el, onDown) => {
      if (!el) return;
      el.addEventListener('pointerdown', (e) => {
        if (this.game.isAnyModalOpen()) return;
        e.preventDefault();
        sfx.unlock();
        el.classList.add('is-pressed');
        this.vibrate(10);
        onDown();
      });
      const clear = () => el.classList.remove('is-pressed');
      el.addEventListener('pointerup', clear);
      el.addEventListener('pointercancel', clear);
      el.addEventListener('pointerleave', clear);
    };

    bindTapAction(jumpBtn, () => this.game.tryJump(false));
    bindTapAction(spinBtn, () => this.game.tryJump(true));
    bindTapAction(dashBtn, () => this.game.tryDash());
    bindTapAction(slamBtn, () => this.game.tryGroundPound());
    bindTapAction(weaponBtn, () => {
      const unlockedCount = this.game.player.unlockedWeapons.size;
      if (unlockedCount > 1) {
        this.game.cycleWeapon();
      } else {
        this.game.openShopModal();
      }
      this.syncHUD();
    });

    // Attack button supports hold-to-autofire via game.keys['KeyJ']
    if (atkBtn) {
      const releaseAtk = (pointerId) => {
        this.atkPointers.delete(pointerId);
        if (this.atkPointers.size === 0) {
          this.game.keys['KeyJ'] = false;
          atkBtn.classList.remove('is-pressed');
        }
      };

      atkBtn.addEventListener('pointerdown', (e) => {
        if (this.game.isAnyModalOpen()) return;
        e.preventDefault();
        sfx.unlock();
        this.atkPointers.add(e.pointerId);
        try {
          atkBtn.setPointerCapture(e.pointerId);
        } catch {
          // Ignore
        }
        atkBtn.classList.add('is-pressed');
        this.game.keys['KeyJ'] = true;
        this.vibrate(8);
        this.game.tryAttack();
      });

      atkBtn.addEventListener('pointerup', (e) => releaseAtk(e.pointerId));
      atkBtn.addEventListener('pointercancel', (e) => releaseAtk(e.pointerId));
      window.addEventListener('blur', () => {
        this.atkPointers.clear();
        this.game.keys['KeyJ'] = false;
        atkBtn.classList.remove('is-pressed');
      });
    }
  }

  bindMobileHudAndMenu() {
    document.getElementById('m-btn-shop')?.addEventListener('click', () => {
      this.releaseAllTouchInputs();
      this.game.openShopModal();
    });

    document.getElementById('m-btn-menu')?.addEventListener('click', () => {
      this.releaseAllTouchInputs();
      this.populateMobileMenuStats();
      if (this.dlgMobileMenu && !this.dlgMobileMenu.open) {
        this.dlgMobileMenu.showModal();
        this.dlgMobileMenu.scrollTop = 0;
      }
    });

    // Fullscreen button (hide cleanly on iOS Safari where Fullscreen API is unavailable)
    const fsBtn = document.getElementById('m-btn-fullscreen');
    if (fsBtn) {
      const canFS = Boolean(document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen);
      if (!canFS) {
        fsBtn.hidden = true;
      } else {
        fsBtn.addEventListener('click', async () => {
          try {
            if (!document.fullscreenElement) {
              await (document.documentElement.requestFullscreen?.() || document.documentElement.webkitRequestFullscreen?.());
            } else {
              await document.exitFullscreen?.();
            }
          } catch {
            // Ignore browser gesture rejections
          }
        });
      }
    }

    // Menu modal internal shortcuts (delegate cleanly to existing game buttons)
    const proxyAction = (id, targetId) => {
      document.getElementById(id)?.addEventListener('click', () => {
        this.dlgMobileMenu?.close();
        document.getElementById(targetId)?.click();
      });
    };

    proxyAction('m-menu-armory', 'btn-armory');
    proxyAction('m-menu-shop', 'btn-shop-open');
    proxyAction('m-menu-boss', 'btn-boss-warp');
    proxyAction('m-menu-levelup', 'btn-free-levelup');
    proxyAction('m-menu-unlock', 'btn-unlock-all-weapons');
    proxyAction('m-menu-help', 'btn-help');

    document.getElementById('m-menu-crt')?.addEventListener('click', () => {
      document.getElementById('btn-crt-toggle')?.click();
      this.syncMobileMenuToggles();
    });

    document.getElementById('m-menu-mute')?.addEventListener('click', () => {
      document.getElementById('btn-mute')?.click();
      this.syncMobileMenuToggles();
    });

    document.querySelectorAll('.m-stage-btn[data-stage]').forEach((btn) => {
      btn.addEventListener('click', () => {
        const st = Number(btn.dataset.stage);
        this.dlgMobileMenu?.close();
        this.game.loadStage(st);
      });
    });

    // Save run state when switching /en/ <-> /zh/ from inside the mobile menu!
    this.dlgMobileMenu?.querySelectorAll('a.lang-btn').forEach((link) => {
      link.addEventListener('click', (e) => {
        if (link.dataset.lang === getLang()) {
          e.preventDefault();
          return;
        }
        this.game.saveRouteState();
      });
    });
  }

  bindPortraitGate() {
    document.getElementById('btn-play-portrait')?.addEventListener('click', () => {
      document.body.classList.add('allow-portrait-play');
      sfx.unlock();
    });
  }

  releaseAllTouchInputs() {
    this.dpadPointerId = null;
    this.atkPointers.clear();
    this.game.keys['ArrowLeft'] = false;
    this.game.keys['ArrowRight'] = false;
    this.game.keys['KeyJ'] = false;
    document.querySelectorAll('.dpad-btn.is-pressed, .touch-btn.is-pressed').forEach((el) => {
      el.classList.remove('is-pressed');
    });
  }

  syncMobileMenuToggles() {
    const desktopCrt = document.getElementById('btn-crt-toggle');
    const mobileCrt = document.getElementById('m-menu-crt');
    if (desktopCrt && mobileCrt) mobileCrt.textContent = desktopCrt.textContent;

    const desktopMute = document.getElementById('btn-mute');
    const mobileMute = document.getElementById('m-menu-mute');
    if (desktopMute && mobileMute) mobileMute.textContent = desktopMute.textContent;
  }

  populateMobileMenuStats() {
    const p = this.game.player;
    this.syncMobileMenuToggles();
    const set = (id, val) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(val);
    };
    set('m-stat-lv', `LV.${p.level}`);
    set('m-stat-hp', `${Math.ceil(p.hp)}/${p.maxHp}`);
    set('m-stat-coins', `${p.coins} 🪙`);
    set('m-stat-stomp', Math.round(p.stompDamage * this.game.getCoinDamageBonus()));
    set('m-stat-atk', `${Math.round(p.atkMultiplier * this.game.getCoinDamageBonus() * 100)}%`);
    set('m-stat-perks', p.acquiredPerkList.length);
  }

  syncHUD() {
    const p = this.game.player;
    const lvl = this.game.level;
    if (!p || !lvl) return;

    const hpPct = Math.max(0, Math.min(100, Math.round((p.hp / p.maxHp) * 100)));
    const hpFill = document.getElementById('m-hp-fill');
    if (hpFill) hpFill.style.setProperty('--m-hp-pct', `${hpPct}%`);

    const hpNum = document.getElementById('m-hp-num');
    if (hpNum) hpNum.textContent = `${Math.ceil(p.hp)}`;

    const lvEl = document.getElementById('m-lv-num');
    if (lvEl) lvEl.textContent = `LV.${p.level}`;

    const coinEl = document.getElementById('m-coin-num');
    if (coinEl) coinEl.textContent = String(p.coins);

    const stageEl = document.getElementById('m-stage-code');
    if (stageEl) stageEl.textContent = `${lvl.stageDef.icon} ${lvl.stageDef.code}`;

    const scoreEl = document.getElementById('m-score-num');
    if (scoreEl) scoreEl.textContent = String(this.game.score).padStart(6, '0');

    const comboEl = document.getElementById('m-combo-pill');
    if (comboEl) {
      comboEl.hidden = p.stompCombo < 2;
      if (p.stompCombo >= 2) {
        comboEl.textContent = `🔥 ${p.stompCombo}x`;
      }
    }

    // Highlight Slam button when Mario is midair!
    const slamBtn = document.getElementById('touch-btn-slam');
    if (slamBtn) {
      slamBtn.classList.toggle('is-airborne', !p.grounded);
    }

    // Sync Quick Weapon Switcher Pill
    const w = this.game.currentWeapon;
    const wLabel = document.getElementById('touch-weapon-label');
    if (w && wLabel) {
      const lv = p.weaponLevels[w.id] || 1;
      const shortName = getLang() === 'en' ? (w.shortNameEn || w.nameEn) : w.nameZh;
      wLabel.textContent = `${w.icon} ${shortName} LV.${lv}`;
    }
  }
}
