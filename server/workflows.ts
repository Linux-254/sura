import { and, count, desc, eq, gt, gte, inArray, isNull, like, lt, ne, or, sql } from "drizzle-orm";
import { cartItems, carts, companyAnalyticsEvents, companies, companyMemberInvitations, companyMembers, commerceOrderItems, discountOfferUsages, discountOffers, companyPosts, companyProducts, commerceOrders, contentReports, conversationMessages, conversationParticipants, conversations, inquiries, inquiryQuotes, orderHandoffEvents, orderHandoffs, paymentOrders, projectBriefEvents, projectBriefItems, projectBriefs, savedCollageItems, savedCollages, showroomAnnotations, showroomObjects, showroomSessions, signalStories, signalStoryViews, userProfiles, vendors, webNotifications } from "../drizzle/schema";
import { getDb } from "./db";

export type WorkflowResult = { persisted: boolean; id?: number };

export function isNotificationRecipient(userId: number, actorUserId?: number) {
  return actorUserId === undefined || userId !== actorUserId;
}

export function isCollageVisible(collage: { userId: number; isPublic: boolean }, requestedUserId: number, includePublic: boolean) {
  return collage.userId === requestedUserId || (includePublic && collage.isPublic);
}

export function isPublicSearchProduct(product: { status: string; isActive: boolean }, companyVerified: boolean) {
  return companyVerified && product.status === "published" && product.isActive;
}

export function canStartContextualConversation(input: { hasContext: boolean; actorAllowed: boolean; participantsAllowed: boolean; participantCount: number }) {
  return input.hasContext && input.actorAllowed && input.participantsAllowed && input.participantCount >= 2;
}

export function canUpdateInquiry(current: "new" | "reviewed" | "quoted" | "accepted" | "declined" | "closed", next: "reviewed" | "quoted" | "accepted" | "declined" | "closed") {
  return inquiryTransitions[current].includes(next);
}

export function canUpdateCompanyProduct(current: "draft" | "pending" | "published" | "rejected", next: "draft" | "pending") {
  return next === "pending" ? current === "draft" || current === "rejected" : current === "pending";
}

export function canReconcilePayment(current: "draft" | "pending" | "paid" | "failed" | "cancelled", next: "paid" | "failed" | "cancelled") {
  return current === "pending";
}

async function participantConversationIds(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select({ conversationId: conversationParticipants.conversationId }).from(conversationParticipants).where(eq(conversationParticipants.userId, userId));
  return rows.map((row) => row.conversationId);
}

export async function createUserNotification(input: { userId: number; kind: "membership" | "offer" | "company" | "platform" | "social" | "message" | "inquiry" | "order" | "project"; title: string; body: string; linkUrl?: string }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(webNotifications).values({ ...input, linkUrl: input.linkUrl ?? null });
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function searchNetwork(query: string, limit = 24) {
  const db = await getDb();
  if (!db) return { query, results: [], persisted: false };
  const term = `%${query.trim().slice(0, 80)}%`;
  if (query.trim().length < 2) return { query, results: [], persisted: true };
  const [posts, products, companyRows, profiles] = await Promise.all([
    db.select({ id: companyPosts.id, title: companyPosts.title, companyId: companyPosts.companyId }).from(companyPosts).where(and(eq(companyPosts.status, "published"), eq(companyPosts.isPublic, true), like(companyPosts.title, term))).limit(limit),
    db.select({ id: companyProducts.id, title: companyProducts.name, description: companyProducts.description, companyId: companyProducts.companyId }).from(companyProducts).innerJoin(companies, eq(companyProducts.companyId, companies.id)).where(and(eq(companyProducts.isActive, true), eq(companyProducts.status, "published"), eq(companies.verificationStatus, "verified"), or(like(companyProducts.name, term), like(companyProducts.description, term)))).limit(limit),
    db.select({ id: companies.id, title: companies.name, description: companies.description, slug: companies.slug }).from(companies).where(and(eq(companies.verificationStatus, "verified"), or(like(companies.name, term), like(companies.description, term), like(companies.city, term)))).limit(limit),
    db.select({ id: userProfiles.userId, title: userProfiles.displayName, description: userProfiles.bio, slug: userProfiles.publicSlug }).from(userProfiles).where(and(eq(userProfiles.isPublic, true), or(like(userProfiles.displayName, term), like(userProfiles.bio, term), like(userProfiles.city, term)))).limit(limit),
  ]);
  return {
    query,
    persisted: true,
    results: [
      ...posts.filter((row) => row.id !== null).map((row) => ({ kind: "signal" as const, id: row.id as number, title: row.title, companyId: row.companyId })),
      ...products.map((row) => ({ kind: "product" as const, id: row.id, title: row.title, description: row.description, companyId: row.companyId })),
      ...companyRows.map((row) => ({ kind: "company" as const, id: row.id, title: row.title, description: row.description, slug: row.slug })),
      ...profiles.map((row) => ({ kind: "person" as const, id: row.id, title: row.title, description: row.description, slug: row.slug })),
    ].slice(0, limit),
  };
}

export async function getEcosystemDirectory(input: { city?: string; category?: string; query?: string; limit?: number }) {
  const db = await getDb();
  if (!db) return { companies: [], vendors: [], persisted: false };
  const limit = input.limit ?? 40;
  const query = input.query?.trim();
  const term = query ? `%${query.slice(0, 80)}%` : undefined;
  const companyRows = await db.select().from(companies).where(and(
    eq(companies.verificationStatus, "verified"),
    input.city ? eq(companies.city, input.city) : undefined,
    term ? or(like(companies.name, term), like(companies.description, term), like(companies.city, term)) : undefined,
  )).limit(limit);
  const vendorRows = await db.select().from(vendors).where(and(input.city ? eq(vendors.city, input.city) : undefined, input.category ? like(vendors.type, `%${input.category}%`) : undefined, term ? or(like(vendors.name, term), like(vendors.description, term), like(vendors.neighbourhood, term)) : undefined)).limit(limit);
  return { companies: companyRows, vendors: vendorRows, persisted: true };
}

export async function createSavedCollage(input: { userId: number; title: string; description?: string; isPublic: boolean; items: Array<{ itemType: "post" | "product" | "vendor" | "build" | "image"; itemId?: number; imageUrl?: string; note?: string }> }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(savedCollages).values({ userId: input.userId, title: input.title, description: input.description ?? null, isPublic: input.isPublic });
  const collageId = Number(result[0]?.insertId ?? 0);
  if (collageId && input.items.length) await db.insert(savedCollageItems).values(input.items.map((item, sortOrder) => ({ collageId, userId: input.userId, ...item, itemId: item.itemId ?? null, imageUrl: item.imageUrl ?? null, note: item.note ?? null, sortOrder })));
  return { id: collageId, persisted: true };
}

export async function getSavedCollages(userId: number, includePublic = false) {
  const db = await getDb();
  if (!db) return [];
  const rows = await db.select().from(savedCollages).where(includePublic ? or(eq(savedCollages.userId, userId), eq(savedCollages.isPublic, true)) : eq(savedCollages.userId, userId)).orderBy(desc(savedCollages.updatedAt)).limit(100);
  const ids = rows.map((row) => row.id);
  const items = ids.length ? await db.select().from(savedCollageItems).where(inArray(savedCollageItems.collageId, ids)).orderBy(savedCollageItems.sortOrder) : [];
  return rows.map((collage) => ({ ...collage, items: items.filter((item) => item.collageId === collage.id) }));
}

export async function createConversation(input: { createdByUserId: number; participantUserIds: number[]; companyId?: number; inquiryId?: number; projectBriefId?: number; subject: string; firstMessage: string }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false, reason: "database_unavailable" as const };
  if (!input.companyId && !input.inquiryId && !input.projectBriefId) return { id: 0, persisted: false, reason: "context_required" as const };
  const participants = Array.from(new Set([input.createdByUserId, ...input.participantUserIds]));
  if (participants.length < 2) return { id: 0, persisted: false, reason: "recipient_required" as const };
  const allowedParticipants = new Set<number>();
  if (input.companyId) {
    const [company] = await db.select({ id: companies.id, verificationStatus: companies.verificationStatus }).from(companies).where(and(eq(companies.id, input.companyId), eq(companies.verificationStatus, "verified"))).limit(1);
    if (!company) return { id: 0, persisted: false, reason: "company_unavailable" as const };
    const members = await db.select({ userId: companyMembers.userId }).from(companyMembers).where(eq(companyMembers.companyId, input.companyId)).limit(100);
    members.forEach((member) => allowedParticipants.add(member.userId));
  }
  if (input.inquiryId) {
    const [inquiry] = await db.select({ userId: inquiries.userId, companyId: inquiries.companyId }).from(inquiries).where(eq(inquiries.id, input.inquiryId)).limit(1);
    if (!inquiry || (input.companyId && inquiry.companyId !== input.companyId)) return { id: 0, persisted: false, reason: "inquiry_context_invalid" as const };
    if (inquiry.userId) allowedParticipants.add(inquiry.userId);
    if (inquiry.companyId) {
      const members = await db.select({ userId: companyMembers.userId }).from(companyMembers).where(eq(companyMembers.companyId, inquiry.companyId)).limit(100);
      members.forEach((member) => allowedParticipants.add(member.userId));
    }
  }
  if (input.projectBriefId) {
    const [brief] = await db.select({ ownerUserId: projectBriefs.ownerUserId, companyId: projectBriefs.companyId }).from(projectBriefs).where(eq(projectBriefs.id, input.projectBriefId)).limit(1);
    if (!brief || (input.companyId && brief.companyId !== input.companyId)) return { id: 0, persisted: false, reason: "project_context_invalid" as const };
    allowedParticipants.add(brief.ownerUserId);
    if (brief.companyId) {
      const members = await db.select({ userId: companyMembers.userId }).from(companyMembers).where(eq(companyMembers.companyId, brief.companyId)).limit(100);
      members.forEach((member) => allowedParticipants.add(member.userId));
    }
  }
  if (!canStartContextualConversation({ hasContext: Boolean(input.companyId || input.inquiryId || input.projectBriefId), actorAllowed: allowedParticipants.has(input.createdByUserId), participantsAllowed: participants.every((userId) => allowedParticipants.has(userId)), participantCount: participants.length })) return { id: 0, persisted: false, reason: "participant_not_authorized" as const };
  const result = await db.insert(conversations).values({ createdByUserId: input.createdByUserId, companyId: input.companyId ?? null, inquiryId: input.inquiryId ?? null, projectBriefId: input.projectBriefId ?? null, subject: input.subject, status: "open" });
  const conversationId = Number(result[0]?.insertId ?? 0);
  if (!conversationId) return { id: 0, persisted: false, reason: "insert_failed" as const };
  await db.insert(conversationParticipants).values(participants.map((userId) => ({ conversationId, userId })));
  await db.insert(conversationMessages).values({ conversationId, senderUserId: input.createdByUserId, body: input.firstMessage });
  return { id: conversationId, persisted: true };
}

