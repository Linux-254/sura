import { and, eq, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { aiAssistRequests, aiImageConsents, buildBoardSelections, buildShareItems, buildShares, commerceOrders, companies, companyContacts, companyMembers, companyProducts, deliveryQuotes, discountOffers, inquiries, InsertUser, legalConsents, paymentOrders, personalEditCollections, personalEditItems, platformAnnouncements, platformContacts, savedVendors, socialLinks, userMemberships, userProfiles, users, verifiedReviews, webNotifications } from "../drizzle/schema";
import { ENV } from './_core/env';
import { assertVerifiedReviewEligibility } from "./sura-commerce";

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function getSavedVendorIds(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ vendorId: savedVendors.vendorId }).from(savedVendors).where(eq(savedVendors.userId, userId));
  return rows.map((row) => row.vendorId);
}

export async function toggleSavedVendor(userId: number, vendorId: number, shouldSave: boolean) {
  const db = await getDb();
  if (!db) return { saved: shouldSave, persisted: false };
  if (shouldSave) {
    await db.insert(savedVendors).values({ userId, vendorId }).onDuplicateKeyUpdate({ set: { createdAt: new Date() } });
  } else {
    await db.delete(savedVendors).where(and(eq(savedVendors.userId, userId), eq(savedVendors.vendorId, vendorId)));
  }
  return { saved: shouldSave, persisted: true };
}

export async function createInquiryRecord(input: typeof inquiries.$inferInsert) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(inquiries).values(input);
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function getBoardSelections(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(buildBoardSelections).where(eq(buildBoardSelections.userId, userId));
}

export async function toggleBuildBoardSelection(userId: number, buildId: number, shouldSave: boolean) {
  const db = await getDb();
  if (!db) return { saved: shouldSave, persisted: false };
  const condition = and(eq(buildBoardSelections.userId, userId), eq(buildBoardSelections.buildId, buildId));
  if (shouldSave) {
    const existing = await db.select({ id: buildBoardSelections.id }).from(buildBoardSelections).where(condition).limit(1);
    if (existing.length === 0) await db.insert(buildBoardSelections).values({ userId, buildId });
  } else {
    await db.delete(buildBoardSelections).where(condition);
  }
  return { saved: shouldSave, persisted: true };
}

export async function createBuildShareRecord(input: { userId: number; shareToken: string; title: string; summary?: string; buildIds: number[]; vendorIds: number[] }) {
  const db = await getDb();
  if (!db) return { shareToken: input.shareToken, persisted: false };
  const result = await db.insert(buildShares).values({
    userId: input.userId,
    shareToken: input.shareToken,
    title: input.title,
    summary: input.summary ?? null,
  });
  const shareId = Number(result[0]?.insertId ?? 0);
  const itemRows = [
    ...input.buildIds.map((buildId, index) => ({ shareId, buildId, sortOrder: index })),
    ...input.vendorIds.map((vendorId, index) => ({ shareId, vendorId, sortOrder: input.buildIds.length + index })),
  ];
  if (itemRows.length > 0) await db.insert(buildShareItems).values(itemRows);
  return { shareToken: input.shareToken, persisted: true };
}

export async function getBuildShareRecord(shareToken: string) {
  const db = await getDb();
  if (!db) return undefined;
  const share = await db.select().from(buildShares).where(and(eq(buildShares.shareToken, shareToken), eq(buildShares.isPublic, true))).limit(1);
  if (!share[0]) return undefined;
  const items = await db.select().from(buildShareItems).where(eq(buildShareItems.shareId, share[0].id));
  return { share: share[0], items };
}

export async function getAccountProfile(userId: number) {
  const db = await getDb();
  if (!db) return { profile: undefined, socialLinks: [] };
  const [profile] = await db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  const links = await db.select().from(socialLinks).where(eq(socialLinks.userId, userId));
  return { profile, socialLinks: links };
}

const selectableAestheticNames = new Set(["Soft Power", "Thrift Remix", "Heritage Modern", "Comfort Official", "Coastal Ease", "Savanna Atelier", "Ink & Ivory", "Orchid After Dark", "Tangerine Social", "Moss & Marigold", "Cobalt Ritual", "Thermal Bloom"]);

function parseAestheticPreferences(raw: string | null | undefined) {
  try {
    const values = JSON.parse(raw ?? "[]");
    if (!Array.isArray(values)) return [];
    return Array.from(new Set(values.filter((value): value is string => typeof value === "string" && selectableAestheticNames.has(value)))).slice(0, 5);
  } catch {
    return [];
  }
}

