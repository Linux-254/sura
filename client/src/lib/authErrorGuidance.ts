export type AuthRecoveryMode = "sign-in" | "sign-up" | "recovery";

export type AuthErrorGuidance = {
  title: string;
  copy: string;
  actionLabel?: string;
  nextMode?: AuthRecoveryMode;
};

export function getAuthErrorGuidance(errorMessage?: string): AuthErrorGuidance | null {
  if (!errorMessage) return null;
  const message = errorMessage.toLowerCase();
  if (message.includes("rate limit")) {
    return {
      title: "Email sending is temporarily paused.",
      copy: "SURA’s email provider has temporarily limited new messages. Please wait before trying again, and avoid repeated requests so the limit can clear. Your account and password have not changed.",
      actionLabel: "Return to sign in",
      nextMode: "sign-in",
    };
  }
  if (message.includes("verify your email") || message.includes("email not confirmed")) {
    return {
      title: "Confirm your email before signing in.",
      copy: "Open the newest SURA verification email, confirm the address, then return here to sign in. If the email has not arrived, wait before requesting another message to avoid the provider’s send limit.",
      actionLabel: "Return to sign in",
      nextMode: "sign-in",
    };
  }
  return {
    title: "We could not complete that securely.",
    copy: "Please check the details and try again. If the issue continues, wait a moment before another request.",
  };
}
