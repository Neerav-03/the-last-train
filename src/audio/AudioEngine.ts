// Procedural Web Audio sound engine for THE LAST TRAIN.
//
// Everything here is synthesized at runtime (oscillators, filters, generated
// noise buffers, gain envelopes) - no audio files, no npm audio libraries.
//
// Every exported function is defensive: it calls initAudio() first and then
// bails out silently if a real AudioContext could not be created (e.g. the
// API is unavailable in a test environment, or the browser refuses to start
// it before a user gesture). Nothing in this file should ever throw.

import { useGameStore } from '../engine/store';

export type AmbienceKind =
  | 'silence'
  | 'platform'
  | 'trainMoving'
  | 'trainStopped'
  | 'stationOutdoor'
  | 'dread';

// ---------------------------------------------------------------------------
// Core graph: source(s) -> ... -> musicGain|sfxGain -> masterGain -> destination
// ---------------------------------------------------------------------------

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let musicGain: GainNode | null = null;
let sfxGain: GainNode | null = null;
let unsubscribeStore: (() => void) | null = null;

const noiseBuffers: Partial<Record<'white' | 'pink', AudioBuffer>> = {};

/** Create/resume the AudioContext. Safe to call any number of times. Never throws. */
export function initAudio(): void {
  try {
    if (ctx) {
      if (ctx.state === 'suspended') {
        void ctx.resume().catch(() => {
          /* autoplay policy blocked resume; try again on next gesture */
        });
      }
      return;
    }

    const AudioContextCtor: typeof AudioContext | undefined =
      typeof window === 'undefined'
        ? undefined
        : window.AudioContext ??
          (window as unknown as { webkitAudioContext?: typeof AudioContext })
            .webkitAudioContext;

    if (!AudioContextCtor) return;

    const newCtx = new AudioContextCtor();
    const master = newCtx.createGain();
    const music = newCtx.createGain();
    const sfx = newCtx.createGain();
    music.connect(master);
    sfx.connect(master);
    master.connect(newCtx.destination);

    ctx = newCtx;
    masterGain = master;
    musicGain = music;
    sfxGain = sfx;

    if (ctx.state === 'suspended') {
      void ctx.resume().catch(() => {
        /* autoplay policy blocked resume; try again on next gesture */
      });
    }

    subscribeToStore();
    syncVolumesFromStore();
  } catch {
    // Never let audio bootstrap crash the game.
  }
}

function clamp01(v: number): number {
  if (typeof v !== 'number' || Number.isNaN(v)) return 0;
  return Math.min(1, Math.max(0, v));
}

/** Re-applies masterVolume/musicVolume/sfxVolume from the store to the gain graph. */
export function syncVolumesFromStore(): void {
  initAudio();
  if (!ctx || !masterGain || !musicGain || !sfxGain) return;
  try {
    const { masterVolume, musicVolume, sfxVolume } = useGameStore.getState().settings;
    const now = ctx.currentTime;
    masterGain.gain.setTargetAtTime(clamp01(masterVolume), now, 0.15);
    musicGain.gain.setTargetAtTime(clamp01(musicVolume), now, 0.15);
    sfxGain.gain.setTargetAtTime(clamp01(sfxVolume), now, 0.15);
  } catch {
    /* ignore */
  }
}

