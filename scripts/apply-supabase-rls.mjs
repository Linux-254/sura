import postgres from "postgres";

const connectionString = process.env.SUPABASE_DATABASE_URL;
if (!connectionString) throw new Error("SUPABASE_DATABASE_URL is required");

const sql = postgres(connectionString, { prepare: false, max: 1 });

try {
  await sql.unsafe("ALTER TABLE public.sura_identity_links ENABLE ROW LEVEL SECURITY");
  await sql.unsafe("REVOKE ALL ON TABLE public.sura_identity_links FROM anon, authenticated");
  await sql.unsafe("GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sura_identity_links TO service_role");
  console.log("Supabase identity-link RLS policy applied.");
} finally {
  await sql.end({ timeout: 5 });
}