export async function getAestheticPreferences(userId: number) {
  const db = await getDb();
  if (!db) return { aesthetics: [], onboardingComplete: false };
  const [profile] = await db.select({ aestheticPreferences: userProfiles.aestheticPreferences, aestheticOnboardingComplete: userProfiles.aestheticOnboardingComplete }).from(userProfiles).where(eq(userProfiles.userId, userId)).limit(1);
  return { aesthetics: parseAestheticPreferences(profile?.aestheticPreferences), onboardingComplete: Boolean(profile?.aestheticOnboardingComplete) };
}

export async function setAestheticPreferences(userId: number, aesthetics: string[]) {
  const db = await getDb();
  if (!db) return { persisted: false };
  const stored = JSON.stringify(aesthetics);
  await db.insert(userProfiles).values({ userId, aestheticPreferences: stored, aestheticOnboardingComplete: true }).onDuplicateKeyUpdate({ set: { aestheticPreferences: stored, aestheticOnboardingComplete: true } });
  return { persisted: true };
}

export async function getPublicAccountProfile(publicSlug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [profile] = await db.select().from(userProfiles).where(and(eq(userProfiles.publicSlug, publicSlug), eq(userProfiles.isPublic, true))).limit(1);
  if (!profile) return undefined;
  const links = await db.select().from(socialLinks).where(and(eq(socialLinks.userId, profile.userId), eq(socialLinks.isPublic, true)));
  return { profile, socialLinks: links };
}

export async function upsertAccountProfile(input: { userId: number; displayName: string; bio?: string; city?: string; publicSlug?: string; isPublic: boolean; socialLinks: Array<{ platform: "instagram" | "tiktok" | "linkedin" | "youtube" | "x" | "website"; url: string; isPublic: boolean }> }) {
  const db = await getDb();
  if (!db) return { persisted: false };
  await db.insert(userProfiles).values({ userId: input.userId, displayName: input.displayName, bio: input.bio ?? null, city: input.city ?? null, publicSlug: input.publicSlug ?? null, isPublic: input.isPublic }).onDuplicateKeyUpdate({ set: { displayName: input.displayName, bio: input.bio ?? null, city: input.city ?? null, publicSlug: input.publicSlug ?? null, isPublic: input.isPublic } });
  await db.delete(socialLinks).where(eq(socialLinks.userId, input.userId));
  if (input.socialLinks.length) await db.insert(socialLinks).values(input.socialLinks.map((link) => ({ userId: input.userId, platform: link.platform, url: link.url, isPublic: link.isPublic })));
  return { persisted: true };
}

export async function getCompaniesForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).where(eq(companies.ownerUserId, userId));
}

export async function createCompanyForUser(input: { ownerUserId: number; name: string; slug: string; description?: string; city?: string; websiteUrl?: string; socialLinks: Array<{ platform: "instagram" | "tiktok" | "linkedin" | "youtube" | "x" | "website"; url: string; isPublic: boolean }> }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(companies).values({ ownerUserId: input.ownerUserId, name: input.name, slug: input.slug, description: input.description ?? null, city: input.city ?? null, websiteUrl: input.websiteUrl ?? null, verificationStatus: "pending" });
  const companyId = Number(result[0]?.insertId ?? 0);
  if (companyId) {
    await db.insert(companyMembers).values({ companyId, userId: input.ownerUserId, memberRole: "owner" });
    if (input.socialLinks.length) await db.insert(socialLinks).values(input.socialLinks.map((link) => ({ companyId, platform: link.platform, url: link.url, isPublic: link.isPublic })));
  }
  return { id: companyId, persisted: true };
}

export async function getCompanyOwnedByUser(companyId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [company] = await db.select().from(companies).where(and(eq(companies.id, companyId), eq(companies.ownerUserId, userId))).limit(1);
  return company;
}

export async function getCompanyMembership(companyId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [membership] = await db.select().from(companyMembers).where(and(eq(companyMembers.companyId, companyId), eq(companyMembers.userId, userId))).limit(1);
  return membership;
}

export async function getPublicCompanyProfile(slug: string) {
  const db = await getDb();
  if (!db) return undefined;
  const [company] = await db.select().from(companies).where(and(eq(companies.slug, slug), eq(companies.verificationStatus, "verified"))).limit(1);
  if (!company) return undefined;
  const links = await db.select().from(socialLinks).where(and(eq(socialLinks.companyId, company.id), eq(socialLinks.isPublic, true)));
  const contacts = await getCompanyContacts(company.id, true);
  return { company, socialLinks: links, contacts };
}

