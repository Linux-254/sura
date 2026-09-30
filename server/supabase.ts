import dotenv from "dotenv";
import type { Request } from "express";
import { createClient, type SupabaseClient, type User } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local" });
dotenv.config();

export const SUPABASE_URL = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL ?? "";
export const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export const hasSupabaseServerConfig = Boolean(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY && SUPABASE_SERVICE_ROLE_KEY);

let adminClient: SupabaseClient | null = null;
export function getAdminClient() {
  if (!hasSupabaseServerConfig) return null;
  adminClient ??= createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return adminClient;
}

function getBearerToken(req: Request) {
  const header = req.headers.authorization;
  return typeof header === "string" && header.startsWith("Bearer ") ? header.slice(7).trim() : "";
}

export async function getRequestUser(req: Request): Promise<User | null> {
  const token = getBearerToken(req);
  if (!token || !SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) return null;
  const verifier = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data, error } = await verifier.auth.getUser(token);
  return error ? null : data.user;
}

export function requireAdminClient() {
  const client = getAdminClient();
  if (!client) throw new Error("Supabase server configuration is incomplete.");
  return client;
}
