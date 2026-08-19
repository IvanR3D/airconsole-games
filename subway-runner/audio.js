/* ============================================================
   GameAudio — tiny self-contained synth engine (Web Audio API)
   No external sound files: every music note and effect is
   generated on the fly, so the game has zero binary assets
   and works instantly once uploaded to AirConsole.
   Shared by screen.html and controller.html.
   ============================================================ */
(function () {
  "use strict";

  let ctx = null;
  let masterGain, musicGain, sfxGain;
  let musicTimer = null;
  let musicStep = 0;
  let musicPlaying = false;
  let musicRate = 1; // tempo multiplier, screen.html speeds this up with gameplay

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      masterGain = ctx.createGain();
      masterGain.gain.value = 1;
      masterGain.connect(ctx.destination);
      musicGain = ctx.createGain();
      musicGain.gain.value = 0.22;
      musicGain.connect(masterGain);
      sfxGain = ctx.createGain();
      sfxGain.gain.value = 0.65;
      sfxGain.connect(masterGain);
    }
    if (ctx.state === "suspended") ctx.resume();
  }

  function tone(freq, dur, opts) {
    opts = opts || {};
    ensureCtx();
    const t0 = ctx.currentTime + (opts.delay || 0);
    const osc = ctx.createOscillator();
    osc.type = opts.type || "square";
    osc.frequency.setValueAtTime(freq, t0);
    if (opts.slideTo) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(1, opts.slideTo), t0 + dur);
    }
    const g = ctx.createGain();
    const vol = opts.volume != null ? opts.volume : 0.3;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g);
    g.connect(sfxGain);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  function noiseBurst(dur, opts) {
    opts = opts || {};
    ensureCtx();
    const t0 = ctx.currentTime + (opts.delay || 0);
    const bufferSize = Math.max(1, Math.floor(ctx.sampleRate * dur));
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
    }
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = opts.filterType || "lowpass";
    filter.frequency.setValueAtTime(opts.freqStart || 3000, t0);
    if (opts.freqEnd) filter.frequency.exponentialRampToValueAtTime(opts.freqEnd, t0 + dur);
    const g = ctx.createGain();
    g.gain.setValueAtTime(opts.volume || 0.4, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filter);
    filter.connect(g);
    g.connect(sfxGain);
    src.start(t0);
  }

  const bassPattern = [110, 110, 146.83, 110, 130.81, 130.81, 164.81, 130.81];
  const leadPattern = [440, 0, 523.25, 0, 587.33, 0, 523.25, 440];

  function scheduleMusicBar() {
    const stepDur = 0.19 / musicRate;
    const t0 = ctx.currentTime;
    for (let i = 0; i < 4; i++) {
      const idx = (musicStep + i) % bassPattern.length;
      const bf = bassPattern[idx];
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.frequency.value = bf;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t0 + i * stepDur);
      g.gain.exponentialRampToValueAtTime(0.18, t0 + i * stepDur + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + i * stepDur + stepDur * 0.9);
      osc.connect(g);
      g.connect(musicGain);
      osc.start(t0 + i * stepDur);
      osc.stop(t0 + i * stepDur + stepDur);

      const lf = leadPattern[idx];
      if (lf > 0) {
        const osc2 = ctx.createOscillator();
        osc2.type = "square";
        osc2.frequency.value = lf;
        const g2 = ctx.createGain();
        g2.gain.setValueAtTime(0.0001, t0 + i * stepDur);
        g2.gain.exponentialRampToValueAtTime(0.09, t0 + i * stepDur + 0.01);
        g2.gain.exponentialRampToValueAtTime(0.0001, t0 + i * stepDur + stepDur * 0.8);
        osc2.connect(g2);
        g2.connect(musicGain);
        osc2.start(t0 + i * stepDur);
        osc2.stop(t0 + i * stepDur + stepDur);
      }
    }
    musicStep = (musicStep + 4) % bassPattern.length;
  }

  const GameAudio = {
    unlock() {
      ensureCtx();
    },
    playJump() { tone(360, 0.16, { type: "square", slideTo: 720, volume: 0.25 }); },
    playDuck() { tone(220, 0.12, { type: "square", slideTo: 120, volume: 0.2 }); },
    playLaneChange() { tone(500, 0.05, { type: "triangle", volume: 0.15 }); },
    playCoin() {
      tone(880, 0.08, { type: "square", volume: 0.22 });
      tone(1320, 0.1, { type: "square", volume: 0.2, delay: 0.05 });
    },
    playCrash() {
      noiseBurst(0.35, { freqStart: 2500, freqEnd: 120, volume: 0.5 });
      tone(90, 0.3, { type: "sawtooth", slideTo: 40, volume: 0.3 });
    },
    playClick() { tone(700, 0.04, { type: "square", volume: 0.18 }); },
    playWhoosh() { noiseBurst(0.4, { freqStart: 800, freqEnd: 4000, volume: 0.15, filterType: "highpass" }); },
    playJoin() {
      tone(660, 0.08, { volume: 0.2 });
      tone(990, 0.12, { volume: 0.2, delay: 0.09 });
    },
    playCountdownBeep(isGo) {
      if (isGo) tone(880, 0.28, { type: "square", volume: 0.32 });
      else tone(440, 0.12, { type: "square", volume: 0.25 });
    },
    playGameOverJingle() {
      const notes = [440, 392, 349, 294];
      notes.forEach((f, i) => tone(f, 0.28, { type: "triangle", volume: 0.22, delay: i * 0.16 }));
    },
    playFanfare() {
      const notes = [523, 659, 784, 1046];
      notes.forEach((f, i) => tone(f, 0.22, { type: "square", volume: 0.25, delay: i * 0.11 }));
    },
    startMusic() {
      ensureCtx();
      if (musicPlaying) return;
      musicPlaying = true;
      musicStep = 0;
      scheduleMusicBar();
      musicTimer = setInterval(() => {
        if (musicPlaying) scheduleMusicBar();
      }, (0.19 / musicRate) * 4 * 1000);
    },
    stopMusic() {
      musicPlaying = false;
      if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    },
    setMusicRate(r) {
      musicRate = Math.max(0.6, Math.min(1.8, r));
      if (musicPlaying) { this.stopMusic(); this.startMusic(); }
    },
    setMusicVolume(v) { ensureCtx(); musicGain.gain.value = v; },
    setSfxVolume(v) { ensureCtx(); sfxGain.gain.value = v; },
    setMuted(m) { ensureCtx(); masterGain.gain.value = m ? 0 : 1; },
  };

  window.GameAudio = GameAudio;
})();
