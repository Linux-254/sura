import { describe, expect, it } from "vitest";
import { getAuthErrorGuidance } from "./authErrorGuidance";

describe("SURA email-auth error guidance", () => {
  it("turns a provider email rate limit into a calm wait-and-retry explanation", () => {
    expect(getAuthErrorGuidance("email rate limit exceeded")).toMatchObject({
      title: "Email sending is temporarily paused.",
      nextMode: "sign-in",
    });
  });

  it("keeps an unverified account in the account-creation recovery path when confirmation email delivery is limited", () => {
    const guidance = getAuthErrorGuidance("email rate limit exceeded", "sign-up");
    expect(guidance).toMatchObject({
      title: "Confirmation email delivery is temporarily paused.",
    });
    expect(guidance).not.toHaveProperty("actionLabel");
  });

  it("keeps password recovery in its own wait-and-retry path when delivery is limited", () => {
    expect(getAuthErrorGuidance("email rate limit exceeded", "recovery")).toMatchObject({
      title: "Recovery email delivery is temporarily paused.",
    });
  });

  it("explains email confirmation without revealing internal authentication details", () => {
    expect(getAuthErrorGuidance("Verify your email before signing in to SURA.")).toMatchObject({
      title: "Confirm your email before signing in.",
      nextMode: "sign-in",
    });
  });
});