export async function getConversationsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const ids = await participantConversationIds(userId);
  if (!ids.length) return [];
  const rows = await db.select().from(conversations).where(inArray(conversations.id, ids)).orderBy(desc(conversations.updatedAt)).limit(100);
  const participants = await db.select().from(conversationParticipants).where(inArray(conversationParticipants.conversationId, ids));
  const latestMessages = await Promise.all(rows.map(async (conversation) => {
    const [latest] = await db.select().from(conversationMessages).where(eq(conversationMessages.conversationId, conversation.id)).orderBy(desc(conversationMessages.createdAt)).limit(1);
    return { conversationId: conversation.id, latest };
  }));
  return rows.map((conversation) => ({ ...conversation, participants: participants.filter((participant) => participant.conversationId === conversation.id), latestMessage: latestMessages.find((item) => item.conversationId === conversation.id)?.latest }));
}

export async function getConversationForUser(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [membership] = await db.select().from(conversationParticipants).where(and(eq(conversationParticipants.conversationId, conversationId), eq(conversationParticipants.userId, userId))).limit(1);
  if (!membership) return undefined;
  const [conversation] = await db.select().from(conversations).where(eq(conversations.id, conversationId)).limit(1);
  if (!conversation) return undefined;
  const messages = await db.select().from(conversationMessages).where(eq(conversationMessages.conversationId, conversationId)).orderBy(conversationMessages.createdAt).limit(200);
  return { conversation, messages };
}

export async function sendConversationMessage(input: { conversationId: number; senderUserId: number; body: string; attachmentUrl?: string }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const [membership] = await db.select({ id: conversationParticipants.id }).from(conversationParticipants).where(and(eq(conversationParticipants.conversationId, input.conversationId), eq(conversationParticipants.userId, input.senderUserId))).limit(1);
  if (!membership) return { id: 0, persisted: false };
  const result = await db.insert(conversationMessages).values({ conversationId: input.conversationId, senderUserId: input.senderUserId, body: input.body, attachmentUrl: input.attachmentUrl ?? null });
  await db.update(conversations).set({ updatedAt: new Date() }).where(eq(conversations.id, input.conversationId));
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function markConversationRead(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) return { persisted: false, reason: "database_unavailable" as const };
  const [membership] = await db.select({ id: conversationParticipants.id }).from(conversationParticipants).where(and(eq(conversationParticipants.conversationId, conversationId), eq(conversationParticipants.userId, userId))).limit(1);
  if (!membership) return { persisted: false, reason: "not_participant" as const };
  const now = new Date();
  await db.update(conversationParticipants).set({ lastReadAt: now }).where(eq(conversationParticipants.id, membership.id));
  await db.update(conversationMessages).set({ isRead: true }).where(and(eq(conversationMessages.conversationId, conversationId), ne(conversationMessages.senderUserId, userId), eq(conversationMessages.isRead, false)));
  return { persisted: true };
}

export async function createProjectBrief(input: { ownerUserId: number; companyId?: number; title: string; intent: "shape_direction" | "ask_product" | "field_note" | "ai_studio"; lane?: string; fieldNote?: string; direction?: string; budgetKes?: number; timeline?: string; isPublic: boolean; items: Array<{ itemType: "post" | "product" | "vendor" | "collage" | "image"; itemId?: number; imageUrl?: string; note?: string }> }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false, reason: "database_unavailable" as const };
  if (input.companyId) {
    const [company] = await db.select({ id: companies.id }).from(companies).where(and(eq(companies.id, input.companyId), eq(companies.verificationStatus, "verified"))).limit(1);
    if (!company) return { id: 0, persisted: false, reason: "company_unavailable" as const };
  }
  const result = await db.insert(projectBriefs).values({ ownerUserId: input.ownerUserId, companyId: input.companyId ?? null, title: input.title, intent: input.intent, lane: input.lane ?? null, fieldNote: input.fieldNote ?? null, direction: input.direction ?? null, budgetKes: input.budgetKes ?? null, timeline: input.timeline ?? null, isPublic: input.isPublic });
  const briefId = Number(result[0]?.insertId ?? 0);
  if (!briefId) return { id: 0, persisted: false };
  if (input.items.length) await db.insert(projectBriefItems).values(input.items.map((item, sortOrder) => ({ briefId, ...item, itemId: item.itemId ?? null, imageUrl: item.imageUrl ?? null, note: item.note ?? null, sortOrder })));
  await db.insert(projectBriefEvents).values({ briefId, actorUserId: input.ownerUserId, eventType: "created", note: null });
  return { id: briefId, persisted: true };
}

