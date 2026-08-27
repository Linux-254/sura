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
    aestheticPreferences: text("aestheticPreferences"),
    aestheticOnboardingComplete: boolean("aestheticOnboardingComplete").default(false).notNull(),
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
    neighbourhood: varchar("neighbourhood", { length: 120 }),
    locationText: varchar("locationText", { length: 220 }),
    latitude: varchar("latitude", { length: 32 }),
    longitude: varchar("longitude", { length: 32 }),
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
    commerceOrderId: int("commerceOrderId"),
    orderType: mysqlEnum("orderType", ["company_membership", "vendor_feature", "build_consultation", "commerce_purchase"]).notNull(),
    amountKes: int("amountKes").notNull(),
    currency: varchar("currency", { length: 3 }).default("KES").notNull(),
    provider: mysqlEnum("provider", ["gateway_pending", "mpesa", "stripe"]).default("gateway_pending").notNull(),
    status: mysqlEnum("status", ["draft", "pending", "paid", "failed", "cancelled"]).default("draft").notNull(),
    providerReference: varchar("providerReference", { length: 128 }),
    failureReason: varchar("failureReason", { length: 300 }),
    paidAt: timestamp("paidAt"),
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
    kind: mysqlEnum("kind", ["membership", "offer", "company", "platform", "social", "message", "inquiry", "order", "project"]).notNull(),
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

export const authVisualSets = mysqlTable(
  "auth_visual_sets",
  {
    id: int("id").autoincrement().primaryKey(),
    createdByUserId: int("createdByUserId").notNull(),
    title: varchar("title", { length: 120 }).notNull(),
    imageUrls: text("imageUrls").notNull(),
    isActive: boolean("isActive").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("auth_visual_sets_active_idx").on(table.isActive)],
);

export const discountOffers = mysqlTable(
  "discount_offers",
  {
    id: int("id").autoincrement().primaryKey(),
    companyId: int("companyId"),
    productId: int("productId"),
    createdByUserId: int("createdByUserId").notNull(),
    code: varchar("code", { length: 48 }).notNull().unique(),
    title: varchar("title", { length: 140 }).notNull(),
    description: varchar("description", { length: 500 }),
    discountType: mysqlEnum("discountType", ["percentage", "fixed_kes"]).notNull(),
    discountValue: int("discountValue").notNull(),
    usageLimit: int("usageLimit"),
    usedCount: int("usedCount").default(0).notNull(),
    minimumSpendKes: int("minimumSpendKes"),
    validFrom: timestamp("validFrom").defaultNow().notNull(),
    validUntil: timestamp("validUntil"),
    status: mysqlEnum("status", ["draft", "pending", "approved", "rejected"]).default("draft").notNull(),
    isPublic: boolean("isPublic").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("discount_offers_company_idx").on(table.companyId), index("discount_offers_product_idx").on(table.productId), index("discount_offers_status_idx").on(table.status)],
);

export const companyProducts = mysqlTable(
  "company_products",
  {
    id: int("id").autoincrement().primaryKey(),
    companyId: int("companyId").notNull(),
    name: varchar("name", { length: 160 }).notNull(),
    category: mysqlEnum("category", ["apparel", "footwear", "home", "accessory", "appliance", "art", "tattoo", "beauty", "pet", "vehicle", "detailing", "architecture", "food", "travel", "technology"]).notNull(),
    description: text("description").notNull(),
    priceKes: int("priceKes").notNull(),
    imageUrl: text("imageUrl"),
    imageUrls: text("imageUrls"),
    sizeOptions: text("sizeOptions"),
    stockQuantity: int("stockQuantity").default(0).notNull(),
    status: mysqlEnum("status", ["draft", "pending", "published", "rejected"]).default("draft").notNull(),
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
    purpose: mysqlEnum("purpose", ["home_refresh", "personal_style", "footwear_fit", "inspiration", "wardrobe_edit", "home_showroom", "product_edit", "vehicle_garage", "detailing_bay", "tattoo_concept", "pet_accessory"]).notNull(),
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
    kind: mysqlEnum("kind", ["home_refresh", "personal_style", "footwear_fit", "inspiration", "wardrobe_edit", "home_showroom", "product_edit", "vehicle_garage", "detailing_bay", "tattoo_concept", "pet_accessory"]).notNull(),
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
    discountKes: int("discountKes").default(0).notNull(),
    selectedOfferId: int("selectedOfferId"),
    stockReserved: boolean("stockReserved").default(false).notNull(),
    reservationExpiresAt: timestamp("reservationExpiresAt"),
    paymentStatus: mysqlEnum("paymentStatus", ["unpaid", "pending", "paid", "failed", "refunded"]).default("unpaid").notNull(),
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

export const personalEditCollections = mysqlTable(
  "personal_edit_collections",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 120 }).notNull(),
    editType: mysqlEnum("editType", ["wardrobe", "tattoo", "room", "books", "lighting", "inspiration"]).notNull(),
    isPrivate: boolean("isPrivate").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("personal_edit_collections_user_idx").on(table.userId), index("personal_edit_collections_type_idx").on(table.editType)],
);

