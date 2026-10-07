/**
 * Bashist Mechanical Switch Keystroke Soundpack Engine
 * High-performance Web Audio API engine with zero latency, buffer pre-caching,
 * physical layout modeling, channel-separated voices, interruptible acoustic damping,
 * and matched downstroke + upstroke mechanical releases.
 */

import {
  SOUND_DEFINES_DOWN,
  SOUND_DEFINES_UP,
  HOLY_PANDA_SLICES,
  CREAM_TRAVEL_SLICES,
  CHERRY_MX_SLICES,
  getKeyPhysicalPosition,
} from './soundSprite';
import {
  KEYECHO_PACK_METAS,
  KEYECHO_PACK_SLICES,
} from './keyechoPacks';

export type SoundpackId =
  | 'keyb-switch'
  | 'holy-panda'
  | 'cream-travel'
  | 'cherrymx-red-abs'
  | string;

export type SoundpackCategory =
  | 'All'
  | 'Tactile'
  | 'Linear'
  | 'Clicky'
  | 'Thocky'
  | 'Silent'
  | 'Vintage'
  | 'FX';

export interface SoundpackMeta {
  id: SoundpackId;
  name: string;
  category: SoundpackCategory;
  description: string;
  tag: string;
  actuation: string;
}

export interface SoundpackSettings {
  enabled: boolean;
  activePack: SoundpackId;
  volume: number; // 0.0 to 1.0
}

export const SOUNDPACK_METAS: SoundpackMeta[] = [
  {
    id: 'keyb-switch',
    name: 'Keyb Mechanical Sprite',
    category: 'Linear',
    description: 'High-fidelity mechanical switch audio sprite with distinct per-key acoustic profiles and realistic key releases.',
    tag: 'Keyb Sprite (Default)',
    actuation: '50g Mechanical',
  },
  {
    id: 'holy-panda',
    name: 'Holy Panda',
    category: 'Tactile',
    description: 'Remastered enthusiast tactile switch with snappy D-bump, row formant modeling, and clean release clack.',
    tag: 'Crisp Thock',
    actuation: '67g Tactile',
  },
  {
    id: 'cream-travel',
    name: 'NK Cream (Lubed)',
    category: 'Linear',
    description: 'Smooth lubed POM housing with physical row-mapped (R0–R4) travel clacks and spatial stereo imaging.',
    tag: 'Buttery Cream',
    actuation: '55g Linear',
  },
  {
    id: 'cherrymx-red-abs',
    name: 'Cherry MX Red',
    category: 'Linear',
    description: 'Lightweight linear switch with clean ABS keycap clacks, matched upstroke synthesis, and generous headroom.',
    tag: 'Classic Linear',
    actuation: '45g Linear',
  },
  ...KEYECHO_PACK_METAS.map((p) => ({
    id: p.id,
    name: p.name,
    category: p.category as SoundpackCategory,
    description: p.description,
    tag: p.tag,
    actuation: p.actuation,
  })),
];

export const SOUNDPACK_SPRITE_FILES: Record<string, string> = {
  'keyb-switch': '/sounds/sound.ogg',
  'holy-panda': '/sounds/holy-panda.ogg',
  'cream-travel': '/sounds/cream-travel.ogg',
  'cherrymx-red-abs': '/sounds/cherrymx-red-abs.ogg',
  ...Object.fromEntries(KEYECHO_PACK_METAS.map((p) => [p.id, p.audioFile])),
};

const STORAGE_KEY = 'bashist-sfx-settings';
const LEGACY_STORAGE_KEY = 'linuxdrill-sfx-settings';
const DEFAULT_SETTINGS: SoundpackSettings = {
  enabled: true,
  activePack: 'keyb-switch',
  volume: 0.85,
};

let currentSettings: SoundpackSettings = loadSoundpackSettings();
let audioCtx: AudioContext | null = null;
const bufferCache = new Map<string, AudioBuffer>();
const loadingPromises = new Map<string, Promise<AudioBuffer | null>>();

export function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

