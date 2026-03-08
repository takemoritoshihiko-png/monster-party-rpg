// ============================================================
// sound.js - Web Audio API sound effects (no external files)
// ============================================================

window.SFX = (() => {
  let ctx = null;

  function getCtx() {
    if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
    return ctx;
  }

  // Resume context on first user interaction (browser autoplay policy)
  function unlock() {
    const c = getCtx();
    if (c.state === 'suspended') c.resume();
  }

  // ---- Attack: short sharp hit ----
  function attack() {
    const c = getCtx();
    const t = c.currentTime;

    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.08);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.start(t);
    osc.stop(t + 0.12);

    // Noise burst
    const buf = c.createBuffer(1, c.sampleRate * 0.05, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * 0.3;
    const noise = c.createBufferSource();
    const ng = c.createGain();
    noise.buffer = buf;
    noise.connect(ng);
    ng.connect(c.destination);
    ng.gain.setValueAtTime(0.25, t);
    ng.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
    noise.start(t);
    noise.stop(t + 0.06);
  }

  // ---- Damage: low thud ----
  function damage() {
    const c = getCtx();
    const t = c.currentTime;

    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.connect(gain);
    gain.connect(c.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(40, t + 0.2);

    gain.gain.setValueAtTime(0.35, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

    osc.start(t);
    osc.stop(t + 0.25);

    // Sub rumble
    const osc2 = c.createOscillator();
    const g2 = c.createGain();
    osc2.connect(g2);
    g2.connect(c.destination);
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(60, t);
    osc2.frequency.exponentialRampToValueAtTime(20, t + 0.3);
    g2.gain.setValueAtTime(0.2, t);
    g2.gain.exponentialRampToValueAtTime(0.001, t + 0.3);
    osc2.start(t);
    osc2.stop(t + 0.3);
  }

  // ---- Heal: bright ascending tone ----
  function heal() {
    const c = getCtx();
    const t = c.currentTime;
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6

    notes.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);

      osc.type = 'sine';
      const start = t + i * 0.08;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.2, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.15);

      osc.start(start);
      osc.stop(start + 0.15);
    });
  }

  // ---- Capture: sparkle ----
  function capture() {
    const c = getCtx();
    const t = c.currentTime;
    const freqs = [1200, 1600, 2000, 2400, 1800, 2200, 2600];

    freqs.forEach((freq, i) => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);

      osc.type = 'sine';
      const start = t + i * 0.06;
      osc.frequency.setValueAtTime(freq, start);

      gain.gain.setValueAtTime(0, start);
      gain.gain.linearRampToValueAtTime(0.15, start + 0.015);
      gain.gain.exponentialRampToValueAtTime(0.001, start + 0.12);

      osc.start(start);
      osc.stop(start + 0.12);
    });

    // Shimmer noise
    const buf = c.createBuffer(1, c.sampleRate * 0.3, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (c.sampleRate * 0.1)) * 0.08;
    }
    const noise = c.createBufferSource();
    const filter = c.createBiquadFilter();
    const ng = c.createGain();
    noise.buffer = buf;
    filter.type = 'highpass';
    filter.frequency.value = 3000;
    noise.connect(filter);
    filter.connect(ng);
    ng.connect(c.destination);
    ng.gain.setValueAtTime(0.15, t);
    noise.start(t);
    noise.stop(t + 0.3);
  }

  // ---- Level Up: fanfare ----
  function levelUp() {
    const c = getCtx();
    const t = c.currentTime;
    // C E G C(high) - G(high) - C(higher)
    const melody = [
      { freq: 523, start: 0,    dur: 0.12 },
      { freq: 659, start: 0.12, dur: 0.12 },
      { freq: 784, start: 0.24, dur: 0.12 },
      { freq: 1047, start: 0.36, dur: 0.25 },
      { freq: 784, start: 0.5,  dur: 0.1  },
      { freq: 1047, start: 0.6,  dur: 0.35 },
    ];

    melody.forEach(n => {
      const osc = c.createOscillator();
      const gain = c.createGain();
      osc.connect(gain);
      gain.connect(c.destination);

      osc.type = 'square';
      osc.frequency.setValueAtTime(n.freq, t + n.start);

      gain.gain.setValueAtTime(0, t + n.start);
      gain.gain.linearRampToValueAtTime(0.15, t + n.start + 0.02);
      gain.gain.setValueAtTime(0.15, t + n.start + n.dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, t + n.start + n.dur);

      osc.start(t + n.start);
      osc.stop(t + n.start + n.dur);

      // Harmony (octave below, quieter)
      const osc2 = c.createOscillator();
      const g2 = c.createGain();
      osc2.connect(g2);
      g2.connect(c.destination);
      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(n.freq / 2, t + n.start);
      g2.gain.setValueAtTime(0, t + n.start);
      g2.gain.linearRampToValueAtTime(0.08, t + n.start + 0.02);
      g2.gain.exponentialRampToValueAtTime(0.001, t + n.start + n.dur);
      osc2.start(t + n.start);
      osc2.stop(t + n.start + n.dur);
    });
  }

  return { unlock, attack, damage, heal, capture, levelUp };
})();
