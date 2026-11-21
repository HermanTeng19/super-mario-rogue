// 16-Bit Chiptune Synthesizer & Sound Engine (Web Audio API)

export class SoundEngine {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.volume = 0.65;
    this.bgmTimer = null;
    this.currentTrack = 'overworld';
    this.stepIndex = 0;
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playTone(freq, type = 'square', duration = 0.12, startTimeOffset = 0, volScale = 0.25, slideTo = null) {
    if (this.muted || this.volume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime + startTimeOffset;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, now);
    if (slideTo !== null) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), now + duration);
    }

    const peak = Math.max(0.001, this.volume * volScale);
    gain.gain.setValueAtTime(peak, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.01);
  }

  playNoise(duration = 0.1, volScale = 0.2) {
    if (this.muted || this.volume <= 0) return;
    this.init();
    if (!this.ctx) return;

    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 950;

    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;
    gain.gain.setValueAtTime(this.volume * volScale, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    noise.start(now);
  }

  // --- Classic & Roguelite Action SFX ---
  jump(isDouble = false) {
    if (isDouble) {
      this.playTone(260, 'square', 0.14, 0, 0.22, 720);
    } else {
      this.playTone(185, 'square', 0.15, 0, 0.22, 540);
    }
  }

  spinJump() {
    this.playTone(320, 'triangle', 0.07, 0, 0.25, 680);
    this.playTone(420, 'square', 0.09, 0.06, 0.22, 880);
  }

  stomp(combo = 1) {
    // Rising pitch with aerial stomp combo!
    const mult = Math.min(2.2, 1 + (combo - 1) * 0.14);
    this.playTone(220 * mult, 'square', 0.09, 0, 0.28, 580 * mult);
    this.playTone(440 * mult, 'triangle', 0.11, 0.05, 0.24, 760 * mult);
  }

  groundPoundStart() {
    this.playTone(520, 'sawtooth', 0.12, 0, 0.2, 220);
  }

  groundPoundImpact() {
    this.playNoise(0.22, 0.35);
    this.playTone(110, 'sawtooth', 0.24, 0, 0.35, 38);
    this.playTone(165, 'square', 0.18, 0.03, 0.25, 55);
  }

  coin() {
    this.playTone(987.77, 'square', 0.07, 0, 0.2); // B5
    this.playTone(1318.51, 'square', 0.22, 0.07, 0.22); // E6
  }

  xpGem() {
    this.playTone(659.25, 'triangle', 0.06, 0, 0.18, 880);
  }

  blockBump() {
    this.playTone(140, 'square', 0.08, 0, 0.25, 90);
  }

  blockBreak() {
    this.playNoise(0.14, 0.28);
    this.playTone(190, 'sawtooth', 0.12, 0, 0.22, 70);
  }

  shootFire() {
    this.playTone(680, 'square', 0.09, 0, 0.18, 220);
  }

  throwHammer() {
    this.playTone(240, 'sawtooth', 0.12, 0, 0.22, 120);
  }

  throwBoomerang() {
    this.playTone(440, 'triangle', 0.1, 0, 0.2, 660);
    this.playTone(660, 'triangle', 0.1, 0.08, 0.18, 440);
  }

  shootIce() {
    this.playTone(1046.5, 'sine', 0.09, 0, 0.22, 1567.98);
  }

  iceShatter() {
    this.playNoise(0.15, 0.25);
    this.playTone(1200, 'square', 0.08, 0, 0.2, 1900);
    this.playTone(1500, 'triangle', 0.1, 0.05, 0.2, 850);
  }

  shootLightning() {
    this.playNoise(0.12, 0.24);
    this.playTone(880, 'sawtooth', 0.12, 0, 0.24, 240);
  }

  capeSlash() {
    this.playNoise(0.08, 0.2);
    this.playTone(540, 'triangle', 0.1, 0, 0.24, 920);
  }

  dash() {
    this.playTone(360, 'triangle', 0.1, 0, 0.2, 720);
  }

  powerup() {
    const notes = [330, 392, 659, 523, 587, 784];
    notes.forEach((n, i) => {
      this.playTone(n, 'square', 0.08, i * 0.055, 0.2);
    });
  }

  levelUp() {
    const notes = [523.25, 659.25, 783.99, 1046.5, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.playTone(n, 'square', 0.11, i * 0.075, 0.24);
    });
  }

  hurt() {
    this.playTone(260, 'sawtooth', 0.12, 0, 0.28, 110);
    this.playTone(180, 'sawtooth', 0.16, 0.09, 0.28, 80);
  }

  bossRoar() {
    this.playNoise(0.35, 0.35);
    this.playTone(95, 'sawtooth', 0.4, 0, 0.35, 42);
    this.playTone(130, 'square', 0.35, 0.08, 0.28, 55);
  }

  victory() {
    const melody = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98];
    melody.forEach((n, i) => {
      this.playTone(n, 'square', 0.15, i * 0.09, 0.25);
    });
  }
}

export const sfx = new SoundEngine();