export async function getProjectBriefsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  const briefs = await db.select().from(projectBriefs).where(eq(projectBriefs.ownerUserId, userId)).orderBy(desc(projectBriefs.updatedAt)).limit(100);
  const ids = briefs.map((brief) => brief.id);
  const items = ids.length ? await db.select().from(projectBriefItems).where(inArray(projectBriefItems.briefId, ids)).orderBy(projectBriefItems.sortOrder) : [];
  return briefs.map((brief) => ({ ...brief, items: items.filter((item) => item.briefId === brief.id) }));
}

type ProjectActorRole = "owner" | "manager" | "editor";
type ProjectStatus = "draft" | "submitted" | "in_review" | "quoted" | "accepted" | "in_progress" | "completed" | "cancelled";
type ProjectEventType = "submitted" | "reviewed" | "quoted" | "accepted" | "payment_requested" | "payment_received" | "handoff_started" | "completed" | "cancelled";

const projectTransitions: Record<ProjectStatus, ProjectStatus[]> = {
  draft: ["submitted", "cancelled"],
  submitted: ["in_review", "cancelled"],
  in_review: ["quoted", "accepted", "cancelled"],
  quoted: ["accepted", "cancelled"],
  accepted: ["in_progress", "cancelled"],
  in_progress: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

const projectRoleTransitions: Record<ProjectActorRole, ProjectStatus[]> = {
  owner: ["submitted", "accepted", "cancelled"],
  manager: ["in_review", "quoted", "in_progress", "completed", "cancelled"],
  editor: ["in_review", "quoted", "in_progress"],
};

export function canAdvanceProject(current: ProjectStatus, next: ProjectStatus, role: ProjectActorRole) {
  return current !== next && projectTransitions[current].includes(next) && projectRoleTransitions[role].includes(next);
}

export async function updateProjectBriefStatus(input: { briefId: number; actorUserId: number; actorRole: ProjectActorRole; status: ProjectStatus; eventType: ProjectEventType; note?: string }) {
  const db = await getDb();
  if (!db) return { persisted: false, reason: "database_unavailable" as const };
  const [brief] = await db.select().from(projectBriefs).where(eq(projectBriefs.id, input.briefId)).limit(1);
  if (!brief) return { persisted: false, reason: "not_found" as const };
  if (input.actorRole === "owner" && brief.ownerUserId !== input.actorUserId) return { persisted: false, reason: "not_owner" as const };
  if (input.actorRole !== "owner") {
    if (!brief.companyId) return { persisted: false, reason: "no_company" as const };
    const [membership] = await db.select({ memberRole: companyMembers.memberRole }).from(companyMembers).where(and(eq(companyMembers.companyId, brief.companyId), eq(companyMembers.userId, input.actorUserId))).limit(1);
    if (!membership || membership.memberRole !== input.actorRole) return { persisted: false, reason: "not_company_member" as const };
  }
  if (!canAdvanceProject(brief.status, input.status, input.actorRole)) return { persisted: false, reason: "invalid_transition" as const };
  const eventForStatus: Partial<Record<ProjectStatus, ProjectEventType>> = { submitted: "submitted", in_review: "reviewed", quoted: "quoted", accepted: "accepted", completed: "completed", cancelled: "cancelled" };
  if (eventForStatus[input.status] && eventForStatus[input.status] !== input.eventType) return { persisted: false, reason: "event_mismatch" as const };
  await db.update(projectBriefs).set({ status: input.status }).where(and(eq(projectBriefs.id, input.briefId), eq(projectBriefs.status, brief.status)));
  await db.insert(projectBriefEvents).values({ briefId: input.briefId, actorUserId: input.actorUserId, eventType: input.eventType, note: input.note ?? null });
  return { persisted: true, ownerUserId: brief.ownerUserId, companyId: brief.companyId ?? undefined, status: input.status };
}

export async function getCompanyInquiries(companyId: number, status?: "new" | "reviewed" | "quoted" | "accepted" | "declined" | "closed") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inquiries).where(and(eq(inquiries.companyId, companyId), status ? eq(inquiries.status, status) : undefined)).orderBy(desc(inquiries.updatedAt)).limit(100);
}

export async function getInquiriesForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(inquiries).where(eq(inquiries.userId, userId)).orderBy(desc(inquiries.updatedAt)).limit(100);
}

export async function updateCompanyProductStatus(input: { companyId: number; productId: number; status: "draft" | "pending" }) {
  const db = await getDb();
  if (!db) return { persisted: false, reason: "database_unavailable" as const };
  const [product] = await db.select({ status: companyProducts.status }).from(companyProducts).where(and(eq(companyProducts.id, input.productId), eq(companyProducts.companyId, input.companyId))).limit(1);
  if (!product) return { persisted: false, reason: "not_found" as const };
  const valid = canUpdateCompanyProduct(product.status, input.status);
  if (!valid) return { persisted: false, reason: "invalid_transition" as const };
  await db.update(companyProducts).set({ status: input.status, isActive: false }).where(and(eq(companyProducts.id, input.productId), eq(companyProducts.companyId, input.companyId), eq(companyProducts.status, product.status)));
  return { persisted: true };
}

export const inquiryTransitions: Record<"new" | "reviewed" | "quoted" | "accepted" | "declined" | "closed", string[]> = {
  new: ["reviewed", "declined", "closed"],
  reviewed: ["quoted", "declined", "closed"],
  quoted: ["accepted", "declined", "closed"],
  accepted: ["closed"],
  declined: [],
  closed: [],
};

export async function createInquiryQuote(input: { inquiryId: number; companyId: number; createdByUserId: number; amountKes: number; description: string; estimatedDays?: number; validUntil?: Date }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false, reason: "database_unavailable" as const };
  const [membership] = await db.select({ id: companyMembers.id }).from(companyMembers).where(and(eq(companyMembers.companyId, input.companyId), eq(companyMembers.userId, input.createdByUserId))).limit(1);
  if (!membership) return { id: 0, persisted: false, reason: "not_company_member" as const };
  const [inquiry] = await db.select({ companyId: inquiries.companyId, status: inquiries.status }).from(inquiries).where(eq(inquiries.id, input.inquiryId)).limit(1);
  if (!inquiry || inquiry.companyId !== input.companyId || !["new", "reviewed"].includes(inquiry.status)) return { id: 0, persisted: false, reason: "inquiry_not_quoteable" as const };
  if (input.validUntil && input.validUntil.getTime() <= Date.now()) return { id: 0, persisted: false, reason: "quote_expired" as const };
  const result = await db.insert(inquiryQuotes).values({ inquiryId: input.inquiryId, companyId: input.companyId, createdByUserId: input.createdByUserId, amountKes: input.amountKes, description: input.description, estimatedDays: input.estimatedDays ?? null, validUntil: input.validUntil ?? null, status: "sent" });
  await db.update(inquiries).set({ status: "quoted" }).where(and(eq(inquiries.id, input.inquiryId), eq(inquiries.companyId, input.companyId), eq(inquiries.status, inquiry.status)));
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function updateInquiryStatus(input: { inquiryId: number; companyId: number; status: "reviewed" | "quoted" | "accepted" | "declined" | "closed" }) {
  const db = await getDb();
  if (!db) return { persisted: false, reason: "database_unavailable" as const };
  const [inquiry] = await db.select({ status: inquiries.status }).from(inquiries).where(and(eq(inquiries.id, input.inquiryId), eq(inquiries.companyId, input.companyId))).limit(1);
  if (!inquiry) return { persisted: false, reason: "not_found" as const };
  if (!canUpdateInquiry(inquiry.status, input.status)) return { persisted: false, reason: "invalid_transition" as const };
  await db.update(inquiries).set({ status: input.status }).where(and(eq(inquiries.id, input.inquiryId), eq(inquiries.companyId, input.companyId), eq(inquiries.status, inquiry.status)));
  return { persisted: true };
}

