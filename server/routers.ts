import { COOKIE_NAME } from "@shared/const";
import { nanoid } from "nanoid";
import { z } from "zod";
import { completeAiAssistRequest, createAiAssistRequest, createBuildShareRecord, createCompanyForUser, createCompanyPost, createCompanyProduct, createCommerceOrder, createDeliveryQuote, createDiscountOffer, createInquiryRecord, createPaymentOrder, createPlatformAnnouncement, createVerifiedReview, failAiAssistRequest, getAccountProfile, getActiveAuthVisualSet, getAdminCompanyPostReviewQueue, getAdminCompanyReviewQueue, getAdminDiscountReviewQueue, getAestheticPreferences, getAiAssistRequestForUser, getBoardSelections, getBuildShareRecord, getCompaniesForUser, getCompanyContacts, getCompanyMembership, getCompanyOwnedByUser, getCompanyPostsForOwner, getCompanyProduct, getCompanyProducts, getCommerceOrdersForUser, getCompanySocialSummary, getDiscountOffersForCompany, getOrCreateFreeMembership, getPaymentOrdersForUser, getProductById, getPublicAccountProfile, getPublicCompanyProfile, getPublicCompanyPosts, getPublicDiscountOffers, getPublicPlatformContacts, getPublicProducts, getSavedVendorIds, getSocialFeed, getUserSocialSummary, getWebNotificationFeed, markWebNotificationRead, recordAiImageConsent, recordLegalConsent, publishAuthVisualSet, replaceCompanyContacts, replacePlatformContacts, setAestheticPreferences, toggleBuildBoardSelection, toggleCompanyFollow, togglePostLike, togglePostRepost, toggleSavedVendor, toggleUserFollow, updateCompanyCommissionRate, updateCompanyPostStatus, updateCompanyReviewStatus, updateDiscountOfferReviewStatus, upsertAccountProfile } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { demoBuilds, demoVendors, filterDemoVendors, getBuildRecommendation, getVendorBySlug } from "./vibebuild-data";
import { buildBoardSelectionInputSchema, inquiryInputSchema, saveVendorInputSchema, shareInputSchema } from "./vibebuild-validation";
import { accountProfileInputSchema, aestheticPreferencesInputSchema, announcementInputSchema, assertCompanyPaymentOwnership, companyContactsInputSchema, companyCreateInputSchema, contactInputSchema, discountOfferInputSchema, legalConsentInputSchema, paymentCatalog, paymentOrderInputSchema, selectableAesthetics } from "./sura-validation";
import { aiAssistInputSchema, calculateCommissionBreakdown, calculateDeliveryEstimate, companyProductInputSchema, productQuoteInputSchema, verifiedReviewInputSchema } from "./sura-commerce";
import { createAiAssistPlan, storeConsentImage } from "./sura-ai-service";
import { assertPersonalEditCollectionOwnership, createPersonalEditCollection, createPersonalEditItem, getPersonalEditCollectionsForUser, getPersonalEditItemsForUser } from "./db";
import { personalEditCollectionInputSchema, personalEditItemInputSchema } from "./sura-validation";
import { storePrivatePersonalEditImage } from "./personal-edit";
import { storeCompanyPostImage } from "./post-media";
import { storeCompanyProductImage } from "./product-media";
import { storeAuthVisualImage } from "./auth-visuals";
import { getUserByOpenId, upsertUser } from "./db";
import { sdk } from "./_core/sdk";
import { verifySupabaseAccessToken } from "./supabase-auth";

