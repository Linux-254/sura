# SURA — Technical Requirements

## Application architecture

SURA is a React/Vite web app with a Vercel-compatible Express API and Supabase as the system of record. The client uses Supabase Auth directly for email/password identity and public read queries. Privileged writes go through the server API so service-role credentials, business review transitions, order orchestration and payment callbacks never run in the browser.

| Layer | Responsibility |
| --- | --- |
| Client | Visual discovery, taxonomy search, onboarding, private space and checkout handoff. |
| Supabase Auth | Session persistence, refresh, email confirmation and identity. |
| Supabase Postgres | Normalized profiles, roles, taxonomy, businesses, catalogues, orders, payment intents, receipts, reviews, settlements and audit events. |
| Vercel API | Input validation, authorization, onboarding upserts, order preparation, provider webhooks and receipt issuance. |
| Vercel | Static Vite output plus `/api/*` rewrites to the serverless function. |

## Roles and authorization

The first role model is `member`, `creator`, `business_owner`, `moderator`, `finance` and `admin`. Every authenticated profile receives `member`. Business owners can submit their own business studio. Moderators control the verified business/catalogue boundary. Finance and admins can access reconciliation records. RLS policies use `auth.uid()` and the security-definer helpers `is_business_member` and `has_profile_role`; policies never compare a column to itself as an authorization check.

## Data model and flow

The central graph is `aesthetic_domains → aesthetic_nodes → business_aesthetics`. Nodes carry a `node_type`, affordability band, local relevance note and JSON metadata so categories, subcategories, styles, materials, moods and palettes can scale without repeated schema changes. The initial seed covers personal style, home/living, spaces/places, food/hospitality, mobility/vehicles, digital/creative, objects/craft, events/occasions and beauty/wellbeing.

The commerce flow is deliberately explicit:

1. The client selects a published catalogue item from a verified business.
2. `/api/v1/orders` verifies business/item state, calculates subtotal, delivery, commission, settlement and total, then creates the order, order line and payment intent.
3. The payment provider owns collection. The browser never marks an order paid.
4. `/api/v1/payments/webhook` validates the shared secret and amount, updates the payment intent and order, and upserts a receipt when status is `paid`.
5. `/api/v1/orders/:orderId/receipt` exposes the receipt only to the buyer or authorized business member after issuance.

## Required Vercel environment variables

| Variable | Exposure | Purpose |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Browser | Supabase project URL. |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Browser | Supabase publishable/anon key. |
| `SUPABASE_URL` | Server | Supabase project URL. |
| `SUPABASE_PUBLISHABLE_KEY` | Server | Token verification key. |
| `SUPABASE_SERVICE_ROLE_KEY` | Server only | Privileged writes and webhook orchestration. |
| `SURA_PAYMENT_WEBHOOK_SECRET` | Server only | Shared secret for provider callbacks. |

## Quality gates

`pnpm check` must pass. `pnpm build` must produce the static shell and both server bundles. Public discovery must remain readable when there are zero verified businesses. A payment callback must be idempotent, amount-checked and the only route that can issue a paid receipt. Production must use Supabase RLS and Vercel environment variables; no database URL, service-role key, payment secret or provider credential belongs in the client bundle.
