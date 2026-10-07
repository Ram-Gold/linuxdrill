import { useState, useEffect, useCallback } from 'react';

export type NavbarMode = 'always' | 'hover' | 'hide';

export const NAVBAR_MODE_KEY = 'bashist-navbar-mode';
export const LEGACY_NAVBAR_MODE_KEY = 'linuxdrill-navbar-mode';
const NAVBAR_MODE_EVENT = 'bashist-navbar-mode-change';
const LEGACY_NAVBAR_MODE_EVENT = 'linuxdrill-navbar-mode-change';

export function getSavedNavbarMode(): NavbarMode {
  if (typeof window === 'undefined') return 'always';
  try {
    const saved = localStorage.getItem(NAVBAR_MODE_KEY) || localStorage.getItem(LEGACY_NAVBAR_MODE_KEY);
    if (saved === 'always' || saved === 'hover' || saved === 'hide') {
      return saved;
    }
  } catch {
    // ignore storage errors
  }
  return 'always';
}

export function setSavedNavbarMode(mode: NavbarMode) {
  try {
    localStorage.setItem(NAVBAR_MODE_KEY, mode);
    window.dispatchEvent(new CustomEvent(NAVBAR_MODE_EVENT, { detail: mode }));
    window.dispatchEvent(new CustomEvent(LEGACY_NAVBAR_MODE_EVENT, { detail: mode }));
  } catch {
    // ignore storage errors
  }
}

export function useNavbarMode() {
  const [navbarMode, setNavbarModeState] = useState<NavbarMode>(getSavedNavbarMode);

  useEffect(() => {
    const handler = (e: Event) => {
      const customEvent = e as CustomEvent<NavbarMode>;
      if (customEvent.detail) {
        setNavbarModeState(customEvent.detail);
      } else {
        setNavbarModeState(getSavedNavbarMode());
      }
    };

    window.addEventListener(NAVBAR_MODE_EVENT, handler);
    window.addEventListener(LEGACY_NAVBAR_MODE_EVENT, handler);
    window.addEventListener('storage', handler);
    return () => {
      window.removeEventListener(NAVBAR_MODE_EVENT, handler);
      window.removeEventListener(LEGACY_NAVBAR_MODE_EVENT, handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  const setNavbarMode = useCallback((mode: NavbarMode) => {
    setNavbarModeState(mode);
    setSavedNavbarMode(mode);
  }, []);

  return {
    navbarMode,
    setNavbarMode,
    isAlwaysOn: navbarMode === 'always',
    isHovered: navbarMode === 'hover',
    isHide: navbarMode === 'hide',
  };
}
