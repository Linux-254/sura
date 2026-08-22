import {
  boolean,
  index,
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  uniqueIndex,
  varchar,
} from "drizzle-orm/mysql-core";

export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export const userProfiles = mysqlTable(
  "user_profiles",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    displayName: varchar("displayName", { length: 120 }),
    bio: varchar("bio", { length: 500 }),
    city: varchar("city", { length: 80 }),
    avatarUrl: text("avatarUrl"),
    publicSlug: varchar("publicSlug", { length: 96 }).unique(),
    isPublic: boolean("isPublic").default(false).notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("user_profiles_user_idx").on(table.userId)],
);

export const companies = mysqlTable(
  "companies",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull(),
    slug: varchar("slug", { length: 96 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    description: text("description"),
    city: varchar("city", { length: 80 }),
    websiteUrl: text("websiteUrl"),
    commissionRatePct: int("commissionRatePct").default(20).notNull(),
    verificationStatus: mysqlEnum("verificationStatus", ["draft", "pending", "verified", "rejected"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("companies_owner_idx").on(table.ownerUserId), index("companies_status_idx").on(table.verificationStatus)],
);

export const companyMembers = mysqlTable(
  "company_members",
  {
    id: int("id").autoincrement().primaryKey(),
    companyId: int("companyId").notNull(),
    userId: int("userId").notNull(),
    memberRole: mysqlEnum("memberRole", ["owner", "manager", "editor"]).default("editor").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("company_members_company_user_unique").on(table.companyId, table.userId), index("company_members_user_idx").on(table.userId)],
);

export const socialLinks = mysqlTable(
  "social_links",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    companyId: int("companyId"),
    platform: mysqlEnum("platform", ["instagram", "tiktok", "linkedin", "youtube", "x", "website"]).notNull(),
    url: varchar("url", { length: 500 }).notNull(),
    isPublic: boolean("isPublic").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("social_links_user_idx").on(table.userId), index("social_links_company_idx").on(table.companyId)],
);

export const legalConsents = mysqlTable(
  "legal_consents",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    documentType: mysqlEnum("documentType", ["terms", "privacy"]).notNull(),
    version: varchar("version", { length: 32 }).notNull(),
    acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("legal_consents_user_document_version_unique").on(table.userId, table.documentType, table.version), index("legal_consents_user_idx").on(table.userId)],
);

export const paymentOrders = mysqlTable(
  "payment_orders",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    companyId: int("companyId"),
    orderType: mysqlEnum("orderType", ["company_membership", "vendor_feature", "build_consultation"]).notNull(),
    amountKes: int("amountKes").notNull(),
    currency: varchar("currency", { length: 3 }).default("KES").notNull(),
    provider: mysqlEnum("provider", ["gateway_pending", "mpesa", "stripe"]).default("gateway_pending").notNull(),
    status: mysqlEnum("status", ["draft", "pending", "paid", "failed", "cancelled"]).default("draft").notNull(),
    reference: varchar("reference", { length: 64 }).notNull().unique(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("payment_orders_user_idx").on(table.userId), index("payment_orders_company_idx").on(table.companyId), index("payment_orders_status_idx").on(table.status)],
);

export const userMemberships = mysqlTable(
  "user_memberships",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    planKey: mysqlEnum("planKey", ["sura_free"]).default("sura_free").notNull(),
    status: mysqlEnum("status", ["active", "paused", "cancelled"]).default("active").notNull(),
    startedAt: timestamp("startedAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("user_memberships_status_idx").on(table.status)],
);

export const webNotifications = mysqlTable(
  "web_notifications",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    kind: mysqlEnum("kind", ["membership", "offer", "company", "platform"]).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    body: varchar("body", { length: 500 }).notNull(),
    linkUrl: varchar("linkUrl", { length: 300 }),
    isRead: boolean("isRead").default(false).notNull(),
    isDismissed: boolean("isDismissed").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("web_notifications_user_idx").on(table.userId), index("web_notifications_read_idx").on(table.isRead)],
);

export const platformAnnouncements = mysqlTable(
  "platform_announcements",
  {
    id: int("id").autoincrement().primaryKey(),
    createdByUserId: int("createdByUserId").notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    body: varchar("body", { length: 500 }).notNull(),
    linkUrl: varchar("linkUrl", { length: 300 }),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("platform_announcements_active_idx").on(table.isActive)],
);

export const companyContacts = mysqlTable(
  "company_contacts",
  {
    id: int("id").autoincrement().primaryKey(),
    companyId: int("companyId").notNull(),
    label: varchar("label", { length: 80 }).notNull(),
    contactType: mysqlEnum("contactType", ["email", "phone", "whatsapp", "address"]).notNull(),
    value: varchar("value", { length: 320 }).notNull(),
    isPublic: boolean("isPublic").default(true).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("company_contacts_company_idx").on(table.companyId)],
);

export const platformContacts = mysqlTable(
  "platform_contacts",
  {
    id: int("id").autoincrement().primaryKey(),
    createdByUserId: int("createdByUserId").notNull(),
    label: varchar("label", { length: 80 }).notNull(),
    contactType: mysqlEnum("contactType", ["email", "phone", "whatsapp", "address"]).notNull(),
    value: varchar("value", { length: 320 }).notNull(),
    isPublic: boolean("isPublic").default(true).notNull(),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("platform_contacts_public_idx").on(table.isPublic)],
);

export const discountOffers = mysqlTable(
  "discount_offers",
  {
    id: int("id").autoincrement().primaryKey(),
    companyId: int("companyId"),
    createdByUserId: int("createdByUserId").notNull(),
    code: varchar("code", { length: 48 }).notNull().unique(),
    title: varchar("title", { length: 140 }).notNull(),
    description: varchar("description", { length: 500 }),
    discountType: mysqlEnum("discountType", ["percentage", "fixed_kes"]).notNull(),
    discountValue: int("discountValue").notNull(),
    minimumSpendKes: int("minimumSpendKes"),
    validFrom: timestamp("validFrom").defaultNow().notNull(),
    validUntil: timestamp("validUntil"),
    status: mysqlEnum("status", ["draft", "pending", "approved", "rejected"]).default("draft").notNull(),
    isPublic: boolean("isPublic").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("discount_offers_company_idx").on(table.companyId), index("discount_offers_status_idx").on(table.status)],
);

export const companyProducts = mysqlTable(
  "company_products",
  {
    id: int("id").autoincrement().primaryKey(),
    companyId: int("companyId").notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    category: mysqlEnum("category", ["apparel", "footwear", "home", "accessory"]).notNull(),
    description: text("description").notNull(),
    priceKes: int("priceKes").notNull(),
    imageUrl: text("imageUrl"),
    sizeOptions: text("sizeOptions"),
    stockQuantity: int("stockQuantity").default(0).notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("company_products_company_idx").on(table.companyId), index("company_products_category_idx").on(table.category), index("company_products_active_idx").on(table.isActive)],
);

export const aiImageConsents = mysqlTable(
  "ai_image_consents",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    purpose: mysqlEnum("purpose", ["home_refresh", "personal_style", "footwear_fit", "inspiration"]).notNull(),
    acceptedAt: timestamp("acceptedAt").defaultNow().notNull(),
    revokedAt: timestamp("revokedAt"),
  },
  (table) => [index("ai_image_consents_user_idx").on(table.userId)],
);

