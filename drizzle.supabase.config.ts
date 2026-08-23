import { defineConfig } from "drizzle-kit";

const connectionString = process.env.SUPABASE_DATABASE_URL;
if (!connectionString) {
  throw new Error("SUPABASE_DATABASE_URL is required to generate Supabase migrations");
}

export default defineConfig({
  schema: "./drizzle/supabase-schema.ts",
  out: "./drizzle/supabase",
  dialect: "postgresql",
  dbCredentials: { url: connectionString },
});
