import { describe, expect, it } from "vitest";
import { assertCompanyPaymentOwnership, filterPublicSocialLinks, isValidPaymentStatusTransition, paymentOrderInputSchema, socialLinkInputSchema } from "./sura-validation";

describe("SURA security validation", () => {
  it("accepts only secure URLs that match the social platform selected", () => {
    expect(socialLinkInputSchema.safeParse({ platform: "instagram", url: "https://instagram.com/sura.local", isPublic: true }).success).toBe(true);
    expect(socialLinkInputSchema.safeParse({ platform: "instagram", url: "https://evil.example/sura", isPublic: true }).success).toBe(false);
    expect(socialLinkInputSchema.safeParse({ platform: "website", url: "https://studio.example", isPublic: false }).success).toBe(true);
    expect(socialLinkInputSchema.safeParse({ platform: "website", url: "http://studio.example", isPublic: false }).success).toBe(false);
  });

  it("limits payment-order requests to a defined catalog of server-priced services", () => {
    expect(paymentOrderInputSchema.safeParse({ orderType: "company_membership" }).success).toBe(true);
    expect(paymentOrderInputSchema.safeParse({ orderType: "custom_amount", amountKes: 1 }).success).toBe(false);
  });

  it("retains only links explicitly approved for public profile display", () => {
    const visible = filterPublicSocialLinks([{ url: "https://instagram.com/sura", isPublic: true }, { url: "https://linkedin.com/in/private", isPublic: false }]);
    expect(visible).toEqual([{ url: "https://instagram.com/sura", isPublic: true }]);
  });

  it("denies payment orders for companies the current user does not own", () => {
    expect(() => assertCompanyPaymentOwnership(14, false)).toThrow("only create an order");
    expect(() => assertCompanyPaymentOwnership(14, true)).not.toThrow();
  });

  it("keeps payment-order states moving forward and never changes final outcomes", () => {
    expect(isValidPaymentStatusTransition("draft", "pending")).toBe(true);
    expect(isValidPaymentStatusTransition("pending", "paid")).toBe(true);
    expect(isValidPaymentStatusTransition("paid", "pending")).toBe(false);
    expect(isValidPaymentStatusTransition("cancelled", "paid")).toBe(false);
  });
});
