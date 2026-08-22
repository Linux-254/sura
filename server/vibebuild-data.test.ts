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
});
