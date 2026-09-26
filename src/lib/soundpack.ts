/**
 * LinuxDrill Mechanical Switch Keystroke Soundpack Engine
 * High-performance Web Audio API engine with zero latency, buffer pre-caching,
 * channel-separated voices, interruptible acoustic damping, and single-stroke key hold.
 */

import { SOUND_DEFINES_DOWN, SOUND_DEFINES_UP } from './soundSprite';

export type SoundpackId = 'keyb-switch' | 'holy-panda' | 'cream-travel' | 'cherrymx-red-abs';

export interface SoundpackMeta {
  id: SoundpackId;
  name: string;
  category: 'Tactile' | 'Linear';
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
    description: 'Enthusiast tactile switch with snappy D-bump & rounded bottom-out pop.',
    tag: 'Crisp Thock',
    actuation: '67g Tactile',
  },
  {
    id: 'cream-travel',
    name: 'NK Cream (Lubed)',
    category: 'Linear',
    description: 'Ultra-smooth lubed POM housing with deep, buttery travel clacks.',
    tag: 'Buttery Cream',
    actuation: '55g Linear',
  },
  {
    id: 'cherrymx-red-abs',
    name: 'Cherry MX Red',
    category: 'Linear',
    description: 'Lightweight linear switch with clean ABS keycap clacks and crisp actuation.',
    tag: 'Classic Linear',
    actuation: '45g Linear',
  },
];

interface SoundpackAudioManifest {
  press: {
    enter: string;
    space: string;
    back: string;
    standard: string[];
  };
  release: {
    enter: string;
    space: string;
    back: string;
    standard: string[];
  };
}

const MANIFESTS: Partial<Record<SoundpackId, SoundpackAudioManifest>> = {
  'holy-panda': {
    press: {
      enter: '/soundpacks/holy-panda/press_enter.mp3',
      space: '/soundpacks/holy-panda/press_space.mp3',
      back: '/soundpacks/holy-panda/press_back.mp3',
      standard: [
        '/soundpacks/holy-panda/press_key1.mp3',
        '/soundpacks/holy-panda/press_key2.mp3',
        '/soundpacks/holy-panda/press_key3.mp3',
        '/soundpacks/holy-panda/press_key4.mp3',
        '/soundpacks/holy-panda/press_key5.mp3',
      ],
    },
    release: {
      enter: '/soundpacks/holy-panda/release_enter.mp3',
      space: '/soundpacks/holy-panda/release_space.mp3',
      back: '/soundpacks/holy-panda/release_back.mp3',
      standard: ['/soundpacks/holy-panda/release_key.mp3'],
    },
  },
  'cream-travel': {
    press: {
      enter: '/soundpacks/cream-travel/press_enter.mp3',
      space: '/soundpacks/cream-travel/press_space.mp3',
      // Dedicated heavier backspace acoustic borrowed from Holy Panda
      back: '/soundpacks/holy-panda/press_back.mp3',
      standard: [
        '/soundpacks/cream-travel/press_standard_GENERIC_R0.mp3',
        '/soundpacks/cream-travel/press_standard_GENERIC_R1.mp3',
        '/soundpacks/cream-travel/press_standard_GENERIC_R2.mp3',
        '/soundpacks/cream-travel/press_standard_GENERIC_R3.mp3',
        '/soundpacks/cream-travel/press_standard_GENERIC_R4.mp3',
      ],
    },
    release: {
      enter: '/soundpacks/cream-travel/release_enter.mp3',
      space: '/soundpacks/cream-travel/release_space.mp3',
      back: '/soundpacks/holy-panda/release_back.mp3',
      standard: ['/soundpacks/cream-travel/release_standard_GENERIC.mp3'],
    },
  },
  'cherrymx-red-abs': {
    press: {
      enter: '/soundpacks/cherrymx-red-abs/press_enter.wav',
      space: '/soundpacks/cherrymx-red-abs/press_space.wav',
      back: '/soundpacks/cherrymx-red-abs/press_back.wav',
      standard: [
        '/soundpacks/cherrymx-red-abs/press_standard_1.wav',
        '/soundpacks/cherrymx-red-abs/press_standard_2.wav',
        '/soundpacks/cherrymx-red-abs/press_standard_3.wav',
      ],
    },
    // Fall back to neutral release recordings from cream-travel & holy-panda
    release: {
      enter: '/soundpacks/cream-travel/release_enter.mp3',
      space: '/soundpacks/cream-travel/release_space.mp3',
      back: '/soundpacks/holy-panda/release_back.mp3',
      standard: ['/soundpacks/cream-travel/release_standard_GENERIC.mp3'],
    },
  },
};