export function loadSoundpackSettings(): SoundpackSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem(LEGACY_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      const activePack = SOUNDPACK_METAS.some((m) => m.id === parsed.activePack)
        ? parsed.activePack
        : DEFAULT_SETTINGS.activePack;
      return {
        ...DEFAULT_SETTINGS,
        ...parsed,
        activePack,
      };
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function saveSoundpackSettings(settings: Partial<SoundpackSettings>) {
  currentSettings = { ...currentSettings, ...settings };
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentSettings));
      window.dispatchEvent(
        new CustomEvent('bashist_sfx_update', { detail: currentSettings })
      );
      window.dispatchEvent(
        new CustomEvent('linuxdrill_sfx_update', { detail: currentSettings })
      );
    } catch {}
  }
}

export function getSoundpackSettings(): SoundpackSettings {
  return { ...currentSettings };
}

async function fetchAndDecode(ctx: AudioContext, url: string): Promise<AudioBuffer | null> {
  if (bufferCache.has(url)) {
    return bufferCache.get(url)!;
  }
  if (loadingPromises.has(url)) {
    return loadingPromises.get(url)!;
  }

  const promise = (async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const arrayBuffer = await res.arrayBuffer();
      const decoded = await ctx.decodeAudioData(arrayBuffer);
      bufferCache.set(url, decoded);
      return decoded;
    } catch (err) {
      console.warn(`[Bashist SFX] Failed to load audio sample: ${url}`, err);
      return null;
    } finally {
      loadingPromises.delete(url);
    }
  })();

  loadingPromises.set(url, promise);
  return promise;
}

/** Preload audio sprite for a given soundpack */
export async function preloadSoundpack(packId: SoundpackId) {
  const ctx = getAudioContext();
  if (!ctx) return;
  const url = SOUNDPACK_SPRITE_FILES[packId];
  if (url) {
    await fetchAndDecode(ctx, url);
  }
}

/** Eagerly preload default and other soundpacks in background */
if (typeof window !== 'undefined') {
  const idlePreload = () => {
    preloadSoundpack(currentSettings.activePack).then(() => {
      // Preload the primary built-in packs lazily when idle; KeyEcho packs preload on demand
      const primaryPacks: SoundpackId[] = ['keyb-switch', 'holy-panda', 'cream-travel', 'cherrymx-red-abs'];
      for (const id of primaryPacks) {
        if (id !== currentSettings.activePack) {
          preloadSoundpack(id);
        }
      }
    });
  };

  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(idlePreload);
  } else {
    setTimeout(idlePreload, 300);
  }
}

// ══════════════════════════════════════════════════════════════════════
// VOICE MANAGEMENT & ACOUSTIC SPATIAL ENGINE
// ══════════════════════════════════════════════════════════════════════

export type KeyChannel = 'enter' | 'space' | 'back' | 'standard';

export function getKeyChannel(key: string): KeyChannel {
  const k = key.toLowerCase();
  if (k === 'enter') return 'enter';
  if (k === ' ' || k === 'space' || k === 'spacebar') return 'space';
  if (k === 'backspace' || k === 'delete') return 'back';
  return 'standard';
}

interface ActiveVoice {
  source: AudioBufferSourceNode;
  gainNode: GainNode;
  startedAt: number;
}

interface KeyStrokeAcoustics {
  spriteUrl: string;
  releaseSlice: [number, number];
  playbackRate: number;
  pan: number;
}

// Track active voice per key code to cleanly crossfade downstroke into upstroke
const activeKeyVoices = new Map<string, ActiveVoice>();
// Track the acoustic configuration chosen on downstroke so upstroke matches it
const activeKeyAcoustics = new Map<string, KeyStrokeAcoustics>();
// Track round-robin variation state per key code to prevent machine-gunning
const activeKeyVariations = new Map<string, number>();

