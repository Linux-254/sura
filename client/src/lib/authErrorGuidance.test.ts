import { describe, expect, it } from "vitest";
import { getAuthErrorGuidance } from "./authErrorGuidance";

describe("SURA email-auth error guidance", () => {
  it("turns a provider email rate limit into a calm wait-and-retry explanation", () => {
    expect(getAuthErrorGuidance("email rate limit exceeded")).toMatchObject({
      title: "Email sending is temporarily paused.",
      nextMode: "sign-in",
    });
  });

  it("explains email confirmation without revealing internal authentication details", () => {
    expect(getAuthErrorGuidance("Verify your email before signing in to SURA.")).toMatchObject({
      title: "Confirm your email before signing in.",
      nextMode: "sign-in",
    });
  });
});
