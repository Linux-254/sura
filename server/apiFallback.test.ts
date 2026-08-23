import type { Request, Response } from "express";
import { describe, expect, it, vi } from "vitest";
import { apiJsonFallback, createTrpcApiFallback } from "./apiFallback";

describe("tRPC API fallback", () => {
  it("returns a valid tRPC-shaped JSON error for an unmatched single procedure", () => {
    expect(createTrpcApiFallback("/api/trpc/vendors.list", false)).toEqual({
      error: {
        json: {
          message: "The SURA API route is unavailable. Please retry the request.",
          code: -32004,
          data: { code: "NOT_FOUND", httpStatus: 404, path: "vendors.list" },
        },
      },
    });
  });

  it("returns one valid tRPC error entry per unmatched procedure in a batch", () => {
    expect(createTrpcApiFallback("/api/trpc/auth.me,vendors.list", true)).toEqual([
      expect.objectContaining({ error: { json: expect.objectContaining({ data: expect.objectContaining({ path: "auth.me" }) }) } }),
      expect.objectContaining({ error: { json: expect.objectContaining({ data: expect.objectContaining({ path: "vendors.list" }) }) } }),
    ]);
  });

  it("sets a JSON response instead of allowing a missing API route to reach the HTML fallback", () => {
    const json = vi.fn();
    const response = { status: vi.fn().mockReturnThis(), json } as unknown as Response;
    const request = { path: "/api/missing-service", query: { batch: "1" } } as unknown as Request;

    apiJsonFallback(request, response);

    expect(response.status).toHaveBeenCalledWith(404);
    expect(json).toHaveBeenCalledWith([expect.objectContaining({ error: expect.any(Object) })]);
  });
});