const STORAGE_KEY = 'linuxdrill-sfx-settings';
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
    const saved = localStorage.getItem(STORAGE_KEY);
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
      console.warn(`[LinuxDrill SFX] Failed to load audio sample: ${url}`, err);
      return null;
    } finally {
      loadingPromises.delete(url);
    }
  })();

  loadingPromises.set(url, promise);
  return promise;
}

/** Preload all audio samples for a given soundpack */
export async function preloadSoundpack(packId: SoundpackId) {
  const ctx = getAudioContext();
  if (!ctx) return;

  if (packId === 'keyb-switch') {
    await fetchAndDecode(ctx, '/sounds/sound.ogg');
    return;
  }

  const manifest = MANIFESTS[packId];
  if (!manifest) return;

  const urls: string[] = [
    manifest.press.enter,
    manifest.press.space,
    manifest.press.back,
    ...manifest.press.standard,
    manifest.release.enter,
    manifest.release.space,
    manifest.release.back,
    ...manifest.release.standard,
  ];

  await Promise.all(urls.map((url) => fetchAndDecode(ctx, url)));
}

/** Eagerly preload default soundpack */
if (typeof window !== 'undefined') {
  if ('requestIdleCallback' in window) {
    (window as any).requestIdleCallback(() => preloadSoundpack(currentSettings.activePack));
  } else {
    setTimeout(() => preloadSoundpack(currentSettings.activePack), 300);
  }
}

// ══════════════════════════════════════════════════════════════════════
// VOICE MANAGEMENT & INTERRUPTIBLE CHANNEL ARCHITECTURE
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

// Dedicated channel voices
let activeEnterVoice: ActiveVoice | null = null;
let activeSpaceVoice: ActiveVoice | null = null;
let activeBackVoice: ActiveVoice | null = null;

// Tight 2-voice circular pool for standard typing keys (natural damped overlap)
const activeStandardVoices: ActiveVoice[] = [];

// Specific key tracking to cancel keydown audio when keyup occurs
const activeKeyVoices = new Map<string, ActiveVoice>();

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

function playBuffer(buffer: AudioBuffer, volume: number): ActiveVoice | null {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Subtle pitch jitter (+/- 2%) for organic analog variety
    source.playbackRate.setValueAtTime(
      1 + (Math.random() - 0.5) * 0.04,
      ctx.currentTime
    );

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(Math.max(0, Math.min(1.5, volume)), ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

    source.start(ctx.currentTime);

    const voice: ActiveVoice = {
      source,
      gainNode,
      startedAt: ctx.currentTime,
    };

    // Clean up when sound finishes naturally
    source.onended = () => {
      source.disconnect();
      gainNode.disconnect();
    };

    return voice;
  } catch (e) {
    console.warn('[LinuxDrill SFX] Playback error', e);
    return null;
  }
}

function playBufferSlice(
  buffer: AudioBuffer,
  offsetSec: number,
  durationSec: number,
  volume: number
): ActiveVoice | null {
  const ctx = getAudioContext();
  if (!ctx) return null;
  if (ctx.state === 'suspended') {
    ctx.resume().catch(() => {});
  }

  try {
    const source = ctx.createBufferSource();
    source.buffer = buffer;

    // Subtle pitch jitter (+/- 1.5%) for organic analog variety
    source.playbackRate.setValueAtTime(
      1 + (Math.random() - 0.5) * 0.03,
      ctx.currentTime
    );

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(Math.max(0, Math.min(1.5, volume)), ctx.currentTime);

    source.connect(gainNode);
    gainNode.connect(ctx.destination);

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
    console.warn('[LinuxDrill SFX] Sprite playback error', e);
    return null;
  }
}

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getPressUrl(manifest: SoundpackAudioManifest, channel: KeyChannel): string {
  if (channel === 'enter') return manifest.press.enter;
  if (channel === 'space') return manifest.press.space;
  if (channel === 'back') return manifest.press.back;
  return getRandomItem(manifest.press.standard);
}

