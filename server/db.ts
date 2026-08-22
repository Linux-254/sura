import { and, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { buildBoardSelections, buildShareItems, buildShares, inquiries, InsertUser, savedVendors, users } from "../drizzle/schema";
import { ENV } from './_core/env';

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