function subscribeToStore(): void {
  if (unsubscribeStore) return;
  try {
    // NOTE: store.ts does not apply zustand's `subscribeWithSelector`
    // middleware, so the selector-overload of `subscribe` isn't available
    // here. We use the vanilla (state, prevState) listener instead and
    // diff `settings` ourselves - functionally equivalent for our purposes.
    unsubscribeStore = useGameStore.subscribe((state, prevState) => {
      if (state.settings !== prevState.settings) {
        syncVolumesFromStore();
      }
    });
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Noise generation
// ---------------------------------------------------------------------------

function getNoiseBuffer(kind: 'white' | 'pink'): AudioBuffer | null {
  if (!ctx) return null;
  const cached = noiseBuffers[kind];
  if (cached) return cached;

  const durationSeconds = 2;
  const length = Math.max(1, Math.floor(ctx.sampleRate * durationSeconds));
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (kind === 'white') {
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
  } else {
    // Paul Kellet's refined pink noise approximation.
    let b0 = 0;
    let b1 = 0;
    let b2 = 0;
    let b3 = 0;
    let b4 = 0;
    let b5 = 0;
    let b6 = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.969 * b2 + white * 0.153852;
      b3 = 0.8665 * b3 + white * 0.3104856;
      b4 = 0.55 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.016898;
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      b6 = white * 0.115926;
      data[i] = pink * 0.11;
    }
  }

  noiseBuffers[kind] = buffer;
  return buffer;
}

// ---------------------------------------------------------------------------
// Ambience layer plumbing
// ---------------------------------------------------------------------------

interface Layer {
  gain: GainNode;
  /** Fades the layer out then stops/disconnects its sources after the fade completes. */
  stop: (fadeSeconds?: number) => void;
}

function createLayerGain(): GainNode | null {
  if (!ctx || !musicGain) return null;
  const g = ctx.createGain();
  g.gain.value = 0;
  g.connect(musicGain);
  return g;
}

function buildRain(target: number): Layer | null {
  if (!ctx) return null;
  const buffer = getNoiseBuffer('white');
  const gain = createLayerGain();
  if (!buffer || !gain) return null;

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const bandpass = ctx.createBiquadFilter();
  bandpass.type = 'bandpass';
  bandpass.frequency.value = 3200;
  bandpass.Q.value = 0.5;
  const highpass = ctx.createBiquadFilter();
  highpass.type = 'highpass';
  highpass.frequency.value = 900;

  src.connect(bandpass);
  bandpass.connect(highpass);
  highpass.connect(gain);
  src.start();
  gain.gain.setTargetAtTime(target, ctx.currentTime, 1.2);

  return {
    gain,
    stop(fadeSeconds = 1) {
      if (!ctx) return;
      gain.gain.setTargetAtTime(0, ctx.currentTime, fadeSeconds);
      setTimeout(
        () => {
          try {
            src.stop();
            src.disconnect();
            bandpass.disconnect();
            highpass.disconnect();
            gain.disconnect();
          } catch {
            /* ignore */
          }
        },
        (fadeSeconds + 0.5) * 1000
      );
    },
  };
}

function buildWind(target: number): Layer | null {
  if (!ctx) return null;
  const buffer = getNoiseBuffer('pink');
  const gain = createLayerGain();
  if (!buffer || !gain) return null;

  const src = ctx.createBufferSource();
  src.buffer = buffer;
  src.loop = true;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 500;
  const lfo = ctx.createOscillator();
  lfo.type = 'sine';
  lfo.frequency.value = 0.1;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 250;
  lfo.connect(lfoGain);
  lfoGain.connect(filter.frequency);

  src.connect(filter);
  filter.connect(gain);
  src.start();
  lfo.start();
  gain.gain.setTargetAtTime(target, ctx.currentTime, 1.5);

  return {
    gain,
    stop(fadeSeconds = 1) {
      if (!ctx) return;
      gain.gain.setTargetAtTime(0, ctx.currentTime, fadeSeconds);
      setTimeout(
        () => {
          try {
            src.stop();
            lfo.stop();
            src.disconnect();
            filter.disconnect();
            lfo.disconnect();
            lfoGain.disconnect();
            gain.disconnect();
          } catch {
            /* ignore */
          }
        },
        (fadeSeconds + 0.5) * 1000
      );
    },
  };
}

function buildHum(target = 0.05): Layer | null {
  if (!ctx) return null;
  const gain = createLayerGain();
  if (!gain) return null;

  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 60;
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 60.7; // slight detune -> subtle beating

  const oscGain = ctx.createGain();
  oscGain.gain.value = 0.5;
  osc1.connect(oscGain);
  osc2.connect(oscGain);

  // Slow amplitude flicker, like an unstable fluorescent tube.
  const flickerLfo = ctx.createOscillator();
  flickerLfo.type = 'sine';
  flickerLfo.frequency.value = 0.13;
  const flickerGain = ctx.createGain();
  flickerGain.gain.value = 0.08;
  flickerLfo.connect(flickerGain);
  flickerGain.connect(oscGain.gain);

  oscGain.connect(gain);
  osc1.start();
  osc2.start();
  flickerLfo.start();
  gain.gain.setTargetAtTime(target, ctx.currentTime, 1);

  return {
    gain,
    stop(fadeSeconds = 1) {
      if (!ctx) return;
      gain.gain.setTargetAtTime(0, ctx.currentTime, fadeSeconds);
      setTimeout(
        () => {
          try {
            osc1.stop();
            osc2.stop();
            flickerLfo.stop();
            osc1.disconnect();
            osc2.disconnect();
            flickerLfo.disconnect();
            flickerGain.disconnect();
            oscGain.disconnect();
            gain.disconnect();
          } catch {
            /* ignore */
          }
        },
        (fadeSeconds + 0.5) * 1000
      );
    },
  };
}

function buildRumble(target: number): Layer | null {
  if (!ctx) return null;
  const gain = createLayerGain();
  if (!gain) return null;

  const osc1 = ctx.createOscillator();
  osc1.type = 'sawtooth';
  osc1.frequency.value = 40;
  const osc2 = ctx.createOscillator();
  osc2.type = 'triangle';
  osc2.frequency.value = 55;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 220;

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(gain);
  osc1.start();
  osc2.start();
  gain.gain.setTargetAtTime(target, ctx.currentTime, 1);

  return {
    gain,
    stop(fadeSeconds = 1) {
      if (!ctx) return;
      gain.gain.setTargetAtTime(0, ctx.currentTime, fadeSeconds);
      setTimeout(
        () => {
          try {
            osc1.stop();
            osc2.stop();
            osc1.disconnect();
            osc2.disconnect();
            filter.disconnect();
            gain.disconnect();
          } catch {
            /* ignore */
          }
        },
        (fadeSeconds + 0.5) * 1000
      );
    },
  };
}

function createDroneLayer(target: number): Layer | null {
  if (!ctx) return null;
  const gain = createLayerGain();
  if (!gain) return null;

  const osc = ctx.createOscillator();
  osc.type = 'triangle';
  osc.frequency.value = 48;
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.value = 300;

  const filterLfo = ctx.createOscillator();
  filterLfo.type = 'sine';
  filterLfo.frequency.value = 0.08;
  const filterLfoGain = ctx.createGain();
  filterLfoGain.gain.value = 80;
  filterLfo.connect(filterLfoGain);
  filterLfoGain.connect(filter.frequency);

  const pitchLfo = ctx.createOscillator();
  pitchLfo.type = 'sine';
  pitchLfo.frequency.value = 0.05;
  const pitchLfoGain = ctx.createGain();
  pitchLfoGain.gain.value = 3;
  pitchLfo.connect(pitchLfoGain);
  pitchLfoGain.connect(osc.frequency);

  osc.connect(filter);
  filter.connect(gain);
  osc.start();
  filterLfo.start();
  pitchLfo.start();
  gain.gain.setTargetAtTime(target, ctx.currentTime, 1.5);

  return {
    gain,
    stop(fadeSeconds = 1) {
      if (!ctx) return;
      gain.gain.setTargetAtTime(0, ctx.currentTime, fadeSeconds);
      setTimeout(
        () => {
          try {
            osc.stop();
            filterLfo.stop();
            pitchLfo.stop();
            osc.disconnect();
            filter.disconnect();
            filterLfo.disconnect();
            filterLfoGain.disconnect();
            pitchLfo.disconnect();
            pitchLfoGain.disconnect();
            gain.disconnect();
          } catch {
            /* ignore */
          }
        },
        (fadeSeconds + 0.5) * 1000
      );
    },
  };
}

function createHighDiscordLayer(target: number): Layer | null {
  if (!ctx) return null;
  const gain = createLayerGain();
  if (!gain) return null;

  const osc1 = ctx.createOscillator();
  osc1.type = 'sine';
  osc1.frequency.value = 1760;
  const osc2 = ctx.createOscillator();
  osc2.type = 'sine';
  osc2.frequency.value = 1864; // dissonant against osc1
  const shaping = ctx.createBiquadFilter();
  shaping.type = 'bandpass';
  shaping.frequency.value = 1800;
  shaping.Q.value = 8;

  osc1.connect(shaping);
  osc2.connect(shaping);
  shaping.connect(gain);
  osc1.start();
  osc2.start();
  gain.gain.setTargetAtTime(target, ctx.currentTime, 2);

  return {
    gain,
    stop(fadeSeconds = 1) {
      if (!ctx) return;
      gain.gain.setTargetAtTime(0, ctx.currentTime, fadeSeconds);
      setTimeout(
        () => {
          try {
            osc1.stop();
            osc2.stop();
            osc1.disconnect();
            osc2.disconnect();
            shaping.disconnect();
            gain.disconnect();
          } catch {
            /* ignore */
          }
        },
        (fadeSeconds + 0.5) * 1000
      );
    },
  };
}

// Lookahead-free, "good enough" recursive schedulers for rhythmic elements.

function startClatterScheduler(): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  function scheduleNext() {
    if (stopped || !ctx || !musicGain) return;
    const buffer = getNoiseBuffer('white');
    if (buffer) {
      const now = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 1200 + Math.random() * 400;
      filter.Q.value = 4;
      const burstGain = ctx.createGain();
      burstGain.gain.setValueAtTime(0, now);
      burstGain.gain.linearRampToValueAtTime(0.3, now + 0.01);
      burstGain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      src.connect(filter);
      filter.connect(burstGain);
      burstGain.connect(musicGain);
      src.start(now);
      src.stop(now + 0.2);
    }
    timeoutId = setTimeout(scheduleNext, 210 + Math.random() * 50);
  }

  scheduleNext();
  return () => {
    stopped = true;
    if (timeoutId !== null) clearTimeout(timeoutId);
  };
}