/** Smoothly fade out and stop an active voice without digital clicks (3-5ms ramp) */
function stopVoice(voice: ActiveVoice | null, ctx: AudioContext, fadeTimeMs = 4) {
  if (!voice) return;
  try {
    const fadeDuration = fadeTimeMs / 1000;
    const now = ctx.currentTime;
    voice.gainNode.gain.cancelScheduledValues(now);
    const curVal = voice.gainNode.gain.value;
    voice.gainNode.gain.setValueAtTime(Math.max(curVal, 0.0001), now);
    voice.gainNode.gain.exponentialRampToValueAtTime(0.00001, now + fadeDuration);
    voice.source.stop(now + fadeDuration + 0.005);
  } catch {}
}

function playBufferSlice(
  buffer: AudioBuffer,
  offsetSec: number,
  durationSec: number,
  volume: number,
  playbackRate = 1.0,
  pan = 0.0
): ActiveVoice | null {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.playbackRate.setValueAtTime(playbackRate, ctx.currentTime);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(Math.max(0, Math.min(1.5, volume)), ctx.currentTime);

    // Physical stereo spatialization across the keyboard plate
    if (typeof ctx.createStereoPanner === 'function' && pan !== 0) {
      const panner = ctx.createStereoPanner();
      panner.pan.setValueAtTime(Math.max(-0.5, Math.min(0.5, pan)), ctx.currentTime);
      source.connect(gainNode);
      gainNode.connect(panner);
      panner.connect(ctx.destination);
    } else {
      source.connect(gainNode);
      gainNode.connect(ctx.destination);
    }

    source.start(ctx.currentTime, offsetSec, durationSec);

    const voice: ActiveVoice = {
      source,
      gainNode,
      startedAt: ctx.currentTime,
    };

    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
    };

    return voice;
  } catch (e) {
    console.warn('[Bashist SFX] Sprite playback error', e);
    return null;
  }
}

