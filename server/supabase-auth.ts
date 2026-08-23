import { createRemoteJWKSet, jwtVerify } from "jose";

type SupabaseUser = {
  id: string;
  email?: string;
  email_confirmed_at?: string | null;
  user_metadata?: { full_name?: string; name?: string };
};

type SupabaseSession = { access_token: string; user: SupabaseUser };

function credentials() {
  const url = process.env.SUPABASE_URL;
  const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!url || !publishableKey) throw new Error("Supabase email authentication is not configured");
  return { url, publishableKey };
}

let remoteJwks: ReturnType<typeof createRemoteJWKSet> | null = null;

async function verifySupabaseJwt(accessToken: string): Promise<SupabaseUser> {
  const { url } = credentials();
  const jwksUrl = process.env.SUPABASE_JWKS_URL;
  if (!jwksUrl) throw new Error("Supabase JWT verification is not configured");
  remoteJwks ??= createRemoteJWKSet(new URL(jwksUrl));
  const { payload } = await jwtVerify(accessToken, remoteJwks, { issuer: `${url}/auth/v1`, audience: "authenticated" });
  if (typeof payload.sub !== "string" || !payload.sub) throw new Error("The email session is missing an authenticated subject");
  return {
    id: payload.sub,
    email: typeof payload.email === "string" ? payload.email : undefined,
    email_confirmed_at: typeof payload.email_confirmed_at === "string" ? payload.email_confirmed_at : null,
    user_metadata: typeof payload.user_metadata === "object" && payload.user_metadata ? payload.user_metadata as SupabaseUser["user_metadata"] : undefined,
  };
}

async function authRequest<T>(path: string, init: RequestInit): Promise<T> {
  const { url, publishableKey } = credentials();
  const response = await fetch(`${url}/auth/v1${path}`, { ...init, headers: { apikey: publishableKey, "Content-Type": "application/json", ...(init.headers ?? {}) } });
  const contentType = response.headers.get("content-type") ?? "";
  const rawBody = await response.text();
  const body = contentType.includes("text/html") || rawBody.trimStart().startsWith("<")
    ? {} as T & { msg?: string; message?: string }
    : JSON.parse(rawBody || "{}") as T & { msg?: string; message?: string };
  if (!response.ok) throw new Error(body.message ?? body.msg ?? "Secure email service is temporarily unavailable. Please wait before trying again.");
  return body;
}

export async function registerSupabaseEmailAccount(email: string, password: string, redirectTo?: string) {
  const body = await authRequest<{ user?: SupabaseUser }>("/signup", { method: "POST", body: JSON.stringify({ email, password, options: redirectTo ? { emailRedirectTo: redirectTo } : undefined }) });
  return body.user ?? null;
}

export async function signInWithSupabaseEmail(email: string, password: string) {
  return authRequest<SupabaseSession>("/token?grant_type=password", { method: "POST", body: JSON.stringify({ email, password }) });
}

export async function verifySupabaseAccessToken(accessToken: string, verifier: (token: string) => Promise<SupabaseUser> = verifySupabaseJwt) {
  return verifier(accessToken);
}

export async function requestSupabasePasswordRecovery(email: string, redirectTo?: string) {
  await authRequest("/recover", { method: "POST", body: JSON.stringify({ email, redirect_to: redirectTo }) });
}

export async function recordSupabaseIdentityLink(suraUserId: number, supabaseAuthUserId: string) {
  const { getSupabaseClient } = await import("./supabase");
  const client = getSupabaseClient();
  if (!client) throw new Error("Supabase identity storage is not configured");
  await client`
    insert into public.sura_identity_links (sura_user_id, supabase_auth_user_id, status, consented_at)
    values (${suraUserId}, ${supabaseAuthUserId}::uuid, 'linked', now())
    on conflict (sura_user_id) do update set
      supabase_auth_user_id = excluded.supabase_auth_user_id,
      status = 'linked',
      consented_at = now(),
      updated_at = now()
  `;
}
