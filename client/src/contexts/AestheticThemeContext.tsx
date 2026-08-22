import React, { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

export const AESTHETIC_THEMES = {
  "Soft Power": { page: "#f4f0e9", paper: "#fbf8f2", primary: "#1d1b18", ink: "#2a2119", accent: "#a96834", soft: "#eee0c7", border: "#dccfbe" },
  "Thrift Remix": { page: "#f7ece3", paper: "#fff8f2", primary: "#285a58", ink: "#173a38", accent: "#d05b3c", soft: "#ebc8a5", border: "#d8b9a0" },
  "Heritage Modern": { page: "#f0e6d3", paper: "#fff9ef", primary: "#59371f", ink: "#332419", accent: "#a96f2c", soft: "#d6b17e", border: "#cfb592" },
  "Comfort Official": { page: "#eaf0e9", paper: "#fbfdf8", primary: "#294d42", ink: "#1e342e", accent: "#6e987a", soft: "#cbdcc8", border: "#bfd1bd" },
  "Coastal Ease": { page: "#e7f0ee", paper: "#f9fdfc", primary: "#205963", ink: "#17373d", accent: "#d28853", soft: "#bddbd5", border: "#b4cfca" },
} as const;

export type AestheticName = keyof typeof AESTHETIC_THEMES;
const STORAGE_KEY = "sura-aesthetic-theme";
const defaultAesthetic: AestheticName = "Soft Power";

type AestheticThemeContextValue = { aesthetic: AestheticName; palette: (typeof AESTHETIC_THEMES)[AestheticName]; setAesthetic: (aesthetic: AestheticName) => void; resetAesthetic: () => void };
const AestheticThemeContext = createContext<AestheticThemeContextValue | null>(null);

export function AestheticThemeProvider({ children }: { children: ReactNode }) {
  const [aesthetic, setAestheticState] = useState<AestheticName>(defaultAesthetic);
  const setAesthetic = (next: AestheticName) => setAestheticState(next);
  const resetAesthetic = () => setAestheticState(defaultAesthetic);
  useEffect(() => {
    try { const saved = window.localStorage.getItem(STORAGE_KEY); if (saved && saved in AESTHETIC_THEMES) setAestheticState(saved as AestheticName); } catch { /* The default palette remains usable. */ }
  }, []);
  useEffect(() => {
    const palette = AESTHETIC_THEMES[aesthetic];
    const root = document.documentElement;
    root.dataset.aesthetic = aesthetic.toLowerCase().replace(/\s+/g, "-");
    Object.entries(palette).forEach(([key, value]) => root.style.setProperty(`--sura-${key}`, value));
    try { window.localStorage.setItem(STORAGE_KEY, aesthetic); } catch { /* Theme remains available for this session. */ }
  }, [aesthetic]);
  const value = useMemo(() => ({ aesthetic, palette: AESTHETIC_THEMES[aesthetic], setAesthetic, resetAesthetic }), [aesthetic]);
  return <AestheticThemeContext.Provider value={value}>{children}</AestheticThemeContext.Provider>;
}

export function useAestheticTheme() {
  const context = useContext(AestheticThemeContext);
  if (!context) throw new Error("useAestheticTheme must be used inside AestheticThemeProvider");
  return context;
}