export async function getOrCreateCart(userId: number) {
  const db = await getDb();
  if (!db) return { cart: undefined, items: [], persisted: false };
  await db.insert(carts).values({ userId, status: "active" }).onDuplicateKeyUpdate({ set: { status: "active", updatedAt: new Date() } });
  const [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  const items = cart ? await db.select().from(cartItems).where(eq(cartItems.cartId, cart.id)).orderBy(desc(cartItems.updatedAt)) : [];
  return { cart, items, persisted: true };
}

function offerDiscountKes(offer: typeof discountOffers.$inferSelect, merchandiseSubtotalKes: number) {
  return Math.min(merchandiseSubtotalKes, offer.discountType === "percentage" ? Math.round(merchandiseSubtotalKes * offer.discountValue / 100) : offer.discountValue);
}

export async function getCartSnapshot(userId: number) {
  const db = await getDb();
  if (!db) return { cart: undefined, items: [], persisted: false };
  const cartResult = await getOrCreateCart(userId);
  if (!cartResult.cart || !cartResult.items.length) return { cart: cartResult.cart, items: [], persisted: true };
  const productIds = Array.from(new Set(cartResult.items.map((item) => item.productId)));
  const products = await db.select({ product: companyProducts, company: companies }).from(companyProducts).innerJoin(companies, eq(companyProducts.companyId, companies.id)).where(and(inArray(companyProducts.id, productIds), eq(companyProducts.status, "published"), eq(companyProducts.isActive, true), eq(companies.verificationStatus, "verified"))).limit(100);
  const offerIds = Array.from(new Set(cartResult.items.map((item) => item.selectedOfferId).filter((id): id is number => id !== null)));
  const offers = offerIds.length ? await db.select().from(discountOffers).where(and(inArray(discountOffers.id, offerIds), eq(discountOffers.status, "approved"), eq(discountOffers.isPublic, true))).limit(100) : [];
  const now = new Date();
  const rows = cartResult.items.flatMap((item) => {
    const matched = products.find((row) => row.product.id === item.productId);
    if (!matched) return [];
    const merchandiseSubtotalKes = matched.product.priceKes * item.quantity;
    const offer = offers.find((candidate) => candidate.id === item.selectedOfferId && (!candidate.productId || candidate.productId === matched.product.id) && (!candidate.companyId || candidate.companyId === matched.company.id) && candidate.validFrom <= now && (!candidate.validUntil || candidate.validUntil >= now) && (!candidate.usageLimit || candidate.usedCount < candidate.usageLimit) && (!candidate.minimumSpendKes || merchandiseSubtotalKes >= candidate.minimumSpendKes));
    const discountKes = offer && (!offer.minimumSpendKes || merchandiseSubtotalKes >= offer.minimumSpendKes) ? offerDiscountKes(offer, merchandiseSubtotalKes) : 0;
    return [{ ...item, product: matched.product, company: matched.company, offer: offer ?? null, merchandiseSubtotalKes, discountKes, checkoutMerchandiseKes: merchandiseSubtotalKes - discountKes }];
  });
  return { cart: cartResult.cart, items: rows, persisted: true };
}

export async function upsertCartItem(input: { userId: number; productId: number; quantity: number; selectedOfferId?: number }) {
  const db = await getDb();
  if (!db) return { persisted: false, reason: "database_unavailable" as const };
  const cartResult = await getOrCreateCart(input.userId);
  if (!cartResult.cart) return { persisted: false, reason: "cart_unavailable" as const };
  const snapshot = await getCartSnapshot(input.userId);
  const item = snapshot.items.find((candidate) => candidate.productId === input.productId);
  const product = item ? { product: item.product, company: item.company } : (await db.select({ product: companyProducts, company: companies }).from(companyProducts).innerJoin(companies, eq(companyProducts.companyId, companies.id)).where(and(eq(companyProducts.id, input.productId), eq(companyProducts.status, "published"), eq(companyProducts.isActive, true), eq(companies.verificationStatus, "verified"))).limit(1))[0];
  if (!product) return { persisted: false, reason: "product_unavailable" as const };
  if (product.product.stockQuantity < input.quantity) return { persisted: false, reason: "stock_unavailable" as const };
  if (input.selectedOfferId) {
    const offer = (await db.select().from(discountOffers).where(and(eq(discountOffers.id, input.selectedOfferId), eq(discountOffers.status, "approved"), eq(discountOffers.isPublic, true))).limit(1))[0];
    const now = new Date();
    if (!offer || (offer.productId && offer.productId !== input.productId) || (offer.companyId && offer.companyId !== product.company.id) || offer.validFrom > now || (offer.validUntil && offer.validUntil < now) || (offer.usageLimit !== null && offer.usedCount >= offer.usageLimit)) return { persisted: false, reason: "offer_unavailable" as const };
    const [priorUse] = await db.select({ id: discountOfferUsages.id }).from(discountOfferUsages).where(and(eq(discountOfferUsages.offerId, offer.id), eq(discountOfferUsages.userId, input.userId))).limit(1);
    if (priorUse) return { persisted: false, reason: "offer_already_used" as const };
  }
  await db.insert(cartItems).values({ cartId: cartResult.cart.id, productId: input.productId, quantity: input.quantity, selectedOfferId: input.selectedOfferId ?? null }).onDuplicateKeyUpdate({ set: { quantity: input.quantity, selectedOfferId: input.selectedOfferId ?? null, updatedAt: new Date() } });
  return { persisted: true };
}

export async function removeCartItem(userId: number, productId: number) {
  const db = await getDb();
  if (!db) return { persisted: false };
  const [cart] = await db.select().from(carts).where(eq(carts.userId, userId)).limit(1);
  if (cart) await db.delete(cartItems).where(and(eq(cartItems.cartId, cart.id), eq(cartItems.productId, productId)));
  return { persisted: true };
}

export async function createOrderHandoff(input: { orderId: number; companyId: number; actorUserId: number; destinationCity: string; customerNote?: string }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false, reason: "database_unavailable" as const };
  const [order] = await db.select({ id: commerceOrders.id, userId: commerceOrders.userId, companyId: commerceOrders.companyId, status: commerceOrders.status, paymentStatus: commerceOrders.paymentStatus }).from(commerceOrders).where(and(eq(commerceOrders.id, input.orderId), eq(commerceOrders.companyId, input.companyId))).limit(1);
  if (!order || order.userId !== input.actorUserId) return { id: 0, persisted: false, reason: "not_order_owner" as const };
  if (order.paymentStatus !== "paid" || !["paid", "processing"].includes(order.status)) return { id: 0, persisted: false, reason: "payment_required" as const };
  const [existing] = await db.select({ id: orderHandoffs.id }).from(orderHandoffs).where(eq(orderHandoffs.orderId, input.orderId)).limit(1);
  if (existing) return { id: existing.id, persisted: false, reason: "already_exists" as const };
  const result = await db.insert(orderHandoffs).values({ orderId: input.orderId, companyId: input.companyId, destinationCity: input.destinationCity, customerNote: input.customerNote ?? null, status: "pending" });
  const handoffId = Number(result[0]?.insertId ?? 0);
  if (handoffId) await db.insert(orderHandoffEvents).values({ handoffId, actorUserId: input.actorUserId, status: "pending", note: "Handoff created" });
  return { id: handoffId, persisted: true };
}

