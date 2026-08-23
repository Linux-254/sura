export type AuthRecoveryMode = "sign-in" | "sign-up" | "recovery";

export type AuthErrorGuidance = {
  title: string;
  copy: string;
  actionLabel?: string;
  nextMode?: AuthRecoveryMode;
};

export function getAuthErrorGuidance(errorMessage?: string, mode: AuthRecoveryMode = "sign-in"): AuthErrorGuidance | null {
  if (!errorMessage) return null;
  const message = errorMessage.toLowerCase();
  if (message.includes("secure email service is temporarily unavailable") || message.includes("provider unavailable")) {
    if (mode === "sign-up") {
      return {
        title: "Account email service is temporarily unavailable.",
        copy: "SURA could not reach the email service to create or confirm this account. Wait before trying again, and do not create a second account while the provider recovers.",
      };
    }
    if (mode === "recovery") {
      return {
        title: "Recovery email service is temporarily unavailable.",
        copy: "SURA could not reach the email service to send a recovery link. Wait before trying again, and use only the newest recovery email when delivery resumes.",
      };
    }
    return {
      title: "Email sign-in is temporarily unavailable.",
      copy: "SURA could not reach the email service to complete sign-in. Your account and password have not changed. Wait before trying again.",
    };
  }
  if (message.includes("rate limit")) {
    if (mode === "sign-up") {
      return {
        title: "Confirmation email delivery is temporarily paused.",
        copy: "SURA cannot send the verification email until the provider’s email limit clears. Keep this account-creation page open if you need it, wait before trying again, and do not sign in until you have confirmed the email link.",
      };
    }
    if (mode === "recovery") {
      return {
        title: "Recovery email delivery is temporarily paused.",
        copy: "SURA cannot send another recovery email until the provider’s email limit clears. Wait before trying again, and use the newest recovery email only when it arrives.",
      };
    }
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