function getReleaseUrl(manifest: SoundpackAudioManifest, channel: KeyChannel): string {
  if (channel === 'enter') return manifest.release.enter;
  if (channel === 'space') return manifest.release.space;
  if (channel === 'back') return manifest.release.back;
  return getRandomItem(manifest.release.standard);
}

export async function playKeyPress(key: string, code: string) {
  if (!currentSettings.enabled || currentSettings.volume <= 0) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Keyb mechanical audio sprite mode (default)
  if (currentSettings.activePack === 'keyb-switch') {
    const soundDef = SOUND_DEFINES_DOWN[code] ?? SOUND_DEFINES_DOWN['KeyA'];
    if (!soundDef) return;

    const buffer = bufferCache.get('/sounds/sound.ogg') || (await fetchAndDecode(ctx, '/sounds/sound.ogg'));
    if (!buffer) return;

    if (activeKeyVoices.has(code)) {
      stopVoice(activeKeyVoices.get(code) || null, ctx, 3);
      activeKeyVoices.delete(code);
    }

    const [startMs, durationMs] = soundDef;
    const voice = playBufferSlice(buffer, startMs / 1000, durationMs / 1000, currentSettings.volume);
    if (voice) {
      activeKeyVoices.set(code, voice);
    }
    return;
  }

  const manifest = MANIFESTS[currentSettings.activePack];
  if (!manifest) return;

  const channel = getKeyChannel(key);

  // Channel-specific interruption: stop ongoing sounds in the same channel
  if (channel === 'enter') {
    stopVoice(activeEnterVoice, ctx, 4);
    activeEnterVoice = null;
  } else if (channel === 'space') {
    stopVoice(activeSpaceVoice, ctx, 4);
    activeSpaceVoice = null;
  } else if (channel === 'back') {
    stopVoice(activeBackVoice, ctx, 4);
    activeBackVoice = null;
  } else {
    // Standard keys: maintain tight 2-voice overlap, damping older voices after ~60ms
    if (activeStandardVoices.length >= 2) {
      const oldest = activeStandardVoices.shift();
      stopVoice(oldest || null, ctx, 6);
    }
  }

  // Also stop any voice previously associated with this specific key
  if (activeKeyVoices.has(code)) {
    stopVoice(activeKeyVoices.get(code) || null, ctx, 3);
    activeKeyVoices.delete(code);
  }

  const url = getPressUrl(manifest, channel);
  const buffer = bufferCache.get(url) || (await fetchAndDecode(ctx, url));
  if (buffer) {
    const voice = playBuffer(buffer, currentSettings.volume);
    if (voice) {
      activeKeyVoices.set(code, voice);

      if (channel === 'enter') activeEnterVoice = voice;
      else if (channel === 'space') activeSpaceVoice = voice;
      else if (channel === 'back') activeBackVoice = voice;
      else activeStandardVoices.push(voice);
    }
  }
}