export async function getPaymentOrdersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(paymentOrders).where(eq(paymentOrders.userId, userId)).limit(50);
}

export async function createPaymentOrder(input: { userId: number; companyId?: number; orderType: "company_membership" | "vendor_feature" | "build_consultation"; amountKes: number; reference: string }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(paymentOrders).values({ userId: input.userId, companyId: input.companyId ?? null, orderType: input.orderType, amountKes: input.amountKes, reference: input.reference, status: "draft", provider: "gateway_pending" });
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function recordLegalConsent(userId: number, documentType: "terms" | "privacy", version: string) {
  const db = await getDb();
  if (!db) return { persisted: false };
  await db.insert(legalConsents).values({ userId, documentType, version }).onDuplicateKeyUpdate({ set: { acceptedAt: new Date() } });
  return { persisted: true };
}

export async function getAdminCompanyReviewQueue() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companies).limit(50);
}

export async function updateCompanyReviewStatus(companyId: number, verificationStatus: "draft" | "pending" | "verified" | "rejected") {
  const db = await getDb();
  if (!db) return { persisted: false };
  await db.update(companies).set({ verificationStatus }).where(eq(companies.id, companyId));
  return { persisted: true };
}

export async function updateCompanyCommissionRate(companyId: number, commissionRatePct: number) {
  const db = await getDb();
  if (!db) return { persisted: false };
  await db.update(companies).set({ commissionRatePct }).where(eq(companies.id, companyId));
  return { persisted: true };
}

export async function getOrCreateFreeMembership(userId: number) {
  const db = await getDb();
  if (!db) return { planKey: "sura_free" as const, status: "active" as const, persisted: false };
  await db.insert(userMemberships).values({ userId, planKey: "sura_free", status: "active" }).onDuplicateKeyUpdate({ set: { updatedAt: new Date() } });
  const [membership] = await db.select().from(userMemberships).where(eq(userMemberships.userId, userId)).limit(1);
  return { ...membership, persisted: true };
}

export async function getWebNotificationFeed(userId: number) {
  const db = await getDb();
  if (!db) return { notifications: [], announcements: [] };
  const notifications = await db.select().from(webNotifications).where(and(eq(webNotifications.userId, userId), eq(webNotifications.isDismissed, false))).limit(30);
  const announcements = await db.select().from(platformAnnouncements).where(eq(platformAnnouncements.isActive, true)).limit(10);
  return { notifications, announcements };
}

export async function markWebNotificationRead(userId: number, notificationId: number, dismissed: boolean) {
  const db = await getDb();
  if (!db) return { persisted: false };
  await db.update(webNotifications).set({ isRead: true, isDismissed: dismissed }).where(and(eq(webNotifications.id, notificationId), eq(webNotifications.userId, userId)));
  return { persisted: true };
}

export async function replaceCompanyContacts(companyId: number, contacts: Array<{ label: string; contactType: "email" | "phone" | "whatsapp" | "address"; value: string; isPublic: boolean; sortOrder: number }>) {
  const db = await getDb();
  if (!db) return { persisted: false };
  await db.delete(companyContacts).where(eq(companyContacts.companyId, companyId));
  if (contacts.length) await db.insert(companyContacts).values(contacts.map((contact) => ({ companyId, ...contact })));
  return { persisted: true };
}

export async function getCompanyContacts(companyId: number, publicOnly = false) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companyContacts).where(publicOnly ? and(eq(companyContacts.companyId, companyId), eq(companyContacts.isPublic, true)) : eq(companyContacts.companyId, companyId));
}

export async function createDiscountOffer(input: { companyId?: number; createdByUserId: number; code: string; title: string; description?: string; discountType: "percentage" | "fixed_kes"; discountValue: number; minimumSpendKes?: number; validUntil?: Date }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(discountOffers).values({ ...input, companyId: input.companyId ?? null, description: input.description ?? null, minimumSpendKes: input.minimumSpendKes ?? null, validUntil: input.validUntil ?? null, status: "pending", isPublic: false });
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function getDiscountOffersForCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(discountOffers).where(eq(discountOffers.companyId, companyId)).limit(30);
}

export async function getPublicDiscountOffers() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(discountOffers).where(and(eq(discountOffers.status, "approved"), eq(discountOffers.isPublic, true))).limit(30);
}

export async function getAdminDiscountReviewQueue() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(discountOffers).where(eq(discountOffers.status, "pending")).limit(50);
}

