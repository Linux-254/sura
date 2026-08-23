// @vitest-environment jsdom
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { AestheticPicker } from "./AestheticPicker";

const setAesthetic = vi.fn();
const resetAesthetic = vi.fn();

afterEach(() => {
  cleanup();
  setAesthetic.mockClear();
  resetAesthetic.mockClear();
});

vi.mock("@/contexts/AestheticThemeContext", () => ({
  AESTHETIC_THEMES: {
    "Soft Power": { primary: "#111", accent: "#b66", soft: "#eee" },
    "Thermal Bloom": { primary: "#222", accent: "#c77", soft: "#ddd" },
    "Cobalt Ritual": { primary: "#333", accent: "#d88", soft: "#ccc" },
    "Coastal Ease": { primary: "#444", accent: "#e99", soft: "#bbb" },
  },
  useAestheticTheme: () => ({ aesthetic: "Soft Power", setAesthetic, resetAesthetic }),
}));

describe("SURA aesthetic picker", () => {
  it("uses a compact, horizontally scrollable mobile list while keeping the first three theme cards available immediately", () => {
    render(<AestheticPicker />);
    fireEvent.click(screen.getByRole("button", { name: "Soft Power" }));
    expect(screen.getByRole("dialog", { name: /Choose your visual direction/i })).toBeTruthy();
    const list = screen.getByTestId("mobile-theme-scroll-list");
    expect(list.className).toContain("overflow-x-auto");
    expect(list.className).toContain("snap-x");
    expect(screen.getByText(/Three themes show first/i)).toBeTruthy();
    expect(screen.getByText("Thermal Bloom")).toBeTruthy();
    expect(screen.getByText("Cobalt Ritual")).toBeTruthy();
  });

  it("selects a scrolled theme and closes the compact list", () => {
    render(<AestheticPicker />);
    fireEvent.click(screen.getByRole("button", { name: "Soft Power" }));
    fireEvent.click(screen.getByRole("button", { name: /Coastal Ease/i }));
    expect(setAesthetic).toHaveBeenCalledWith("Coastal Ease");
    expect(screen.queryByRole("dialog", { name: /Choose your visual direction/i })).toBeNull();
  });
});