/** Resolves downstroke and matching upstroke slices, row acoustics, and stereo pan */
function resolveKeyAcoustics(
  packId: SoundpackId,
  key: string,
  code: string
): {
  spriteUrl: string;
  pressSlice: [number, number];
  releaseSlice: [number, number];
  playbackRate: number;
  pan: number;
} {
  const pos = getKeyPhysicalPosition(code);
  const channel = getKeyChannel(key);
  const pan = pos.col * 0.22; // Subtle natural stereo width
  const jitter = (Math.random() - 0.5) * 0.025; // +/-1.25% humanized analog variation

  // 1. Keyb Mechanical Audio Sprite
  if (packId === 'keyb-switch') {
    const pressSlice = SOUND_DEFINES_DOWN[code] ?? SOUND_DEFINES_DOWN['KeyA'];
    const releaseSlice = SOUND_DEFINES_UP[code] ?? SOUND_DEFINES_UP['KeyA'];
    return {
      spriteUrl: SOUNDPACK_SPRITE_FILES['keyb-switch'],
      pressSlice,
      releaseSlice,
      playbackRate: 1.0 + jitter,
      pan,
    };
  }

  // 2. NK Cream (Lubed) — Physical Row Mapping (R0 to R4)
  if (packId === 'cream-travel') {
    let pressSlice: [number, number];
    let releaseSlice: [number, number];

    if (channel === 'enter') {
      pressSlice = CREAM_TRAVEL_SLICES.press_enter;
      releaseSlice = CREAM_TRAVEL_SLICES.release_enter;
    } else if (channel === 'space') {
      pressSlice = CREAM_TRAVEL_SLICES.press_space;
      releaseSlice = CREAM_TRAVEL_SLICES.release_space;
    } else if (channel === 'back') {
      pressSlice = CREAM_TRAVEL_SLICES.press_back;
      releaseSlice = CREAM_TRAVEL_SLICES.release_back;
    } else {
      const rowIdx = Math.min(4, Math.max(0, pos.row));
      pressSlice = CREAM_TRAVEL_SLICES[`press_row_${rowIdx}`] ?? CREAM_TRAVEL_SLICES.press_row_3;
      releaseSlice = CREAM_TRAVEL_SLICES.release_standard;
    }

    return {
      spriteUrl: SOUNDPACK_SPRITE_FILES['cream-travel'],
      pressSlice,
      releaseSlice,
      playbackRate: 1.0 + jitter,
      pan,
    };
  }

  // 3. Holy Panda — Round-Robin Cycling + Row/Plate Formant Pitch Modeling
  if (packId === 'holy-panda') {
    let pressSlice: [number, number];
    let releaseSlice: [number, number];
    let pitchMultiplier = 1.0;

    if (channel === 'enter') {
      pressSlice = HOLY_PANDA_SLICES.press_enter;
      releaseSlice = HOLY_PANDA_SLICES.release_enter;
    } else if (channel === 'space') {
      pressSlice = HOLY_PANDA_SLICES.press_space;
      releaseSlice = HOLY_PANDA_SLICES.release_space;
    } else if (channel === 'back') {
      pressSlice = HOLY_PANDA_SLICES.press_back;
      releaseSlice = HOLY_PANDA_SLICES.release_back;
    } else {
      // Cycle through 5 variations sequentially per key code to prevent machine-gunning
      const lastVar = activeKeyVariations.get(code) ?? Math.floor(Math.random() * 5);
      const nextVar = (lastVar + 1) % 5;
      activeKeyVariations.set(code, nextVar);

      pressSlice = HOLY_PANDA_SLICES[`press_key${nextVar + 1}`] ?? HOLY_PANDA_SLICES.press_key1;
      releaseSlice = HOLY_PANDA_SLICES.release_standard;

      // Row acoustics: higher clacks on top rows, deeper bottom-outs on lower rows
      const rowCents = [35, 20, 10, 0, -18, -25][pos.row] ?? 0;
      // Center plate flex: keys near center vibrate deeper
      const centerPlateCents = (1 - Math.abs(pos.col)) * -8;
      pitchMultiplier = Math.pow(2, (rowCents + centerPlateCents) / 1200);
    }

    return {
      spriteUrl: SOUNDPACK_SPRITE_FILES['holy-panda'],
      pressSlice,
      releaseSlice,
      playbackRate: pitchMultiplier * (1.0 + jitter),
      pan,
    };
  }

  // 4. Cherry MX Red — Matched Upstroke Synthesis & Row Modeling
  if (packId === 'cherrymx-red-abs') {
    let pressSlice: [number, number];
    let releaseSlice: [number, number];
    let pitchMultiplier = 1.0;

    if (channel === 'enter') {
      pressSlice = CHERRY_MX_SLICES.press_enter;
      releaseSlice = CHERRY_MX_SLICES.release_enter;
    } else if (channel === 'space') {
      pressSlice = CHERRY_MX_SLICES.press_space;
      releaseSlice = CHERRY_MX_SLICES.release_space;
    } else if (channel === 'back') {
      pressSlice = CHERRY_MX_SLICES.press_back;
      releaseSlice = CHERRY_MX_SLICES.release_back;
    } else {
      // Cycle through 3 variations
      const lastVar = activeKeyVariations.get(code) ?? Math.floor(Math.random() * 3);
      const nextVar = (lastVar + 1) % 3;
      activeKeyVariations.set(code, nextVar);

      pressSlice = CHERRY_MX_SLICES[`press_standard_${nextVar + 1}`] ?? CHERRY_MX_SLICES.press_standard_1;
      // Matched upstroke: release sound corresponds directly to the struck switch take!
      releaseSlice = CHERRY_MX_SLICES[`release_standard_${nextVar + 1}`] ?? CHERRY_MX_SLICES.release_standard_1;

      const rowCents = [30, 18, 8, 0, -15, -20][pos.row] ?? 0;
      pitchMultiplier = Math.pow(2, rowCents / 1200);
    }

      return {
        spriteUrl: SOUNDPACK_SPRITE_FILES['cherrymx-red-abs'],
        pressSlice,
        releaseSlice,
        playbackRate: pitchMultiplier * (1.0 + jitter),
        pan,
      };
    }

    // 5. KeyEcho Official Soundpacks (18 profiles)
    if (KEYECHO_PACK_SLICES[packId]) {
      const packSlices = KEYECHO_PACK_SLICES[packId];
      let pressSlice = packSlices[code];
      if (!pressSlice) {
        if (channel === 'enter' && packSlices.Enter) pressSlice = packSlices.Enter;
        else if (channel === 'space' && packSlices.Space) pressSlice = packSlices.Space;
        else if (channel === 'back' && (packSlices.Backspace || packSlices.Delete)) {
          pressSlice = packSlices.Backspace || packSlices.Delete;
        } else {
          pressSlice = packSlices.KeyA || packSlices.Space || Object.values(packSlices)[0];
        }
      }

      // Synthesize matched mechanical release acoustic:
      // Extract the keycap release transient (first 25-32ms of the switch take)
      const [startMs, durMs] = pressSlice;
      const releaseDuration = Math.min(Math.max(durMs, 10), 32);
      const releaseSlice: [number, number] = [startMs, releaseDuration];

      const rowCents = [24, 14, 6, 0, -12, -18][pos.row] ?? 0;
      const pitchMultiplier = Math.pow(2, rowCents / 1200);

      return {
        spriteUrl: SOUNDPACK_SPRITE_FILES[packId] || `/sounds/packs/${packId}.ogg`,
        pressSlice,
        releaseSlice,
        playbackRate: pitchMultiplier * (1.0 + jitter),
        pan,
      };
    }

    // Fallback
    return {
      spriteUrl: SOUNDPACK_SPRITE_FILES['keyb-switch'],
      pressSlice: SOUND_DEFINES_DOWN.KeyA,
      releaseSlice: SOUND_DEFINES_UP.KeyA,
      playbackRate: 1.0,
      pan: 0.0,
    };
  }

  export async function playKeyPress(key: string, code: string) {
    if (!currentSettings.enabled || currentSettings.volume <= 0) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    const packId = currentSettings.activePack;
    const acoustic = resolveKeyAcoustics(packId, key, code);

    const buffer =
      bufferCache.get(acoustic.spriteUrl) || (await fetchAndDecode(ctx, acoustic.spriteUrl));
    if (!buffer) return;

    // Stop any voice previously playing for this specific key with a 3ms ramp
    if (activeKeyVoices.has(code)) {
      stopVoice(activeKeyVoices.get(code) || null, ctx, 3);
      activeKeyVoices.delete(code);
    }

    // Cache acoustic info so keyup release matches this stroke perfectly
    activeKeyAcoustics.set(code, acoustic);

    const [startMs, durationMs] = acoustic.pressSlice;
    const voice = playBufferSlice(
      buffer,
      startMs / 1000,
      durationMs / 1000,
      currentSettings.volume,
      acoustic.playbackRate,
      acoustic.pan
    );

    if (voice) {
      activeKeyVoices.set(code, voice);
    }
  }

  export async function playKeyRelease(key: string, code: string) {
    if (!currentSettings.enabled || currentSettings.volume <= 0) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    // Damping: smoothly stop the ongoing downstroke voice with 4ms exponential ramp
    if (activeKeyVoices.has(code)) {
      stopVoice(activeKeyVoices.get(code) || null, ctx, 4);
      activeKeyVoices.delete(code);
    }

    // Retrieve cached acoustics for this stroke (or resolve fresh if missing)
    const acoustic =
      activeKeyAcoustics.get(code) ??
      resolveKeyAcoustics(currentSettings.activePack, key, code);
    activeKeyAcoustics.delete(code);

    const buffer =
      bufferCache.get(acoustic.spriteUrl) || (await fetchAndDecode(ctx, acoustic.spriteUrl));
    if (!buffer) return;

    const [startMs, durationMs] = acoustic.releaseSlice;
    const isKeyEcho = Boolean(KEYECHO_PACK_SLICES[currentSettings.activePack]);
    const releaseVol = isKeyEcho
      ? currentSettings.volume * 0.32
      : currentSettings.volume * 0.86;
    const releaseRate = isKeyEcho
      ? acoustic.playbackRate * 1.12
      : acoustic.playbackRate;

    playBufferSlice(
      buffer,
      startMs / 1000,
      durationMs / 1000,
      releaseVol,
      releaseRate,
      acoustic.pan
    );
  }

  /** Play a test sound for modal previews */
  export async function playSamplePreview(
    packId: SoundpackId,
    type: 'enter' | 'space' | 'standard' | 'back' = 'enter'
  ) {
    const ctx = getAudioContext();
    if (!ctx) return;

    const sampleKey =
      type === 'enter'
        ? 'Enter'
        : type === 'space'
        ? ' '
        : type === 'back'
        ? 'Backspace'
        : 'a';
    const sampleCode =
      type === 'enter'
        ? 'Enter'
        : type === 'space'
        ? 'Space'
        : type === 'back'
        ? 'Backspace'
        : 'KeyA';

    const acoustic = resolveKeyAcoustics(packId, sampleKey, sampleCode);
    const buffer =
      bufferCache.get(acoustic.spriteUrl) || (await fetchAndDecode(ctx, acoustic.spriteUrl));
    if (!buffer) return;

    const [downStartMs, downDurMs] = acoustic.pressSlice;
    const [upStartMs, upDurMs] = acoustic.releaseSlice;

    const voice = playBufferSlice(
      buffer,
      downStartMs / 1000,
      downDurMs / 1000,
      currentSettings.volume,
      acoustic.playbackRate,
      acoustic.pan
    );

    setTimeout(() => {
      if (voice) {
        stopVoice(voice, ctx, 4);
      }
      const isKeyEcho = Boolean(KEYECHO_PACK_SLICES[packId]);
      const releaseVol = isKeyEcho
        ? currentSettings.volume * 0.32
        : currentSettings.volume * 0.86;
      const releaseRate = isKeyEcho
        ? acoustic.playbackRate * 1.12
        : acoustic.playbackRate;

      playBufferSlice(
        buffer,
        upStartMs / 1000,
        upDurMs / 1000,
        releaseVol,
        releaseRate,
        acoustic.pan
      );
    }, downDurMs + 15);
  }

