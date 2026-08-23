import { afterEach, describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import { setDbForTest } from "./db";
import type { TrpcContext } from "./_core/context";

type ReviewOrder = { id: number; userId: number; status: string; companyId: number; productId: number };

function reviewDatabase(order: ReviewOrder | undefined, existingReview?: { id: number }) {
  const responses = [order ? [order] : [], existingReview ? [existingReview] : []];
  return {
    select: () => ({ from: () => ({ where: () => ({ limit: async () => responses.shift() ?? [] }) }) }),
    insert: () => ({ values: async () => [{ insertId: 91 }] }),
  };
}

function reviewCaller(userId = 77) {
  const context: TrpcContext = {
    user: { id: userId, openId: `review-member-${userId}`, name: "Review Member", email: "member@example.com", loginMethod: "supabase_email", role: "user", createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
  return appRouter.createCaller(context);
}

const input = { orderId: 44, rating: 5, comment: "The delivered item matched the listing and arrived in good order." };
const deliveredOrder: ReviewOrder = { id: 44, userId: 77, status: "delivered", companyId: 3, productId: 9 };

afterEach(() => setDbForTest(null));

describe("SURA verified review route journey", () => {
  it("creates a review for the authenticated owner of a delivered order through the concrete helper", async () => {
    setDbForTest(reviewDatabase(deliveredOrder) as never);
    await expect(reviewCaller().commerce.createReview(input)).resolves.toEqual({ id: 91, persisted: true });
  });

  it("rejects a review request from a different authenticated account before insertion", async () => {
    setDbForTest(reviewDatabase(deliveredOrder) as never);
    await expect(reviewCaller(78).commerce.createReview(input)).rejects.toThrow(/delivered purchase/i);
  });

  it("rejects a second review for the same delivered order before insertion", async () => {
    setDbForTest(reviewDatabase(deliveredOrder, { id: 5 }) as never);
    await expect(reviewCaller().commerce.createReview(input)).rejects.toThrow(/already been submitted/i);
  });

  it("rejects a non-delivered order through the same protected route", async () => {
    setDbForTest(reviewDatabase({ ...deliveredOrder, status: "processing" }) as never);
    await expect(reviewCaller().commerce.createReview(input)).rejects.toThrow(/delivered purchase/i);
  });
});