export async function playKeyRelease(key: string, code: string) {
  if (!currentSettings.enabled || currentSettings.volume <= 0) return;

  const ctx = getAudioContext();
  if (!ctx) return;

  // Keyb mechanical audio sprite mode (default)
  if (currentSettings.activePack === 'keyb-switch') {
    if (activeKeyVoices.has(code)) {
      stopVoice(activeKeyVoices.get(code) || null, ctx, 4);
      activeKeyVoices.delete(code);
    }

    const soundDef = SOUND_DEFINES_UP[code] ?? SOUND_DEFINES_UP['KeyA'];
    if (!soundDef) return;

    const buffer = bufferCache.get('/sounds/sound.ogg') || (await fetchAndDecode(ctx, '/sounds/sound.ogg'));
    if (!buffer) return;

    const [startMs, durationMs] = soundDef;
    playBufferSlice(buffer, startMs / 1000, durationMs / 1000, currentSettings.volume * 0.88);
    return;
  }

  const manifest = MANIFESTS[currentSettings.activePack];
  if (!manifest) return;

  const channel = getKeyChannel(key);

  // Instantly damp the ongoing press sound of this key so release clack takes over cleanly
  if (activeKeyVoices.has(code)) {
    stopVoice(activeKeyVoices.get(code) || null, ctx, 4);
    activeKeyVoices.delete(code);
  }

  // Also damp channel press if still playing
  if (channel === 'enter' && activeEnterVoice) {
    stopVoice(activeEnterVoice, ctx, 4);
    activeEnterVoice = null;
  } else if (channel === 'space' && activeSpaceVoice) {
    stopVoice(activeSpaceVoice, ctx, 4);
    activeSpaceVoice = null;
  } else if (channel === 'back' && activeBackVoice) {
    stopVoice(activeBackVoice, ctx, 4);
    activeBackVoice = null;
  }

  const url = getReleaseUrl(manifest, channel);
  const buffer = bufferCache.get(url) || (await fetchAndDecode(ctx, url));
  if (buffer) {
    // Release sounds are slightly softer (~88% volume)
    const voice = playBuffer(buffer, currentSettings.volume * 0.88);
    if (voice) {
      if (channel === 'enter') activeEnterVoice = voice;
      else if (channel === 'space') activeSpaceVoice = voice;
      else if (channel === 'back') activeBackVoice = voice;
    }
  }
}

/** Play a test sound for modal previews */
export async function playSamplePreview(
  packId: SoundpackId,
  type: 'enter' | 'space' | 'standard' | 'back' = 'enter'
) {
  const ctx = getAudioContext();
  if (!ctx) return;

  // Keyb mechanical audio sprite preview
  if (packId === 'keyb-switch') {
    const code =
      type === 'enter'
        ? 'Enter'
        : type === 'space'
        ? 'Space'
        : type === 'back'
        ? 'Backspace'
        : 'KeyA';
    const downDef = SOUND_DEFINES_DOWN[code] ?? SOUND_DEFINES_DOWN['Enter'];
    const upDef = SOUND_DEFINES_UP[code] ?? SOUND_DEFINES_UP['Enter'];
    const buffer = bufferCache.get('/sounds/sound.ogg') || (await fetchAndDecode(ctx, '/sounds/sound.ogg'));
    if (buffer) {
      playBufferSlice(buffer, downDef[0] / 1000, downDef[1] / 1000, currentSettings.volume);
      setTimeout(() => {
        playBufferSlice(buffer, upDef[0] / 1000, upDef[1] / 1000, currentSettings.volume * 0.88);
      }, downDef[1] + 15);
    }
    return;
  }

  const manifest = MANIFESTS[packId];
  if (!manifest) return;

  const channel: KeyChannel = type;
  const pressUrl = getPressUrl(manifest, channel);
  const releaseUrl = getReleaseUrl(manifest, channel);

  // Play press immediately, then release 85ms later with clean transition
  const pressBuf = bufferCache.get(pressUrl) || (await fetchAndDecode(ctx, pressUrl));
  let pressVoice: ActiveVoice | null = null;
  if (pressBuf) {
    pressVoice = playBuffer(pressBuf, currentSettings.volume);
  }

  setTimeout(async () => {
    if (pressVoice) {
      stopVoice(pressVoice, ctx, 4);
    }
    const releaseBuf = bufferCache.get(releaseUrl) || (await fetchAndDecode(ctx, releaseUrl));
    if (releaseBuf) {
      playBuffer(releaseBuf, currentSettings.volume * 0.88);
    }
  }, 85);
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
    // If the key wasn't registered as pressed, ignore
    if (!activeDownKeys.has(e.code)) {
      return;
    }

    activeDownKeys.delete(e.code);

    // Ignore modifier key releases
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
