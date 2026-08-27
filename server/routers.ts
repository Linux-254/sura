import { COOKIE_NAME } from "@shared/const";
import { nanoid } from "nanoid";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { completeAiAssistRequest, createAiAssistRequest, createBuildShareRecord, createCompanyForUser, createCompanyPost, createCompanyProduct, createDeliveryQuote, createDiscountOffer, createInquiryRecord, createPaymentOrder, createPlatformAnnouncement, createVerifiedReview, failAiAssistRequest, getAccountProfile, getActiveAuthVisualSet, getAdminCompanyPostReviewQueue, getAdminCompanyReviewQueue, getAdminDiscountReviewQueue, getAestheticPreferences, getAiAssistRequestForUser, getBoardSelections, getBuildShareRecord, getCompaniesForUser, getCompanyContacts, getCompanyMembership, getCompanyOwnedByUser, getCompanyPostsForOwner, getCompanyProduct, getCompanyProducts, getCommerceOrdersForUser, getCompanySocialSummary, getDiscountOffersForCompany, getOrCreateFreeMembership, getPaymentOrdersForUser, getProductById, getPublicAccountProfile, getPublicCompanyProfile, getPublicCompanyPosts, getPublicDiscountOffers, getPublicPlatformContacts, getPublicProducts, getSavedVendorIds, getSocialFeed, getUserSocialSummary, getWebNotificationFeed, markWebNotificationRead, recordAiImageConsent, recordLegalConsent, publishAuthVisualSet, replaceCompanyContacts, replacePlatformContacts, setAestheticPreferences, toggleBuildBoardSelection, toggleCompanyFollow, togglePostLike, togglePostRepost, toggleSavedVendor, toggleUserFollow, updateCompanyCommissionRate, updateCompanyPostStatus, updateCompanyReviewStatus, updateDiscountOfferReviewStatus, upsertAccountProfile } from "./db";
import { getSessionCookieOptions } from "./_core/cookies";
import { ENV } from "./_core/env";
import { systemRouter } from "./_core/systemRouter";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { demoBuilds, demoVendors, filterDemoVendors, getBuildRecommendation, getVendorBySlug } from "./vibebuild-data";
import { buildBoardSelectionInputSchema, inquiryInputSchema, saveVendorInputSchema, shareInputSchema } from "./vibebuild-validation";
import { accountProfileInputSchema, aestheticPreferencesInputSchema, announcementInputSchema, assertCompanyPaymentOwnership, companyContactsInputSchema, companyCreateInputSchema, contactInputSchema, discountOfferInputSchema, legalConsentInputSchema, paymentCatalog, paymentOrderInputSchema, selectableAesthetics } from "./sura-validation";
import { aiAssistInputSchema, calculateCommissionBreakdown, calculateDeliveryEstimate, companyProductInputSchema, productCategories, productQuoteInputSchema, verifiedReviewInputSchema } from "./sura-commerce";
import { createAiAssistPlan, storeConsentImage } from "./sura-ai-service";
import { assertPersonalEditCollectionOwnership, createPersonalEditCollection, createPersonalEditItem, getPersonalEditCollectionsForUser, getPersonalEditItemsForUser } from "./db";
import { personalEditCollectionInputSchema, personalEditItemInputSchema } from "./sura-validation";
import { storePrivatePersonalEditImage } from "./personal-edit";
import { storeCompanyPostImage } from "./post-media";
import { storeCompanyProductImage } from "./product-media";
import { storeAuthVisualImage } from "./auth-visuals";
import { getUserByOpenId, upsertUser } from "./db";
import { acceptCompanyMemberInvitation, beginCommercePayment, createCompanyMemberInvitation, createContentReport, createConversation, createInquiryQuote, createOrderHandoff, createProjectBrief, createReservedCommerceOrder, createSavedCollage, createShowroomSession, createSignalStory, createUserNotification, getAdminContentReports, getAdminCompanyProductReviewQueue, getCartSnapshot, getCheckoutLine, getCompanyAnalytics, getCompanyInquiries, getCompanyMemberInvitations, getCompanyMembers, getCompanyOwnerUserId, getConversationAudience, getConversationForUser, getConversationsForUser, getEcosystemDirectory, getInquiriesForUser, getInquiryAudience, getOrderHandoff, getOrderHandoffsForCompany, getPostOwnerUserId, getProjectBriefsForCompany, getProjectBriefsForUser, getSavedCollages, getShowroomSession, getShowroomSessionsForUser, getSignalStoryFeed, markConversationRead, markSignalStoryViewed, recordCompanyAnalyticsEvent, reconcileCommercePayment, removeCartItem, searchNetwork, sendConversationMessage, updateAdminCompanyProductStatus, updateCompanyProductStatus, updateContentReportStatus, updateInquiryStatus, updateOrderHandoff, updateProjectBriefStatus, updateShowroomSession, upsertCartItem, getOrCreateCart } from "./workflows";
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
        if (!ENV.supabaseUrl || !ENV.supabasePublishableKey) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Sura email authentication is not configured on this deployment.",
          });
        }
        if (!ENV.databaseUrl) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Sura’s application database is not configured yet. Add a MySQL/TiDB DATABASE_URL and redeploy.",
          });
        }
        if (!ENV.cookieSecret) {
          throw new TRPCError({
            code: "PRECONDITION_FAILED",
            message: "Sura’s secure session signing is not configured yet. Add JWT_SECRET and redeploy.",
          });
        }

        let identity;
        try {
          identity = await verifySupabaseAccessToken(input.accessToken);
        } catch {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "That Sura sign-in session is invalid or expired. Please sign in again.",
          });
        }

        const openId = `supabase:${identity.id}`;
        const signedInAt = new Date();
        try {
          await upsertUser({
            openId,
            email: identity.email,
            name: identity.name,
            loginMethod: "supabase_email",
            lastSignedIn: signedInAt,
          });

          const user = await getUserByOpenId(openId);
          if (!user) throw new Error("User row was not returned after upsert");

          const sessionToken = await sdk.createSessionToken(openId, {
            name: user.name ?? identity.name ?? "",
          });
          ctx.res.cookie(COOKIE_NAME, sessionToken, getSessionCookieOptions(ctx.req));

          return {
            success: true,
            user,
          } as const;
        } catch (error) {
          console.error("[Auth] Sura session exchange failed:", error);
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Sura could not open your private session. Check the application database connection and try again.",
          });
        }
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
    followUser: protectedProcedure.input(z.object({ userId: z.number().int().positive(), shouldFollow: z.boolean() })).mutation(async ({ ctx, input }) => { const result = await toggleUserFollow(ctx.user.id, input.userId, input.shouldFollow); if (result.following && result.persisted) await createUserNotification({ userId: input.userId, kind: "social", title: "A new signal connection", body: "Someone added your profile to their Sura signal.", linkUrl: `/profile/${input.userId}` }); return result; }),
    followCompany: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), shouldFollow: z.boolean() })).mutation(async ({ ctx, input }) => { const result = await toggleCompanyFollow(ctx.user.id, input.companyId, input.shouldFollow); const owner = result.following && result.persisted ? await getCompanyOwnerUserId(input.companyId) : undefined; if (owner) await createUserNotification({ userId: owner.userId, kind: "social", title: "A new company signal", body: `Someone followed ${owner.name}.`, linkUrl: `/companies/${input.companyId}` }); return result; }),
    likePost: protectedProcedure.input(z.object({ postId: z.number().int().positive(), shouldLike: z.boolean() })).mutation(async ({ ctx, input }) => { const result = await togglePostLike(ctx.user.id, input.postId, input.shouldLike); const ownerId = result.liked && result.persisted ? await getPostOwnerUserId(input.postId) : undefined; if (ownerId && ownerId !== ctx.user.id) await createUserNotification({ userId: ownerId, kind: "social", title: "Your signal was liked", body: "A Sura user liked one of your signals.", linkUrl: `/signals/${input.postId}` }); return result; }),
    repostPost: protectedProcedure.input(z.object({ postId: z.number().int().positive(), shouldRepost: z.boolean(), note: z.string().trim().max(280).optional() })).mutation(async ({ ctx, input }) => { const result = await togglePostRepost(ctx.user.id, input.postId, input.shouldRepost, input.note); const ownerId = result.reposted && result.persisted ? await getPostOwnerUserId(input.postId) : undefined; if (ownerId && ownerId !== ctx.user.id) await createUserNotification({ userId: ownerId, kind: "social", title: "Your signal was reposted", body: "A Sura user added your signal to their Shelf.", linkUrl: `/signals/${input.postId}` }); return result; }),
  }),
  search: router({
    global: publicProcedure.input(z.object({ query: z.string().trim().min(2).max(80), limit: z.number().int().min(1).max(50).default(24) })).query(({ input }) => searchNetwork(input.query, input.limit)),
  }),
  directory: router({
    browse: publicProcedure.input(z.object({ city: z.string().trim().max(80).optional(), category: z.string().trim().max(80).optional(), query: z.string().trim().max(80).optional(), limit: z.number().int().min(1).max(50).default(40) }).optional()).query(({ input }) => getEcosystemDirectory(input ?? {})),
  }),
  shelf: router({
    mine: protectedProcedure.query(({ ctx }) => getSavedCollages(ctx.user.id)),
    public: publicProcedure.input(z.object({ userId: z.number().int().positive() })).query(({ ctx, input }) => getSavedCollages(input.userId, ctx.user?.id === input.userId)),
    createCollage: protectedProcedure.input(z.object({ title: z.string().trim().min(2).max(160), description: z.string().trim().max(1000).optional(), isPublic: z.boolean().default(false), items: z.array(z.object({ itemType: z.enum(["post", "product", "vendor", "build", "image"]), itemId: z.number().int().positive().optional(), imageUrl: z.string().url().max(1000).optional(), note: z.string().trim().max(280).optional() })).max(50).default([]) })).mutation(({ ctx, input }) => createSavedCollage({ userId: ctx.user.id, ...input })),
  }),
  showroom: router({
    mine: protectedProcedure.query(async ({ ctx }) => getShowroomSessionsForUser(ctx.user.id)),
    get: publicProcedure.input(z.object({ sessionId: z.number().int().positive() })).query(({ ctx, input }) => getShowroomSession(input.sessionId, ctx.user?.id)),
    create: protectedProcedure.input(z.object({ title: z.string().trim().min(2).max(160), kind: z.enum(["home_refresh", "personal_style", "footwear_fit", "inspiration", "wardrobe_edit", "home_showroom", "product_edit", "vehicle_garage", "detailing_bay", "tattoo_concept", "pet_accessory"]), viewMode: z.enum(["orbit", "cover_flow", "window_carousel", "reverse_columns", "explorer"]).default("orbit"), configJson: z.string().max(10000).optional(), objects: z.array(z.object({ objectType: z.string().trim().min(1).max(80), label: z.string().trim().min(1).max(160), imageUrl: z.string().url().max(1000).optional(), modelUrl: z.string().url().max(1000).optional(), positionJson: z.string().max(500).optional(), rotationJson: z.string().max(500).optional(), scaleJson: z.string().max(500).optional(), metadataJson: z.string().max(4000).optional() })).max(100).default([]), annotations: z.array(z.object({ objectId: z.number().int().positive().optional(), title: z.string().trim().min(1).max(160), body: z.string().trim().min(1).max(1000), anchorJson: z.string().max(500).optional() })).max(100).default([]) })).mutation(({ ctx, input }) => createShowroomSession({ userId: ctx.user.id, sessionToken: nanoid(24), ...input })),
    update: protectedProcedure.input(z.object({ sessionId: z.number().int().positive(), title: z.string().trim().min(2).max(160).optional(), viewMode: z.enum(["orbit", "cover_flow", "window_carousel", "reverse_columns", "explorer"]).optional(), configJson: z.string().max(10000).optional(), status: z.enum(["draft", "active", "archived"]).optional(), isPublic: z.boolean().optional() })).mutation(({ ctx, input }) => updateShowroomSession({ ...input, userId: ctx.user.id })),
  }),
  stories: router({
    feed: publicProcedure.query(({ ctx }) => getSignalStoryFeed(ctx.user?.id)),
    create: protectedProcedure.input(z.object({ companyId: z.number().int().positive().optional(), imageUrl: z.string().url().max(1000), caption: z.string().trim().max(500).optional(), aestheticTags: z.array(z.string().trim().min(1).max(48)).max(12).default([]), expiresAt: z.date() })).mutation(async ({ ctx, input }) => { if (input.companyId && !(await getCompanyMembership(input.companyId, ctx.user.id))) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this company signal" }); return createSignalStory({ creatorUserId: ctx.user.id, ...input }); }),
    view: protectedProcedure.input(z.object({ storyId: z.number().int().positive() })).mutation(({ ctx, input }) => markSignalStoryViewed(input.storyId, ctx.user.id)),
  }),
  reports: router({
    create: protectedProcedure.input(z.object({ targetType: z.enum(["post", "product", "company", "profile", "message", "story", "review"]), targetId: z.number().int().positive(), reason: z.enum(["spam", "misleading", "copyright", "harassment", "unsafe", "other"]), details: z.string().trim().max(1000).optional() })).mutation(({ ctx, input }) => createContentReport({ reporterUserId: ctx.user.id, ...input })),
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
      const result = await createInquiryRecord({ userId: ctx.user?.id, companyId: input.companyId, vendorId: input.vendorId, buildId: input.buildId, name: input.name, email: input.email || null, phone: input.phone || null, city: input.city, message: input.message });
      if (result.persisted && result.id) for (const userId of await getInquiryAudience(result.id)) if (userId !== ctx.user?.id) await createUserNotification({ userId, kind: "inquiry", title: "A new Sura inquiry", body: "A new field note is waiting for a response.", linkUrl: `/inquiries/${result.id}` });
      return { success: true, ...result };
    }),
    createDetailed: protectedProcedure.input(z.object({ companyId: z.number().int().positive().optional(), vendorId: z.number().int().positive().optional(), buildId: z.number().int().positive().optional(), name: z.string().trim().min(2).max(120), city: z.string().trim().min(2).max(80), message: z.string().trim().min(12).max(2000) }).refine((input) => Boolean(input.companyId || input.vendorId || input.buildId), "Choose a company, vendor, or build before sending an inquiry")).mutation(async ({ ctx, input }) => { const result = await createInquiryRecord({ ...input, userId: ctx.user.id, email: ctx.user.email ?? null, phone: null }); if (result.persisted && result.id) for (const userId of await getInquiryAudience(result.id)) if (userId !== ctx.user.id) await createUserNotification({ userId, kind: "inquiry", title: "A new Sura inquiry", body: "A new field note is waiting for a response.", linkUrl: `/inquiries/${result.id}` }); return result; }),
    mine: protectedProcedure.query(({ ctx }) => getInquiriesForUser(ctx.user.id)),
    forCompany: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), status: z.enum(["new", "reviewed", "quoted", "accepted", "declined", "closed"]).optional() })).query(async ({ ctx, input }) => { const membership = await getCompanyMembership(input.companyId, ctx.user.id); if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this company inquiry queue" }); return getCompanyInquiries(input.companyId, input.status); }),
    quote: protectedProcedure.input(z.object({ inquiryId: z.number().int().positive(), companyId: z.number().int().positive(), amountKes: z.number().int().min(1).max(100000000), description: z.string().trim().min(12).max(2000), estimatedDays: z.number().int().min(1).max(365).optional(), validUntil: z.date().optional() })).mutation(async ({ ctx, input }) => { const membership = await getCompanyMembership(input.companyId, ctx.user.id); if (!membership || !["owner", "manager", "editor"].includes(membership.memberRole)) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have quote access for this company" }); const result = await createInquiryQuote({ ...input, createdByUserId: ctx.user.id }); if (!result.persisted) throw new TRPCError({ code: "BAD_REQUEST", message: "This inquiry is no longer quoteable." }); for (const userId of await getInquiryAudience(input.inquiryId)) if (userId !== ctx.user.id) await createUserNotification({ userId, kind: "inquiry", title: "A new Sura quote", body: "A company has responded to your field note.", linkUrl: `/inquiries/${input.inquiryId}` }); return result; }),
    updateStatus: protectedProcedure.input(z.object({ inquiryId: z.number().int().positive(), companyId: z.number().int().positive(), status: z.enum(["reviewed", "accepted", "declined", "closed"]) })).mutation(async ({ ctx, input }) => { const membership = await getCompanyMembership(input.companyId, ctx.user.id); if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this company inquiry queue" }); const result = await updateInquiryStatus(input); if (!result.persisted) throw new TRPCError({ code: "BAD_REQUEST", message: "That inquiry transition is not allowed." }); for (const userId of await getInquiryAudience(input.inquiryId)) if (userId !== ctx.user.id) await createUserNotification({ userId, kind: "inquiry", title: "Your Sura inquiry moved", body: `The inquiry is now ${input.status}.`, linkUrl: `/inquiries/${input.inquiryId}` }); return result; }),
  }),
  messages: router({
    mine: protectedProcedure.query(({ ctx }) => getConversationsForUser(ctx.user.id)),
    thread: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).query(({ ctx, input }) => getConversationForUser(input.conversationId, ctx.user.id)),
    start: protectedProcedure.input(z.object({ participantUserIds: z.array(z.number().int().positive()).min(1).max(10), companyId: z.number().int().positive().optional(), inquiryId: z.number().int().positive().optional(), projectBriefId: z.number().int().positive().optional(), subject: z.string().trim().min(2).max(180), firstMessage: z.string().trim().min(1).max(4000) })).mutation(async ({ ctx, input }) => { const result = await createConversation({ createdByUserId: ctx.user.id, ...input }); if (!result.persisted || !result.id) throw new TRPCError({ code: "FORBIDDEN", message: "Messages must be connected to an inquiry, project, or verified company relationship." }); for (const userId of await getConversationAudience(result.id, ctx.user.id)) await createUserNotification({ userId, kind: "message", title: "A new Sura conversation", body: input.subject, linkUrl: `/messages/${result.id}` }); return result; }),
    send: protectedProcedure.input(z.object({ conversationId: z.number().int().positive(), body: z.string().trim().min(1).max(4000), attachmentUrl: z.string().url().max(1000).optional() })).mutation(async ({ ctx, input }) => { const result = await sendConversationMessage({ ...input, senderUserId: ctx.user.id }); if (!result.persisted) throw new TRPCError({ code: "FORBIDDEN", message: "You cannot send to this conversation." }); for (const userId of await getConversationAudience(input.conversationId, ctx.user.id)) await createUserNotification({ userId, kind: "message", title: "A new Sura message", body: "Someone added a note to a conversation.", linkUrl: `/messages/${input.conversationId}` }); return result; }),
    markRead: protectedProcedure.input(z.object({ conversationId: z.number().int().positive() })).mutation(async ({ ctx, input }) => { const result = await markConversationRead(input.conversationId, ctx.user.id); if (!result.persisted) throw new TRPCError({ code: "FORBIDDEN", message: "You cannot mark this conversation as read." }); return result; }),
  }),
  projects: router({
    mine: protectedProcedure.query(({ ctx }) => getProjectBriefsForUser(ctx.user.id)),
    create: protectedProcedure.input(z.object({ companyId: z.number().int().positive().optional(), title: z.string().trim().min(2).max(160), intent: z.enum(["shape_direction", "ask_product", "field_note", "ai_studio"]), lane: z.string().trim().max(80).optional(), fieldNote: z.string().trim().max(4000).optional(), direction: z.string().trim().max(500).optional(), budgetKes: z.number().int().min(0).max(100000000).optional(), timeline: z.string().trim().max(120).optional(), isPublic: z.boolean().default(false), items: z.array(z.object({ itemType: z.enum(["post", "product", "vendor", "collage", "image"]), itemId: z.number().int().positive().optional(), imageUrl: z.string().url().max(1000).optional(), note: z.string().trim().max(280).optional() })).max(50).default([]) })).mutation(({ ctx, input }) => createProjectBrief({ ownerUserId: ctx.user.id, ...input })),
    updateStatus: protectedProcedure.input(z.object({ briefId: z.number().int().positive(), status: z.enum(["draft", "submitted", "in_review", "quoted", "accepted", "in_progress", "completed", "cancelled"]), eventType: z.enum(["submitted", "reviewed", "quoted", "accepted", "payment_requested", "payment_received", "handoff_started", "completed", "cancelled"]), note: z.string().trim().max(1000).optional() })).mutation(async ({ ctx, input }) => { const brief = (await getProjectBriefsForUser(ctx.user.id)).find((item) => item.id === input.briefId); if (!brief) throw new TRPCError({ code: "NOT_FOUND", message: "This private brief is not available" }); const result = await updateProjectBriefStatus({ ...input, actorUserId: ctx.user.id, actorRole: "owner" }); if (!result.persisted) throw new TRPCError({ code: "BAD_REQUEST", message: "That project transition is not allowed." }); if (result.persisted && result.companyId && result.status) for (const userId of await getCompanyMembers(result.companyId).then((members) => members.map((member) => member.userId))) if (userId !== ctx.user.id) await createUserNotification({ userId, kind: "project", title: "A project brief needs your eye", body: `The project is now ${result.status.replaceAll("_", " ")}.`, linkUrl: `/projects/${input.briefId}` }); return result; }),
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
    products: publicProcedure.input(z.object({ category: z.enum(productCategories).optional(), city: z.string().optional() }).optional()).query(({ input }) => getPublicProducts(input ?? {})),
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
    quote: protectedProcedure.input(productQuoteInputSchema).mutation(async ({ ctx, input }) => {
      const line = await getCheckoutLine({ userId: ctx.user.id, ...input });
      if (!line) throw new TRPCError({ code: "BAD_REQUEST", message: "This product, stock level, or offer is no longer available." });
      const delivery = calculateDeliveryEstimate(line.company.city, input.destinationCity);
      const commissionKes = Math.round(line.checkoutMerchandiseKes * line.company.commissionRatePct / 100);
      const quote = await createDeliveryQuote({ productId: line.product.id, destinationCity: input.destinationCity, ...delivery, expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
      return { product: { ...line.product, salePriceKes: line.checkoutMerchandiseKes }, company: line.company, deliveryQuoteId: quote.id, delivery, merchandiseSubtotalKes: line.merchandiseSubtotalKes, discountKes: line.discountKes, deliveryKes: delivery.deliveryKes, commissionRatePct: line.company.commissionRatePct, commissionKes, sellerSettlementKes: line.checkoutMerchandiseKes - commissionKes, customerTotalKes: line.checkoutMerchandiseKes + delivery.deliveryKes };
    }),
    createOrder: protectedProcedure.input(productQuoteInputSchema).mutation(async ({ ctx, input }) => {
      const line = await getCheckoutLine({ userId: ctx.user.id, ...input });
      if (!line) throw new TRPCError({ code: "BAD_REQUEST", message: "This product, stock level, or offer is no longer available." });
      const delivery = calculateDeliveryEstimate(line.company.city, input.destinationCity);
      const commissionKes = Math.round(line.checkoutMerchandiseKes * line.company.commissionRatePct / 100);
      const breakdown = { merchandiseSubtotalKes: line.merchandiseSubtotalKes, discountKes: line.discountKes, commissionRatePct: line.company.commissionRatePct, commissionKes, sellerSettlementKes: line.checkoutMerchandiseKes - commissionKes, deliveryKes: delivery.deliveryKes, customerTotalKes: line.checkoutMerchandiseKes + delivery.deliveryKes };
      const quote = await createDeliveryQuote({ productId: line.product.id, destinationCity: input.destinationCity, ...delivery, expiresAt: new Date(Date.now() + 30 * 60 * 1000) });
      const order = await createReservedCommerceOrder({ userId: ctx.user.id, companyId: line.company.id, productId: line.product.id, deliveryQuoteId: quote.id, quantity: input.quantity, selectedOfferId: input.selectedOfferId, ...breakdown });
      if (!order.persisted) throw new TRPCError({ code: "BAD_REQUEST", message: "The order could not reserve the requested product." });
      const owner = await getCompanyOwnerUserId(line.company.id); if (owner && owner.userId !== ctx.user.id) await createUserNotification({ userId: owner.userId, kind: "order", title: "A new Sura order", body: "A customer has started a paid order for your company.", linkUrl: `/orders/${order.id}` });
      return { ...order, delivery, ...breakdown, sellerName: line.company.name };
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
    members: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => { const membership = await getCompanyMembership(input.companyId, ctx.user.id); if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this company studio" }); return getCompanyMembers(input.companyId); }),
    invitations: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => { const membership = await getCompanyMembership(input.companyId, ctx.user.id); if (!membership || !["owner", "manager"].includes(membership.memberRole)) throw new TRPCError({ code: "FORBIDDEN", message: "Only company leads can view invitations" }); return getCompanyMemberInvitations(input.companyId); }),
    inviteMember: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), email: z.string().email().max(320), memberRole: z.enum(["manager", "editor"]) })).mutation(async ({ ctx, input }) => { const membership = await getCompanyMembership(input.companyId, ctx.user.id); if (!membership || !["owner", "manager"].includes(membership.memberRole)) throw new TRPCError({ code: "FORBIDDEN", message: "Only company leads can invite members" }); return createCompanyMemberInvitation({ ...input, invitedByUserId: ctx.user.id, token: nanoid(32) }); }),
    acceptInvitation: protectedProcedure.input(z.object({ token: z.string().min(16).max(64) })).mutation(({ ctx, input }) => acceptCompanyMemberInvitation({ token: input.token, userId: ctx.user.id, email: ctx.user.email ?? "" })),
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
    products: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => { const membership = await getCompanyMembership(input.companyId, ctx.user.id); if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this company product workspace" }); return getCompanyProducts(input.companyId); }),
    createProduct: protectedProcedure.input(companyProductInputSchema).mutation(async ({ ctx, input }) => {
      const membership = await getCompanyMembership(input.companyId, ctx.user.id);
      if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this company product workspace" });
      const { imageDataUrls, imageUrls: submittedImageUrls, ...productInput } = input;
      const uploaded = await Promise.all(imageDataUrls.map((dataUrl, position) => storeCompanyProductImage({ dataUrl, companyId: input.companyId, uploadedByUserId: ctx.user.id, position })));
      const imageUrls = Array.from(new Set([...submittedImageUrls, ...uploaded.map((image) => image.url)])).slice(0, 8);
      return createCompanyProduct({ ...productInput, imageUrls, imageUrl: imageUrls[0] });
    }),
    publishProduct: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), productId: z.number().int().positive(), status: z.enum(["draft", "pending"]) })).mutation(async ({ ctx, input }) => { const membership = await getCompanyMembership(input.companyId, ctx.user.id); if (!membership || !["owner", "manager", "editor"].includes(membership.memberRole)) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have product publishing access" }); const result = await updateCompanyProductStatus(input); if (!result.persisted) throw new TRPCError({ code: "BAD_REQUEST", message: "That product review transition is not allowed." }); return result; }),
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
  companyProjects: router({
    mine: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => { const membership = await getCompanyMembership(input.companyId, ctx.user.id); if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this company project queue" }); return getProjectBriefsForCompany(input.companyId); }),
    updateStatus: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), briefId: z.number().int().positive(), status: z.enum(["in_review", "quoted", "accepted", "in_progress", "completed", "cancelled"]), eventType: z.enum(["reviewed", "quoted", "accepted", "payment_requested", "payment_received", "handoff_started", "completed", "cancelled"]), note: z.string().trim().max(1000).optional() })).mutation(async ({ ctx, input }) => { const membership = await getCompanyMembership(input.companyId, ctx.user.id); if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this company project" }); const briefs = await getProjectBriefsForCompany(input.companyId); if (!briefs.some((brief) => brief.id === input.briefId)) throw new TRPCError({ code: "NOT_FOUND", message: "This company project is not available" }); const result = await updateProjectBriefStatus({ ...input, actorUserId: ctx.user.id, actorRole: membership.memberRole }); if (!result.persisted) throw new TRPCError({ code: "BAD_REQUEST", message: "That company project transition is not allowed." }); if (result.persisted && result.ownerUserId !== undefined && result.ownerUserId !== ctx.user.id && result.status) await createUserNotification({ userId: result.ownerUserId, kind: "project", title: "Your project moved on Sura", body: `The project is now ${result.status.replaceAll("_", " ")}.`, linkUrl: `/projects/${input.briefId}` }); return result; }),
  }),
  cart: router({
    mine: protectedProcedure.query(({ ctx }) => getOrCreateCart(ctx.user.id)),
    preview: protectedProcedure.query(({ ctx }) => getCartSnapshot(ctx.user.id)),
    upsertItem: protectedProcedure.input(z.object({ productId: z.number().int().positive(), quantity: z.number().int().min(1).max(20), selectedOfferId: z.number().int().positive().optional() })).mutation(async ({ ctx, input }) => { const result = await upsertCartItem({ userId: ctx.user.id, ...input }); if (!result.persisted) throw new TRPCError({ code: "BAD_REQUEST", message: "That product or offer cannot be added to your Shelf cart." }); return result; }),
    removeItem: protectedProcedure.input(z.object({ productId: z.number().int().positive() })).mutation(({ ctx, input }) => removeCartItem(ctx.user.id, input.productId)),
  }),
  handoffs: router({
    byOrder: protectedProcedure.input(z.object({ orderId: z.number().int().positive() })).query(async ({ ctx, input }) => { const orders = await getCommerceOrdersForUser(ctx.user.id); const order = orders.find((item) => item.id === input.orderId); if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "This order is not available" }); return getOrderHandoff(input.orderId); }),
    forCompany: protectedProcedure.input(z.object({ companyId: z.number().int().positive(), status: z.enum(["pending", "accepted", "in_production", "ready", "in_transit", "delivered", "issue", "cancelled"]).optional() })).query(async ({ ctx, input }) => { const membership = await getCompanyMembership(input.companyId, ctx.user.id); if (!membership) throw new TRPCError({ code: "FORBIDDEN", message: "You do not have access to this company handoff queue" }); return getOrderHandoffsForCompany(input.companyId, input.status); }),
    create: protectedProcedure.input(z.object({ orderId: z.number().int().positive(), companyId: z.number().int().positive(), destinationCity: z.string().trim().min(2).max(80), customerNote: z.string().trim().max(1000).optional() })).mutation(async ({ ctx, input }) => { const orders = await getCommerceOrdersForUser(ctx.user.id); const order = orders.find((item) => item.id === input.orderId && item.companyId === input.companyId); if (!order) throw new TRPCError({ code: "NOT_FOUND", message: "This order is not available for handoff" }); const result = await createOrderHandoff({ ...input, actorUserId: ctx.user.id }); if (!result.persisted) throw new TRPCError({ code: "BAD_REQUEST", message: "The handoff could not be created. Confirm payment is complete." }); for (const member of await getCompanyMembers(input.companyId)) if (member.userId !== ctx.user.id) await createUserNotification({ userId: member.userId, kind: "order", title: "A paid Sura order needs fulfillment", body: "A customer has created a handoff request.", linkUrl: `/handoffs/${result.id}` }); return result; }),
    update: protectedProcedure.input(z.object({ handoffId: z.number().int().positive(), status: z.enum(["pending", "accepted", "in_production", "ready", "in_transit", "delivered", "issue", "cancelled"]), note: z.string().trim().max(1000).optional(), trackingReference: z.string().trim().max(160).optional() })).mutation(async ({ ctx, input }) => { const result = await updateOrderHandoff({ ...input, actorUserId: ctx.user.id }); if (!result.persisted) throw new TRPCError({ code: "FORBIDDEN", message: "That handoff transition is not allowed" }); if (result.persisted && result.orderUserId !== undefined && result.orderUserId !== ctx.user.id) await createUserNotification({ userId: result.orderUserId, kind: "order", title: `Your Sura handoff is ${input.status.replaceAll("_", " ")}`, body: input.note ?? "The order handoff timeline was updated.", linkUrl: `/orders/${result.orderId ?? input.handoffId}` }); else if (result.persisted && result.companyId) for (const member of await getCompanyMembers(result.companyId)) if (member.userId !== ctx.user.id) await createUserNotification({ userId: member.userId, kind: "order", title: "A customer updated a handoff", body: input.note ?? `The handoff is now ${input.status.replaceAll("_", " ")}.`, linkUrl: `/handoffs/${input.handoffId}` }); return result; }),
  }),
  analytics: router({
    record: publicProcedure.input(z.object({ companyId: z.number().int().positive(), productId: z.number().int().positive().optional(), postId: z.number().int().positive().optional(), eventType: z.enum(["profile_view", "product_view", "post_view", "save", "repost", "inquiry", "checkout_start", "purchase"]), metadataJson: z.string().max(2000).optional() })).mutation(({ ctx, input }) => recordCompanyAnalyticsEvent({ ...input, actorUserId: ctx.user?.id })),
    company: protectedProcedure.input(z.object({ companyId: z.number().int().positive() })).query(async ({ ctx, input }) => { const company = await getCompanyOwnedByUser(input.companyId, ctx.user.id); if (!company) throw new TRPCError({ code: "FORBIDDEN", message: "You can only view analytics for a company you own" }); return getCompanyAnalytics(input.companyId); }),
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
    beginCommerce: protectedProcedure.input(z.object({ orderId: z.number().int().positive(), provider: z.enum(["mpesa", "stripe"]) })).mutation(async ({ ctx, input }) => { const result = await beginCommercePayment({ ...input, userId: ctx.user.id, reference: `sura_${nanoid(18)}` }); if (!result.persisted) throw new TRPCError({ code: "BAD_REQUEST", message: "This order is not ready for payment." }); return result; }),
    reconcileCommerce: adminProcedure.input(z.object({ paymentOrderId: z.number().int().positive(), status: z.enum(["paid", "failed", "cancelled"]), providerReference: z.string().trim().max(128).optional(), failureReason: z.string().trim().max(300).optional() })).mutation(async ({ input }) => { const result = await reconcileCommercePayment(input); if (!result.persisted || result.status === undefined || result.userId === undefined || result.orderId === undefined || result.companyId === undefined) throw new TRPCError({ code: "BAD_REQUEST", message: "That payment is not pending or has already been reconciled." }); if (result.status === "paid") { await createUserNotification({ userId: result.userId, kind: "order", title: "Payment confirmed on Sura", body: "Your order is ready for the next handoff step.", linkUrl: `/orders/${result.orderId}` }); for (const member of await getCompanyMembers(result.companyId)) if (member.userId !== result.userId) await createUserNotification({ userId: member.userId, kind: "order", title: "A Sura order is paid", body: "The order can now move into fulfillment.", linkUrl: `/orders/${result.orderId}` }); } else await createUserNotification({ userId: result.userId, kind: "order", title: "Sura payment not completed", body: result.status === "failed" ? "The payment failed and inventory was released." : "The payment was cancelled and inventory was released.", linkUrl: `/orders/${result.orderId}` }); return result; }),
  }),
  admin: router({
    companyReviewQueue: adminProcedure.query(() => getAdminCompanyReviewQueue()),
    setCompanyReviewStatus: adminProcedure.input(z.object({ companyId: z.number().int().positive(), verificationStatus: z.enum(["draft", "pending", "verified", "rejected"]) })).mutation(({ input }) => updateCompanyReviewStatus(input.companyId, input.verificationStatus)),
    setCompanyCommissionRate: adminProcedure.input(z.object({ companyId: z.number().int().positive(), commissionRatePct: z.number().int().min(20).max(50) })).mutation(({ input }) => updateCompanyCommissionRate(input.companyId, input.commissionRatePct)),
    discountReviewQueue: adminProcedure.query(() => getAdminDiscountReviewQueue()),
    postReviewQueue: adminProcedure.query(() => getAdminCompanyPostReviewQueue()),
    productReviewQueue: adminProcedure.query(() => getAdminCompanyProductReviewQueue()),
    setPostStatus: adminProcedure.input(z.object({ postId: z.number().int().positive(), status: z.enum(["draft", "pending", "published", "rejected"]) })).mutation(({ input }) => updateCompanyPostStatus(input.postId, input.status)),
    setProductStatus: adminProcedure.input(z.object({ productId: z.number().int().positive(), status: z.enum(["published", "rejected"]) })).mutation(async ({ input }) => { const result = await updateAdminCompanyProductStatus(input.productId, input.status); if (result.persisted && result.companyId) { const owner = await getCompanyOwnerUserId(result.companyId); if (owner) await createUserNotification({ userId: owner.userId, kind: "company", title: input.status === "published" ? "Product published on Sura" : "Product review needs a revision", body: input.status === "published" ? "Your product is now visible in the Sura ecosystem." : "An admin review returned this product for revision.", linkUrl: `/companies/${result.companyId}/products` }); } return result; }),
    setDiscountReviewStatus: adminProcedure.input(z.object({ offerId: z.number().int().positive(), status: z.enum(["approved", "rejected"]) })).mutation(async ({ input }) => { const result = await updateDiscountOfferReviewStatus(input.offerId, input.status); if (result.persisted && result.companyId) { const owner = await getCompanyOwnerUserId(result.companyId); if (owner) await createUserNotification({ userId: owner.userId, kind: "offer", title: input.status === "approved" ? "Your Sura offer is live" : "Your Sura offer needs a revision", body: input.status === "approved" ? "The offer can now appear on eligible product surfaces." : "An admin review returned this offer for revision.", linkUrl: `/companies/${result.companyId}/offers` }); } return result; }),
    reportQueue: adminProcedure.input(z.object({ status: z.enum(["open", "under_review", "resolved", "dismissed"]).optional() }).optional()).query(({ input }) => getAdminContentReports(input?.status)),
    setReportStatus: adminProcedure.input(z.object({ reportId: z.number().int().positive(), status: z.enum(["open", "under_review", "resolved", "dismissed"]) })).mutation(({ input }) => updateContentReportStatus(input.reportId, input.status)),
    createAnnouncement: adminProcedure.input(announcementInputSchema).mutation(({ ctx, input }) => createPlatformAnnouncement({ createdByUserId: ctx.user.id, ...input })),
    replacePlatformContacts: adminProcedure.input(z.object({ contacts: z.array(contactInputSchema).max(6) })).mutation(({ ctx, input }) => replacePlatformContacts(ctx.user.id, input.contacts)),
    publishAuthVisuals: adminProcedure.input(z.object({ title: z.string().trim().min(3).max(120), imageDataUrls: z.array(z.string().regex(/^data:image\/(jpeg|png|webp);base64,/).max(7_000_000)).min(1).max(8) })).mutation(async ({ ctx, input }) => {
      const uploaded = await Promise.all(input.imageDataUrls.map((dataUrl, position) => storeAuthVisualImage({ dataUrl, uploadedByUserId: ctx.user.id, position })));
      return publishAuthVisualSet({ createdByUserId: ctx.user.id, title: input.title, imageUrls: uploaded.map((image) => image.url) });
    }),
  }),
});

export type AppRouter = typeof appRouter;
