import { z } from "zod";

export const aiAssistKinds = ["home_refresh", "personal_style", "footwear_fit", "inspiration"] as const;
export const productCategories = ["apparel", "footwear", "home", "accessory"] as const;

export const aiAssistInputSchema = z.object({
  kind: z.enum(aiAssistKinds),
  purposeConsent: z.literal(true),
  brief: z.string().trim().min(12).max(1800),
  city: z.string().trim().min(2).max(80),
  budgetKes: z.number().int().min(500).max(5_000_000),
  sizeProfile: z.string().trim().max(500).optional(),
  imageDataUrl: z.string().regex(/^data:image\/(jpeg|png|webp);base64,/).max(7_000_000).optional(),
});

export const companyProductInputSchema = z.object({
  companyId: z.number().int().positive(),
  name: z.string().trim().min(3).max(160),
  category: z.enum(productCategories),
  description: z.string().trim().min(12).max(3000),
  priceKes: z.number().int().min(50).max(10_000_000),
  imageUrl: z.string().trim().url().max(1000).optional(),
  sizeOptions: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  stockQuantity: z.number().int().min(0).max(100_000),
});

export const productQuoteInputSchema = z.object({
  productId: z.number().int().positive(),
  destinationCity: z.string().trim().min(2).max(80),
  quantity: z.number().int().min(1).max(20).default(1),
});

export const verifiedReviewInputSchema = z.object({
  orderId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(12).max(1000).optional(),
});

export type DeliveryBand = "same_neighbourhood" | "same_city" | "national";

export function calculateDeliveryEstimate(originCity: string | null, destinationCity: string): { distanceBand: DeliveryBand; deliveryKes: number; providerLabel: string } {
  if (!originCity || originCity.toLowerCase() !== destinationCity.toLowerCase()) return { distanceBand: "national", deliveryKes: 950, providerLabel: "National delivery estimate" };
  return { distanceBand: "same_city", deliveryKes: 450, providerLabel: "City delivery estimate" };
}

export function calculateCommissionBreakdown(input: { unitPriceKes: number; quantity: number; commissionRatePct: number; deliveryKes: number }) {
  if (!Number.isInteger(input.unitPriceKes) || input.unitPriceKes <= 0) throw new Error("Product price must be a positive whole-KES amount");
  if (!Number.isInteger(input.quantity) || input.quantity < 1) throw new Error("Quantity must be a positive whole number");
  if (!Number.isInteger(input.commissionRatePct) || input.commissionRatePct < 20 || input.commissionRatePct > 50) throw new Error("SURA commission must be between 20% and 50%");
  if (!Number.isInteger(input.deliveryKes) || input.deliveryKes < 0) throw new Error("Delivery must be a non-negative whole-KES amount");
  const merchandiseSubtotalKes = input.unitPriceKes * input.quantity;
  const commissionKes = Math.round(merchandiseSubtotalKes * input.commissionRatePct / 100);
  const sellerSettlementKes = merchandiseSubtotalKes - commissionKes;
  const customerTotalKes = merchandiseSubtotalKes + input.deliveryKes;
  return { merchandiseSubtotalKes, commissionKes, sellerSettlementKes, deliveryKes: input.deliveryKes, customerTotalKes, commissionRatePct: input.commissionRatePct };
}

export function decodeImageDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp));base64,([A-Za-z0-9+/=]+)$/);
  if (!match) throw new Error("Use a JPEG, PNG, or WebP image");
  const buffer = Buffer.from(match[2], "base64");
  if (buffer.length > 5 * 1024 * 1024) throw new Error("Choose an image smaller than 5 MB");
  return { mimeType: match[1], buffer };
}
