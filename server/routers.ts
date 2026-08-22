import { COOKIE_NAME } from "@shared/const";
import { nanoid } from "nanoid";
import { z } from "zod";
import { createBuildShareRecord, createCompanyForUser, createInquiryRecord, createPaymentOrder, getAccountProfile, getAdminCompanyReviewQueue, getBoardSelections, getBuildShareRecord, getCompaniesForUser, getCompanyMembership, getCompanyOwnedByUser, getPaymentOrdersForUser, getPublicAccountProfile, getPublicCompanyProfile, getSavedVendorIds, recordLegalConsent, toggleBuildBoardSelection, toggleSavedVendor, updateCompanyReviewStatus, upsertAccountProfile } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { demoBuilds, demoVendors, filterDemoVendors, getBuildRecommendation, getVendorBySlug } from "./vibebuild-data";
import { buildBoardSelectionInputSchema, inquiryInputSchema, saveVendorInputSchema, shareInputSchema } from "./vibebuild-validation";
import { accountProfileInputSchema, assertCompanyPaymentOwnership, companyCreateInputSchema, legalConsentInputSchema, paymentCatalog, paymentOrderInputSchema } from "./sura-validation";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  vendors: router({
    list: publicProcedure.input(z.object({
      search: z.string().optional(),
      city: z.string().optional(),
      type: z.string().optional(),
      budgetTier: z.string().optional(),
      aesthetic: z.string().optional(),
    }).optional()).query(({ input }) => filterDemoVendors(input ?? {})),
    bySlug: publicProcedure.input(z.object({ slug: z.string().min(1) })).query(({ input }) => {
      const vendor = getVendorBySlug(input.slug);
      if (!vendor) throw new Error("Vendor profile not found");
      return vendor;
    }),
  }),
  builds: router({
    list: publicProcedure.query(() => demoBuilds),
    recommend: publicProcedure.input(z.object({
      budgetKes: z.number().int().min(500).max(500000),
      city: z.string().min(1),
      lifestyle: z.string().min(1),
      aesthetic: z.string().min(1),
      priority: z.string().min(1),
    })).query(({ input }) => getBuildRecommendation(input)),
  }),
  board: router({
    savedVendorIds: protectedProcedure.query(({ ctx }) => getSavedVendorIds(ctx.user.id)),
    selections: protectedProcedure.query(({ ctx }) => getBoardSelections(ctx.user.id)),
    saveVendor: protectedProcedure.input(saveVendorInputSchema).mutation(({ ctx, input }) => toggleSavedVendor(ctx.user.id, input.vendorId, input.shouldSave)),
    saveBuild: protectedProcedure.input(buildBoardSelectionInputSchema).mutation(({ ctx, input }) => toggleBuildBoardSelection(ctx.user.id, input.buildId, input.shouldSave)),
  }),
  shares: router({
    create: protectedProcedure.input(shareInputSchema).mutation(async ({ ctx, input }) => {
      const shareToken = nanoid(12);
      return createBuildShareRecord({ userId: ctx.user.id, shareToken, ...input });
    }),
    byToken: publicProcedure.input(z.object({ token: z.string().min(8).max(48) })).query(async ({ input }) => {
      const record = await getBuildShareRecord(input.token);
      if (!record) throw new Error("This shared build is not available");
      const buildIds = record.items.map((item) => item.buildId).filter((id): id is number => id !== null);
      const vendorIds = record.items.map((item) => item.vendorId).filter((id): id is number => id !== null);
      return {
        title: record.share.title,
        summary: record.share.summary,
        createdAt: record.share.createdAt,
        builds: demoBuilds.filter((build) => buildIds.includes(build.id)),
        vendors: demoVendors.filter((vendor) => vendorIds.includes(vendor.id)),
      };
    }),
  }),
  inquiries: router({
    create: publicProcedure.input(inquiryInputSchema).mutation(async ({ ctx, input }) => {
      const result = await createInquiryRecord({
        userId: ctx.user?.id,
        vendorId: input.vendorId,
        buildId: input.buildId,
        name: input.name,
        email: input.email || null,
        phone: input.phone || null,
        city: input.city,
        message: input.message,
      });
      return { success: true, ...result };
    }),
  }),
  account: router({
    profile: protectedProcedure.query(({ ctx }) => getAccountProfile(ctx.user.id)),
    publicProfile: publicProcedure.input(z.object({ slug: z.string().regex(/^[a-z0-9-]{3,96}$/) })).query(async ({ input }) => {
      const profile = await getPublicAccountProfile(input.slug);
      if (!profile) throw new Error("This public profile is not available");
      return profile;
    }),
    updateProfile: protectedProcedure.input(accountProfileInputSchema).mutation(({ ctx, input }) => upsertAccountProfile({ userId: ctx.user.id, ...input })),
    acceptLegal: protectedProcedure.input(legalConsentInputSchema).mutation(({ ctx, input }) => recordLegalConsent(ctx.user.id, input.documentType, input.version)),
  }),
  companies: router({
    mine: protectedProcedure.query(({ ctx }) => getCompaniesForUser(ctx.user.id)),
    publicProfile: publicProcedure.input(z.object({ slug: z.string().regex(/^[a-z0-9-]{3,96}$/) })).query(async ({ input }) => {
      const company = await getPublicCompanyProfile(input.slug);
      if (!company) throw new Error("This company profile is not available");
      return company;
    }),
    membership: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const membership = await getCompanyMembership(input.companyId, ctx.user.id);
      if (!membership) throw new Error("You do not have access to this company studio");
      return membership;
    }),
    create: protectedProcedure.input(companyCreateInputSchema).mutation(({ ctx, input }) => createCompanyForUser({ ownerUserId: ctx.user.id, ...input })),
  }),
  payments: router({
    catalog: protectedProcedure.query(() => paymentCatalog),
    mine: protectedProcedure.query(({ ctx }) => getPaymentOrdersForUser(ctx.user.id)),
    createOrder: protectedProcedure.input(paymentOrderInputSchema).mutation(async ({ ctx, input }) => {
      if (input.companyId) {
        const company = await getCompanyOwnedByUser(input.companyId, ctx.user.id);
        assertCompanyPaymentOwnership(input.companyId, Boolean(company));
      }
      const offer = paymentCatalog[input.orderType];
      const reference = `sura_${nanoid(18)}`;
      return createPaymentOrder({ userId: ctx.user.id, companyId: input.companyId, orderType: input.orderType, amountKes: offer.amountKes, reference });
    }),
  }),
  admin: router({
    companyReviewQueue: adminProcedure.query(() => getAdminCompanyReviewQueue()),
    setCompanyReviewStatus: adminProcedure.input(z.object({ companyId: z.number().int().positive(), verificationStatus: z.enum(["draft", "pending", "verified", "rejected"]) })).mutation(({ input }) => updateCompanyReviewStatus(input.companyId, input.verificationStatus)),
  }),
});

export type AppRouter = typeof appRouter;