export const aiAssistRequests = mysqlTable(
  "ai_assist_requests",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    consentId: int("consentId").notNull(),
    kind: mysqlEnum("kind", ["home_refresh", "personal_style", "footwear_fit", "inspiration"]).notNull(),
    inputImageKey: varchar("inputImageKey", { length: 500 }),
    inputImageUrl: text("inputImageUrl"),
    brief: text("brief").notNull(),
    city: varchar("city", { length: 80 }).notNull(),
    budgetKes: int("budgetKes").notNull(),
    sizeProfile: varchar("sizeProfile", { length: 500 }),
    outputJson: text("outputJson"),
    generatedImageUrl: text("generatedImageUrl"),
    status: mysqlEnum("status", ["draft", "processing", "complete", "failed", "revoked"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("ai_assist_requests_user_idx").on(table.userId), index("ai_assist_requests_status_idx").on(table.status)],
);

export const deliveryQuotes = mysqlTable(
  "delivery_quotes",
  {
    id: int("id").autoincrement().primaryKey(),
    productId: int("productId").notNull(),
    destinationCity: varchar("destinationCity", { length: 80 }).notNull(),
    distanceBand: mysqlEnum("distanceBand", ["same_neighbourhood", "same_city", "national"]).notNull(),
    deliveryKes: int("deliveryKes").notNull(),
    providerLabel: varchar("providerLabel", { length: 120 }).notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("delivery_quotes_product_idx").on(table.productId), index("delivery_quotes_city_idx").on(table.destinationCity)],
);

export const commerceOrders = mysqlTable(
  "commerce_orders",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    companyId: int("companyId").notNull(),
    productId: int("productId").notNull(),
    deliveryQuoteId: int("deliveryQuoteId"),
    paymentOrderId: int("paymentOrderId"),
    quantity: int("quantity").default(1).notNull(),
    merchandiseSubtotalKes: int("merchandiseSubtotalKes").notNull(),
    commissionRatePct: int("commissionRatePct").notNull(),
    commissionKes: int("commissionKes").notNull(),
    sellerSettlementKes: int("sellerSettlementKes").notNull(),
    deliveryKes: int("deliveryKes").notNull(),
    customerTotalKes: int("customerTotalKes").notNull(),
    status: mysqlEnum("status", ["draft", "awaiting_payment", "paid", "processing", "delivered", "cancelled", "refunded"]).default("draft").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("commerce_orders_user_idx").on(table.userId), index("commerce_orders_company_idx").on(table.companyId), index("commerce_orders_status_idx").on(table.status)],
);

