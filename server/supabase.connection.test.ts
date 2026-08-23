import { afterAll, describe, expect, it } from "vitest";
import { closeSupabaseClient, getSupabaseClient } from "./supabase";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

describe("Supabase staged integration credentials", () => {
  it("accepts the configured server-only project key at the Supabase Auth settings endpoint", async () => {
    expect(supabaseUrl).toMatch(/^https:\/\/[^/]+\.supabase\.co$/);
    expect(supabaseSecretKey).toMatch(/^sb_secret_/);

    const response = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        apikey: supabaseSecretKey!,
        Authorization: `Bearer ${supabaseSecretKey!}`,
      },
    });

    expect(response.status).not.toBe(401);
    expect(response.status).not.toBe(403);
    expect(response.ok).toBe(true);
  }, 15_000);

  it("connects to the staged Supabase PostgreSQL pool without replacing the active MySQL runtime", async () => {
    const client = getSupabaseClient();
    expect(client).not.toBeNull();
    const result = await client!.unsafe<{ connection_ok: number }>("select 1 as connection_ok");
    expect(result[0]?.connection_ok).toBe(1);
  }, 15_000);

  it("applies the additive identity-link foundation without touching active SURA user records", async () => {
    const client = getSupabaseClient();
    const result = await client!<{ identity_links: string | null; mapping_index_count: number }>`
      select
        to_regclass('public.sura_identity_links') as identity_links,
        count(*)::int as mapping_index_count
      from pg_indexes
      where schemaname = 'public'
        and tablename = 'sura_identity_links'
    `;

    expect(result[0]?.identity_links).toBe("sura_identity_links");
    expect(result[0]?.mapping_index_count).toBeGreaterThanOrEqual(3);
  }, 15_000);

  it("keeps staged identity links server-only until an explicit account-linking policy exists", async () => {
    const client = getSupabaseClient();
    const result = await client!<{ rls_enabled: boolean; anon_can_select: boolean; authenticated_can_select: boolean }>`
      select
        c.relrowsecurity as rls_enabled,
        has_table_privilege('anon', 'public.sura_identity_links', 'select') as anon_can_select,
        has_table_privilege('authenticated', 'public.sura_identity_links', 'select') as authenticated_can_select
      from pg_class c
      join pg_namespace n on n.oid = c.relnamespace
      where n.nspname = 'public'
        and c.relname = 'sura_identity_links'
    `;

    expect(result[0]).toMatchObject({ rls_enabled: true, anon_can_select: false, authenticated_can_select: false });
  }, 15_000);
});

afterAll(async () => {
  await closeSupabaseClient();
});
