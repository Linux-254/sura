import React, { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { canUseOptionalPreferences, COOKIE_CONSENT_EVENT, readPreferenceCookie, THEME_MODE_COOKIE, writePreferenceCookie } from "@/lib/privacy";

export type ThemeMode = "light" | "dark" | "system";
export type ResolvedTheme = "light" | "dark";

interface ThemeContextType {
  /** Resolved light/dark value kept for existing consumers. */
  theme: ResolvedTheme;
  /** User preference, including system. */
  mode: ThemeMode;
  resolvedTheme: ResolvedTheme;
  setThemeMode: (mode: ThemeMode) => void;
  toggleTheme: () => void;
  switchable: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  switchable?: boolean;
}

function isThemeMode(value: string | undefined): value is ThemeMode {
  return value === "light" || value === "dark" || value === "system";
}

function getStoredMode(defaultTheme: ThemeMode) {
  if (typeof window === "undefined") return defaultTheme;
  const cookieMode = readPreferenceCookie(THEME_MODE_COOKIE);
  return isThemeMode(cookieMode) ? cookieMode : defaultTheme;
}

function systemPrefersDark() {
  return typeof window !== "undefined" && window.matchMedia?.("(prefers-color-scheme: dark)").matches;
}

export function ThemeProvider({ children, defaultTheme = "system", switchable = true }: ThemeProviderProps) {
  const [mode, setMode] = useState<ThemeMode>(() => getStoredMode(defaultTheme));
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>(() => mode === "system" ? (systemPrefersDark() ? "dark" : "light") : mode);

  useEffect(() => {
    const resolve = () => setResolvedTheme(mode === "system" && systemPrefersDark() ? "dark" : mode === "system" ? "light" : mode);
    resolve();
    if (mode !== "system" || typeof window === "undefined" || !window.matchMedia) return;
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const onChange = () => resolve();
    mediaQuery.addEventListener?.("change", onChange);
    return () => mediaQuery.removeEventListener?.("change", onChange);
  }, [mode]);

  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", resolvedTheme === "dark");
    root.dataset.themeMode = mode;
    root.dataset.theme = resolvedTheme;
  }, [mode, resolvedTheme]);

  useEffect(() => {
    const persist = () => {
      if (!switchable || !canUseOptionalPreferences()) return;
      writePreferenceCookie(THEME_MODE_COOKIE, mode);
      try { window.localStorage.setItem("theme", mode); } catch { /* Preference remains available for this session. */ }
    };
    persist();
    window.addEventListener(COOKIE_CONSENT_EVENT, persist);
    return () => window.removeEventListener(COOKIE_CONSENT_EVENT, persist);
  }, [mode, switchable]);

  const toggleTheme = () => setMode((current) => current === "system" ? (resolvedTheme === "dark" ? "light" : "dark") : current === "light" ? "dark" : "light");
  const value = useMemo(() => ({ theme: resolvedTheme, mode, resolvedTheme, setThemeMode: setMode, toggleTheme, switchable }), [mode, resolvedTheme, switchable]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error("useTheme must be used within ThemeProvider");
  return context;
}