export const verifiedReviews = mysqlTable(
  "verified_reviews",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull().unique(),
    userId: int("userId").notNull(),
    companyId: int("companyId").notNull(),
    productId: int("productId").notNull(),
    rating: int("rating").notNull(),
    comment: varchar("comment", { length: 1000 }),
    status: mysqlEnum("status", ["pending", "published", "rejected"]).default("pending").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("verified_reviews_company_idx").on(table.companyId), index("verified_reviews_product_idx").on(table.productId), index("verified_reviews_status_idx").on(table.status)],
);

export const vendors = mysqlTable(
  "vendors",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 96 }).notNull().unique(),
    name: varchar("name", { length: 160 }).notNull(),
    type: mysqlEnum("type", ["thrift", "tailor", "home_studio", "stylist", "creative"]).notNull(),
    city: varchar("city", { length: 80 }).notNull(),
    neighbourhood: varchar("neighbourhood", { length: 120 }).notNull(),
    locationText: varchar("locationText", { length: 220 }).notNull(),
    description: text("description").notNull(),
    pointOfView: text("pointOfView").notNull(),
    priceFloorKes: int("priceFloorKes").notNull(),
    priceCeilingKes: int("priceCeilingKes").notNull(),
    budgetTier: mysqlEnum("budgetTier", ["considered", "signature", "statement"]).notNull(),
    portfolioImageUrl: text("portfolioImageUrl").notNull(),
    socialHandle: varchar("socialHandle", { length: 160 }),
    socialUrl: text("socialUrl"),
    isDemo: boolean("isDemo").default(true).notNull(),
    isVerified: boolean("isVerified").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("vendors_city_idx").on(table.city),
    index("vendors_type_idx").on(table.type),
    index("vendors_budget_idx").on(table.budgetTier),
  ],
);

