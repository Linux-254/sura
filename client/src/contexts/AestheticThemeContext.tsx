import React, { createContext, type ReactNode, useContext, useEffect, useMemo, useState } from "react";

import { canUseOptionalPreferences, COOKIE_CONSENT_EVENT, readPreferenceCookie, AESTHETIC_MIX_COOKIE, AESTHETIC_THEME_COOKIE, writePreferenceCookie } from "@/lib/privacy";

export const AESTHETIC_THEMES = {
  "Soft Power": { page: "#f4f0e9", paper: "#fbf8f2", primary: "#1d1b18", ink: "#2a2119", accent: "#a96834", soft: "#eee0c7", border: "#dccfbe", "font-display": '"Playfair Display", Georgia, serif', "font-body": '"DM Sans", sans-serif', "font-kicker": '"DM Sans", sans-serif' },
  "Thrift Remix": { page: "#f7ece3", paper: "#fff8f2", primary: "#285a58", ink: "#173a38", accent: "#d05b3c", soft: "#ebc8a5", border: "#d8b9a0", "font-display": '"Space Grotesk", sans-serif', "font-body": '"DM Sans", sans-serif', "font-kicker": '"Space Grotesk", sans-serif' },
  "Heritage Modern": { page: "#f0e6d3", paper: "#fff9ef", primary: "#59371f", ink: "#332419", accent: "#a96f2c", soft: "#d6b17e", border: "#cfb592", "font-display": '"DM Serif Display", Georgia, serif', "font-body": '"Manrope", sans-serif', "font-kicker": '"Manrope", sans-serif' },
  "Comfort Official": { page: "#eaf0e9", paper: "#fbfdf8", primary: "#294d42", ink: "#1e342e", accent: "#6e987a", soft: "#cbdcc8", border: "#bfd1bd", "font-display": '"Fraunces", Georgia, serif', "font-body": '"Manrope", sans-serif', "font-kicker": '"Manrope", sans-serif' },
  "Coastal Ease": { page: "#e7f0ee", paper: "#f9fdfc", primary: "#205963", ink: "#17373d", accent: "#d28853", soft: "#bddbd5", border: "#b4cfca", "font-display": '"Fraunces", Georgia, serif', "font-body": '"DM Sans", sans-serif', "font-kicker": '"DM Sans", sans-serif' },
  "Savanna Atelier": { page: "#ece6dc", paper: "#fffaf2", primary: "#31271f", ink: "#2a2018", accent: "#8a5633", soft: "#dfc5a7", border: "#d5bea6", "font-display": '"DM Serif Display", Georgia, serif', "font-body": '"Manrope", sans-serif', "font-kicker": '"Manrope", sans-serif' },
  "Ink & Ivory": { page: "#efefeb", paper: "#fffefa", primary: "#151515", ink: "#23211f", accent: "#9e7540", soft: "#ddd7ca", border: "#c8c1b5", "font-display": '"Playfair Display", Georgia, serif', "font-body": '"Space Grotesk", sans-serif', "font-kicker": '"Space Grotesk", sans-serif' },
  "Orchid After Dark": { page: "#eee5ed", paper: "#fffbff", primary: "#472a46", ink: "#342132", accent: "#9b5b7f", soft: "#e8cddd", border: "#d8bbce", "font-display": '"Fraunces", Georgia, serif', "font-body": '"DM Sans", sans-serif', "font-kicker": '"Space Grotesk", sans-serif' },
  "Tangerine Social": { page: "#f7ede0", paper: "#fffaf2", primary: "#3b2920", ink: "#372014", accent: "#c8602e", soft: "#f1d4b1", border: "#dfc3a1", "font-display": '"Space Grotesk", sans-serif', "font-body": '"Manrope", sans-serif', "font-kicker": '"Space Grotesk", sans-serif' },
  "Moss & Marigold": { page: "#f0f0df", paper: "#fffdf0", primary: "#405030", ink: "#2e3b24", accent: "#9c7618", soft: "#e2d99f", border: "#d1c785", "font-display": '"DM Serif Display", Georgia, serif', "font-body": '"Manrope", sans-serif', "font-kicker": '"Manrope", sans-serif' },
  "Cobalt Ritual": { page: "#e7edf4", paper: "#fbfdff", primary: "#173d73", ink: "#172f55", accent: "#9b672d", soft: "#c9d7e9", border: "#b8c9dd", "font-display": '"Space Grotesk", sans-serif', "font-body": '"DM Sans", sans-serif', "font-kicker": '"Space Grotesk", sans-serif' },
  "Thermal Bloom": { page: "#f6e8ed", paper: "#fffafd", primary: "#35203d", ink: "#2e1e33", accent: "#cc4a39", soft: "#f0c4cb", border: "#deb5c0", "font-display": '"Fraunces", Georgia, serif', "font-body": '"Space Grotesk", sans-serif', "font-kicker": '"Space Grotesk", sans-serif' },
  "Soft Comfort": { page: "#f3eee6", paper: "#fffaf3", primary: "#5a4738", ink: "#3d3026", accent: "#c28b62", soft: "#ead8c4", border: "#d9c3ab", "font-display": '"Fraunces", Georgia, serif', "font-body": '"DM Sans", sans-serif', "font-kicker": '"DM Sans", sans-serif' },
  "Warm Minimal": { page: "#f1eee8", paper: "#fcfbf7", primary: "#373531", ink: "#262522", accent: "#9a8062", soft: "#e5ded2", border: "#d2c8ba", "font-display": '"DM Serif Display", Georgia, serif', "font-body": '"Manrope", sans-serif', "font-kicker": '"Manrope", sans-serif' },
  "Quiet Utility": { page: "#e9ece8", paper: "#f9fbf7", primary: "#263a37", ink: "#20302d", accent: "#728b7f", soft: "#cddbd2", border: "#bbcec2", "font-display": '"Space Grotesk", sans-serif', "font-body": '"DM Sans", sans-serif', "font-kicker": '"Space Grotesk", sans-serif' },
  "Earthbound Home": { page: "#eee7d9", paper: "#fffaf0", primary: "#4b3827", ink: "#33271d", accent: "#a26f42", soft: "#ddc6a5", border: "#d3b998", "font-display": '"DM Serif Display", Georgia, serif', "font-body": '"Manrope", sans-serif', "font-kicker": '"Manrope", sans-serif' },
  "Bright Play": { page: "#f8efe1", paper: "#fffdf5", primary: "#4d395d", ink: "#34253e", accent: "#ed8b3d", soft: "#f3d5a8", border: "#e3bf94", "font-display": '"Space Grotesk", sans-serif', "font-body": '"DM Sans", sans-serif', "font-kicker": '"Space Grotesk", sans-serif' },
  "Street Archive": { page: "#e7e6e2", paper: "#faf9f5", primary: "#252729", ink: "#1e2021", accent: "#b55b3b", soft: "#d5c9be", border: "#c5b9ae", "font-display": '"Space Grotesk", sans-serif', "font-body": '"DM Sans", sans-serif', "font-kicker": '"Space Grotesk", sans-serif' },
  "Studio Calm": { page: "#e8eef0", paper: "#fbfdfd", primary: "#29404a", ink: "#21343c", accent: "#a87961", soft: "#cadde1", border: "#b9cfd3", "font-display": '"Fraunces", Georgia, serif', "font-body": '"Manrope", sans-serif', "font-kicker": '"Manrope", sans-serif' },
  "Pet Piece": { page: "#f2ecdf", paper: "#fffaf1", primary: "#5b4632", ink: "#3b2c21", accent: "#d0885b", soft: "#ead0b4", border: "#dbc0a0", "font-display": '"Fraunces", Georgia, serif', "font-body": '"DM Sans", sans-serif', "font-kicker": '"DM Sans", sans-serif' },
  "Object Story": { page: "#eee9e3", paper: "#fffdf9", primary: "#3b3532", ink: "#2e2926", accent: "#ab7052", soft: "#dfd0c4", border: "#d1bcae", "font-display": '"DM Serif Display", Georgia, serif', "font-body": '"Manrope", sans-serif', "font-kicker": '"Manrope", sans-serif' },
  "Motion Detail": { page: "#e8edf3", paper: "#fbfdff", primary: "#223b58", ink: "#1b2e45", accent: "#c27d43", soft: "#cbd8e6", border: "#b8c9dc", "font-display": '"Space Grotesk", sans-serif', "font-body": '"DM Sans", sans-serif', "font-kicker": '"Space Grotesk", sans-serif' },
} as const;

