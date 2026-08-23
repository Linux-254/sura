// @vitest-environment jsdom

import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, beforeEach } from "vitest";
import { ThemeProvider, useTheme } from "./ThemeContext";
import { setCookieConsent } from "@/lib/privacy";

function ThemeProbe() {
  const { mode, theme, setThemeMode } = useTheme();
  return <div><span data-testid="mode">{mode}</span><span data-testid="resolved">{theme}</span><button onClick={() => setThemeMode("dark")}>dark</button><button onClick={() => setThemeMode("system")}>system</button></div>;
}

describe("Sura theme mode", () => {
  beforeEach(() => {
    cleanup();
    document.cookie = "sura_cookie_consent=; Max-Age=0; Path=/";
    document.cookie = "sura_theme_mode=; Max-Age=0; Path=/";
    window.localStorage.clear();
    document.documentElement.className = "";
  });

  it("starts in system mode and resolves to a usable light fallback", () => {
    render(<ThemeProvider defaultTheme="system" switchable><ThemeProbe /></ThemeProvider>);
    expect(screen.getByTestId("mode").textContent).toBe("system");
    expect(screen.getByTestId("resolved").textContent).toBe("light");
    expect(document.documentElement.dataset.themeMode).toBe("system");
  });

  it("applies a dark selection immediately without writing optional preference storage before consent", () => {
    render(<ThemeProvider defaultTheme="system" switchable><ThemeProbe /></ThemeProvider>);
    fireEvent.click(screen.getByText("dark"));
    expect(document.documentElement.classList.contains("dark")).toBe(true);
    expect(document.cookie).not.toContain("sura_theme_mode");
    expect(window.localStorage.getItem("theme")).toBeNull();
  });

  it("persists the selected mode after optional cookies are accepted", () => {
    setCookieConsent("accepted");
    render(<ThemeProvider defaultTheme="system" switchable><ThemeProbe /></ThemeProvider>);
    fireEvent.click(screen.getByText("dark"));
    expect(document.cookie).toContain("sura_theme_mode=dark");
    expect(window.localStorage.getItem("theme")).toBe("dark");
  });
});
