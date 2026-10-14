import { AmbientSoundId, AMBIENT_SOUNDS } from '../types/theme';

/**
 * AmbientAudioEngine
 * 
 * High-performance Web Audio engine combining:
 * 1. Free looping audio streams from verified CDN / open-source sources
 * 2. Web Audio API GainNode, AnalyserNode, and BiquadFilter routing for smooth fading & visualizer
 * 3. Pure procedural Web Audio synthesis fallback (100% offline-ready & seamless)
 */
class AmbientAudioEngine {
  private audioCtx: AudioContext | null = null;
  private currentSoundId: AmbientSoundId | null = null;
  private audioElement: HTMLAudioElement | null = null;
  private mediaSourceNode: MediaElementAudioSourceNode | null = null;
  private masterGain: GainNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private spaceFilterNode: BiquadFilterNode | null = null;
  private spaceOsc1: OscillatorNode | null = null;
  private spaceOsc2: OscillatorNode | null = null;

  // Procedural Synth State
  private isSynthesizing = false;
  private synthNodes: { stop?: () => void; intervalId?: number } = {};

  private isPlaying = false;
  private targetVolume = 0.5;

  private ensureAudioContext(): AudioContext {
    if (!this.audioCtx) {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.audioCtx = new AudioCtxClass();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume().catch(() => {});
    }
    return this.audioCtx;
  }

