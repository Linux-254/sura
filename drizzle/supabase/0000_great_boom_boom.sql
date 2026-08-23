CREATE TYPE "public"."sura_identity_link_status" AS ENUM('pending', 'linked', 'revoked');--> statement-breakpoint
CREATE TABLE "sura_identity_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sura_user_id" integer NOT NULL,
	"supabase_auth_user_id" uuid,
	"status" "sura_identity_link_status" DEFAULT 'pending' NOT NULL,
	"consented_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX "sura_identity_links_sura_user_unique" ON "sura_identity_links" USING btree ("sura_user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "sura_identity_links_auth_user_unique" ON "sura_identity_links" USING btree ("supabase_auth_user_id");--> statement-breakpoint
CREATE INDEX "sura_identity_links_status_idx" ON "sura_identity_links" USING btree ("status");