export type AestheticName = keyof typeof AESTHETIC_THEMES;
const ACTIVE_STORAGE_KEY = "sura-aesthetic-theme";
const PREFERENCES_STORAGE_KEY = "sura-aesthetic-preferences";
const defaultAesthetic: AestheticName = "Soft Power";

type AestheticThemeContextValue = { aesthetic: AestheticName; palette: (typeof AESTHETIC_THEMES)[AestheticName]; preferenceMix: AestheticName[]; setAesthetic: (aesthetic: AestheticName) => void; setPreferenceMix: (aesthetics: AestheticName[]) => void; resetAesthetic: () => void };
const AestheticThemeContext = createContext<AestheticThemeContextValue | null>(null);

function normaliseMix(values: readonly string[]) {
  const unique = Array.from(new Set(values.filter((value): value is AestheticName => value in AESTHETIC_THEMES))).slice(0, 5);
  return unique.length ? unique : [defaultAesthetic];
}

export function AestheticThemeProvider({ children }: { children: ReactNode }) {
  const [aesthetic, setAestheticState] = useState<AestheticName>(defaultAesthetic);
  const [preferenceMix, setPreferenceMixState] = useState<AestheticName[]>([defaultAesthetic]);
  const setPreferenceMix = (values: AestheticName[]) => { const next = normaliseMix(values); setPreferenceMixState(next); setAestheticState(next[0]); };
  const setAesthetic = (next: AestheticName) => setPreferenceMix([next, ...preferenceMix.filter((value) => value !== next)]);
  const resetAesthetic = () => setPreferenceMix([defaultAesthetic]);
  useEffect(() => {
    if (!canUseOptionalPreferences()) return;
    try {
      const rawMix = readPreferenceCookie(AESTHETIC_MIX_COOKIE) ?? window.localStorage.getItem(PREFERENCES_STORAGE_KEY);
      if (rawMix) setPreferenceMixState(normaliseMix(JSON.parse(rawMix)));
      const saved = readPreferenceCookie(AESTHETIC_THEME_COOKIE) ?? window.localStorage.getItem(ACTIVE_STORAGE_KEY);
      if (saved && saved in AESTHETIC_THEMES) setAestheticState(saved as AestheticName);
    } catch { /* The default palette remains usable. */ }
  }, []);
  useEffect(() => {
    const palette = AESTHETIC_THEMES[aesthetic];
    const root = document.documentElement;
    root.dataset.aesthetic = aesthetic.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    Object.entries(palette).forEach(([key, value]) => root.style.setProperty(`--sura-${key}`, value));
    if (canUseOptionalPreferences()) {
      try { window.localStorage.setItem(ACTIVE_STORAGE_KEY, aesthetic); } catch { /* Theme remains available for this session. */ }
      writePreferenceCookie(AESTHETIC_THEME_COOKIE, aesthetic);
    }
  }, [aesthetic]);
  useEffect(() => {
    const persist = () => {
      if (!canUseOptionalPreferences()) return;
      try { window.localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferenceMix)); } catch { /* Theme remains available for this session. */ }
      writePreferenceCookie(AESTHETIC_MIX_COOKIE, JSON.stringify(preferenceMix));
    };
    persist();
    window.addEventListener(COOKIE_CONSENT_EVENT, persist);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, persist);
  }, [preferenceMix]);
  const value = useMemo(() => ({ aesthetic, palette: AESTHETIC_THEMES[aesthetic], preferenceMix, setAesthetic, setPreferenceMix, resetAesthetic }), [aesthetic, preferenceMix]);
  return <AestheticThemeContext.Provider value={value}>{children}</AestheticThemeContext.Provider>;
}

export function useAestheticTheme() {
  const context = useContext(AestheticThemeContext);
  if (!context) throw new Error("useAestheticTheme must be used inside AestheticThemeProvider");
  return context;
}
