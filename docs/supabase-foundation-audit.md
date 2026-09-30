# SURA Supabase Foundation Audit

## Verified project

- Project: `SURA`
- Project ref: `oqqdobzjrfwclqsmnkcm`
- Organization: `fpkunscenihxtjpovgbf`
- Region: `eu-west-1`
- Status: `ACTIVE_HEALTHY`
- Created: 2026-09-30
- API URL: `https://oqqdobzjrfwclqsmnkcm.supabase.co`
- Migrations present: `sura_platform_foundation`, `sura_aesthetic_taxonomy_seed`, `sura_commerce_operations_foundation`, `sura_taxonomy_rls_remediation`
- Edge Functions: none

The existing project already contains the intended Postgres/Auth foundation: `profiles`, `profile_roles`, `aesthetic_domains`, `aesthetic_nodes`, `businesses`, `business_members`, `business_aesthetics`, `catalog_items`, `orders`, `order_lines`, `receipts`, `payment_intents`, `delivery_quotes`, `order_refunds`, `seller_settlements`, `reconciliation_events`, `reviews`, `notifications`, and `audit_events`. Row level security is enabled on all inspected public tables.

## Existing taxonomy

The seed currently contains six active aesthetic domains and 15 active nodes, including Personal style, Creative direction, Home/space-related directions, and styles such as Heritage Modern, Coastal Ease, Soft Power, Thrift Remix, Savanna Atelier, Ink & Ivory, Tangerine Social, Cobalt Ritual and Natural fibre. The product migration will extend this into an 8-domain, multi-level taxonomy with affordability and Kenya-aware metadata.

## Security and performance findings

Security advisor returned no lints. The policy inspection found several incorrectly correlated membership policies using tautologies such as `bm.business_id = bm.business_id`, so the migration must replace them with correlated checks against the outer business/order row before real data is used.

Performance advisor reported:

- 13 unindexed foreign keys, including business membership, order lines, refunds, reviews, settlements and taxonomy parent relationships.
- 20 RLS init-plan warnings where `auth.uid()` should be wrapped as `(select auth.uid())`.
- Multiple permissive policy warnings for `business_aesthetics`.
- Unused indexes are informational on a brand-new database; do not remove them before production workload evidence.

Remediation reference: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

## External references already used by the product direction

- https://www.figma.com/resource-library/100-color-combinations/
- https://www.buyrentkenya.com/discover/incorporating-cultural-elements-into-design
- https://www.vistaprint.com/hub/color-trends

## Implementation decision

Reuse this active SURA project instead of creating a duplicate. The application will use Supabase Auth directly in the browser, a small Vercel serverless API for privileged writes and payment/order orchestration, Postgres/RLS for data ownership,.
