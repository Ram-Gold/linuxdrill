import { useState, useEffect, useCallback } from "react";

export type NavbarPrototypeId = "dock" | "workspace" | "glass";

export interface NavbarPrototypeMeta {
  id: NavbarPrototypeId;
  name: string;
  shortName: string;
  description: string;
  width: string;
}

export const NAVBAR_PROTOTYPES: NavbarPrototypeMeta[] = [
  {
    id: "dock",
    name: "Prototype 1: Capsule Dock",
    shortName: "1: Capsule Dock",
    description: "Compact ~78px floating rail with vertical segmented controls & top points badge",
    width: "78px",
  },
  {
    id: "workspace",
    name: "Prototype 2: Pro Sidebar",
    shortName: "2: Pro Sidebar",
    description: "Full-width ~240px developer workspace drawer with top XP card & rich items",
    width: "240px",
  },
  {
    id: "glass",
    name: "Prototype 3: Floating Glass",
    shortName: "3: Floating Glass",
    description: "Futuristic translucent glassmorphic rail with fluid micro-interactions",
    width: "74px",
  },
];

const STORAGE_KEY = "bashist_navbar_prototype";
const EVENT_KEY = "bashist_navbar_prototype_change";

export function getSavedPrototype(): NavbarPrototypeId {
  if (typeof window === "undefined") return "dock";
  try {
    const urlParam = new URLSearchParams(window.location.search).get("proto");
    if (urlParam === "dock" || urlParam === "workspace" || urlParam === "glass" || urlParam === "1" || urlParam === "2" || urlParam === "3") {
      if (urlParam === "1") return "dock";
      if (urlParam === "2") return "workspace";
      if (urlParam === "3") return "glass";
      return urlParam as NavbarPrototypeId;
    }
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dock" || saved === "workspace" || saved === "glass") {
      return saved;
    }
  } catch {
    // ignore
  }
  return "workspace";
}

export function setSavedPrototype(proto: NavbarPrototypeId) {
  try {
    localStorage.setItem(STORAGE_KEY, proto);
    window.dispatchEvent(new CustomEvent(EVENT_KEY, { detail: proto }));
  } catch {
    // ignore
  }
}

export function useNavbarPrototype() {
  const [prototype, setPrototypeState] = useState<NavbarPrototypeId>(getSavedPrototype);

  useEffect(() => {
    const handleEvent = (e: Event) => {
      const customEvent = e as CustomEvent<NavbarPrototypeId>;
      if (customEvent.detail) {
        setPrototypeState(customEvent.detail);
      } else {
        setPrototypeState(getSavedPrototype());
      }
    };

    window.addEventListener(EVENT_KEY, handleEvent);
    window.addEventListener("storage", handleEvent);
    return () => {
      window.removeEventListener(EVENT_KEY, handleEvent);
      window.removeEventListener("storage", handleEvent);
    };
  }, []);

  const setPrototype = useCallback((proto: NavbarPrototypeId) => {
    setPrototypeState(proto);
    setSavedPrototype(proto);
  }, []);

  return {
    prototype,
    setPrototype,
    prototypes: NAVBAR_PROTOTYPES,
    activeMeta: NAVBAR_PROTOTYPES.find((p) => p.id === prototype) || NAVBAR_PROTOTYPES[0],
  };
}
