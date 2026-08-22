/** @vitest-environment jsdom */
import React from "react";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { AestheticThemeProvider, useAestheticTheme } from "./AestheticThemeContext";

function ThemeProbe() {
  const { aesthetic, palette, preferenceMix, resetAesthetic, setAesthetic, setPreferenceMix } = useAestheticTheme();
  return <div><output data-testid="aesthetic">{aesthetic}</output><output data-testid="primary">{palette.primary}</output><output data-testid="mix">{preferenceMix.join("|")}</output><button onClick={() => setAesthetic("Coastal Ease")}>Choose coastal</button><button onClick={() => setPreferenceMix(["Moss & Marigold", "Cobalt Ritual", "Thermal Bloom", "Ink & Ivory", "Savanna Atelier", "Soft Power"])}>Choose five</button><button onClick={resetAesthetic}>Reset</button></div>;
}

beforeEach(() => {
  window.localStorage.clear();
  document.documentElement.removeAttribute("data-aesthetic");
});
afterEach(cleanup);

describe("SURA aesthetic theme provider", () => {
  it("persists an aesthetic choice and applies its colour tokens to the document", () => {
    render(<AestheticThemeProvider><ThemeProbe /></AestheticThemeProvider>);
    fireEvent.click(screen.getByText("Choose coastal"));
    expect(screen.getByTestId("aesthetic").textContent).toBe("Coastal Ease");
    expect(screen.getByTestId("primary").textContent).toBe("#205963");
    expect(window.localStorage.getItem("sura-aesthetic-theme")).toBe("Coastal Ease");
    expect(document.documentElement.dataset.aesthetic).toBe("coastal-ease");
    expect(document.documentElement.style.getPropertyValue("--sura-primary")).toBe("#205963");
  });

  it("resets the visual direction to Soft Power", () => {
    render(<AestheticThemeProvider><ThemeProbe /></AestheticThemeProvider>);
    fireEvent.click(screen.getByText("Choose coastal"));
    fireEvent.click(screen.getByText("Reset"));
    expect(screen.getByTestId("aesthetic").textContent).toBe("Soft Power");
    expect(window.localStorage.getItem("sura-aesthetic-theme")).toBe("Soft Power");
  });

  it("keeps a primary direction and persists no more than five expression preferences", () => {
    render(<AestheticThemeProvider><ThemeProbe /></AestheticThemeProvider>);
    fireEvent.click(screen.getByText("Choose five"));
    expect(screen.getByTestId("aesthetic").textContent).toBe("Moss & Marigold");
    expect(screen.getByTestId("mix").textContent).toBe("Moss & Marigold|Cobalt Ritual|Thermal Bloom|Ink & Ivory|Savanna Atelier");
    expect(JSON.parse(window.localStorage.getItem("sura-aesthetic-preferences") ?? "[]")).toHaveLength(5);
  });
});