function startDistantRumblePings(): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  function tick() {
    if (stopped || !ctx || !musicGain) return;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = 35 + Math.random() * 10;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, now);
    g.gain.linearRampToValueAtTime(0.12, now + 1.5);
    g.gain.linearRampToValueAtTime(0, now + 4);
    osc.connect(g);
    g.connect(musicGain);
    osc.start(now);
    osc.stop(now + 4.2);
    timeoutId = setTimeout(tick, 8000 + Math.random() * 10000);
  }

  timeoutId = setTimeout(tick, 4000 + Math.random() * 4000);
  return () => {
    stopped = true;
    if (timeoutId !== null) clearTimeout(timeoutId);
  };
}

function startMetallicPings(): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let stopped = false;

  function tick() {
    if (stopped || !ctx || !musicGain) return;
    const now = ctx.currentTime;
    const freq = 400 + Math.random() * 200;
    const osc = ctx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = freq;
    filter.Q.value = 12;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, now);
    g.gain.exponentialRampToValueAtTime(0.06, now + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, now + 2.5);
    osc.connect(filter);
    filter.connect(g);
    g.connect(musicGain);
    osc.start(now);
    osc.stop(now + 2.6);
    timeoutId = setTimeout(tick, 5000 + Math.random() * 7000);
  }

  timeoutId = setTimeout(tick, 2000 + Math.random() * 3000);
  return () => {
    stopped = true;
    if (timeoutId !== null) clearTimeout(timeoutId);
  };
}

