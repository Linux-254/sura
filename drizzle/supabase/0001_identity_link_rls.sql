ALTER TABLE public.sura_identity_links ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE public.sura_identity_links ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
REVOKE ALL ON TABLE public.sura_identity_links FROM anon, authenticated;--> statement-breakpoint
GRANT SELECT, INSERT, UPDATE, DELETE ON TABLE public.sura_identity_links TO service_role;