export const appRouter = router({
    // if you need to use socket.io, read and register route in server/_core/index.ts, all api should start with '/api/' so that the gateway can route correctly
  system: systemRouter,
  public: router({
    authVisuals: publicProcedure.query(() => getActiveAuthVisualSet()),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    exchangeSupabaseSession: publicProcedure
      .input(z.object({ accessToken: z.string().trim().min(20).max(8192) }))
      .mutation(async ({ ctx, input }) => {
        const identity = await verifySupabaseAccessToken(input.accessToken);
        const openId = `supabase:${identity.id}`;
        const signedInAt = new Date();

        await upsertUser({
          openId,
          email: identity.email,
          name: identity.name,
          loginMethod: "supabase_email",
          lastSignedIn: signedInAt,
        });

        const user = await getUserByOpenId(openId);
        if (!user) throw new Error("Unable to create your Sura account");

        const sessionToken = await sdk.createSessionToken(openId, {
          name: user.name ?? identity.name ?? "",
        });
        ctx.res.cookie(COOKIE_NAME, sessionToken, getSessionCookieOptions(ctx.req));

        return {
          success: true,
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
          },
        } as const;
      }),
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
  social: router({
    feed: publicProcedure.input(z.object({ mode: z.enum(["forYou", "following"]).default("forYou") }).optional()).query(({ ctx, input }) => getSocialFeed(ctx.user?.id, input?.mode ?? "forYou")),
    profile: publicProcedure.input(z.object({ kind: z.enum(["person", "company"]), id: z.number().int().positive() })).query(({ ctx, input }) => input.kind === "person" ? getUserSocialSummary(input.id, ctx.user?.id) : getCompanySocialSummary(input.id, ctx.user?.id)),
    companyPosts: publicProcedure.input(z.object({ companyId: z.number().int().positive() })).query(({ ctx, input }) => getPublicCompanyPosts(input.companyId, ctx.user?.id)),
    followUser: protectedProcedure.input(z.object({ userId: z.number().int().positive(), shouldFollow: z.boolean() })).mutation(({ ctx, input }) => toggleUserFollow(ctx.user.id, input.userId, input.shouldFollow)),
    followCompany: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), shouldFollow: z.boolean() })).mutation(({ ctx, input }) => toggleCompanyFollow(ctx.user.id, input.companyId, input.shouldFollow)),
    likePost: protectedProcedure.input(z.object({ postId: z.number().int().positive(), shouldLike: z.boolean() })).mutation(({ ctx, input }) => togglePostLike(ctx.user.id, input.postId, input.shouldLike)),
    repostPost: protectedProcedure.input(z.object({ postId: z.number().int().positive(), shouldRepost: z.boolean(), note: z.string().trim().max(280).optional() })).mutation(({ ctx, input }) => togglePostRepost(ctx.user.id, input.postId, input.shouldRepost, input.note)),
  }),
  builds: router({
    list: publicProcedure.query(() => demoBuilds),
    recommend: publicProcedure.input(z.object({
      budgetKes: z.number().int().min(500).max(500000),
      city: z.string().min(1),
      lifestyle: z.string().min(1),
      aesthetic: z.string().min(1),
      aestheticMix: z.array(z.enum(selectableAesthetics)).max(5).default([]).refine((aesthetics) => new Set(aesthetics).size === aesthetics.length, { message: "Each aesthetic can only appear once" }),
      priority: z.string().min(1),
    })).query(({ input }) => getBuildRecommendation(input)),
  }),
  board: router({
    savedVendorIds: protectedProcedure.query(({ ctx }) => getSavedVendorIds(ctx.user.id)),
    selections: protectedProcedure.query(({ ctx }) => getBoardSelections(ctx.user.id)),
    saveVendor: protectedProcedure.input(saveVendorInputSchema).mutation(({ ctx, input }) => toggleSavedVendor(ctx.user.id, input.vendorId, input.shouldSave)),
    saveBuild: protectedProcedure.input(buildBoardSelectionInputSchema).mutation(({ ctx, input }) => toggleBuildBoardSelection(ctx.user.id, input.buildId, input.shouldSave)),
  }),
  personalEdits: router({
    collections: protectedProcedure.query(({ ctx }) => getPersonalEditCollectionsForUser(ctx.user.id)),
    items: protectedProcedure.input(z.object({ collectionId: z.number().int().positive().optional() }).optional()).query(({ ctx, input }) => getPersonalEditItemsForUser({ userId: ctx.user.id, collectionId: input?.collectionId })),
    createCollection: protectedProcedure.input(personalEditCollectionInputSchema).mutation(({ ctx, input }) => createPersonalEditCollection({ userId: ctx.user.id, ...input })),
    createItem: protectedProcedure.input(personalEditItemInputSchema).mutation(async ({ ctx, input }) => {
      await assertPersonalEditCollectionOwnership(ctx.user.id, input.collectionId);
      const storedImage = input.imageDataUrl ? await storePrivatePersonalEditImage(ctx.user.id, input.imageDataUrl) : undefined;
      return createPersonalEditItem({
        userId: ctx.user.id,
        collectionId: input.collectionId,
        itemType: input.itemType,
        title: input.title,
        note: input.note,
        tags: JSON.stringify(input.tags),
        imageKey: storedImage?.key,
        imageUrl: storedImage?.url,
        analysisConsentAt: input.analysisConsent ? new Date() : undefined,
      });
    }),
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
    aestheticPreferences: protectedProcedure.query(({ ctx }) => getAestheticPreferences(ctx.user.id)),
    setAestheticPreferences: protectedProcedure.input(aestheticPreferencesInputSchema).mutation(({ ctx, input }) => setAestheticPreferences(ctx.user.id, input.aesthetics)),
    publicProfile: publicProcedure.input(z.object({ slug: z.string().regex(/^[a-z0-9-]{3,96}$/) })).query(async ({ input }) => {
      const profile = await getPublicAccountProfile(input.slug);
      if (!profile) throw new Error("This public profile is not available");
      return profile;
    }),
    updateProfile: protectedProcedure.input(accountProfileInputSchema).mutation(({ ctx, input }) => upsertAccountProfile({ userId: ctx.user.id, ...input })),
    acceptLegal: protectedProcedure.input(legalConsentInputSchema).mutation(({ ctx, input }) => recordLegalConsent(ctx.user.id, input.documentType, input.version)),
  }),
  membership: router({
    mine: protectedProcedure.query(({ ctx }) => getOrCreateFreeMembership(ctx.user.id)),
  }),
  notifications: router({
    feed: protectedProcedure.query(({ ctx }) => getWebNotificationFeed(ctx.user.id)),
    markRead: protectedProcedure.input(z.object({ notificationId: z.number().int().positive(), dismissed: z.boolean().default(false) })).mutation(({ ctx, input }) => markWebNotificationRead(ctx.user.id, input.notificationId, input.dismissed)),
  }),
  contacts: router({
    platform: publicProcedure.query(() => getPublicPlatformContacts()),
  }),
  offers: router({
    public: publicProcedure.query(() => getPublicDiscountOffers()),
  }),
  commerce: router({
    products: publicProcedure.input(z.object({ category: z.enum(["apparel", "footwear", "home", "accessory"]).optional(), city: z.string().optional() }).optional()).query(({ input }) => getPublicProducts(input ?? {})),
    product: publicProcedure.input(z.object({ productId: z.number().int().positive() })).query(({ input }) => getProductById(input.productId)),
    aiAssist: protectedProcedure.input(aiAssistInputSchema).mutation(async ({ ctx, input }) => {
      const consent = await recordAiImageConsent(ctx.user.id, input.kind);
      if (!consent.persisted || !consent.id) throw new Error("Unable to record your image consent");
      let imageKey: string | undefined;
      let imageUrl: string | undefined;
      try {
        if (input.imageDataUrl) {
          const stored = await storeConsentImage(ctx.user.id, input.imageDataUrl);
          imageKey = stored.key;
          imageUrl = stored.url;
        }
        const request = await createAiAssistRequest({ userId: ctx.user.id, consentId: consent.id, kind: input.kind, inputImageKey: imageKey, inputImageUrl: imageUrl, brief: input.brief, city: input.city, budgetKes: input.budgetKes, sizeProfile: input.sizeProfile });
        if (!request.persisted || !request.id) throw new Error("Unable to start your private assistance request");
        const result = await createAiAssistPlan({ kind: input.kind, brief: input.brief, city: input.city, budgetKes: input.budgetKes, sizeProfile: input.sizeProfile, aestheticMix: input.aestheticMix, imageKey });
        const category = input.kind === "home_refresh" || input.kind === "home_showroom" ? "home" : input.kind === "footwear_fit" ? "footwear" : input.kind === "personal_style" || input.kind === "wardrobe_edit" ? "apparel" : input.kind === "product_edit" || input.kind === "vehicle_garage" || input.kind === "detailing_bay" || input.kind === "tattoo_concept" || input.kind === "pet_accessory" ? "accessory" : undefined;
        const connectedProducts = category ? (await getPublicProducts({ city: input.city, category })).slice(0, 3).map(({ company, ...product }) => {
          const delivery = calculateDeliveryEstimate(company.city, input.city);
          const breakdown = calculateCommissionBreakdown({ unitPriceKes: product.priceKes, quantity: 1, commissionRatePct: company.commissionRatePct, deliveryKes: delivery.deliveryKes });
          return { product, company: { id: company.id, name: company.name, city: company.city }, delivery, ...breakdown };
        }) : [];
        await completeAiAssistRequest({ requestId: request.id, outputJson: JSON.stringify(result.plan), generatedImageUrl: result.generatedImageUrl });
        return { requestId: request.id, imageUrl, connectedProducts, ...result };
      } catch (error) {
        throw error;
      }
    }),
    aiRequest: protectedProcedure.input(z.object({ requestId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const request = await getAiAssistRequestForUser(input.requestId, ctx.user.id);
      if (!request) throw new Error("This private AI request is not available");
      return request;
    }),
    quote: protectedProcedure.input(productQuoteInputSchema).mutation(async ({ input }) => {
      const productResult = await getProductById(input.productId);
      if (!productResult) throw new Error("This product is not available");
      const delivery = calculateDeliveryEstimate(productResult.company.city, input.destinationCity);
      const breakdown = calculateCommissionBreakdown({ unitPriceKes: productResult.product.salePriceKes ?? productResult.product.priceKes, quantity: input.quantity, commissionRatePct: productResult.company.commissionRatePct, deliveryKes: delivery.deliveryKes });
      const quote = await createDeliveryQuote({ productId: productResult.product.id, destinationCity: input.destinationCity, ...delivery, expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
      return { product: productResult.product, company: productResult.company, deliveryQuoteId: quote.id, delivery, ...breakdown };
    }),
    createOrder: protectedProcedure.input(productQuoteInputSchema).mutation(async ({ ctx, input }) => {
      const productResult = await getProductById(input.productId);
      if (!productResult) throw new Error("This product is not available");
      if (productResult.product.stockQuantity < input.quantity) throw new Error("The requested quantity is not currently available");
      const delivery = calculateDeliveryEstimate(productResult.company.city, input.destinationCity);
      const breakdown = calculateCommissionBreakdown({ unitPriceKes: productResult.product.salePriceKes ?? productResult.product.priceKes, quantity: input.quantity, commissionRatePct: productResult.company.commissionRatePct, deliveryKes: delivery.deliveryKes });
      const quote = await createDeliveryQuote({ productId: productResult.product.id, destinationCity: input.destinationCity, ...delivery, expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
      const order = await createCommerceOrder({ userId: ctx.user.id, companyId: productResult.company.id, productId: productResult.product.id, deliveryQuoteId: quote.id, quantity: input.quantity, ...breakdown });
      return { ...order, delivery, ...breakdown, sellerName: productResult.company.name };
    }),
    orders: protectedProcedure.query(({ ctx }) => getCommerceOrdersForUser(ctx.user.id)),
    createReview: protectedProcedure.input(verifiedReviewInputSchema).mutation(({ ctx, input }) => createVerifiedReview({ userId: ctx.user.id, ...input })),
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
    posts: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const company = await getCompanyOwnedByUser(input.companyId, ctx.user.id);
      if (!company) throw new Error("You can only manage posts for a company you own");
      return getCompanyPostsForOwner(input.companyId);
    }),
    createPost: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), title: z.string().trim().min(3).max(160), caption: z.string().trim().max(2000).optional(), aestheticTags: z.array(z.string().trim().min(1).max(48)).max(8).default([]), imageDataUrl: z.string().regex(/^data:image\/(jpeg|png|webp);base64,/).max(7_000_000) })).mutation(async ({ ctx, input }) => {
      const company = await getCompanyOwnedByUser(input.companyId, ctx.user.id);
      if (!company) throw new Error("You can only publish posts for a company you own");
      const stored = await storeCompanyPostImage({ dataUrl: input.imageDataUrl, companyId: input.companyId, uploadedByUserId: ctx.user.id });
      return createCompanyPost({ companyId: input.companyId, createdByUserId: ctx.user.id, title: input.title, caption: input.caption || null, imageUrl: stored.url, aestheticTags: JSON.stringify(input.aestheticTags) });
    }),
    products: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const company = await getCompanyOwnedByUser(input.companyId, ctx.user.id);
      if (!company) throw new Error("You can only manage products for a company you own");
      return getCompanyProducts(input.companyId);
    }),
    createProduct: protectedProcedure.input(companyProductInputSchema).mutation(async ({ ctx, input }) => {
      const company = await getCompanyOwnedByUser(input.companyId, ctx.user.id);
      if (!company) throw new Error("You can only add products for a company you own");
      const { imageDataUrls, imageUrls: submittedImageUrls, ...productInput } = input;
      const uploaded = await Promise.all(imageDataUrls.map((dataUrl, position) => storeCompanyProductImage({ dataUrl, companyId: input.companyId, uploadedByUserId: ctx.user.id, position })));
      const imageUrls = Array.from(new Set([...submittedImageUrls, ...uploaded.map((image) => image.url)])).slice(0, 8);
      return createCompanyProduct({ ...productInput, imageUrls, imageUrl: imageUrls[0] });
    }),
    contacts: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const company = await getCompanyOwnedByUser(input.companyId, ctx.user.id);
      if (!company) throw new Error("You can only manage contacts for a company you own");
      return getCompanyContacts(input.companyId);
    }),
    replaceContacts: protectedProcedure.input(companyContactsInputSchema).mutation(async ({ ctx, input }) => {
      const company = await getCompanyOwnedByUser(input.companyId, ctx.user.id);
      if (!company) throw new Error("You can only manage contacts for a company you own");
      return replaceCompanyContacts(input.companyId, input.contacts);
    }),
    offers: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => {
      const company = await getCompanyOwnedByUser(input.companyId, ctx.user.id);
      if (!company) throw new Error("You can only manage offers for a company you own");
      return getDiscountOffersForCompany(input.companyId);
    }),
    createOffer: protectedProcedure.input(discountOfferInputSchema.safeExtend({ companyId: z.number().int().positive() })).mutation(async ({ ctx, input }) => {
      const company = await getCompanyOwnedByUser(input.companyId, ctx.user.id);
      if (!company) throw new Error("You can only create offers for a company you own");
      if (input.productId && !(await getCompanyProduct(input.companyId, input.productId))) throw new Error("That product does not belong to this company");
      return createDiscountOffer({ ...input, createdByUserId: ctx.user.id });
    }),
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
    setCompanyCommissionRate: adminProcedure.input(z.object({ companyId: z.number().int().positive(), commissionRatePct: z.number().int().min(20).max(50) })).mutation(({ input }) => updateCompanyCommissionRate(input.companyId, input.commissionRatePct)),
    discountReviewQueue: adminProcedure.query(() => getAdminDiscountReviewQueue()),
    postReviewQueue: adminProcedure.query(() => getAdminCompanyPostReviewQueue()),
    setPostStatus: adminProcedure.input(z.object({ postId: z.number().int().positive(), status: z.enum(["draft", "pending", "published", "rejected"]) })).mutation(({ input }) => updateCompanyPostStatus(input.postId, input.status)),
    setDiscountReviewStatus: adminProcedure.input(z.object({ offerId: z.number().int().positive(), status: z.enum(["approved", "rejected"]) })).mutation(({ input }) => updateDiscountOfferReviewStatus(input.offerId, input.status)),
    createAnnouncement: adminProcedure.input(announcementInputSchema).mutation(({ ctx, input }) => createPlatformAnnouncement({ createdByUserId: ctx.user.id, ...input })),
    replacePlatformContacts: adminProcedure.input(z.object({ contacts: z.array(contactInputSchema).max(6) })).mutation(({ ctx, input }) => replacePlatformContacts(ctx.user.id, input.contacts)),
    publishAuthVisuals: adminProcedure.input(z.object({ title: z.string().trim().min(3).max(120), imageDataUrls: z.array(z.string().regex(/^data:image\/(jpeg|png|webp);base64,/).max(7_000_000)).min(1).max(8) })).mutation(async ({ ctx, input }) => {
      const uploaded = await Promise.all(input.imageDataUrls.map((dataUrl, position) => storeAuthVisualImage({ dataUrl, uploadedByUserId: ctx.user.id, position })));
      return publishAuthVisualSet({ createdByUserId: ctx.user.id, title: input.title, imageUrls: uploaded.map((image) => image.url) });
    }),
  }),
});

export type AppRouter = typeof appRouter;
