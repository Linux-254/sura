import { describe, expect, it } from "vitest";
import { AESTHETIC_THEMES } from "@/contexts/AestheticThemeContext";
import { meetsNormalTextContrast } from "./aestheticContrast";

describe("SURA aesthetic accessibility", () => {
  it("keeps every aesthetic primary-to-paper pairing readable for normal text", () => {
    Object.entries(AESTHETIC_THEMES).forEach(([name, palette]) => {
      expect(meetsNormalTextContrast(palette.primary, palette.paper), `${name} primary-on-paper contrast`).toBe(true);
      expect(meetsNormalTextContrast(palette.ink, palette.page), `${name} ink-on-page contrast`).toBe(true);
    });
  });
});