// ---------------------------------------------------------------------------
// Ambience bed
// ---------------------------------------------------------------------------

let currentAmbienceKind: AmbienceKind = 'silence';
let currentLayers: Layer[] = [];
let currentSchedulerStops: Array<() => void> = [];

export function setAmbience(kind: AmbienceKind): void {
  initAudio();
  if (!ctx || !musicGain) return;
  try {
    if (kind === currentAmbienceKind) return;
    currentAmbienceKind = kind;

    const fadeSeconds = 0.8;
    currentLayers.forEach((layer) => layer.stop(fadeSeconds));
    currentLayers = [];
    currentSchedulerStops.forEach((stop) => stop());
    currentSchedulerStops = [];

    const newLayers: Array<Layer | null> = [];

    switch (kind) {
      case 'silence':
        break;
      case 'platform':
        newLayers.push(buildRain(0.18), buildHum(0.05));
        currentSchedulerStops.push(startDistantRumblePings());
        break;
      case 'trainMoving':
        newLayers.push(buildRumble(0.28), buildWind(0.06));
        currentSchedulerStops.push(startClatterScheduler());
        break;
      case 'trainStopped':
        newLayers.push(buildHum(0.05), buildRumble(0.04));
        break;
      case 'stationOutdoor':
        newLayers.push(buildRain(0.09), buildWind(0.12));
        currentSchedulerStops.push(startMetallicPings());
        break;
      case 'dread':
        newLayers.push(createDroneLayer(0.2), createHighDiscordLayer(0.025));
        break;
    }

    currentLayers = newLayers.filter((l): l is Layer => l !== null);
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// One-shot SFX
// ---------------------------------------------------------------------------

export function playDoorSound(): void {
  initAudio();
  if (!ctx || !sfxGain) return;
  try {
    const now = ctx.currentTime;

    const hissBuffer = getNoiseBuffer('white');
    if (hissBuffer) {
      const hissSrc = ctx.createBufferSource();
      hissSrc.buffer = hissBuffer;
      const hissFilter = ctx.createBiquadFilter();
      hissFilter.type = 'highpass';
      hissFilter.frequency.value = 2500;
      const hissGain = ctx.createGain();
      hissGain.gain.setValueAtTime(0, now);
      hissGain.gain.linearRampToValueAtTime(0.3, now + 0.05);
      hissGain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
      hissSrc.connect(hissFilter);
      hissFilter.connect(hissGain);
      hissGain.connect(sfxGain);
      hissSrc.start(now);
      hissSrc.stop(now + 0.55);
    }

    const clunkOsc = ctx.createOscillator();
    clunkOsc.type = 'sine';
    clunkOsc.frequency.setValueAtTime(120, now + 0.35);
    clunkOsc.frequency.exponentialRampToValueAtTime(50, now + 0.45);
    const clunkGain = ctx.createGain();
    clunkGain.gain.setValueAtTime(0.0001, now + 0.35);
    clunkGain.gain.linearRampToValueAtTime(0.6, now + 0.37);
    clunkGain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
    clunkOsc.connect(clunkGain);
    clunkGain.connect(sfxGain);
    clunkOsc.start(now + 0.35);
    clunkOsc.stop(now + 0.6);
  } catch {
    /* ignore */
  }
}

export function playAnnouncementStatic(): void {
  initAudio();
  if (!ctx || !sfxGain) return;
  try {
    const buffer = getNoiseBuffer('white');
    if (!buffer) return;
    const now = ctx.currentTime;
    const duration = 0.6 + Math.random() * 0.6;

    const src = ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    const bandpass = ctx.createBiquadFilter();
    bandpass.type = 'bandpass';
    bandpass.Q.value = 1.2;
    bandpass.frequency.setValueAtTime(1200, now);
    bandpass.frequency.linearRampToValueAtTime(2600, now + duration * 0.5);
    bandpass.frequency.linearRampToValueAtTime(900, now + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.25, now + 0.08);
    gain.gain.setValueAtTime(0.25, now + duration - 0.1);
    gain.gain.linearRampToValueAtTime(0, now + duration);

    src.connect(bandpass);
    bandpass.connect(gain);
    gain.connect(sfxGain);
    src.start(now);
    src.stop(now + duration + 0.05);
  } catch {
    /* ignore */
  }
}

export function playFootstep(): void {
  initAudio();
  if (!ctx || !sfxGain) return;
  try {
    const now = ctx.currentTime;

    const buffer = getNoiseBuffer('white');
    if (buffer) {
      const noiseSrc = ctx.createBufferSource();
      noiseSrc.buffer = buffer;
      const lowpass = ctx.createBiquadFilter();
      lowpass.type = 'lowpass';
      lowpass.frequency.value = 300;
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.3, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      noiseSrc.connect(lowpass);
      lowpass.connect(noiseGain);
      noiseGain.connect(sfxGain);
      noiseSrc.start(now);
      noiseSrc.stop(now + 0.15);
    }

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(90, now);
    osc.frequency.exponentialRampToValueAtTime(45, now + 0.1);
    const oscGain = ctx.createGain();
    oscGain.gain.setValueAtTime(0.4, now);
    oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    osc.connect(oscGain);
    oscGain.connect(sfxGain);
    osc.start(now);
    osc.stop(now + 0.15);
  } catch {
    /* ignore */
  }
}

export function playStinger(): void {
  initAudio();
  if (!ctx || !sfxGain) return;
  try {
    const now = ctx.currentTime;
    const freqs = [220, 233, 415, 830];

    freqs.forEach((freq, i) => {
      if (!ctx || !sfxGain) return;
      const osc = ctx.createOscillator();
      osc.type = i % 2 === 0 ? 'sawtooth' : 'square';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.5 / freqs.length, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);
      osc.connect(g);
      g.connect(sfxGain);
      osc.start(now);
      osc.stop(now + 0.95);
    });

    const buffer = getNoiseBuffer('white');
    if (buffer) {
      const src = ctx.createBufferSource();
      src.buffer = buffer;
      const highpass = ctx.createBiquadFilter();
      highpass.type = 'highpass';
      highpass.frequency.value = 1500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.4, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
      src.connect(highpass);
      highpass.connect(g);
      g.connect(sfxGain);
      src.start(now);
      src.stop(now + 0.35);
    }
  } catch {
    /* ignore */
  }
}

export function playChime(): void {
  initAudio();
  if (!ctx || !sfxGain) return;
  try {
    const now = ctx.currentTime;
    const freqs = [880, 1108.73];

    freqs.forEach((freq, i) => {
      if (!ctx || !sfxGain) return;
      const startAt = now + i * 0.05;
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, startAt);
      g.gain.exponentialRampToValueAtTime(0.3, startAt + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, startAt + 1.0);
      osc.connect(g);
      g.connect(sfxGain);
      osc.start(startAt);
      osc.stop(startAt + 1.05);
    });
  } catch {
    /* ignore */
  }
}