export async function getOrderHandoff(orderId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [handoff] = await db.select().from(orderHandoffs).where(eq(orderHandoffs.orderId, orderId)).limit(1);
  if (!handoff) return undefined;
  const events = await db.select().from(orderHandoffEvents).where(eq(orderHandoffEvents.handoffId, handoff.id)).orderBy(orderHandoffEvents.createdAt);
  return { handoff, events };
}

type HandoffStatus = "pending" | "accepted" | "in_production" | "ready" | "in_transit" | "delivered" | "issue" | "cancelled";
const handoffTransitions: Record<HandoffStatus, HandoffStatus[]> = {
  pending: ["accepted", "issue", "cancelled"],
  accepted: ["in_production", "issue", "cancelled"],
  in_production: ["ready", "issue", "cancelled"],
  ready: ["in_transit", "issue"],
  in_transit: ["delivered", "issue"],
  delivered: [],
  issue: ["accepted", "in_production", "cancelled"],
  cancelled: [],
};

export function canAdvanceHandoff(current: HandoffStatus, next: HandoffStatus, actorType: "customer" | "company") {
  const customerAllowed: HandoffStatus[] = ["issue", "cancelled"];
  const companyAllowed: HandoffStatus[] = ["accepted", "in_production", "ready", "in_transit", "delivered", "issue", "cancelled"];
  return current !== next && handoffTransitions[current].includes(next) && (actorType === "customer" ? customerAllowed.includes(next) : companyAllowed.includes(next));
}

export async function updateOrderHandoff(input: { handoffId: number; actorUserId: number; status: HandoffStatus; note?: string; trackingReference?: string }) {
  const db = await getDb();
  if (!db) return { persisted: false, reason: "database_unavailable" as const };
  const [handoff] = await db.select({ handoff: orderHandoffs, order: commerceOrders }).from(orderHandoffs).innerJoin(commerceOrders, eq(orderHandoffs.orderId, commerceOrders.id)).where(eq(orderHandoffs.id, input.handoffId)).limit(1);
  if (!handoff) return { persisted: false, reason: "not_found" as const };
  const [member] = await db.select({ memberRole: companyMembers.memberRole }).from(companyMembers).where(and(eq(companyMembers.companyId, handoff.handoff.companyId), eq(companyMembers.userId, input.actorUserId))).limit(1);
  const isCustomer = handoff.order.userId === input.actorUserId;
  if (!isCustomer && !member) return { persisted: false, reason: "not_authorized" as const };
  if (!canAdvanceHandoff(handoff.handoff.status, input.status, isCustomer ? "customer" : "company")) return { persisted: false, reason: "invalid_transition" as const };
  const updateSet = input.trackingReference === undefined ? { status: input.status } : { status: input.status, trackingReference: input.trackingReference };
  await db.update(orderHandoffs).set(updateSet).where(and(eq(orderHandoffs.id, input.handoffId), eq(orderHandoffs.status, handoff.handoff.status)));
  await db.insert(orderHandoffEvents).values({ handoffId: input.handoffId, actorUserId: input.actorUserId, status: input.status, note: input.note ?? null });
  if (input.status === "in_production" || input.status === "ready" || input.status === "in_transit") await db.update(commerceOrders).set({ status: "processing" }).where(and(eq(commerceOrders.id, handoff.order.id), eq(commerceOrders.status, "paid")));
  if (input.status === "delivered") await db.update(commerceOrders).set({ status: "delivered" }).where(and(eq(commerceOrders.id, handoff.order.id), eq(commerceOrders.status, "processing")));
  return { persisted: true, companyId: handoff.handoff.companyId, orderUserId: handoff.order.userId, orderId: handoff.order.id, status: input.status };
}

export async function recordCompanyAnalyticsEvent(input: { companyId: number; productId?: number; postId?: number; eventType: "profile_view" | "product_view" | "post_view" | "save" | "repost" | "inquiry" | "checkout_start" | "purchase"; actorUserId?: number; metadataJson?: string }) {
  const db = await getDb();
  if (!db) return { persisted: false, reason: "database_unavailable" as const };
  const [company] = await db.select({ id: companies.id }).from(companies).where(and(eq(companies.id, input.companyId), eq(companies.verificationStatus, "verified"))).limit(1);
  if (!company) return { persisted: false, reason: "company_unavailable" as const };
  if (input.productId) {
    const [product] = await db.select({ id: companyProducts.id }).from(companyProducts).where(and(eq(companyProducts.id, input.productId), eq(companyProducts.companyId, input.companyId), eq(companyProducts.status, "published"), eq(companyProducts.isActive, true))).limit(1);
    if (!product) return { persisted: false, reason: "product_unavailable" as const };
  }
  if (input.postId) {
    const [post] = await db.select({ id: companyPosts.id }).from(companyPosts).where(and(eq(companyPosts.id, input.postId), eq(companyPosts.companyId, input.companyId), eq(companyPosts.status, "published"), eq(companyPosts.isPublic, true))).limit(1);
    if (!post) return { persisted: false, reason: "post_unavailable" as const };
  }
  await db.insert(companyAnalyticsEvents).values({ ...input, productId: input.productId ?? null, postId: input.postId ?? null, actorUserId: input.actorUserId ?? null, metadataJson: input.metadataJson ?? null });
  return { persisted: true };
}

export async function getCompanyAnalytics(companyId: number) {
  const db = await getDb();
  if (!db) return { totals: [], persisted: false };
  const totals = await db.select({ eventType: companyAnalyticsEvents.eventType, total: count(companyAnalyticsEvents.id) }).from(companyAnalyticsEvents).where(eq(companyAnalyticsEvents.companyId, companyId)).groupBy(companyAnalyticsEvents.eventType);
  return { totals: totals.map((row) => ({ eventType: row.eventType, total: Number(row.total) })), persisted: true };
}

export async function beginCommercePayment(input: { userId: number; orderId: number; provider: "mpesa" | "stripe"; reference: string }) {
  await releaseExpiredCommerceReservations();
  const db = await getDb();
  if (!db) return { id: 0, persisted: false, reason: "database_unavailable" as const };
  const [order] = await db.select().from(commerceOrders).where(and(eq(commerceOrders.id, input.orderId), eq(commerceOrders.userId, input.userId))).limit(1);
  if (!order || order.status !== "awaiting_payment" || order.paymentStatus !== "unpaid" || !order.stockReserved) return { id: 0, persisted: false, reason: "order_not_payable" as const };
  const [existing] = await db.select().from(paymentOrders).where(and(eq(paymentOrders.commerceOrderId, order.id), eq(paymentOrders.status, "pending"))).orderBy(desc(paymentOrders.createdAt)).limit(1);
  if (existing) return { id: existing.id, reference: existing.reference, amountKes: existing.amountKes, provider: existing.provider, persisted: true, reused: true };
  const payment = await db.insert(paymentOrders).values({ userId: input.userId, companyId: order.companyId, commerceOrderId: order.id, orderType: "commerce_purchase", amountKes: order.customerTotalKes, provider: input.provider, status: "pending", reference: input.reference });
  const paymentOrderId = Number(payment[0]?.insertId ?? 0);
  await db.update(commerceOrders).set({ paymentOrderId, paymentStatus: "pending" }).where(and(eq(commerceOrders.id, order.id), eq(commerceOrders.paymentStatus, "unpaid")));
  return { id: paymentOrderId, reference: input.reference, amountKes: order.customerTotalKes, provider: input.provider, persisted: true, reused: false };
}