// ══════════════════════════════════════════════════════════════════════
// GLOBAL KEYSTROKE EVENT LISTENER
// ══════════════════════════════════════════════════════════════════════

let isListenerActive = false;
const activeDownKeys = new Set<string>();

const MODIFIER_KEYS = new Set(['Control', 'Shift', 'Alt', 'Meta', 'CapsLock']);

export function setupGlobalKeySoundListener(): () => void {
  if (typeof window === 'undefined' || isListenerActive) return () => {};
  isListenerActive = true;

  // Unmute/unlock AudioContext on first user interaction
  const unlockAudio = () => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    unlockAudio();

    // Ignore repeating when key is held down — only play ONCE per physical strike!
    if (e.repeat || activeDownKeys.has(e.code)) {
      return;
    }

    // Ignore isolated modifier key clicks
    if (MODIFIER_KEYS.has(e.key)) {
      return;
    }

    activeDownKeys.add(e.code);
    playKeyPress(e.key, e.code);
  };

  const handleKeyUp = (e: KeyboardEvent) => {
    if (!activeDownKeys.has(e.code)) {
      return;
    }

    activeDownKeys.delete(e.code);

    if (MODIFIER_KEYS.has(e.key)) {
      return;
    }

    playKeyRelease(e.key, e.code);
  };

  const unlockEvents = ['pointerdown', 'touchstart', 'mousedown'];
  unlockEvents.forEach((evt) => {
    window.addEventListener(evt, unlockAudio, { passive: true, capture: true, once: true });
  });

  window.addEventListener('keydown', handleKeyDown, { passive: true, capture: true });
  window.addEventListener('keyup', handleKeyUp, { passive: true, capture: true });

  return () => {
    isListenerActive = false;
    window.removeEventListener('keydown', handleKeyDown, { capture: true } as any);
    window.removeEventListener('keyup', handleKeyUp, { capture: true } as any);
  };
}

// Automatically start global keystroke sound listener on import
if (typeof window !== 'undefined') {
  setupGlobalKeySoundListener();
}