  private setupGraph() {
    const ctx = this.ensureAudioContext();
    if (!this.masterGain) {
      this.masterGain = ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.targetVolume, ctx.currentTime);

      this.analyserNode = ctx.createAnalyser();
      this.analyserNode.fftSize = 64;
      this.analyserNode.smoothingTimeConstant = 0.8;

      this.masterGain.connect(this.analyserNode);
      this.analyserNode.connect(ctx.destination);
    }
  }

  public async play(soundId: AmbientSoundId, volume = 0.5): Promise<void> {
    this.targetVolume = volume;
    const ctx = this.ensureAudioContext();
    this.setupGraph();

    // If changing track or starting fresh
    if (this.currentSoundId !== soundId || !this.isPlaying) {
      this.stopCurrent();
      this.currentSoundId = soundId;
      await this.startStream(soundId);
    }

    if (this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.targetVolume, ctx.currentTime + 0.35);
    }

    this.isPlaying = true;
  }

  private async startStream(soundId: AmbientSoundId): Promise<void> {
    const config = AMBIENT_SOUNDS[soundId];
    if (!config) return;

    try {
      const audio = new Audio();
      audio.crossOrigin = 'anonymous';
      audio.loop = true;
      audio.preload = 'auto';
      audio.src = config.streamUrl;
      this.audioElement = audio;

      // Handle stream errors gracefully by trying fallback URL or procedural synthesis
      audio.onerror = () => {
        console.warn(`[AmbientAudio] Stream error on primary URL for ${soundId}. Trying fallback...`);
        if (config.fallbackUrl && audio.src !== config.fallbackUrl) {
          audio.src = config.fallbackUrl;
          audio.play().catch(() => this.startProceduralSynth(soundId));
        } else {
          this.startProceduralSynth(soundId);
        }
      };

      // Connect to Web Audio graph if possible (allows audio analysis and filters)
      const ctx = this.ensureAudioContext();
      try {
        if (!this.mediaSourceNode && this.masterGain) {
          this.mediaSourceNode = ctx.createMediaElementSource(audio);

          // Deep space theme enhancement: subtle resonant lowpass filter
          if (soundId === 'deep-space') {
            this.spaceFilterNode = ctx.createBiquadFilter();
            this.spaceFilterNode.type = 'lowpass';
            this.spaceFilterNode.frequency.setValueAtTime(650, ctx.currentTime);
            this.spaceFilterNode.Q.setValueAtTime(3.5, ctx.currentTime);

            this.mediaSourceNode.connect(this.spaceFilterNode);
            this.spaceFilterNode.connect(this.masterGain);
            this.startCosmicHum();
          } else {
            this.mediaSourceNode.connect(this.masterGain);
          }
        }
      } catch (err) {
        // If createMediaElementSource throws (e.g. CORS edge case in some browsers),
        // fallback to standard element volume control so user always hears sound!
        console.info('[AmbientAudio] MediaElementSource routing note:', err);
        audio.volume = this.targetVolume;
      }

      await audio.play();
      this.isSynthesizing = false;
    } catch (e) {
      console.warn(`[AmbientAudio] Stream playback failed for ${soundId}. Activating procedural synth:`, e);
      this.startProceduralSynth(soundId);
    }
  }

  /**
   * Pure procedural Web Audio synthesis fallback.
   * Generates high-fidelity fireplace, rain, deep-space, or birdsong using Web Audio nodes.
   */
  private startProceduralSynth(soundId: AmbientSoundId): void {
    const ctx = this.ensureAudioContext();
    this.setupGraph();
    this.isSynthesizing = true;
    this.stopSynthNodes();

    if (!this.masterGain) return;

    if (soundId === 'fireplace') {
      // 1. Warm Fireplace: Filtered brown noise + randomized crackle impulses
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        data[i] = (lastOut + 0.02 * white) / 1.02;
        lastOut = data[i];
        data[i] *= 3.5;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.masterGain);
      noise.start();

      // Random ember crackle pops
      const intervalId = window.setInterval(() => {
        if (!this.isPlaying || !this.isSynthesizing) return;
        try {
          const osc = ctx.createOscillator();
          const popGain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(1200 + Math.random() * 2200, ctx.currentTime);
          popGain.gain.setValueAtTime(0.08 * Math.random(), ctx.currentTime);
          popGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.04);
          osc.connect(popGain);
          popGain.connect(this.masterGain!);
          osc.start();
          osc.stop(ctx.currentTime + 0.045);
        } catch {
          // ignore cleanup errors
        }
      }, 180);

      this.synthNodes = {
        stop: () => {
          try { noise.stop(); } catch {}
          clearInterval(intervalId);
        },
        intervalId,
      };

    } else if (soundId === 'rain') {
      // 2. Rain on Window: Bandpass pink noise with subtle droplet bursts
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      let b0 = 0, b1 = 0, b2 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        data[i] = (b0 + b1 + b2) * 0.2;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1100, ctx.currentTime);
      filter.Q.setValueAtTime(1.2, ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.masterGain);
      noise.start();

      // Soft rain patter pings
      const intervalId = window.setInterval(() => {
        if (!this.isPlaying || !this.isSynthesizing) return;
        try {
          const ping = ctx.createOscillator();
          const pingGain = ctx.createGain();
          ping.type = 'sine';
          ping.frequency.setValueAtTime(1800 + Math.random() * 800, ctx.currentTime);
          pingGain.gain.setValueAtTime(0.03 * Math.random(), ctx.currentTime);
          pingGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.03);
          ping.connect(pingGain);
          pingGain.connect(this.masterGain!);
          ping.start();
          ping.stop(ctx.currentTime + 0.035);
        } catch {}
      }, 95);

      this.synthNodes = {
        stop: () => {
          try { noise.stop(); } catch {}
          clearInterval(intervalId);
        },
        intervalId,
      };

    } else if (soundId === 'deep-space') {
      // 3. Deep Space: Low resonant white noise sweep + dual 55Hz & 110Hz cosmic drone
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.15;
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;
      noise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(260, ctx.currentTime);
      filter.Q.setValueAtTime(4.0, ctx.currentTime);

      noise.connect(filter);
      filter.connect(this.masterGain);
      noise.start();

      this.startCosmicHum();

      this.synthNodes = {
        stop: () => {
          try { noise.stop(); } catch {}
          this.stopCosmicHum();
        },
      };

    } else if (soundId === 'birds') {
      // 4. Forest Birds: Soft wind bed + periodic procedural birdsong sweeps
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * 0.06;
      }

      const wind = ctx.createBufferSource();
      wind.buffer = buffer;
      wind.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(320, ctx.currentTime);

      wind.connect(filter);
      filter.connect(this.masterGain);
      wind.start();

      // Bird chirp generator
      const intervalId = window.setInterval(() => {
        if (!this.isPlaying || !this.isSynthesizing) return;
        try {
          const chirp = ctx.createOscillator();
          const chirpGain = ctx.createGain();
          const startFreq = 2400 + Math.random() * 600;
          const peakFreq = startFreq + 900;

          chirp.type = 'sine';
          chirp.frequency.setValueAtTime(startFreq, ctx.currentTime);
          chirp.frequency.exponentialRampToValueAtTime(peakFreq, ctx.currentTime + 0.06);
          chirp.frequency.exponentialRampToValueAtTime(startFreq - 200, ctx.currentTime + 0.14);

          chirpGain.gain.setValueAtTime(0.07, ctx.currentTime);
          chirpGain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.15);

          chirp.connect(chirpGain);
          chirpGain.connect(this.masterGain!);
          chirp.start();
          chirp.stop(ctx.currentTime + 0.16);
        } catch {}
      }, 2400);

      this.synthNodes = {
        stop: () => {
          try { wind.stop(); } catch {}
          clearInterval(intervalId);
        },
        intervalId,
      };
    }
  }

  private startCosmicHum() {
    if (this.spaceOsc1 || !this.audioCtx || !this.masterGain) return;
    try {
      const osc1 = this.audioCtx.createOscillator();
      const osc2 = this.audioCtx.createOscillator();
      const humGain = this.audioCtx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(55, this.audioCtx.currentTime); // A1 note sub-drone
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(110.2, this.audioCtx.currentTime); // A2 slight beat frequency

      humGain.gain.setValueAtTime(0.12, this.audioCtx.currentTime);

      osc1.connect(humGain);
      osc2.connect(humGain);
      humGain.connect(this.masterGain);

      osc1.start();
      osc2.start();

      this.spaceOsc1 = osc1;
      this.spaceOsc2 = osc2;
    } catch {}
  }

  private stopCosmicHum() {
    if (this.spaceOsc1) {
      try { this.spaceOsc1.stop(); } catch {}
      this.spaceOsc1.disconnect();
      this.spaceOsc1 = null;
    }
    if (this.spaceOsc2) {
      try { this.spaceOsc2.stop(); } catch {}
      this.spaceOsc2.disconnect();
      this.spaceOsc2 = null;
    }
  }

  private stopSynthNodes() {
    if (this.synthNodes.stop) {
      try { this.synthNodes.stop(); } catch {}
    }
    if (this.synthNodes.intervalId) {
      clearInterval(this.synthNodes.intervalId);
    }
    this.synthNodes = {};
    this.stopCosmicHum();
  }

  public pause(): void {
    if (!this.isPlaying) return;
    const ctx = this.audioCtx;

    if (ctx && this.masterGain) {
      this.masterGain.gain.cancelScheduledValues(ctx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, ctx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.3);
      setTimeout(() => {
        if (!this.isPlaying) {
          this.audioElement?.pause();
          this.stopSynthNodes();
        }
      }, 320);
    } else {
      this.audioElement?.pause();
      this.stopSynthNodes();
    }

    this.isPlaying = false;
  }

  private stopCurrent(): void {
    if (this.audioElement) {
      this.audioElement.pause();
      this.audioElement.src = '';
      this.audioElement = null;
    }
    this.stopSynthNodes();
    if (this.mediaSourceNode) {
      try { this.mediaSourceNode.disconnect(); } catch {}
      this.mediaSourceNode = null;
    }
    if (this.spaceFilterNode) {
      try { this.spaceFilterNode.disconnect(); } catch {}
      this.spaceFilterNode = null;
    }
    this.stopCosmicHum();
  }

  public setVolume(vol: number): void {
    this.targetVolume = Math.max(0, Math.min(1, vol));
    if (this.audioElement) {
      this.audioElement.volume = this.targetVolume;
    }
    if (this.masterGain && this.audioCtx) {
      this.masterGain.gain.cancelScheduledValues(this.audioCtx.currentTime);
      this.masterGain.gain.setValueAtTime(this.masterGain.gain.value, this.audioCtx.currentTime);
      this.masterGain.gain.linearRampToValueAtTime(this.targetVolume, this.audioCtx.currentTime + 0.1);
    }
  }

  public getFrequencyLevels(): number[] {
    if (!this.isPlaying || !this.analyserNode) {
      return [0, 0, 0, 0, 0];
    }
    const bufferLength = this.analyserNode.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyserNode.getByteFrequencyData(dataArray);

    // Sample 5 representative frequency bands (bass, low-mid, mid, high-mid, highs)
    const bands = [
      Math.floor(bufferLength * 0.05),
      Math.floor(bufferLength * 0.15),
      Math.floor(bufferLength * 0.35),
      Math.floor(bufferLength * 0.60),
      Math.floor(bufferLength * 0.85),
    ];

    return bands.map((idx) => {
      const val = dataArray[idx] || 0;
      return Math.min(100, Math.round((val / 255) * 100));
    });
  }

  public isSoundPlaying(): boolean {
    return this.isPlaying;
  }

  public getCurrentSoundId(): AmbientSoundId | null {
    return this.currentSoundId;
  }
}

// Global Singleton Export
export const ambientAudioEngine = new AmbientAudioEngine();