export async function reconcileCommercePayment(input: { paymentOrderId: number; status: "paid" | "failed" | "cancelled"; providerReference?: string; failureReason?: string }) {
  const db = await getDb();
  if (!db) return { persisted: false, reason: "database_unavailable" as const };
  const [payment] = await db.select().from(paymentOrders).where(eq(paymentOrders.id, input.paymentOrderId)).limit(1);
  if (!payment || payment.orderType !== "commerce_purchase" || !canReconcilePayment(payment.status, input.status) || !payment.commerceOrderId) return { persisted: false, reason: "payment_not_pending" as const };
  const [order] = await db.select().from(commerceOrders).where(eq(commerceOrders.id, payment.commerceOrderId)).limit(1);
  if (!order) return { persisted: false, reason: "order_not_found" as const };
  await db.transaction(async (tx) => {
    await tx.update(paymentOrders).set({ status: input.status, providerReference: input.providerReference ?? null, failureReason: input.failureReason ?? null, paidAt: input.status === "paid" ? new Date() : null }).where(and(eq(paymentOrders.id, input.paymentOrderId), eq(paymentOrders.status, "pending")));
    if (input.status === "paid") {
      await tx.update(commerceOrders).set({ paymentStatus: "paid", status: "paid", reservationExpiresAt: null }).where(and(eq(commerceOrders.id, order.id), eq(commerceOrders.paymentStatus, "pending")));
      if (order.selectedOfferId) await tx.update(discountOfferUsages).set({ status: "consumed" }).where(and(eq(discountOfferUsages.offerId, order.selectedOfferId), eq(discountOfferUsages.commerceOrderId, order.id), eq(discountOfferUsages.status, "reserved")));
    } else {
      if (order.stockReserved) {
        await tx.update(companyProducts).set({ stockQuantity: sql`${companyProducts.stockQuantity} + ${order.quantity}` }).where(eq(companyProducts.id, order.productId));
        await tx.update(commerceOrders).set({ stockReserved: false }).where(eq(commerceOrders.id, order.id));
      }
      if (order.selectedOfferId) {
        await tx.update(discountOffers).set({ usedCount: sql`greatest(0, ${discountOffers.usedCount} - 1)` }).where(and(eq(discountOffers.id, order.selectedOfferId), gt(discountOffers.usedCount, 0)));
        await tx.update(discountOfferUsages).set({ status: "released" }).where(and(eq(discountOfferUsages.offerId, order.selectedOfferId), eq(discountOfferUsages.commerceOrderId, order.id), eq(discountOfferUsages.status, "reserved")));
      }
      await tx.update(commerceOrders).set({ paymentStatus: "unpaid", status: input.status === "cancelled" ? "cancelled" : "awaiting_payment", reservationExpiresAt: null }).where(and(eq(commerceOrders.id, order.id), eq(commerceOrders.paymentStatus, "pending")));
    }
  });
  return { persisted: true, status: input.status, userId: order.userId, companyId: order.companyId, orderId: order.id };
}


export async function getAdminCompanyProductReviewQueue() {
  const db = await getDb();
  if (!db) return [];
  return db.select({ product: companyProducts, company: { id: companies.id, name: companies.name, slug: companies.slug } }).from(companyProducts).innerJoin(companies, eq(companyProducts.companyId, companies.id)).where(eq(companyProducts.status, "pending")).orderBy(desc(companyProducts.updatedAt)).limit(100);
}

export async function updateAdminCompanyProductStatus(productId: number, status: "published" | "rejected") {
  const db = await getDb();
  if (!db) return { persisted: false, reason: "database_unavailable" as const };
  const [product] = await db.select({ companyId: companyProducts.companyId, status: companyProducts.status }).from(companyProducts).where(eq(companyProducts.id, productId)).limit(1);
  if (!product || product.status !== "pending") return { persisted: false, reason: "not_pending" as const };
  await db.update(companyProducts).set({ status, isActive: status === "published" }).where(and(eq(companyProducts.id, productId), eq(companyProducts.status, "pending")));
  return { persisted: true, companyId: product.companyId };
}

export async function getProjectBriefsForCompany(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  const briefs = await db.select().from(projectBriefs).where(eq(projectBriefs.companyId, companyId)).orderBy(desc(projectBriefs.updatedAt)).limit(100);
  const ids = briefs.map((brief) => brief.id);
  const items = ids.length ? await db.select().from(projectBriefItems).where(inArray(projectBriefItems.briefId, ids)).orderBy(projectBriefItems.sortOrder) : [];
  return briefs.map((brief) => ({ ...brief, items: items.filter((item) => item.briefId === brief.id) }));
}

export async function getCompanyMembers(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ userId: companyMembers.userId, memberRole: companyMembers.memberRole }).from(companyMembers).where(eq(companyMembers.companyId, companyId)).limit(100);
}


export async function getPostOwnerUserId(postId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [post] = await db.select({ userId: companyPosts.createdByUserId }).from(companyPosts).where(eq(companyPosts.id, postId)).limit(1);
  return post?.userId;
}

export async function getCompanyOwnerUserId(companyId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [company] = await db.select({ userId: companies.ownerUserId, name: companies.name }).from(companies).where(eq(companies.id, companyId)).limit(1);
  return company;
}


export async function getInquiryAudience(inquiryId: number) {
  const db = await getDb();
  if (!db) return [];
  const [inquiry] = await db.select({ userId: inquiries.userId, companyId: inquiries.companyId }).from(inquiries).where(eq(inquiries.id, inquiryId)).limit(1);
  if (!inquiry) return [];
  const ids = new Set<number>();
  if (inquiry.userId) ids.add(inquiry.userId);
  if (inquiry.companyId) {
    const members = await db.select({ userId: companyMembers.userId }).from(companyMembers).where(eq(companyMembers.companyId, inquiry.companyId)).limit(100);
    members.forEach((member) => ids.add(member.userId));
  }
  return Array.from(ids);
}

export async function getConversationAudience(conversationId: number, excludeUserId?: number) {
  const db = await getDb();
  if (!db) return [];
  const participants = await db.select({ userId: conversationParticipants.userId }).from(conversationParticipants).where(eq(conversationParticipants.conversationId, conversationId)).limit(100);
  return participants.map((participant) => participant.userId).filter((userId) => isNotificationRecipient(userId, excludeUserId));
}