export const personalEditItems = mysqlTable(
  "personal_edit_items",
  {
    id: int("id").autoincrement().primaryKey(),
    collectionId: int("collectionId").notNull(),
    userId: int("userId").notNull(),
    itemType: mysqlEnum("itemType", ["wardrobe", "tattoo", "room", "books", "lighting", "inspiration"]).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    note: text("note"),
    tags: text("tags"),
    imageKey: varchar("imageKey", { length: 500 }),
    imageUrl: text("imageUrl"),
    analysisConsentAt: timestamp("analysisConsentAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("personal_edit_items_user_idx").on(table.userId), index("personal_edit_items_collection_idx").on(table.collectionId), index("personal_edit_items_type_idx").on(table.itemType)],
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
    companyId: int("companyId"),
    vendorId: int("vendorId"),
    buildId: int("buildId"),
    name: varchar("name", { length: 120 }).notNull(),
    email: varchar("email", { length: 320 }),
    phone: varchar("phone", { length: 32 }),
    city: varchar("city", { length: 80 }).notNull(),
    message: text("message").notNull(),
    status: mysqlEnum("status", ["new", "reviewed", "quoted", "accepted", "declined", "closed"]).default("new").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("inquiries_company_idx").on(table.companyId),
    index("inquiries_vendor_idx").on(table.vendorId),
    index("inquiries_status_idx").on(table.status),
  ],
);

export const userFollows = mysqlTable(
  "user_follows",
  {
    id: int("id").autoincrement().primaryKey(),
    followerUserId: int("followerUserId").notNull(),
    followedUserId: int("followedUserId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("user_follows_pair_unique").on(table.followerUserId, table.followedUserId),
    index("user_follows_follower_idx").on(table.followerUserId),
    index("user_follows_followed_idx").on(table.followedUserId),
  ],
);

export const companyFollows = mysqlTable(
  "company_follows",
  {
    id: int("id").autoincrement().primaryKey(),
    followerUserId: int("followerUserId").notNull(),
    companyId: int("companyId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("company_follows_pair_unique").on(table.followerUserId, table.companyId),
    index("company_follows_follower_idx").on(table.followerUserId),
    index("company_follows_company_idx").on(table.companyId),
  ],
);

export const companyPosts = mysqlTable(
  "company_posts",
  {
    id: int("id").autoincrement().primaryKey(),
    companyId: int("companyId").notNull(),
    createdByUserId: int("createdByUserId").notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    caption: text("caption"),
    imageUrl: text("imageUrl").notNull(),
    aestheticTags: text("aestheticTags"),
    status: mysqlEnum("status", ["draft", "pending", "published", "rejected"]).default("pending").notNull(),
    isPublic: boolean("isPublic").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [
    index("company_posts_company_idx").on(table.companyId),
    index("company_posts_status_idx").on(table.status),
    index("company_posts_created_idx").on(table.createdAt),
  ],
);

export const postLikes = mysqlTable(
  "post_likes",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    postId: int("postId").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("post_likes_user_post_unique").on(table.userId, table.postId),
    index("post_likes_post_idx").on(table.postId),
    index("post_likes_user_idx").on(table.userId),
  ],
);

export const postReposts = mysqlTable(
  "post_reposts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    postId: int("postId").notNull(),
    note: varchar("note", { length: 280 }),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("post_reposts_user_post_unique").on(table.userId, table.postId),
    index("post_reposts_post_idx").on(table.postId),
    index("post_reposts_user_idx").on(table.userId),
  ],
);

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;


export const savedCollages = mysqlTable(
  "saved_collages",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    description: text("description"),
    isPublic: boolean("isPublic").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("saved_collages_user_idx").on(table.userId), index("saved_collages_public_idx").on(table.isPublic)],
);

export const savedCollageItems = mysqlTable(
  "saved_collage_items",
  {
    id: int("id").autoincrement().primaryKey(),
    collageId: int("collageId").notNull(),
    userId: int("userId").notNull(),
    itemType: mysqlEnum("itemType", ["post", "product", "vendor", "build", "image"]).notNull(),
    itemId: int("itemId"),
    imageUrl: text("imageUrl"),
    note: varchar("note", { length: 280 }),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("saved_collage_items_collage_idx").on(table.collageId), index("saved_collage_items_user_idx").on(table.userId)],
);

export const conversations = mysqlTable(
  "conversations",
  {
    id: int("id").autoincrement().primaryKey(),
    createdByUserId: int("createdByUserId").notNull(),
    companyId: int("companyId"),
    inquiryId: int("inquiryId"),
    projectBriefId: int("projectBriefId"),
    subject: varchar("subject", { length: 180 }).notNull(),
    status: mysqlEnum("status", ["open", "archived", "closed"]).default("open").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("conversations_creator_idx").on(table.createdByUserId), index("conversations_company_idx").on(table.companyId), index("conversations_inquiry_idx").on(table.inquiryId)],
);

export const conversationParticipants = mysqlTable(
  "conversation_participants",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversationId").notNull(),
    userId: int("userId").notNull(),
    lastReadAt: timestamp("lastReadAt"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("conversation_participants_unique").on(table.conversationId, table.userId), index("conversation_participants_user_idx").on(table.userId)],
);

export const conversationMessages = mysqlTable(
  "conversation_messages",
  {
    id: int("id").autoincrement().primaryKey(),
    conversationId: int("conversationId").notNull(),
    senderUserId: int("senderUserId").notNull(),
    body: text("body").notNull(),
    attachmentUrl: text("attachmentUrl"),
    isRead: boolean("isRead").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("conversation_messages_conversation_idx").on(table.conversationId), index("conversation_messages_sender_idx").on(table.senderUserId), index("conversation_messages_created_idx").on(table.createdAt)],
);

export const projectBriefs = mysqlTable(
  "project_briefs",
  {
    id: int("id").autoincrement().primaryKey(),
    ownerUserId: int("ownerUserId").notNull(),
    companyId: int("companyId"),
    title: varchar("title", { length: 160 }).notNull(),
    intent: mysqlEnum("intent", ["shape_direction", "ask_product", "field_note", "ai_studio"]).notNull(),
    lane: varchar("lane", { length: 80 }),
    fieldNote: text("fieldNote"),
    direction: varchar("direction", { length: 500 }),
    budgetKes: int("budgetKes"),
    timeline: varchar("timeline", { length: 120 }),
    status: mysqlEnum("status", ["draft", "submitted", "in_review", "quoted", "accepted", "in_progress", "completed", "cancelled"]).default("draft").notNull(),
    isPublic: boolean("isPublic").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("project_briefs_owner_idx").on(table.ownerUserId), index("project_briefs_company_idx").on(table.companyId), index("project_briefs_status_idx").on(table.status)],
);

export const projectBriefItems = mysqlTable(
  "project_brief_items",
  {
    id: int("id").autoincrement().primaryKey(),
    briefId: int("briefId").notNull(),
    itemType: mysqlEnum("itemType", ["post", "product", "vendor", "collage", "image"]).notNull(),
    itemId: int("itemId"),
    imageUrl: text("imageUrl"),
    note: varchar("note", { length: 280 }),
    sortOrder: int("sortOrder").default(0).notNull(),
  },
  (table) => [index("project_brief_items_brief_idx").on(table.briefId)],
);

export const projectBriefEvents = mysqlTable(
  "project_brief_events",
  {
    id: int("id").autoincrement().primaryKey(),
    briefId: int("briefId").notNull(),
    actorUserId: int("actorUserId").notNull(),
    eventType: mysqlEnum("eventType", ["created", "submitted", "reviewed", "quoted", "accepted", "payment_requested", "payment_received", "handoff_started", "completed", "cancelled"]).notNull(),
    note: text("note"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("project_brief_events_brief_idx").on(table.briefId), index("project_brief_events_actor_idx").on(table.actorUserId)],
);

export const inquiryQuotes = mysqlTable(
  "inquiry_quotes",
  {
    id: int("id").autoincrement().primaryKey(),
    inquiryId: int("inquiryId").notNull(),
    companyId: int("companyId").notNull(),
    createdByUserId: int("createdByUserId").notNull(),
    amountKes: int("amountKes").notNull(),
    description: text("description").notNull(),
    estimatedDays: int("estimatedDays"),
    status: mysqlEnum("status", ["draft", "sent", "accepted", "declined", "expired"]).default("draft").notNull(),
    validUntil: timestamp("validUntil"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("inquiry_quotes_inquiry_idx").on(table.inquiryId), index("inquiry_quotes_company_idx").on(table.companyId), index("inquiry_quotes_status_idx").on(table.status)],
);

export const carts = mysqlTable(
  "carts",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull().unique(),
    status: mysqlEnum("status", ["active", "checked_out", "abandoned"]).default("active").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("carts_user_idx").on(table.userId), index("carts_status_idx").on(table.status)],
);

export const cartItems = mysqlTable(
  "cart_items",
  {
    id: int("id").autoincrement().primaryKey(),
    cartId: int("cartId").notNull(),
    productId: int("productId").notNull(),
    quantity: int("quantity").default(1).notNull(),
    selectedOfferId: int("selectedOfferId"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [uniqueIndex("cart_items_cart_product_unique").on(table.cartId, table.productId), index("cart_items_cart_idx").on(table.cartId), index("cart_items_product_idx").on(table.productId)],
);

export const orderHandoffs = mysqlTable(
  "order_handoffs",
  {
    id: int("id").autoincrement().primaryKey(),
    orderId: int("orderId").notNull().unique(),
    companyId: int("companyId").notNull(),
    assignedPartner: varchar("assignedPartner", { length: 160 }),
    destinationCity: varchar("destinationCity", { length: 80 }).notNull(),
    status: mysqlEnum("status", ["pending", "accepted", "in_production", "ready", "in_transit", "delivered", "issue", "cancelled"]).default("pending").notNull(),
    trackingReference: varchar("trackingReference", { length: 160 }),
    customerNote: text("customerNote"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("order_handoffs_company_idx").on(table.companyId), index("order_handoffs_status_idx").on(table.status)],
);

export const orderHandoffEvents = mysqlTable(
  "order_handoff_events",
  {
    id: int("id").autoincrement().primaryKey(),
    handoffId: int("handoffId").notNull(),
    actorUserId: int("actorUserId").notNull(),
    status: mysqlEnum("status", ["pending", "accepted", "in_production", "ready", "in_transit", "delivered", "issue", "cancelled"]).notNull(),
    note: text("note"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("order_handoff_events_handoff_idx").on(table.handoffId), index("order_handoff_events_actor_idx").on(table.actorUserId)],
);

export const companyAnalyticsEvents = mysqlTable(
  "company_analytics_events",
  {
    id: int("id").autoincrement().primaryKey(),
    companyId: int("companyId").notNull(),
    productId: int("productId"),
    postId: int("postId"),
    eventType: mysqlEnum("eventType", ["profile_view", "product_view", "post_view", "save", "repost", "inquiry", "checkout_start", "purchase"]).notNull(),
    actorUserId: int("actorUserId"),
    metadataJson: text("metadataJson"),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("company_analytics_company_idx").on(table.companyId), index("company_analytics_type_idx").on(table.eventType), index("company_analytics_created_idx").on(table.createdAt)],
);


export const showroomSessions = mysqlTable(
  "showroom_sessions",
  {
    id: int("id").autoincrement().primaryKey(),
    userId: int("userId").notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    kind: mysqlEnum("kind", ["home_refresh", "personal_style", "footwear_fit", "inspiration", "wardrobe_edit", "home_showroom", "product_edit", "vehicle_garage", "detailing_bay", "tattoo_concept", "pet_accessory"]).notNull(),
    viewMode: mysqlEnum("viewMode", ["orbit", "cover_flow", "window_carousel", "reverse_columns", "explorer"]).default("orbit").notNull(),
    sessionToken: varchar("sessionToken", { length: 48 }).notNull().unique(),
    configJson: text("configJson"),
    status: mysqlEnum("status", ["draft", "active", "archived"]).default("draft").notNull(),
    isPublic: boolean("isPublic").default(false).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("showroom_sessions_user_idx").on(table.userId), index("showroom_sessions_status_idx").on(table.status), index("showroom_sessions_public_idx").on(table.isPublic)],
);

export const showroomObjects = mysqlTable(
  "showroom_objects",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId").notNull(),
    objectType: varchar("objectType", { length: 80 }).notNull(),
    label: varchar("label", { length: 160 }).notNull(),
    imageUrl: text("imageUrl"),
    modelUrl: text("modelUrl"),
    positionJson: varchar("positionJson", { length: 500 }),
    rotationJson: varchar("rotationJson", { length: 500 }),
    scaleJson: varchar("scaleJson", { length: 500 }),
    metadataJson: text("metadataJson"),
    sortOrder: int("sortOrder").default(0).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("showroom_objects_session_idx").on(table.sessionId), index("showroom_objects_sort_idx").on(table.sortOrder)],
);

export const showroomAnnotations = mysqlTable(
  "showroom_annotations",
  {
    id: int("id").autoincrement().primaryKey(),
    sessionId: int("sessionId").notNull(),
    objectId: int("objectId"),
    title: varchar("title", { length: 160 }).notNull(),
    body: text("body").notNull(),
    anchorJson: varchar("anchorJson", { length: 500 }),
    isVisible: boolean("isVisible").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("showroom_annotations_session_idx").on(table.sessionId), index("showroom_annotations_object_idx").on(table.objectId)],
);

export const signalStories = mysqlTable(
  "signal_stories",
  {
    id: int("id").autoincrement().primaryKey(),
    creatorUserId: int("creatorUserId").notNull(),
    companyId: int("companyId"),
    imageUrl: text("imageUrl").notNull(),
    caption: varchar("caption", { length: 500 }),
    aestheticTags: text("aestheticTags"),
    expiresAt: timestamp("expiresAt").notNull(),
    isPublic: boolean("isPublic").default(true).notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("signal_stories_creator_idx").on(table.creatorUserId), index("signal_stories_company_idx").on(table.companyId), index("signal_stories_expiry_idx").on(table.expiresAt)],
);

export const signalStoryViews = mysqlTable(
  "signal_story_views",
  {
    id: int("id").autoincrement().primaryKey(),
    storyId: int("storyId").notNull(),
    userId: int("userId").notNull(),
    viewedAt: timestamp("viewedAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("signal_story_views_unique").on(table.storyId, table.userId), index("signal_story_views_user_idx").on(table.userId)],
);

export const companyMemberInvitations = mysqlTable(
  "company_member_invitations",
  {
    id: int("id").autoincrement().primaryKey(),
    companyId: int("companyId").notNull(),
    invitedByUserId: int("invitedByUserId").notNull(),
    email: varchar("email", { length: 320 }).notNull(),
    memberRole: mysqlEnum("memberRole", ["manager", "editor"]).default("editor").notNull(),
    status: mysqlEnum("status", ["pending", "accepted", "declined", "expired"]).default("pending").notNull(),
    token: varchar("token", { length: 48 }).notNull().unique(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [index("company_member_invites_company_idx").on(table.companyId), index("company_member_invites_email_idx").on(table.email), index("company_member_invites_status_idx").on(table.status)],
);

export const contentReports = mysqlTable(
  "content_reports",
  {
    id: int("id").autoincrement().primaryKey(),
    reporterUserId: int("reporterUserId").notNull(),
    targetType: mysqlEnum("targetType", ["post", "product", "company", "profile", "message", "story", "review"]).notNull(),
    targetId: int("targetId").notNull(),
    reason: mysqlEnum("reason", ["spam", "misleading", "copyright", "harassment", "unsafe", "other"]).notNull(),
    details: varchar("details", { length: 1000 }),
    status: mysqlEnum("status", ["open", "under_review", "resolved", "dismissed"]).default("open").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
    updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  },
  (table) => [index("content_reports_status_idx").on(table.status), index("content_reports_target_idx").on(table.targetType, table.targetId), index("content_reports_reporter_idx").on(table.reporterUserId)],
);


export const discountOfferUsages = mysqlTable(
  "discount_offer_usages",
  {
    id: int("id").autoincrement().primaryKey(),
    offerId: int("offerId").notNull(),
    userId: int("userId").notNull(),
    commerceOrderId: int("commerceOrderId").notNull(),
    discountKes: int("discountKes").notNull(),
    status: mysqlEnum("status", ["reserved", "consumed", "released"]).default("reserved").notNull(),
    createdAt: timestamp("createdAt").defaultNow().notNull(),
  },
  (table) => [uniqueIndex("discount_offer_usages_order_unique").on(table.offerId, table.commerceOrderId), index("discount_offer_usages_offer_idx").on(table.offerId), index("discount_offer_usages_user_idx").on(table.userId)],
);

export const commerceOrderItems = mysqlTable(
  "commerce_order_items",
  {
    id: int("id").autoincrement().primaryKey(),
    commerceOrderId: int("commerceOrderId").notNull(),
    productId: int("productId").notNull(),
    companyId: int("companyId").notNull(),
    quantity: int("quantity").notNull(),
    unitPriceKes: int("unitPriceKes").notNull(),
    discountKes: int("discountKes").default(0).notNull(),
    lineTotalKes: int("lineTotalKes").notNull(),
    offerId: int("offerId"),
  },
  (table) => [index("commerce_order_items_order_idx").on(table.commerceOrderId), index("commerce_order_items_product_idx").on(table.productId)],
);