export async function updateDiscountOfferReviewStatus(offerId: number, status: "approved" | "rejected") {
  const db = await getDb();
  if (!db) return { persisted: false };
  await db.update(discountOffers).set({ status, isPublic: status === "approved" }).where(eq(discountOffers.id, offerId));
  return { persisted: true };
}

export async function createPlatformAnnouncement(input: { createdByUserId: number; title: string; body: string; linkUrl?: string; isActive: boolean }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(platformAnnouncements).values({ ...input, linkUrl: input.linkUrl ?? null });
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function replacePlatformContacts(createdByUserId: number, contacts: Array<{ label: string; contactType: "email" | "phone" | "whatsapp" | "address"; value: string; isPublic: boolean; sortOrder: number }>) {
  const db = await getDb();
  if (!db) return { persisted: false };
  await db.delete(platformContacts);
  if (contacts.length) await db.insert(platformContacts).values(contacts.map((contact) => ({ createdByUserId, ...contact })));
  return { persisted: true };
}

export async function getPublicPlatformContacts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(platformContacts).where(eq(platformContacts.isPublic, true)).limit(10);
}

export async function getCompanyProducts(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companyProducts).where(eq(companyProducts.companyId, companyId)).limit(100);
}

export async function getPublicProducts(input: { category?: "apparel" | "footwear" | "home" | "accessory"; city?: string }) {
  const db = await getDb();
  if (!db) return [];
  const products = await db.select().from(companyProducts).where(eq(companyProducts.isActive, true)).limit(100);
  const companyIds = Array.from(new Set(products.map((product) => product.companyId)));
  const verifiedCompanies = await Promise.all(companyIds.map(async (companyId) => (await db.select().from(companies).where(and(eq(companies.id, companyId), eq(companies.verificationStatus, "verified"))).limit(1))[0]));
  const allowedCompanies = new Map(verifiedCompanies.filter(Boolean).map((company) => [company!.id, company!]));
  return products.filter((product) => {
    const company = allowedCompanies.get(product.companyId);
    return Boolean(company) && (!input.category || product.category === input.category) && (!input.city || company?.city === input.city);
  }).map((product) => ({ ...product, company: allowedCompanies.get(product.companyId)! }));
}

export async function getProductById(productId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [product] = await db.select().from(companyProducts).where(and(eq(companyProducts.id, productId), eq(companyProducts.isActive, true))).limit(1);
  if (!product) return undefined;
  const [company] = await db.select().from(companies).where(and(eq(companies.id, product.companyId), eq(companies.verificationStatus, "verified"))).limit(1);
  return company ? { product, company } : undefined;
}

