import { describe, expect, it } from "vitest";
import { aiAssistInputSchema, assertVerifiedReviewEligibility, calculateCommissionBreakdown, calculateDeliveryEstimate, productQuoteInputSchema, verifiedReviewInputSchema } from "./sura-commerce";
import { createVerifiedReview } from "./db";

function reviewDatabase(order?: { id: number; userId: number; status: string; companyId: number; productId: number }, existingReview?: { id: number }) {
  const responses = [order ? [order] : [], existingReview ? [existingReview] : []];
  return {
    select: () => ({ from: () => ({ where: () => ({ limit: async () => responses.shift() ?? [] }) }) }),
    insert: () => ({ values: async () => [{ insertId: 8 }] }),
  };
}

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

  it("accepts up to five unique saved aesthetics as an optional AI creative reference", () => {
    const base = { kind: "home_refresh", purposeConsent: true, brief: "Make my compact living room warmer and ready for relaxed weekend hosting.", city: "Nairobi", budgetKes: 40000 };
    expect(aiAssistInputSchema.safeParse({ ...base, aestheticMix: ["Savanna Atelier", "Ink & Ivory", "Moss & Marigold"] }).success).toBe(true);
    expect(aiAssistInputSchema.safeParse({ ...base, aestheticMix: ["Soft Power", "Thrift Remix", "Heritage Modern", "Comfort Official", "Coastal Ease", "Savanna Atelier"] }).success).toBe(false);
    expect(aiAssistInputSchema.safeParse({ ...base, aestheticMix: ["Soft Power", "Soft Power"] }).success).toBe(false);
  });

  it("keeps delivery estimates transparent when origin and destination differ", () => {
    expect(calculateDeliveryEstimate("Nairobi", "Nairobi")).toMatchObject({ distanceBand: "same_city", deliveryKes: 450 });
    expect(calculateDeliveryEstimate("Nairobi", "Mombasa")).toMatchObject({ distanceBand: "national", deliveryKes: 950 });
  });

  it("accepts only bounded verified-review content; delivered-order ownership remains server-enforced", () => {
    expect(verifiedReviewInputSchema.safeParse({ orderId: 4, rating: 5, comment: "The delivery and product matched the order details." }).success).toBe(true);
    expect(verifiedReviewInputSchema.safeParse({ orderId: 4, rating: 0 }).success).toBe(false);
    expect(verifiedReviewInputSchema.safeParse({ orderId: 4, rating: 6 }).success).toBe(false);
    expect(verifiedReviewInputSchema.safeParse({ orderId: 4, rating: 5, comment: "too short" }).success).toBe(false);
  });

  it("rejects second reviews, wrong users, and non-delivered orders before review insertion", () => {
    const delivered = { userId: 7, status: "delivered" };
    expect(() => assertVerifiedReviewEligibility({ order: delivered, reviewUserId: 7, existingReview: null })).not.toThrow();
    expect(() => assertVerifiedReviewEligibility({ order: delivered, reviewUserId: 7, existingReview: { id: 1 } })).toThrow(/already been submitted/i);
    expect(() => assertVerifiedReviewEligibility({ order: delivered, reviewUserId: 8, existingReview: null })).toThrow(/delivered purchase/i);
    expect(() => assertVerifiedReviewEligibility({ order: { userId: 7, status: "processing" }, reviewUserId: 7, existingReview: null })).toThrow(/delivered purchase/i);
  });

  it("enforces review eligibility through the concrete database helper", async () => {
    const delivered = { id: 14, userId: 7, status: "delivered", companyId: 3, productId: 9 };
    await expect(createVerifiedReview({ orderId: 14, userId: 7, rating: 5 }, reviewDatabase(undefined) as never)).rejects.toThrow(/delivered purchase/i);
    await expect(createVerifiedReview({ orderId: 14, userId: 8, rating: 5 }, reviewDatabase(delivered) as never)).rejects.toThrow(/delivered purchase/i);
    await expect(createVerifiedReview({ orderId: 14, userId: 7, rating: 5 }, reviewDatabase({ ...delivered, status: "processing" }) as never)).rejects.toThrow(/delivered purchase/i);
    await expect(createVerifiedReview({ orderId: 14, userId: 7, rating: 5 }, reviewDatabase(delivered, { id: 2 }) as never)).rejects.toThrow(/already been submitted/i);
    await expect(createVerifiedReview({ orderId: 14, userId: 7, rating: 5 }, reviewDatabase(delivered) as never)).resolves.toMatchObject({ id: 8, persisted: true });
  });
});
