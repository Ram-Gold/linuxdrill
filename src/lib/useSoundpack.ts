import { useState, useEffect, useCallback } from 'react';
import {
  getSoundpackSettings,
  saveSoundpackSettings,
  preloadSoundpack,
  playSamplePreview,
  SOUNDPACK_METAS,
  type SoundpackId,
  type SoundpackSettings,
} from './soundpack';

export type { SoundpackId, SoundpackSettings, SoundpackMeta } from './soundpack';


export function useSoundpack() {
  const [settings, setSettings] = useState<SoundpackSettings>(getSoundpackSettings);

  useEffect(() => {
    const handleUpdate = (e: CustomEvent<SoundpackSettings>) => {
      if (e.detail) {
        setSettings(e.detail);
      } else {
        setSettings(getSoundpackSettings());
      }
    };

    window.addEventListener('linuxdrill_sfx_update' as any, handleUpdate as any);
    return () => {
      window.removeEventListener('linuxdrill_sfx_update' as any, handleUpdate as any);
    };
  }, []);

  const updateSettings = useCallback((partial: Partial<SoundpackSettings>) => {
    saveSoundpackSettings(partial);
    if (partial.activePack) {
      preloadSoundpack(partial.activePack);
    }
  }, []);

  const toggleEnabled = useCallback(() => {
    updateSettings({ enabled: !settings.enabled });
  }, [settings.enabled, updateSettings]);

  const setActivePack = useCallback(
    (packId: SoundpackId) => {
      updateSettings({ activePack: packId });
      playSamplePreview(packId, 'enter');
    },
    [updateSettings]
  );

  const setVolume = useCallback(
    (vol: number) => {
      const clamped = Math.max(0, Math.min(1, vol));
      updateSettings({ volume: clamped });
    },
    [updateSettings]
  );

  return {
    settings,
    metas: SOUNDPACK_METAS,
    isEnabled: settings.enabled && settings.volume > 0,
    updateSettings,
    toggleEnabled,
    setActivePack,
    setVolume,
    playPreview: playSamplePreview,
  };
}
