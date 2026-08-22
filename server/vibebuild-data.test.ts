import { describe, expect, it } from "vitest";
import { filterDemoVendors, getBuildRecommendation } from "./vibebuild-data";

describe("VibeBuild demo matching", () => {
  it("selects an in-budget plan when one is available", () => {
    const recommendation = getBuildRecommendation({
      budgetKes: 10000,
      city: "Nairobi",
      lifestyle: "Creative Work",
      aesthetic: "Soft Power",
      priority: "Polish",
    });

    expect(recommendation.withinBudget).toBe(true);
    expect(recommendation.build.slug).toBe("the-nairobi-after-five");
  });

  it("finds vendors using combined city and aesthetic filters", () => {
    const vendors = filterDemoVendors({ city: "Nairobi", aesthetic: "Heritage Modern" });
    expect(vendors.map((vendor) => vendor.slug)).toContain("ember-thread-atelier");
    expect(vendors.map((vendor) => vendor.slug)).toContain("northline-makers");
  });

  it("uses a bounded aesthetic mix to rank and explain the local build direction without changing demo facts", () => {
    const recommendation = getBuildRecommendation({
      budgetKes: 16000,
      city: "Nairobi",
      lifestyle: "Home Refresh",
      aesthetic: "Soft Power",
      aestheticMix: ["Soft Power", "Heritage Modern", "Coastal Ease"],
      priority: "Warmth",
    });
    expect(recommendation.build.slug).toBe("the-one-room-reset");
    expect(recommendation.personalisationNote).toContain("Soft Power · Heritage Modern · Coastal Ease");
    expect(recommendation.personalisationNote).toContain("not the demo vendors, prices, or availability");
    expect(recommendation.personalisationNote).toContain("active direction leads this plan");
  });
});
