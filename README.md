# SURA — Make the feeling findable

SURA is a Nairobi-first visual network for people, businesses, objects, spaces, style, food, mobility, pets, events and the details that make life feel coherent. It is designed as an editorial discovery layer with a commerce spine: see a direction, understand the pocket it can fit, meet the people who make it real, then move through a clear order and receipt handoff.

## Product loop

**See → shape → source → handoff.** A visitor can explore a living aesthetics taxonomy without an account. A signed-in member uses Supabase Auth to create a private profile, choose a mix of directions and keep the route visible. A business owner can submit a studio for review, add a catalogue, and later receive order handoffs. A paid order is only marked `paid` after a verified provider callback; the receipt is issued from that callback, never from a browser button.

## Architecture

| Layer | Responsibility |
| --- | --- |
| React + Vite + Tailwind v4 | The visual network shell, discovery surfaces, onboarding, private space and order handoff UI. |
| Supabase Auth | Email/password identity, session refresh and client-side sign-in state. No legacy session or OAuth exchange is used. |
| Supabase Postgres + RLS | Profiles, roles, aesthetic domains/nodes, businesses, catalogues, orders, payment intents, receipts, reviews and audit records. |
| Vercel serverless API | Service-role-only writes for onboarding, business creation, order preparation, provider webhooks and receipt issuance. |
| External payment provider | Provider-specific collection and callback. Credentials are deliberately not committed to the repository. |

The app uses the existing SURA Supabase project `oqqdobzjrfwclqsmnkcm` rather than creating a duplicate. The database hardening migration lives at `supabase/migrations/20260930210000_sura_rls_and_taxonomy_hardening.sql` and is already applied to that project.

## Local development

Create `.env.local` from `.env.example` and add the publishable Supabase values. Start the app with:

```bash
pnpm install --no-frozen-lockfile
pnpm dev
```

Validate the source and production bundles with:

```bash
pnpm check
pnpm build
```

The browser only needs `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. The Vercel deployment also needs `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and `SURA_PAYMENT_WEBHOOK_SECRET`. The service-role key and webhook secret must exist only in Vercel project environment variables; never place them in `VITE_*` variables.

## Product surfaces in this build

- **Landing shell:** SURA visual language from the first pixel, with a signal-led hero, local visual assets, affordability-aware pocket ladder and a real taxonomy preview.
- **Explore:** searchable domain and node discovery plus verified business surfaces and catalogue entry points.
- **Onboarding:** member, creator and business-owner roles; profile details; county/city; aesthetic mix; optional business studio submission.
- **Private space:** profile signal, roles, studio review state, order state and receipt visibility.
- **Order handoff:** server-side order preparation, payment-intent record, provider webhook boundary and receipt issuance after settlement.

## Brand and launch system

`brand-spec.md` records the token system, typography, supplied marks, local visual asset map and motion intent. `ICP.md` defines the member and business audiences. `messaging.md` contains the launch promise, hooks, caption structure and CTAs. The research-backed taxonomy and affordability model are in `docs/aesthetics-taxonomy-research.md`.

The launch system is intentionally credit-light: one source idea should become a Reel/TikTok/Short, a Pinterest video pin and a still carousel by reusing the same SURA signal, rather than generating separate concepts for each platform. Generated video should be added only after the product loop is stable and measurable.

## Security rules

RLS policies are correlated to `auth.uid()` or an explicitly verified business membership. Public reads expose only active taxonomy, verified businesses, published catalogue items, published profiles and published reviews. Privileged writes run through the Vercel API with the Supabase service role. Payment webhooks require `X-Sura-Webhook-Secret`, validate the order amount, update the payment intent and issue a receipt idempotently.

## Principle

> SURA should make the next useful action feel obvious — and make the handoff trustworthy when the user is ready to move.
