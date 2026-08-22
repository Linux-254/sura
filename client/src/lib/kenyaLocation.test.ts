import { describe, expect, it } from "vitest";
import { isKenyanCity, isWithinKenya, locationFallbackMessage, resolveKenyanLocation } from "./kenyaLocation";

describe("Kenya location resolution", () => {
  it("matches coordinates in Nairobi to Nairobi", () => {
    expect(resolveKenyanLocation(-1.2864, 36.8172)).toMatchObject({ inKenya: true, city: "Nairobi" });
  });

  it("matches coordinates in Mombasa to Mombasa", () => {
    expect(resolveKenyanLocation(-4.0435, 39.6682)).toMatchObject({ inKenya: true, city: "Mombasa" });
  });

  it("does not treat foreign coordinates as a Kenyan city", () => {
    expect(isWithinKenya(-1.2921, 36.8219)).toBe(true);
    expect(resolveKenyanLocation(-1.2921, 36.8219).city).toBe("Nairobi");
    expect(resolveKenyanLocation(-6.7924, 39.2083)).toEqual({ inKenya: false, city: null, distanceKm: null });
  });

  it("supports a manual Kenyan city selection and clear permission fallbacks", () => {
    expect(isKenyanCity("Kisumu")).toBe(true);
    expect(isKenyanCity("Eldoret")).toBe(false);
    expect(locationFallbackMessage("denied")).toContain("optional");
    expect(locationFallbackMessage("unsupported")).toContain("browser");
    expect(locationFallbackMessage("outside_kenya")).toContain("outside Kenya");
  });
});
