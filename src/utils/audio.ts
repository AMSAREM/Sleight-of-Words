// Web Audio API synthesizer for playful, responsive sound effects
class SoundController {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // Read mute preference from localStorage
    try {
      const saved = localStorage.getItem('sow_sound_muted');
      this.isMuted = saved === 'true';
    } catch {
      this.isMuted = false;
    }
  }

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    try {
      localStorage.setItem('sow_sound_muted', String(this.isMuted));
    } catch {
      // ignore
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public playTap() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(480, now);
    osc.frequency.exponentialRampToValueAtTime(720, now + 0.05);

    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.09);
  }

  public playDelete() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(320, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.06);

    gain.gain.setValueAtTime(0.12, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.08);
  }

  public playHint() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [587.33, 880, 1174.66]; // D5, A5, D6 shimmer
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.06;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.12, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.22);
    });
  }

  public playError() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const now = this.ctx.currentTime;

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.setValueAtTime(120, now + 0.08);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playStarPop(index: number = 0) {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    const f = freqs[index % freqs.length];

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(f, now);
    osc.frequency.exponentialRampToValueAtTime(f * 1.5, now + 0.12);

    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.26);
  }

  public playFanfare() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    // Triumphant brass-like chords & arpeggios
    const notes = [
      { f: 523.25, d: 0.12, t: 0 },
      { f: 659.25, d: 0.12, t: 0.1 },
      { f: 783.99, d: 0.12, t: 0.2 },
      { f: 1046.50, d: 0.35, t: 0.32 },
      { f: 880.00, d: 0.15, t: 0.65 },
      { f: 1046.50, d: 0.6, t: 0.82 }
    ];

    notes.forEach((n) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const startTime = now + n.t;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.f, startTime);

      gain.gain.setValueAtTime(0.22, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + n.d);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(startTime);
      osc.stop(startTime + n.d + 0.05);
    });
  }

  public playSuccess() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.07;

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.28);
    });
  }

  public playLevelClear() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const notes = [440, 554.37, 659.25, 880, 1108.73]; // A major fanfare
    notes.forEach((freq, idx) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      const t = now + idx * 0.08;

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);

      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

      osc.connect(gain);
      gain.connect(this.ctx!.destination);

      osc.start(t);
      osc.stop(t + 0.45);
    });
  }

  public playChestOpen() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const chords = [
      [523.25, 659.25, 783.99],
      [587.33, 739.99, 880],
      [659.25, 830.61, 987.77],
      [1046.50, 1318.51, 1567.98]
    ];
    chords.forEach((chord, i) => {
      chord.forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        const t = now + i * 0.12;

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.6);

        osc.connect(gain);
        gain.connect(this.ctx!.destination);

        osc.start(t);
        osc.stop(t + 0.65);
      });
    });
  }

  // --- THEME SONG: The Conjurer's Waltz ---
  private themeGainNode: GainNode | null = null;
  private isThemePlaying: boolean = false;
  private themeTimer: number | null = null;
  private themeCurrentStep: number = 0;
  private themeNextNoteTime: number = 0;
  private themeListeners: Array<(isPlaying: boolean) => void> = [];
  private themeBeatListeners: Array<(beat: number) => void> = [];

  public onThemeStateChange(cb: (isPlaying: boolean) => void): () => void {
    this.themeListeners.push(cb);
    return () => {
      this.themeListeners = this.themeListeners.filter((l) => l !== cb);
    };
  }

  public onThemeBeat(cb: (beat: number) => void): () => void {
    this.themeBeatListeners.push(cb);
    return () => {
      this.themeBeatListeners = this.themeBeatListeners.filter((l) => l !== cb);
    };
  }

  private notifyThemeState() {
    this.themeListeners.forEach((cb) => cb(this.isThemePlaying));
  }

  public isThemeSongPlaying(): boolean {
    return this.isThemePlaying;
  }

  public startThemeSong() {
    if (this.isThemePlaying) return;
    this.initCtx();
    if (!this.ctx) return;

    this.isThemePlaying = true;
    this.notifyThemeState();

    // Create or reuse master theme gain
    if (!this.themeGainNode) {
      this.themeGainNode = this.ctx.createGain();
      this.themeGainNode.connect(this.ctx.destination);
    }

    const now = this.ctx.currentTime;
    this.themeGainNode.gain.cancelScheduledValues(now);
    this.themeGainNode.gain.setValueAtTime(0.001, now);
    this.themeGainNode.gain.exponentialRampToValueAtTime(0.28, now + 0.8);

    this.themeCurrentStep = 0;
    this.themeNextNoteTime = this.ctx.currentTime + 0.1;

    // Run lookahead scheduler
    const scheduleAheadTime = 0.2;
    const lookaheadInterval = 25; // ms

    this.themeTimer = window.setInterval(() => {
      if (!this.ctx || !this.isThemePlaying) return;
      while (this.themeNextNoteTime < this.ctx.currentTime + scheduleAheadTime) {
        this.scheduleThemeBeat(this.themeCurrentStep, this.themeNextNoteTime);
        this.advanceThemeBeat();
      }
    }, lookaheadInterval);
  }

  public stopThemeSong(fadeSeconds: number = 0.5) {
    if (!this.isThemePlaying) return;
    this.isThemePlaying = false;
    this.notifyThemeState();

    if (this.themeTimer !== null) {
      clearInterval(this.themeTimer);
      this.themeTimer = null;
    }

    if (this.themeGainNode && this.ctx) {
      const now = this.ctx.currentTime;
      this.themeGainNode.gain.cancelScheduledValues(now);
      this.themeGainNode.gain.setValueAtTime(this.themeGainNode.gain.value, now);
      this.themeGainNode.gain.exponentialRampToValueAtTime(0.001, now + fadeSeconds);
    }
  }

  public toggleThemeSong(): boolean {
    if (this.isThemePlaying) {
      this.stopThemeSong(0.3);
      return false;
    } else {
      this.startThemeSong();
      return true;
    }
  }

  // 16-measure waltz (3 beats per measure = 48 beats total cycle)
  // Tempo: 130 BPM => 0.4615 seconds per beat
  private readonly BEAT_DURATION = 0.4615;

  private advanceThemeBeat() {
    this.themeNextNoteTime += this.BEAT_DURATION;
    this.themeCurrentStep = (this.themeCurrentStep + 1) % 48;
  }

  private scheduleThemeBeat(step: number, time: number) {
    if (!this.ctx || !this.themeGainNode) return;

    // Trigger visualizer beat listener
    if (this.themeBeatListeners.length > 0) {
      setTimeout(() => {
        this.themeBeatListeners.forEach((cb) => cb(step));
      }, Math.max(0, (time - this.ctx!.currentTime) * 1000));
    }

    const measure = Math.floor(step / 3);
    const beatInMeasure = step % 3; // 0, 1, or 2

    // Chords definition for each of the 16 measures:
    // [Bass frequency, Chord Note 1, Chord Note 2]
    const chords: Array<{ bass: number; mid1: number; mid2: number }> = [
      { bass: 146.83, mid1: 349.23, mid2: 440.0 }, // Dm (D3, F4, A4)
      { bass: 146.83, mid1: 349.23, mid2: 440.0 }, // Dm
      { bass: 98.0, mid1: 466.16, mid2: 587.33 }, // Gm (G2, Bb4, D5)
      { bass: 98.0, mid1: 466.16, mid2: 587.33 }, // Gm
      { bass: 110.0, mid1: 370.0, mid2: 440.0 }, // A7 (A2, F#4/G4, A4)
      { bass: 110.0, mid1: 392.0, mid2: 440.0 }, // A7
      { bass: 146.83, mid1: 349.23, mid2: 440.0 }, // Dm
      { bass: 146.83, mid1: 349.23, mid2: 440.0 }, // Dm
      { bass: 87.31, mid1: 349.23, mid2: 523.25 }, // F (F2, F4, C5)
      { bass: 87.31, mid1: 349.23, mid2: 523.25 }, // F
      { bass: 116.54, mid1: 466.16, mid2: 587.33 }, // Bb (Bb2, Bb4, D5)
      { bass: 116.54, mid1: 466.16, mid2: 587.33 }, // Bb
      { bass: 82.41, mid1: 392.0, mid2: 466.16 }, // Em7b5 (E2, G4, Bb4)
      { bass: 110.0, mid1: 392.0, mid2: 554.37 }, // A7 (A2, G4, C#5)
      { bass: 146.83, mid1: 349.23, mid2: 440.0 }, // Dm
      { bass: 73.42, mid1: 440.0, mid2: 587.33 } // Dm deep coda
    ];

    const currentChord = chords[measure % chords.length];

    // --- ACCOMPANIMENT ---
    // Beat 0 = Deep Parlor Bass Note
    if (beatInMeasure === 0) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(currentChord.bass, time);

      gain.gain.setValueAtTime(0.35, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + this.BEAT_DURATION * 1.8);

      osc.connect(gain);
      gain.connect(this.themeGainNode);
      osc.start(time);
      osc.stop(time + this.BEAT_DURATION * 1.9);
    } else {
      // Beats 1 & 2 = "Pah - Pah" gentle mid chords
      [currentChord.mid1, currentChord.mid2].forEach((freq) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);

        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + this.BEAT_DURATION * 0.7);

        osc.connect(gain);
        gain.connect(this.themeGainNode!);
        osc.start(time);
        osc.stop(time + this.BEAT_DURATION * 0.75);
      });
    }

    // --- LEAD MELODY (The Parlor Music Box Celesta) ---
    // 48 steps melody table
    const melody: Array<{ f: number; len: number } | null> = [
      // Measure 1 (Dm)
      { f: 440.0, len: 1 }, // A4
      { f: 587.33, len: 1 }, // D5
      { f: 698.46, len: 1 }, // F5
      // Measure 2 (Dm)
      { f: 659.25, len: 2.8 }, // E5 (sustained)
      null,
      null,
      // Measure 3 (Gm)
      { f: 783.99, len: 1 }, // G5
      { f: 698.46, len: 1 }, // F5
      { f: 587.33, len: 1 }, // D5
      // Measure 4 (Gm)
      { f: 554.37, len: 2.8 }, // C#5 (suspense)
      null,
      null,
      // Measure 5 (A7)
      { f: 659.25, len: 1 }, // E5
      { f: 698.46, len: 1 }, // F5
      { f: 783.99, len: 1 }, // G5
      // Measure 6 (A7)
      { f: 880.0, len: 2.8 }, // A5
      null,
      null,
      // Measure 7 (Dm)
      { f: 698.46, len: 1 }, // F5
      { f: 659.25, len: 1 }, // E5
      { f: 587.33, len: 1 }, // D5
      // Measure 8 (Dm)
      { f: 587.33, len: 2.5 }, // D5
      null,
      { f: 880.0, len: 0.8 }, // A5 chime
      // Measure 9 (F)
      { f: 523.25, len: 1 }, // C5
      { f: 698.46, len: 1 }, // F5
      { f: 880.0, len: 1 }, // A5
      // Measure 10 (F)
      { f: 783.99, len: 1.8 }, // G5
      null,
      { f: 698.46, len: 1 }, // F5
      // Measure 11 (Bb)
      { f: 1174.66, len: 1 }, // D6
      { f: 1046.5, len: 1 }, // C6
      { f: 932.33, len: 1 }, // Bb5
      // Measure 12 (Bb)
      { f: 880.0, len: 1.8 }, // A5
      null,
      { f: 783.99, len: 1 }, // G5
      // Measure 13 (Em7b5)
      { f: 932.33, len: 1 }, // Bb5
      { f: 880.0, len: 1 }, // A5
      { f: 783.99, len: 1 }, // G5
      // Measure 14 (A7)
      { f: 698.46, len: 1 }, // F5
      { f: 659.25, len: 1 }, // E5
      { f: 554.37, len: 1 }, // C#5
      // Measure 15 (Dm)
      { f: 587.33, len: 2.5 }, // D5
      null,
      null,
      // Measure 16 (Dm Coda)
      { f: 1174.66, len: 2.8 }, // High D6 shimmer
      null,
      null
    ];

    const note = melody[step];
    if (note) {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      // Sine + slight sparkle
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, time);

      const noteDuration = note.len * this.BEAT_DURATION;
      gain.gain.setValueAtTime(0.24, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + noteDuration);

      osc.connect(gain);
      gain.connect(this.themeGainNode);
      osc.start(time);
      osc.stop(time + noteDuration + 0.05);

      // Magical high harmonic overtone on strong beats
      if (step % 6 === 0 || step === 45) {
        const shimmerOsc = this.ctx.createOscillator();
        const shimmerGain = this.ctx.createGain();
        shimmerOsc.type = 'sine';
        shimmerOsc.frequency.setValueAtTime(note.f * 2, time);

        shimmerGain.gain.setValueAtTime(0.08, time);
        shimmerGain.gain.exponentialRampToValueAtTime(0.001, time + 0.4);

        shimmerOsc.connect(shimmerGain);
        shimmerGain.connect(this.themeGainNode);
        shimmerOsc.start(time);
        shimmerOsc.stop(time + 0.45);
      }
    }
  }
}

export const sound = new SoundController();
