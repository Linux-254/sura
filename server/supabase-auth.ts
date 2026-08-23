import { ENV } from "./_core/env";

type SupabaseUserPayload = {
  id?: unknown;
  email?: unknown;
  user_metadata?: unknown;
};

export type SupabaseIdentity = {
  id: string;
  email: string | null;
  name: string | null;
};

type FetchLike = typeof fetch;

function metadataName(metadata: unknown): string | null {
  if (!metadata || typeof metadata !== "object") return null;
  const record = metadata as Record<string, unknown>;
  const candidate = record.full_name ?? record.name ?? record.display_name;
  return typeof candidate === "string" && candidate.trim().length > 0
    ? candidate.trim().slice(0, 160)
    : null;
}

export async function verifySupabaseAccessToken(
  accessToken: string,
  fetchImpl: FetchLike = fetch
): Promise<SupabaseIdentity> {
  if (!ENV.supabaseUrl || !ENV.supabasePublishableKey) {
    throw new Error("Supabase email authentication is not configured");
  }

  const token = accessToken.trim();
  if (token.length < 20 || token.length > 8192) {
    throw new Error("Invalid Supabase access token");
  }

  const response = await fetchImpl(`${ENV.supabaseUrl.replace(/\/$/, "")}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: ENV.supabasePublishableKey,
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error("Invalid Supabase access token");
  }

  const payload = (await response.json()) as SupabaseUserPayload;
  if (typeof payload.id !== "string" || payload.id.trim().length === 0) {
    throw new Error("Supabase returned an invalid user identity");
  }

  const email = typeof payload.email === "string" && payload.email.trim().length > 0
    ? payload.email.trim().slice(0, 320)
    : null;
  const name = metadataName(payload.user_metadata) ?? (email ? email.split("@")[0].slice(0, 160) : null);

  return {
    id: payload.id.trim(),
    email,
    name,
  };
}
