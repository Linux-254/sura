import { drizzle } from "drizzle-orm/postgres-js";
import postgres, { type Sql } from "postgres";

let client: Sql | null = null;

/**
 * Returns the staged Supabase PostgreSQL client. It is intentionally separate
 * from the active MySQL/TiDB getDb() path until migration reconciliation passes.
 */
export function getSupabaseClient(): Sql | null {
  const connectionString = process.env.SUPABASE_DATABASE_URL;
  if (!connectionString) return null;
  if (!client) client = postgres(connectionString, { prepare: false, max: 1 });
  return client;
}

export function getSupabaseDb() {
  const supabaseClient = getSupabaseClient();
  return supabaseClient ? drizzle(supabaseClient) : null;
}

export async function closeSupabaseClient() {
  if (client) await client.end({ timeout: 5 });
  client = null;
}