export async function createCompanyProduct(input: { companyId: number; name: string; category: "apparel" | "footwear" | "home" | "accessory"; description: string; priceKes: number; imageUrl?: string; sizeOptions: string[]; stockQuantity: number }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(companyProducts).values({ ...input, imageUrl: input.imageUrl ?? null, sizeOptions: JSON.stringify(input.sizeOptions) });
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function recordAiImageConsent(userId: number, purpose: "home_refresh" | "personal_style" | "footwear_fit" | "inspiration") {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(aiImageConsents).values({ userId, purpose });
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function createAiAssistRequest(input: { userId: number; consentId: number; kind: "home_refresh" | "personal_style" | "footwear_fit" | "inspiration"; inputImageKey?: string; inputImageUrl?: string; brief: string; city: string; budgetKes: number; sizeProfile?: string }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(aiAssistRequests).values({ ...input, inputImageKey: input.inputImageKey ?? null, inputImageUrl: input.inputImageUrl ?? null, sizeProfile: input.sizeProfile ?? null, status: "processing" });
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function completeAiAssistRequest(input: { requestId: number; outputJson: string; generatedImageUrl?: string }) {
  const db = await getDb();
  if (!db) return { persisted: false };
  await db.update(aiAssistRequests).set({ outputJson: input.outputJson, generatedImageUrl: input.generatedImageUrl ?? null, status: "complete" }).where(eq(aiAssistRequests.id, input.requestId));
  return { persisted: true };
}

export async function failAiAssistRequest(requestId: number) {
  const db = await getDb();
  if (!db) return { persisted: false };
  await db.update(aiAssistRequests).set({ status: "failed" }).where(eq(aiAssistRequests.id, requestId));
  return { persisted: true };
}

export async function getAiAssistRequestForUser(requestId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [request] = await db.select().from(aiAssistRequests).where(and(eq(aiAssistRequests.id, requestId), eq(aiAssistRequests.userId, userId))).limit(1);
  return request;
}

export async function createDeliveryQuote(input: { productId: number; destinationCity: string; distanceBand: "same_neighbourhood" | "same_city" | "national"; deliveryKes: number; providerLabel: string; expiresAt: Date }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(deliveryQuotes).values(input);
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function createCommerceOrder(input: { userId: number; companyId: number; productId: number; deliveryQuoteId: number; quantity: number; merchandiseSubtotalKes: number; commissionRatePct: number; commissionKes: number; sellerSettlementKes: number; deliveryKes: number; customerTotalKes: number }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(commerceOrders).values({ ...input, status: "awaiting_payment" });
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function getCommerceOrdersForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const orders = await db.select().from(commerceOrders).where(eq(commerceOrders.userId, userId)).limit(50);
  if (!orders.length) return [];
  const reviews = await db.select().from(verifiedReviews).where(and(eq(verifiedReviews.userId, userId), inArray(verifiedReviews.orderId, orders.map((order) => order.id))));
  return orders.map((order) => ({ ...order, review: reviews.find((review) => review.orderId === order.id) ?? null }));
}

export async function createVerifiedReview(input: { orderId: number; userId: number; rating: number; comment?: string }, databaseOverride?: any) {
  const db = databaseOverride ?? await getDb();
  if (!db) return { id: 0, persisted: false };
  const [order] = await db.select().from(commerceOrders).where(eq(commerceOrders.id, input.orderId)).limit(1);
  if (!order) throw new Error("Reviews are available only after a delivered purchase belonging to this account");
  const [existingReview] = await db.select().from(verifiedReviews).where(and(eq(verifiedReviews.orderId, order.id), eq(verifiedReviews.userId, input.userId))).limit(1);
  assertVerifiedReviewEligibility({ order, reviewUserId: input.userId, existingReview });
  const result = await db.insert(verifiedReviews).values({ orderId: order.id, userId: input.userId, companyId: order.companyId, productId: order.productId, rating: input.rating, comment: input.comment ?? null, status: "pending" });
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function getPersonalEditCollectionsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(personalEditCollections).where(eq(personalEditCollections.userId, userId)).limit(100);
}

export async function getPersonalEditItemsForUser(input: { userId: number; collectionId?: number }) {
  const db = await getDb();
  if (!db) return [];
  const ownership = input.collectionId === undefined
    ? eq(personalEditItems.userId, input.userId)
    : and(eq(personalEditItems.userId, input.userId), eq(personalEditItems.collectionId, input.collectionId));
  return db.select().from(personalEditItems).where(ownership).limit(200);
}

export async function assertPersonalEditCollectionOwnership(userId: number, collectionId: number, databaseOverride?: any) {
  const db = databaseOverride ?? await getDb();
  if (!db) throw new Error("The private studio is unavailable right now");
  const [collection] = await db.select().from(personalEditCollections).where(and(eq(personalEditCollections.id, collectionId), eq(personalEditCollections.userId, userId))).limit(1);
  if (!collection) throw new Error("This private collection is not available to the current account");
  return collection;
}

export async function createPersonalEditCollection(input: { userId: number; title: string; editType: "wardrobe" | "tattoo" | "room" | "books" | "lighting" | "inspiration" }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const existing = await db.select({ id: personalEditCollections.id }).from(personalEditCollections).where(eq(personalEditCollections.userId, input.userId)).limit(25);
  if (existing.length >= 24) throw new Error("Keep up to 24 private edit collections so your studio remains focused");
  const result = await db.insert(personalEditCollections).values({ ...input, isPrivate: true });
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function createPersonalEditItem(input: { userId: number; collectionId: number; itemType: "wardrobe" | "tattoo" | "room" | "books" | "lighting" | "inspiration"; title: string; note?: string; tags?: string; imageKey?: string; imageUrl?: string; analysisConsentAt?: Date }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  await assertPersonalEditCollectionOwnership(input.userId, input.collectionId);
  const existing = await db.select({ id: personalEditItems.id }).from(personalEditItems).where(and(eq(personalEditItems.collectionId, input.collectionId), eq(personalEditItems.userId, input.userId))).limit(101);
  if (existing.length >= 100) throw new Error("Keep up to 100 private references in one collection");
  const result = await db.insert(personalEditItems).values({ ...input, note: input.note ?? null, tags: input.tags ?? null, imageKey: input.imageKey ?? null, imageUrl: input.imageUrl ?? null, analysisConsentAt: input.analysisConsentAt ?? null });
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}
