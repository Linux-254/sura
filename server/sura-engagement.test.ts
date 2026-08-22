import { describe, expect, it } from "vitest";
import { announcementInputSchema, contactInputSchema, discountOfferInputSchema } from "./sura-validation";

describe("SURA engagement controls", () => {
  it("accepts a public-safe company contact route", () => {
    expect(contactInputSchema.safeParse({ label: "Bookings", contactType: "whatsapp", value: "+254712345678", isPublic: true, sortOrder: 0 }).success).toBe(true);
    expect(contactInputSchema.safeParse({ label: "", contactType: "email", value: "x" }).success).toBe(false);
  });

  it("keeps discount offers inside clear value boundaries", () => {
    expect(discountOfferInputSchema.safeParse({ code: "WELCOME10", title: "A warm first visit", discountType: "percentage", discountValue: 10 }).success).toBe(true);
    expect(discountOfferInputSchema.safeParse({ code: "TOOMUCH", title: "Invalid percentage", discountType: "percentage", discountValue: 101 }).success).toBe(false);
  });

  it("requires concise, actionable platform notifications", () => {
    expect(announcementInputSchema.safeParse({ title: "New local offers", body: "A considered collection of verified studio offers is now live.", isActive: true }).success).toBe(true);
    expect(announcementInputSchema.safeParse({ title: "Hi", body: "No" }).success).toBe(false);
  });
});
