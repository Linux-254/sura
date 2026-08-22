import { z } from "zod";

export const socialPlatforms = ["instagram", "tiktok", "linkedin", "youtube", "x", "website"] as const;
export const paymentOrderTypes = ["company_membership", "vendor_feature", "build_consultation"] as const;
export const contactTypes = ["email", "phone", "whatsapp", "address"] as const;

const platformHosts: Record<Exclude<(typeof socialPlatforms)[number], "website">, string[]> = {
  instagram: ["instagram.com"],
  tiktok: ["tiktok.com"],
  linkedin: ["linkedin.com"],
  youtube: ["youtube.com", "youtu.be"],
  x: ["x.com", "twitter.com"],
};

function isAllowedSocialUrl(platform: (typeof socialPlatforms)[number], rawUrl: string) {
  try {
    const url = new URL(rawUrl);
    if (url.protocol !== "https:") return false;
    if (platform === "website") return true;
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    return platformHosts[platform].some((allowed) => host === allowed || host.endsWith(`.${allowed}`));
  } catch {
    return false;
  }
}

export const socialLinkInputSchema = z.object({
  platform: z.enum(socialPlatforms),
  url: z.string().trim().url().max(500),
  isPublic: z.boolean().default(true),
}).refine((input) => isAllowedSocialUrl(input.platform, input.url), {
  message: "Use a secure URL that matches the selected social platform",
  path: ["url"],
});

export const accountProfileInputSchema = z.object({
  displayName: z.string().trim().min(2).max(120),
  bio: z.string().trim().max(500).optional(),
  city: z.string().trim().max(80).optional(),
  publicSlug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{3,96}$/).optional(),
  isPublic: z.boolean().default(false),
  socialLinks: z.array(socialLinkInputSchema).max(6).default([]),
});

export const companyCreateInputSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().toLowerCase().regex(/^[a-z0-9-]{3,96}$/),
  description: z.string().trim().max(2000).optional(),
  city: z.string().trim().max(80).optional(),
  websiteUrl: z.string().trim().url().max(500).optional(),
  socialLinks: z.array(socialLinkInputSchema).max(6).default([]),
});

export const legalConsentInputSchema = z.object({
  documentType: z.enum(["terms", "privacy"]),
  version: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const paymentOrderInputSchema = z.object({
  orderType: z.enum(paymentOrderTypes),
  companyId: z.number().int().positive().optional(),
});

export const contactInputSchema = z.object({
  label: z.string().trim().min(2).max(80),
  contactType: z.enum(contactTypes),
  value: z.string().trim().min(3).max(320),
  isPublic: z.boolean().default(true),
  sortOrder: z.number().int().min(0).max(50).default(0),
});

export const companyContactsInputSchema = z.object({
  companyId: z.number().int().positive(),
  contacts: z.array(contactInputSchema).max(6),
});

export const discountOfferInputSchema = z.object({
  companyId: z.number().int().positive().optional(),
  code: z.string().trim().toUpperCase().regex(/^[A-Z0-9-]{3,48}$/),
  title: z.string().trim().min(3).max(140),
  description: z.string().trim().max(500).optional(),
  discountType: z.enum(["percentage", "fixed_kes"]),
  discountValue: z.number().int().positive().max(100000),
  minimumSpendKes: z.number().int().min(0).max(10000000).optional(),
  validUntil: z.date().optional(),
}).refine((input) => input.discountType !== "percentage" || input.discountValue <= 100, {
  message: "Percentage discounts cannot exceed 100%",
  path: ["discountValue"],
});

export const announcementInputSchema = z.object({
  title: z.string().trim().min(3).max(160),
  body: z.string().trim().min(5).max(500),
  linkUrl: z.string().trim().url().max(300).optional(),
  isActive: z.boolean().default(true),
});

export const platformContactInputSchema = contactInputSchema;

export const paymentCatalog = {
  company_membership: { amountKes: 2500, label: "Company launch membership" },
  vendor_feature: { amountKes: 1500, label: "Featured local source" },
  build_consultation: { amountKes: 3500, label: "Private build consultation" },
} as const;

export function filterPublicSocialLinks<T extends { isPublic: boolean }>(links: T[]) {
  return links.filter((link) => link.isPublic);
}

export function assertCompanyPaymentOwnership(companyId: number | undefined, ownedCompany: boolean) {
  if (companyId && !ownedCompany) throw new Error("You can only create an order for a company you own");
}

export function isValidPaymentStatusTransition(from: "draft" | "pending" | "paid" | "failed" | "cancelled", to: "draft" | "pending" | "paid" | "failed" | "cancelled") {
  const transitions = {
    draft: ["pending", "cancelled"],
    pending: ["paid", "failed", "cancelled"],
    paid: [],
    failed: [],
    cancelled: [],
  } as const;
  return transitions[from].includes(to as never);
}
