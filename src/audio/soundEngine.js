// src/audio/soundEngine.js - Web Audio API Procedural Sound Engine
// 100% Native, Zero-latency, High-fidelity Fantasy Synthesizer

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.sfxGain = null;
    this.bgmGain = null;
    this.isMuted = false;
    this.bgmPlaying = false;
    this.bgmInterval = null;
    this.volume = 0.7;
    this.bgmVolume = 0.3;
  }

  init() {
    if (!this.ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioContext();

      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.sfxGain = this.ctx.createGain();
      this.sfxGain.gain.setValueAtTime(1.0, this.ctx.currentTime);
      this.sfxGain.connect(this.masterGain);

      this.bgmGain = this.ctx.createGain();
      this.bgmGain.gain.setValueAtTime(this.bgmVolume, this.ctx.currentTime);
      this.bgmGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
  }

  toggleMute() {
    this.isMuted = !this.isMuted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : this.volume, this.ctx.currentTime);
    }
    return this.isMuted;
  }

  // Play Card Sound (Elemental Resonance)
  playCard(color = 'ruby') {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const pitches = {
      ruby: 220,      // Deep warm fire (A3)
      sapphire: 392,  // Crisp ice (G4)
      emerald: 330,   // Earth wood (E4)
      amber: 440,     // Lightning high (A4)
      celestial: 523.25 // Mystic high (C5)
    };

    const freq = pitches[color] || 330;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq * 1.5, t);
    osc.frequency.exponentialRampToValueAtTime(freq, t + 0.12);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.15);

    // Add crisp card slap noise
    this.playNoiseSnap(t, 0.08, 0.2);
  }

  // Card Draw Swoosh
  playDraw() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const filter = this.ctx.createBiquadFilter();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, t);
    osc.frequency.exponentialRampToValueAtTime(450, t + 0.12);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, t);
    filter.frequency.linearRampToValueAtTime(3000, t + 0.1);

    gain.gain.setValueAtTime(0.15, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.14);
  }

  // Skip Spell (Ice Crystal Freeze)
  playSkip() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const notes = [659.25, 880, 1046.5, 1318.5]; // E5, A5, C6, E6 chime

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteTime = t + (idx * 0.04);

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, noteTime);

      gain.gain.setValueAtTime(0.2, noteTime);
      gain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.4);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteTime);
      osc.stop(noteTime + 0.45);
    });
  }

  // Reverse Spell (Chrono Rift / Time Warp)
  playReverse() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.exponentialRampToValueAtTime(800, t + 0.15);
    osc.frequency.exponentialRampToValueAtTime(220, t + 0.35);

    gain.gain.setValueAtTime(0.25, t);
    gain.gain.linearRampToValueAtTime(0.3, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.4);
  }

  // Draw 2 (+2 Lightning Burst)
  playLightning() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    // Zap 1
    this.playZap(t, 550, 0.15);
    // Zap 2
    this.playZap(t + 0.08, 880, 0.18);
  }

  playZap(t, baseFreq, dur) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(100, t + dur);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + dur);
  }

  // Wild Draw 4 (+4 Supernova Cataclysm)
  playSupernova() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    // Cosmic arpeggio
    const arpeggio = [261.63, 329.63, 392.00, 523.25, 659.25, 783.99, 1046.50];
    arpeggio.forEach((f, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteT = t + (i * 0.05);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, noteT);

      gain.gain.setValueAtTime(0.2, noteT);
      gain.gain.exponentialRampToValueAtTime(0.001, noteT + 0.35);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteT);
      osc.stop(noteT + 0.4);
    });

    // Deep sub bass boom
    const subOsc = this.ctx.createOscillator();
    const subGain = this.ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(120, t + 0.2);
    subOsc.frequency.exponentialRampToValueAtTime(30, t + 0.8);

    subGain.gain.setValueAtTime(0.4, t + 0.2);
    subGain.gain.exponentialRampToValueAtTime(0.001, t + 0.85);

    subOsc.connect(subGain);
    subGain.connect(this.sfxGain);

    subOsc.start(t + 0.2);
    subOsc.stop(t + 0.85);
  }

  // Golden "UNO!" Fanfare
  playUnoShout() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const chords = [
      { freq: 440, time: 0 },    // A4
      { freq: 554.37, time: 0 }, // C#5
      { freq: 659.25, time: 0 }, // E5
      { freq: 880, time: 0.12 },  // A5
      { freq: 1108.73, time: 0.12 } // C#6
    ];

    chords.forEach(({ freq, time }) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const noteT = t + time;

      osc.type = 'square';
      osc.frequency.setValueAtTime(freq, noteT);

      gain.gain.setValueAtTime(0.18, noteT);
      gain.gain.exponentialRampToValueAtTime(0.001, noteT + 0.6);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(noteT);
      osc.stop(noteT + 0.65);
    });
  }

  // UNO Penalty Buzzer
  playUnoPenalty() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(200, t);
    osc.frequency.setValueAtTime(150, t + 0.15);

    gain.gain.setValueAtTime(0.3, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.45);
  }

  // Turn Countdown Heartbeat
  playTurnTick(urgency = 0) {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    const baseFreq = urgency > 0 ? 440 + (urgency * 40) : 320;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, t);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, t + 0.06);

    gain.gain.setValueAtTime(0.2 + (urgency * 0.05), t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.07);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.08);
  }

  // Victory Triumphant Fanfare
  playVictory() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    // C Major Triad Fanfare
    const notes = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 523.25, t: 0.15, d: 0.15 },
      { f: 523.25, t: 0.3, d: 0.15 },
      { f: 659.25, t: 0.45, d: 0.35 },
      { f: 523.25, t: 0.8, d: 0.2 },
      { f: 659.25, t: 1.0, d: 0.2 },
      { f: 783.99, t: 1.2, d: 0.7 }
    ];

    notes.forEach(n => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const st = t + n.t;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, st);

      gain.gain.setValueAtTime(0.25, st);
      gain.gain.exponentialRampToValueAtTime(0.001, st + n.d);

      osc.connect(gain);
      gain.connect(this.sfxGain);

      osc.start(st);
      osc.stop(st + n.d + 0.05);
    });
  }

  // Emote Pop
  playEmote() {
    this.init();
    if (this.isMuted || !this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(400, t);
    osc.frequency.exponentialRampToValueAtTime(900, t + 0.08);

    gain.gain.setValueAtTime(0.18, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.09);

    osc.connect(gain);
    gain.connect(this.sfxGain);

    osc.start(t);
    osc.stop(t + 0.1);
  }

  // Noise helper for physical card snap
  playNoiseSnap(t, dur = 0.05, vol = 0.15) {
    const bufferSize = this.ctx.sampleRate * dur;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(2000, t);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.sfxGain);

    noise.start(t);
  }

  // Generative Ambient Fantasy Background Music
  startBgm() {
    if (this.bgmPlaying) return;
    this.init();
    this.bgmPlaying = true;

    const chords = [
      [261.63, 329.63, 392.00, 493.88], // Cmaj7
      [220.00, 261.63, 329.63, 392.00], // Am7
      [174.61, 220.00, 261.63, 329.63], // Fmaj7
      [196.00, 246.94, 293.66, 392.00]  // G6
    ];

    let chordIdx = 0;

    const playChordPad = () => {
      if (!this.bgmPlaying || !this.ctx || this.isMuted) return;

      const t = this.ctx.currentTime;
      const currentChord = chords[chordIdx % chords.length];
      chordIdx++;

      currentChord.forEach(freq => {
        const osc = this.ctx.createOscillator();
        const filter = this.ctx.createBiquadFilter();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, t);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(600, t);
        filter.frequency.linearRampToValueAtTime(1200, t + 2);
        filter.frequency.linearRampToValueAtTime(500, t + 4);

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.04, t + 1.5);
        gain.gain.linearRampToValueAtTime(0.001, t + 3.8);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmGain);

        osc.start(t);
        osc.stop(t + 4);
      });
    };

    playChordPad();
    this.bgmInterval = setInterval(playChordPad, 3900);
  }

  stopBgm() {
    this.bgmPlaying = false;
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  toggleBgm() {
    if (this.bgmPlaying) {
      this.stopBgm();
      return false;
    } else {
      this.startBgm();
      return true;
    }
  }
}

export const sound = new SoundEngine();
