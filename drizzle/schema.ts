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
