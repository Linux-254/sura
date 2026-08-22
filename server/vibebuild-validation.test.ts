import { describe, expect, it } from "vitest";
import { buildBoardSelectionInputSchema, inquiryInputSchema, shareInputSchema } from "./vibebuild-validation";

describe("VibeBuild action validation", () => {
  it("accepts a save or remove action for a selected curated build", () => {
    expect(buildBoardSelectionInputSchema.safeParse({ buildId: 101, shouldSave: true }).success).toBe(true);
    expect(buildBoardSelectionInputSchema.safeParse({ buildId: 0, shouldSave: true }).success).toBe(false);
  });

  it("requires something meaningful before a board can become public", () => {
    expect(shareInputSchema.safeParse({ title: "Weekend edit", buildIds: [101], vendorIds: [] }).success).toBe(true);
    expect(shareInputSchema.safeParse({ title: "Empty edit", buildIds: [], vendorIds: [] }).success).toBe(false);
  });

  it("validates inquiry context and a message with enough detail to be useful", () => {
    expect(inquiryInputSchema.safeParse({
      vendorId: 1,
      name: "Akinyi",
      email: "akinyi@example.com",
      phone: "0712345678",
      city: "Nairobi",
      message: "I would like to ask about shaping this look for an upcoming work event.",
    }).success).toBe(true);
    expect(inquiryInputSchema.safeParse({
      name: "A",
      city: "Nairobi",
      message: "Too brief",
    }).success).toBe(false);
  });
});
