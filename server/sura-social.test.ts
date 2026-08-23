import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(user?: TrpcContext["user"]): TrpcContext {
  return {
    user,
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const member = {
  id: 321,
  openId: "social-test-user",
  name: "Social Test User",
  email: "social@example.com",
  loginMethod: "manus",
  role: "user" as const,
  createdAt: new Date(),
  updatedAt: new Date(),
  lastSignedIn: new Date(),
};

describe("SURA social network", () => {
  it("keeps the public feed readable without a signed-in session", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.social.feed({ mode: "forYou" })).resolves.toEqual([]);
  });

  it("protects follow and repost mutations behind authentication", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.social.followCompany({ companyId: 1, shouldFollow: true })).rejects.toThrow();
    await expect(caller.social.repostPost({ postId: 1, shouldRepost: true })).rejects.toThrow();
  });

  it("returns a safe non-persisted result when social storage is unavailable", async () => {
    const caller = appRouter.createCaller(createContext(member));
    await expect(caller.social.followUser({ userId: 999, shouldFollow: true })).resolves.toEqual({ following: false, persisted: false });
    await expect(caller.social.likePost({ postId: 999, shouldLike: true })).resolves.toEqual({ liked: false, persisted: false });
  });
});