export async function createShowroomSession(input: { userId: number; title: string; kind: "home_refresh" | "personal_style" | "footwear_fit" | "inspiration" | "wardrobe_edit" | "home_showroom" | "product_edit" | "vehicle_garage" | "detailing_bay" | "tattoo_concept" | "pet_accessory"; viewMode: "orbit" | "cover_flow" | "window_carousel" | "reverse_columns" | "explorer"; sessionToken: string; configJson?: string; objects: Array<{ objectType: string; label: string; imageUrl?: string; modelUrl?: string; positionJson?: string; rotationJson?: string; scaleJson?: string; metadataJson?: string }>; annotations: Array<{ objectId?: number; title: string; body: string; anchorJson?: string }> }) {
  const db = await getDb();
  if (!db) return { id: 0, sessionToken: input.sessionToken, persisted: false };
  const result = await db.insert(showroomSessions).values({ userId: input.userId, title: input.title, kind: input.kind, viewMode: input.viewMode, sessionToken: input.sessionToken, configJson: input.configJson ?? null, status: "draft", isPublic: false });
  const sessionId = Number(result[0]?.insertId ?? 0);
  if (!sessionId) return { id: 0, sessionToken: input.sessionToken, persisted: false };
  if (input.objects.length) await db.insert(showroomObjects).values(input.objects.map((object, sortOrder) => ({ sessionId, objectType: object.objectType, label: object.label, imageUrl: object.imageUrl ?? null, modelUrl: object.modelUrl ?? null, positionJson: object.positionJson ?? null, rotationJson: object.rotationJson ?? null, scaleJson: object.scaleJson ?? null, metadataJson: object.metadataJson ?? null, sortOrder })));
  if (input.annotations.length) await db.insert(showroomAnnotations).values(input.annotations.map((annotation) => ({ sessionId, objectId: annotation.objectId ?? null, title: annotation.title, body: annotation.body, anchorJson: annotation.anchorJson ?? null, isVisible: true })));
  return { id: sessionId, sessionToken: input.sessionToken, persisted: true };
}

export async function getShowroomSession(sessionId: number, userId?: number) {
  const db = await getDb();
  if (!db) return undefined;
  const [session] = await db.select().from(showroomSessions).where(and(eq(showroomSessions.id, sessionId), userId === undefined ? eq(showroomSessions.isPublic, true) : or(eq(showroomSessions.userId, userId), eq(showroomSessions.isPublic, true)))).limit(1);
  if (!session) return undefined;
  const [objects, annotations] = await Promise.all([
    db.select().from(showroomObjects).where(eq(showroomObjects.sessionId, sessionId)).orderBy(showroomObjects.sortOrder),
    db.select().from(showroomAnnotations).where(and(eq(showroomAnnotations.sessionId, sessionId), eq(showroomAnnotations.isVisible, true))),
  ]);
  return { session, objects, annotations };
}

export async function getShowroomSessionsForUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(showroomSessions).where(eq(showroomSessions.userId, userId)).orderBy(desc(showroomSessions.updatedAt)).limit(100);
}

export async function updateShowroomSession(input: { sessionId: number; userId: number; title?: string; viewMode?: "orbit" | "cover_flow" | "window_carousel" | "reverse_columns" | "explorer"; configJson?: string; status?: "draft" | "active" | "archived"; isPublic?: boolean }) {
  const db = await getDb();
  if (!db) return { persisted: false };
  const [session] = await db.select({ id: showroomSessions.id }).from(showroomSessions).where(and(eq(showroomSessions.id, input.sessionId), eq(showroomSessions.userId, input.userId))).limit(1);
  if (!session) return { persisted: false };
  const { sessionId, userId, ...updates } = input;
  await db.update(showroomSessions).set(updates).where(eq(showroomSessions.id, sessionId));
  return { persisted: true };
}


export async function createSignalStory(input: { creatorUserId: number; companyId?: number; imageUrl: string; caption?: string; aestheticTags?: string[]; expiresAt: Date }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  if (input.expiresAt.getTime() <= Date.now() || input.expiresAt.getTime() > Date.now() + 48 * 60 * 60 * 1000) return { id: 0, persisted: false };
  const result = await db.insert(signalStories).values({ creatorUserId: input.creatorUserId, companyId: input.companyId ?? null, imageUrl: input.imageUrl, caption: input.caption ?? null, aestheticTags: JSON.stringify(input.aestheticTags ?? []), expiresAt: input.expiresAt, isPublic: true });
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function getSignalStoryFeed(userId?: number) {
  const db = await getDb();
  if (!db) return [];
  const stories = await db.select().from(signalStories).where(and(eq(signalStories.isPublic, true), gt(signalStories.expiresAt, new Date()))).orderBy(desc(signalStories.createdAt)).limit(100);
  const storyIds = stories.map((story) => story.id);
  const views = userId && storyIds.length ? await db.select({ storyId: signalStoryViews.storyId }).from(signalStoryViews).where(and(eq(signalStoryViews.userId, userId), inArray(signalStoryViews.storyId, storyIds))) : [];
  const viewed = new Set(views.map((view) => view.storyId));
  return stories.map((story) => ({ ...story, viewed: viewed.has(story.id) }));
}

export async function markSignalStoryViewed(storyId: number, userId: number) {
  const db = await getDb();
  if (!db) return { persisted: false };
  await db.insert(signalStoryViews).values({ storyId, userId }).onDuplicateKeyUpdate({ set: { viewedAt: new Date() } });
  return { persisted: true };
}

export async function createCompanyMemberInvitation(input: { companyId: number; invitedByUserId: number; email: string; memberRole: "manager" | "editor"; token: string }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(companyMemberInvitations).values({ companyId: input.companyId, invitedByUserId: input.invitedByUserId, email: input.email.toLowerCase(), memberRole: input.memberRole, token: input.token, expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), status: "pending" });
  return { id: Number(result[0]?.insertId ?? 0), token: input.token, persisted: true };
}

export async function getCompanyMemberInvitations(companyId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(companyMemberInvitations).where(eq(companyMemberInvitations.companyId, companyId)).orderBy(desc(companyMemberInvitations.createdAt)).limit(100);
}

export async function acceptCompanyMemberInvitation(input: { token: string; userId: number; email: string }) {
  const db = await getDb();
  if (!db) return { persisted: false };
  const [invitation] = await db.select().from(companyMemberInvitations).where(and(eq(companyMemberInvitations.token, input.token), eq(companyMemberInvitations.status, "pending"))).limit(1);
  if (!invitation || invitation.expiresAt.getTime() <= Date.now() || invitation.email.toLowerCase() !== input.email.toLowerCase()) return { persisted: false };
  await db.insert(companyMembers).values({ companyId: invitation.companyId, userId: input.userId, memberRole: invitation.memberRole }).onDuplicateKeyUpdate({ set: { memberRole: invitation.memberRole } });
  await db.update(companyMemberInvitations).set({ status: "accepted" }).where(eq(companyMemberInvitations.id, invitation.id));
  return { persisted: true, companyId: invitation.companyId, memberRole: invitation.memberRole };
}

export async function createContentReport(input: { reporterUserId: number; targetType: "post" | "product" | "company" | "profile" | "message" | "story" | "review"; targetId: number; reason: "spam" | "misleading" | "copyright" | "harassment" | "unsafe" | "other"; details?: string }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false };
  const result = await db.insert(contentReports).values({ ...input, details: input.details ?? null, status: "open" });
  return { id: Number(result[0]?.insertId ?? 0), persisted: true };
}

export async function getAdminContentReports(status?: "open" | "under_review" | "resolved" | "dismissed") {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(contentReports).where(status ? eq(contentReports.status, status) : undefined).orderBy(desc(contentReports.createdAt)).limit(100);
}

export async function updateContentReportStatus(reportId: number, status: "open" | "under_review" | "resolved" | "dismissed") {
  const db = await getDb();
  if (!db) return { persisted: false };
  await db.update(contentReports).set({ status }).where(eq(contentReports.id, reportId));
  return { persisted: true };
}