export const vendorServices = mysqlTable(
  "vendor_services",
  {
    id: int("id").autoincrement().primaryKey(),
    vendorId: int("vendorId").notNull(),
    title: varchar("title", { length: 140 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    priceFromKes: int("priceFromKes").notNull(),
    priceToKes: int("priceToKes").notNull(),
    leadTime: varchar("leadTime", { length: 100 }).notNull(),
    aestheticTags: text("aestheticTags").notNull(),
  },
  (table) => [index("vendor_services_vendor_idx").on(table.vendorId)],
);

export const curatedBuilds = mysqlTable(
  "curated_builds",
  {
    id: int("id").autoincrement().primaryKey(),
    slug: varchar("slug", { length: 96 }).notNull().unique(),
    title: varchar("title", { length: 160 }).notNull(),
    city: varchar("city", { length: 80 }).notNull(),
    lifestyle: varchar("lifestyle", { length: 100 }).notNull(),
    aesthetic: varchar("aesthetic", { length: 100 }).notNull(),
    priority: varchar("priority", { length: 100 }).notNull(),
    totalMinKes: int("totalMinKes").notNull(),
    totalMaxKes: int("totalMaxKes").notNull(),
    headline: varchar("headline", { length: 220 }).notNull(),
    rationale: text("rationale").notNull(),
    heroImageUrl: text("heroImageUrl").notNull(),
    isDemo: boolean("isDemo").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("curated_builds_city_idx").on(table.city),
    index("curated_builds_aesthetic_idx").on(table.aesthetic),
  ],
);

export const curatedBuildItems = mysqlTable(
  "curated_build_items",
  {
    id: int("id").autoincrement().primaryKey(),
    buildId: int("buildId").notNull(),
    vendorId: int("vendorId"),
    label: varchar("label", { length: 140 }).notNull(),
    category: varchar("category", { length: 80 }).notNull(),
    estimatedCostKes: int("estimatedCostKes").notNull(),
    note: text("note").notNull(),
    sortOrder: int("sortOrder").notNull(),
  },
  (table) => [index("curated_build_items_build_idx").on(table.buildId)],
);

export const savedVendors = mysqlTable(
  "saved_vendors",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    vendorId: int("vendorId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("saved_vendors_user_vendor_unique").on(table.userId, table.vendorId),
    index("saved_vendors_user_idx").on(table.userId),
  ],
);

export const buildBoardSelections = mysqlTable(
  "build_board_selections",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    buildId: int("buildId"),
    vendorId: int("vendorId"),
    note: text("note"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("build_board_selections_user_idx").on(table.userId)],
);

export const buildShares = mysqlTable(
  "build_shares",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    shareToken: varchar("shareToken", { length: 48 }).notNull().unique(),
    title: varchar("title", { length: 160 }).notNull(),
    summary: text("summary"),
    isPublic: boolean("isPublic").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("build_shares_user_idx").on(table.userId)],
);

export const buildShareItems = mysqlTable(
  "build_share_items",
  {
    id: int("id").autoincrement().primaryKey(),
    shareId: int("shareId").notNull(),
    buildId: int("buildId"),
    vendorId: int("vendorId"),
    sortOrder: int("sortOrder").notNull(),
  },
  (table) => [index("build_share_items_share_idx").on(table.shareId)],
);

export const inquiries = mysqlTable(
  "inquiries",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId"),
    vendorId: int("vendorId"),
    buildId: int("buildId"),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 32 }),
    city: varchar("city", { length: 80 }).notNull(),
    message: text("message").notNull(),
    status: mysqlEnum("status", ["new", "reviewed", "contacted", "closed"]).default("new").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    index("inquiries_vendor_idx").on(table.vendorId),
    index("inquiries_status_idx").on(table.status),
  ],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
