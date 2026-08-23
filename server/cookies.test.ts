import { describe, expect, it } from "vitest";
import { getSessionCookieOptions, isSecureRequest } from "./_core/cookies";

describe("session cookie options", () => {
  it("uses secure SameSite=None cookies for HTTPS requests", () => {
    const req = {
      protocol: "https",
      headers: {},
    } as any;

    expect(isSecureRequest(req)).toBe(true);
    expect(getSessionCookieOptions(req)).toMatchObject({
      secure: true,
      sameSite: "none",
      httpOnly: true,
      path: "/",
    });
  });

  it("uses compatible Lax cookies for local HTTP requests", () => {
    const req = {
      protocol: "http",
      headers: {},
    } as any;

    expect(isSecureRequest(req)).toBe(false);
    expect(getSessionCookieOptions(req)).toMatchObject({
      secure: false,
      sameSite: "lax",
      httpOnly: true,
      path: "/",
    });
  });

  it("trusts the forwarded HTTPS protocol from a reverse proxy", () => {
    const req = {
      protocol: "http",
      headers: { "x-forwarded-proto": "https, http" },
    } as any;

    expect(isSecureRequest(req)).toBe(true);
  });
});