export async function releaseExpiredCommerceReservations() {
  const db = await getDb();
  if (!db) return { released: 0, persisted: false };
  const now = new Date();
  const expired = await db.select().from(commerceOrders).where(and(eq(commerceOrders.status, "awaiting_payment"), eq(commerceOrders.paymentStatus, "unpaid"), eq(commerceOrders.stockReserved, true), lt(commerceOrders.reservationExpiresAt, now))).limit(100);
  if (!expired.length) return { released: 0, persisted: true };
  await db.transaction(async (tx) => {
    for (const order of expired) {
      await tx.update(companyProducts).set({ stockQuantity: sql`${companyProducts.stockQuantity} + ${order.quantity}` }).where(eq(companyProducts.id, order.productId));
      if (order.selectedOfferId) {
        await tx.update(discountOffers).set({ usedCount: sql`greatest(0, ${discountOffers.usedCount} - 1)` }).where(and(eq(discountOffers.id, order.selectedOfferId), gt(discountOffers.usedCount, 0)));
        await tx.update(discountOfferUsages).set({ status: "released" }).where(and(eq(discountOfferUsages.offerId, order.selectedOfferId), eq(discountOfferUsages.commerceOrderId, order.id), eq(discountOfferUsages.status, "reserved")));
      }
      await tx.update(commerceOrders).set({ status: "cancelled", paymentStatus: "unpaid", stockReserved: false, reservationExpiresAt: null }).where(and(eq(commerceOrders.id, order.id), eq(commerceOrders.status, "awaiting_payment"), eq(commerceOrders.stockReserved, true)));
    }
  });
  return { released: expired.length, persisted: true };
}

export async function getCheckoutLine(input: { userId: number; productId: number; quantity: number; selectedOfferId?: number }) {
  await releaseExpiredCommerceReservations();
  const db = await getDb();
  if (!db) return undefined;
  const [row] = await db.select({ product: companyProducts, company: companies }).from(companyProducts).innerJoin(companies, eq(companyProducts.companyId, companies.id)).where(and(eq(companyProducts.id, input.productId), eq(companyProducts.status, "published"), eq(companyProducts.isActive, true), eq(companies.verificationStatus, "verified"))).limit(1);
  if (!row || row.product.stockQuantity < input.quantity) return undefined;
  const merchandiseSubtotalKes = row.product.priceKes * input.quantity;
  let offer: typeof discountOffers.$inferSelect | undefined;
  if (input.selectedOfferId) {
    const candidate = (await db.select().from(discountOffers).where(and(eq(discountOffers.id, input.selectedOfferId), eq(discountOffers.status, "approved"), eq(discountOffers.isPublic, true))).limit(1))[0];
    const [priorUse] = candidate ? await db.select({ id: discountOfferUsages.id }).from(discountOfferUsages).where(and(eq(discountOfferUsages.offerId, candidate.id), eq(discountOfferUsages.userId, input.userId), ne(discountOfferUsages.status, "released"))).limit(1) : [];
    const now = new Date();
    if (!candidate || priorUse || (candidate.productId && candidate.productId !== row.product.id) || (candidate.companyId && candidate.companyId !== row.company.id) || candidate.validFrom > now || (candidate.validUntil && candidate.validUntil < now) || (candidate.usageLimit !== null && candidate.usedCount >= candidate.usageLimit) || (candidate.minimumSpendKes !== null && merchandiseSubtotalKes < candidate.minimumSpendKes)) return undefined;
    offer = candidate;
  }
  const discountKes = offer ? offerDiscountKes(offer, merchandiseSubtotalKes) : 0;
  return { ...row, offer: offer ?? null, merchandiseSubtotalKes, discountKes, checkoutMerchandiseKes: merchandiseSubtotalKes - discountKes };
}

export async function createReservedCommerceOrder(input: { userId: number; companyId: number; productId: number; deliveryQuoteId: number; quantity: number; merchandiseSubtotalKes: number; discountKes?: number; selectedOfferId?: number; commissionRatePct: number; commissionKes: number; sellerSettlementKes: number; deliveryKes: number; customerTotalKes: number }) {
  const db = await getDb();
  if (!db) return { id: 0, persisted: false, reason: "database_unavailable" as const };
  const orderId = await db.transaction(async (tx) => {
    const stock = await tx.update(companyProducts).set({ stockQuantity: sql`${companyProducts.stockQuantity} - ${input.quantity}` }).where(and(eq(companyProducts.id, input.productId), eq(companyProducts.companyId, input.companyId), eq(companyProducts.status, "published"), eq(companyProducts.isActive, true), gte(companyProducts.stockQuantity, input.quantity)));
    if (!Number((stock as unknown as { affectedRows?: number }).affectedRows ?? 0)) throw new Error("The requested quantity is no longer available");
    if (input.selectedOfferId) {
      const offerReservation = await tx.update(discountOffers).set({ usedCount: sql`${discountOffers.usedCount} + 1` }).where(and(eq(discountOffers.id, input.selectedOfferId), eq(discountOffers.status, "approved"), eq(discountOffers.isPublic, true), or(isNull(discountOffers.usageLimit), gt(discountOffers.usageLimit, discountOffers.usedCount))));
      if (!Number((offerReservation as unknown as { affectedRows?: number }).affectedRows ?? 0)) throw new Error("That offer is no longer available");
    }
    const orderResult = await tx.insert(commerceOrders).values({ userId: input.userId, companyId: input.companyId, productId: input.productId, deliveryQuoteId: input.deliveryQuoteId, quantity: input.quantity, merchandiseSubtotalKes: input.merchandiseSubtotalKes, discountKes: input.discountKes ?? 0, selectedOfferId: input.selectedOfferId ?? null, stockReserved: true, commissionRatePct: input.commissionRatePct, commissionKes: input.commissionKes, sellerSettlementKes: input.sellerSettlementKes, deliveryKes: input.deliveryKes, customerTotalKes: input.customerTotalKes, status: "awaiting_payment", paymentStatus: "unpaid", reservationExpiresAt: new Date(Date.now() + 30 * 60 * 1000) });
    const id = Number(orderResult[0]?.insertId ?? 0);
    if (!id) throw new Error("Unable to create the order");
    await tx.insert(commerceOrderItems).values({ commerceOrderId: id, productId: input.productId, companyId: input.companyId, quantity: input.quantity, unitPriceKes: Math.round(input.merchandiseSubtotalKes / input.quantity), discountKes: input.discountKes ?? 0, lineTotalKes: Math.max(0, input.merchandiseSubtotalKes - (input.discountKes ?? 0)), offerId: input.selectedOfferId ?? null });
    if (input.selectedOfferId) await tx.insert(discountOfferUsages).values({ offerId: input.selectedOfferId, userId: input.userId, commerceOrderId: id, discountKes: input.discountKes ?? 0, status: "reserved" });
    return id;
  });
  return { id: Number(orderId), persisted: true };
}


export async function getOrderHandoffsForCompany(companyId: number, status?: HandoffStatus) {
  const db = await getDb();
  if (!db) return [];
  return db.select({ handoff: orderHandoffs, order: commerceOrders }).from(orderHandoffs).innerJoin(commerceOrders, eq(orderHandoffs.orderId, commerceOrders.id)).where(and(eq(orderHandoffs.companyId, companyId), status ? eq(orderHandoffs.status, status) : undefined)).orderBy(desc(orderHandoffs.updatedAt)).limit(100);
}
