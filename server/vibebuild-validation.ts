import { z } from "zod";

export const saveVendorInputSchema = z.object({
  vendorId: z.number().int().positive(),
  shouldSave: z.boolean(),
});

export const buildBoardSelectionInputSchema = z.object({
  buildId: z.number().int().positive(),
  shouldSave: z.boolean(),
});

export const shareInputSchema = z.object({
  title: z.string().trim().min(3).max(160),
  summary: z.string().trim().max(600).optional(),
  buildIds: z.array(z.number().int().positive()).max(12),
  vendorIds: z.array(z.number().int().positive()).max(24),
}).refine((input) => input.buildIds.length > 0 || input.vendorIds.length > 0, {
  message: "Save at least one build or vendor before sharing",
});

export const inquiryInputSchema = z.object({
  companyId: z.number().int().positive().optional(),
  vendorId: z.number().int().positive().optional(),
  buildId: z.number().int().positive().optional(),
  name: z.string().trim().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().trim().min(7).max(32).optional().or(z.literal("")),
  city: z.string().trim().min(2).max(80),
  message: z.string().trim().min(12).max(1200),
}).refine((input) => Boolean(input.companyId || input.vendorId || input.buildId), {
  message: "Choose a company, vendor, or build before sending an inquiry",
});
