// Web Audio API sound synthesizer - zero external asset dependencies

class SoundManager {
  private ctx: AudioContext | null = null;
  private ambientSource: AudioNode | null = null;
  private isSoundEnabled = true;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  public setSoundEnabled(enabled: boolean) {
    this.isSoundEnabled = enabled;
  }

  // Pleasant notification bell/chime
  public playChime() {
    if (!this.isSoundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
      osc.frequency.exponentialRampToValueAtTime(1174.66, ctx.currentTime + 0.35); // D6

      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.8);
    } catch {
      // AudioContext policy fallback
    }
  }

  // Completion fanfare
  public playSuccess() {
    if (!this.isSoundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);

        gain.gain.setValueAtTime(0.2, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.4);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.4);
      });
    } catch {}
  }

  // Gentle tick
  public playTick() {
    if (!this.isSoundEnabled) return;
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);

      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch {}
  }

  // Ambient sound generator for Pomodoro focus
  public startAmbientSound(type: 'whitenoise' | 'rain' | 'binaural' | 'none') {
    this.stopAmbientSound();
    if (type === 'none') return;

    try {
      const ctx = this.getContext();
      if (!ctx) return;

      if (type === 'binaural') {
        // 40Hz Gamma wave binaural tone for cognitive focus
        const oscLeft = ctx.createOscillator();
        const oscRight = ctx.createOscillator();
        const gain = ctx.createGain();

        oscLeft.type = 'sine';
        oscLeft.frequency.value = 200; // Base carrier

        oscRight.type = 'sine';
        oscRight.frequency.value = 240; // 40Hz difference

        gain.gain.value = 0.05;

        oscLeft.connect(gain);
        oscRight.connect(gain);
        gain.connect(ctx.destination);

        oscLeft.start();
        oscRight.start();

        this.ambientSource = gain;
      } else {
        // Noise buffer for white noise or soft rain
        const bufferSize = ctx.sampleRate * 2;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }

        const noise = ctx.createBufferSource();
        noise.buffer = buffer;
        noise.loop = true;

        const filter = ctx.createBiquadFilter();
        if (type === 'rain') {
          filter.type = 'lowpass';
          filter.frequency.value = 800; // Softer muffled rain sound
        } else {
          filter.type = 'bandpass';
          filter.frequency.value = 1000;
        }

        const gain = ctx.createGain();
        gain.gain.value = 0.03;

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);

        noise.start();
        this.ambientSource = gain;
      }
    } catch (e) {
      console.warn('Ambient sound error:', e);
    }
  }

  public stopAmbientSound() {
    try {
      if (this.ambientSource) {
        this.ambientSource.disconnect();
        this.ambientSource = null;
      }
    } catch {}
  }
}

export const soundManager = new SoundManager();
