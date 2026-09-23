class SoundManager {
  private ctx: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private musicInterval: any = null;
  private isMusicPlaying: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user gesture
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  // Play crisp click sound when selecting cards
  public playClick() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);
    } catch {
      // Ignore audio context errors
    }
  }

  // Melodic chime for successful pair match
  public playSuccess() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);

        gain.gain.setValueAtTime(0.15, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.08 + 0.25);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.25);
      });
    } catch {
      // Ignore audio context errors
    }
  }

  // Soft buzzer for wrong pair attempt
  public playError() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(130, ctx.currentTime + 0.2);

      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } catch {
      // Ignore audio context errors
    }
  }

  // Fanfare for level completion
  public playVictory() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const fanfare = [
        { f: 523.25, t: 0.0, d: 0.15 }, // C5
        { f: 659.25, t: 0.15, d: 0.15 }, // E5
        { f: 783.99, t: 0.3, d: 0.18 }, // G5
        { f: 1046.5, t: 0.5, d: 0.4 },  // C6
        { f: 880.0, t: 0.95, d: 0.18 },  // A5
        { f: 1046.5, t: 1.15, d: 0.6 }  // C6 long
      ];

      fanfare.forEach(n => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(n.f, ctx.currentTime + n.t);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + n.t);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + n.t + n.d);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + n.t);
        osc.stop(ctx.currentTime + n.t + n.d);
      });
    } catch {
      // Ignore audio context errors
    }
  }

  // Balloon Pop Sound
  public playBalloonPop() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      // Pop transient: quick frequency downward sweep + noise
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(600 + Math.random() * 200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(60, ctx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.08);

      // Add a snappy noise puff
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.25));
      }
      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.2, ctx.currentTime);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
      noise.connect(noiseGain);
      noiseGain.connect(ctx.destination);
      noise.start();
    } catch {
      // Ignore audio error
    }
  }

  // Upbeat background celebration melody for victory
  public startCelebrationMusic() {
    if (!this.soundEnabled || this.isMusicPlaying) return;
    this.isMusicPlaying = true;

    const playMelodyBar = () => {
      if (!this.isMusicPlaying || !this.soundEnabled) return;
      try {
        const ctx = this.getAudioContext();
        if (!ctx) return;

        // Joyful pentatonic arpeggio sequence: C - E - G - A - C6 - G - E - C
        const melody = [
          { f: 523.25, t: 0.0, d: 0.12 }, // C5
          { f: 659.25, t: 0.15, d: 0.12 }, // E5
          { f: 783.99, t: 0.3, d: 0.12 },  // G5
          { f: 880.0, t: 0.45, d: 0.12 },  // A5
          { f: 1046.5, t: 0.6, d: 0.2 },   // C6
          { f: 880.0, t: 0.85, d: 0.12 },  // A5
          { f: 783.99, t: 1.0, d: 0.12 },  // G5
          { f: 659.25, t: 1.15, d: 0.2 },  // E5
          { f: 587.33, t: 1.4, d: 0.12 },  // D5
          { f: 659.25, t: 1.55, d: 0.12 }, // E5
          { f: 783.99, t: 1.7, d: 0.3 }    // G5
        ];

        melody.forEach(note => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(note.f, ctx.currentTime + note.t);

          gain.gain.setValueAtTime(0.12, ctx.currentTime + note.t);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + note.t + note.d);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + note.t);
          osc.stop(ctx.currentTime + note.t + note.d);
        });

        // Warm playful bass notes: C3 -> F3 -> G3 -> C3
        const bassNotes = [
          { f: 130.81, t: 0.0, d: 0.4 }, // C3
          { f: 174.61, t: 0.6, d: 0.4 }, // F3
          { f: 196.00, t: 1.2, d: 0.4 }, // G3
          { f: 130.81, t: 1.7, d: 0.4 }, // C3
        ];

        bassNotes.forEach(b => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(b.f, ctx.currentTime + b.t);

          gain.gain.setValueAtTime(0.08, ctx.currentTime + b.t);
          gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + b.t + b.d);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(ctx.currentTime + b.t);
          osc.stop(ctx.currentTime + b.t + b.d);
        });
      } catch {
        // Ignore audio errors
      }
    };

    // Play first bar immediately
    playMelodyBar();
    // Loop every 2.2 seconds
    this.musicInterval = setInterval(playMelodyBar, 2200);
  }

  public stopCelebrationMusic() {
    this.isMusicPlaying = false;
    if (this.musicInterval) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  // Speech pronunciation for Gujarati words
  public speakGujarati(text: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      const voices = window.speechSynthesis.getVoices();

      // Find Gujarati or Hindi voice
      const guVoice = voices.find(v => v.lang.startsWith('gu') || v.name.toLowerCase().includes('gujarati'));
      const hiVoice = voices.find(v => v.lang.startsWith('hi') || v.name.toLowerCase().includes('hindi'));

      if (guVoice) {
        utterance.voice = guVoice;
        utterance.lang = 'gu-IN';
      } else if (hiVoice) {
        utterance.voice = hiVoice;
        utterance.lang = 'hi-IN';
      } else {
        utterance.lang = 'gu-IN';
      }

      utterance.rate = 0.85; // Slightly slower for clear child learning
      utterance.pitch = 1.05;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis issues
    }
  }
}

export const sounds = new SoundManager();
