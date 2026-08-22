import { describe, expect, it } from "vitest";
import { aiAssistInputSchema, calculateCommissionBreakdown, calculateDeliveryEstimate, productQuoteInputSchema } from "./sura-commerce";

describe("SURA AI-commerce safeguards", () => {
  it("calculates an explicit seller, platform, and delivery allocation", () => {
    expect(calculateCommissionBreakdown({ unitPriceKes: 5000, quantity: 2, commissionRatePct: 30, deliveryKes: 450 })).toEqual({
      merchandiseSubtotalKes: 10000,
      commissionKes: 3000,
      sellerSettlementKes: 7000,
      deliveryKes: 450,
      customerTotalKes: 10450,
      commissionRatePct: 30,
    });
  });

  it("holds commission rates within the declared 20% to 50% band", () => {
    expect(() => calculateCommissionBreakdown({ unitPriceKes: 1000, quantity: 1, commissionRatePct: 19, deliveryKes: 0 })).toThrow();
    expect(() => calculateCommissionBreakdown({ unitPriceKes: 1000, quantity: 1, commissionRatePct: 51, deliveryKes: 0 })).toThrow();
    expect(productQuoteInputSchema.safeParse({ productId: 1, destinationCity: "Nairobi" }).success).toBe(true);
  });

  it("requires explicit consent before accepting a private visual-assistance brief", () => {
    const base = { kind: "home_refresh", brief: "Make my compact living room warmer and ready for relaxed weekend hosting.", city: "Nairobi", budgetKes: 40000 };
    expect(aiAssistInputSchema.safeParse({ ...base, purposeConsent: true }).success).toBe(true);
    expect(aiAssistInputSchema.safeParse({ ...base, purposeConsent: false }).success).toBe(false);
  });

  it("keeps delivery estimates transparent when origin and destination differ", () => {
    expect(calculateDeliveryEstimate("Nairobi", "Nairobi")).toMatchObject({ distanceBand: "same_city", deliveryKes: 450 });
    expect(calculateDeliveryEstimate("Nairobi", "Mombasa")).toMatchObject({ distanceBand: "national", deliveryKes: 950 });
  });
});