// ---------------------------------------------------------------------------
// Toggleable continuous low layers
// ---------------------------------------------------------------------------

let heartbeatActive = false;
let heartbeatGain: GainNode | null = null;
let heartbeatTimeoutId: ReturnType<typeof setTimeout> | null = null;

function playHeartbeatThump(time: number, dest: GainNode): void {
  if (!ctx) return;
  const osc = ctx.createOscillator();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(60, time);
  osc.frequency.exponentialRampToValueAtTime(35, time + 0.15);
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, time);
  g.gain.exponentialRampToValueAtTime(0.8, time + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, time + 0.22);
  osc.connect(g);
  g.connect(dest);
  osc.start(time);
  osc.stop(time + 0.25);
}

function scheduleHeartbeat(): void {
  if (!ctx || !heartbeatActive || !heartbeatGain) return;
  const now = ctx.currentTime;
  playHeartbeatThump(now, heartbeatGain);
  playHeartbeatThump(now + 0.28, heartbeatGain);
  heartbeatTimeoutId = setTimeout(scheduleHeartbeat, 1100);
}

export function setHeartbeat(active: boolean): void {
  initAudio();
  if (!ctx || !musicGain) return;
  try {
    if (active === heartbeatActive) return;
    heartbeatActive = active;

    if (active) {
      const g = ctx.createGain();
      g.gain.value = 0;
      g.connect(musicGain);
      heartbeatGain = g;
      g.gain.setTargetAtTime(0.5, ctx.currentTime, 0.8);
      scheduleHeartbeat();
    } else {
      if (heartbeatTimeoutId !== null) {
        clearTimeout(heartbeatTimeoutId);
        heartbeatTimeoutId = null;
      }
      const g = heartbeatGain;
      heartbeatGain = null;
      if (g && ctx) {
        g.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
        setTimeout(() => {
          try {
            g.disconnect();
          } catch {
            /* ignore */
          }
        }, 900);
      }
    }
  } catch {
    /* ignore */
  }
}

let droneActive = false;
let droneLayer: Layer | null = null;

export function setDrone(active: boolean): void {
  initAudio();
  if (!ctx || !musicGain) return;
  try {
    if (active === droneActive) return;
    droneActive = active;

    if (active) {
      droneLayer = createDroneLayer(0.18);
    } else if (droneLayer) {
      droneLayer.stop(1.2);
      droneLayer = null;
    }
  } catch {
    /* ignore */
  }
}
