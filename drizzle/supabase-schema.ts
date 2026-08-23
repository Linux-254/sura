import { index, integer, pgEnum, pgTable, timestamp, uniqueIndex, uuid } from "drizzle-orm/pg-core";

export const supabaseIdentityLinkStatus = pgEnum("sura_identity_link_status", ["pending", "linked", "revoked"]);

/**
 * This table is deliberately separate from auth.users. It maps an existing
 * SURA/MySQL member to a future, explicitly linked Supabase Auth subject.
 */
export const supabaseIdentityLinks = pgTable(
  "sura_identity_links",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    suraUserId: integer("sura_user_id").notNull(),
    supabaseAuthUserId: uuid("supabase_auth_user_id"),
    status: supabaseIdentityLinkStatus("status").default("pending").notNull(),
    consentedAt: timestamp("consented_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [
    uniqueIndex("sura_identity_links_sura_user_unique").on(table.suraUserId),
    uniqueIndex("sura_identity_links_auth_user_unique").on(table.supabaseAuthUserId),
    index("sura_identity_links_status_idx").on(table.status),
  ],
);
