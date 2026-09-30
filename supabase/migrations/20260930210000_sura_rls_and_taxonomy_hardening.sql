-- SURA backend hardening: correlated RLS, server-scale indexes, and the release-1 taxonomy.

CREATE OR REPLACE FUNCTION public.is_business_member(target_business uuid, actor uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.business_members bm
    WHERE bm.business_id = target_business AND bm.profile_id = actor
  );
$$;

CREATE OR REPLACE FUNCTION public.has_profile_role(target_profile uuid, target_role public.sura_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profile_roles pr
    WHERE pr.profile_id = target_profile AND pr.role = target_role
  );
$$;

-- Replace the original tautological or per-row auth policies with correlated checks.
DROP POLICY IF EXISTS profiles_self_or_public ON public.profiles;
DROP POLICY IF EXISTS profiles_self_update ON public.profiles;
CREATE POLICY profiles_public_or_self ON public.profiles FOR SELECT TO public
  USING (is_public = true OR id = (select auth.uid()));
CREATE POLICY profiles_self_insert ON public.profiles FOR INSERT TO public
  WITH CHECK (id = (select auth.uid()));
CREATE POLICY profiles_self_update ON public.profiles FOR UPDATE TO public
  USING (id = (select auth.uid())) WITH CHECK (id = (select auth.uid()));

DROP POLICY IF EXISTS roles_self_read ON public.profile_roles;
CREATE POLICY roles_self_read ON public.profile_roles FOR SELECT TO public
  USING (profile_id = (select auth.uid()));

DROP POLICY IF EXISTS businesses_public_verified ON public.businesses;
CREATE POLICY businesses_public_verified_or_owner ON public.businesses FOR SELECT TO public
  USING (status = 'verified' OR owner_profile_id = (select auth.uid()));
CREATE POLICY businesses_owner_insert ON public.businesses FOR INSERT TO public
  WITH CHECK (owner_profile_id = (select auth.uid()));
CREATE POLICY businesses_owner_update ON public.businesses FOR UPDATE TO public
  USING (owner_profile_id = (select auth.uid()) OR public.has_profile_role((select auth.uid()), 'admin'))
  WITH CHECK (owner_profile_id = (select auth.uid()) OR public.has_profile_role((select auth.uid()), 'admin'));

DROP POLICY IF EXISTS business_members_self_or_owner ON public.business_members;
CREATE POLICY business_members_self_or_owner ON public.business_members FOR SELECT TO public
  USING (profile_id = (select auth.uid()) OR EXISTS (
    SELECT 1 FROM public.businesses b
    WHERE b.id = business_members.business_id AND b.owner_profile_id = (select auth.uid())
  ));

DROP POLICY IF EXISTS business_aesthetics_member_delete ON public.business_aesthetics;
DROP POLICY IF EXISTS business_aesthetics_member_insert ON public.business_aesthetics;
DROP POLICY IF EXISTS business_aesthetics_member_read ON public.business_aesthetics;
DROP POLICY IF EXISTS business_aesthetics_public_verified ON public.business_aesthetics;
CREATE POLICY business_aesthetics_public_or_member_read ON public.business_aesthetics FOR SELECT TO public
  USING (
    EXISTS (SELECT 1 FROM public.businesses b WHERE b.id = business_aesthetics.business_id AND b.status = 'verified')
    OR public.is_business_member(business_aesthetics.business_id, (select auth.uid()))
  );
CREATE POLICY business_aesthetics_member_insert ON public.business_aesthetics FOR INSERT TO public
  WITH CHECK (public.is_business_member(business_id, (select auth.uid())));
CREATE POLICY business_aesthetics_member_delete ON public.business_aesthetics FOR DELETE TO public
  USING (public.is_business_member(business_id, (select auth.uid())));

DROP POLICY IF EXISTS catalog_public_published ON public.catalog_items;
CREATE POLICY catalog_public_published_or_member ON public.catalog_items FOR SELECT TO public
  USING (is_published = true OR public.is_business_member(business_id, (select auth.uid())));
CREATE POLICY catalog_member_insert ON public.catalog_items FOR INSERT TO public
  WITH CHECK (public.is_business_member(business_id, (select auth.uid())));
CREATE POLICY catalog_member_update ON public.catalog_items FOR UPDATE TO public
  USING (public.is_business_member(business_id, (select auth.uid())))
  WITH CHECK (public.is_business_member(business_id, (select auth.uid())));
CREATE POLICY catalog_member_delete ON public.catalog_items FOR DELETE TO public
  USING (public.is_business_member(business_id, (select auth.uid())));

DROP POLICY IF EXISTS orders_buyer_or_business ON public.orders;
CREATE POLICY orders_buyer_or_business ON public.orders FOR SELECT TO public
  USING (buyer_profile_id = (select auth.uid()) OR public.is_business_member(business_id, (select auth.uid())));

DROP POLICY IF EXISTS order_lines_order_access ON public.order_lines;
CREATE POLICY order_lines_order_access ON public.order_lines FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_lines.order_id
      AND (o.buyer_profile_id = (select auth.uid()) OR public.is_business_member(o.business_id, (select auth.uid())))
  ));

DROP POLICY IF EXISTS receipts_order_access ON public.receipts;
CREATE POLICY receipts_order_access ON public.receipts FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = receipts.order_id
      AND (o.buyer_profile_id = (select auth.uid()) OR public.is_business_member(o.business_id, (select auth.uid())))
  ));

DROP POLICY IF EXISTS payment_intent_order_access ON public.payment_intents;
CREATE POLICY payment_intent_order_access ON public.payment_intents FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = payment_intents.order_id
      AND (o.buyer_profile_id = (select auth.uid()) OR public.is_business_member(o.business_id, (select auth.uid())))
  ));

DROP POLICY IF EXISTS delivery_quote_order_access ON public.delivery_quotes;
CREATE POLICY delivery_quote_order_access ON public.delivery_quotes FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = delivery_quotes.order_id
      AND (o.buyer_profile_id = (select auth.uid()) OR public.is_business_member(o.business_id, (select auth.uid())))
  ));

DROP POLICY IF EXISTS refund_order_access ON public.order_refunds;
CREATE POLICY refund_order_access ON public.order_refunds FOR SELECT TO public
  USING (EXISTS (
    SELECT 1 FROM public.orders o
    WHERE o.id = order_refunds.order_id
      AND (o.buyer_profile_id = (select auth.uid()) OR public.is_business_member(o.business_id, (select auth.uid())))
  ));

DROP POLICY IF EXISTS settlement_business_access ON public.seller_settlements;
CREATE POLICY settlement_business_access ON public.seller_settlements FOR SELECT TO public
  USING (public.is_business_member(business_id, (select auth.uid())));

DROP POLICY IF EXISTS audit_self_read ON public.audit_events;
CREATE POLICY audit_self_or_admin_read ON public.audit_events FOR SELECT TO public
  USING (actor_profile_id = (select auth.uid()) OR public.has_profile_role((select auth.uid()), 'admin'));

DROP POLICY IF EXISTS reconciliation_finance_only ON public.reconciliation_events;
CREATE POLICY reconciliation_finance_only ON public.reconciliation_events FOR SELECT TO public
  USING (public.has_profile_role((select auth.uid()), 'finance') OR public.has_profile_role((select auth.uid()), 'admin'));

DROP POLICY IF EXISTS review_public_published ON public.reviews;
CREATE POLICY review_public_published_or_author ON public.reviews FOR SELECT TO public
  USING (status = 'published' OR author_profile_id = (select auth.uid()));

DROP POLICY IF EXISTS notification_self_access ON public.notifications;
CREATE POLICY notification_self_access ON public.notifications FOR SELECT TO public
  USING (profile_id = (select auth.uid()));

-- Cover the foreign keys identified by the Supabase performance advisor.
CREATE INDEX IF NOT EXISTS aesthetic_nodes_parent_idx ON public.aesthetic_nodes(parent_id);
CREATE INDEX IF NOT EXISTS audit_events_actor_idx ON public.audit_events(actor_profile_id);
CREATE INDEX IF NOT EXISTS business_aesthetics_node_idx ON public.business_aesthetics(aesthetic_node_id);
CREATE INDEX IF NOT EXISTS business_members_profile_idx ON public.business_members(profile_id);
CREATE INDEX IF NOT EXISTS businesses_owner_idx ON public.businesses(owner_profile_id);
CREATE INDEX IF NOT EXISTS order_lines_catalog_idx ON public.order_lines(catalog_item_id);
CREATE INDEX IF NOT EXISTS order_lines_order_idx ON public.order_lines(order_id);
CREATE INDEX IF NOT EXISTS order_refunds_order_idx ON public.order_refunds(order_id);
CREATE INDEX IF NOT EXISTS profile_roles_granted_by_idx ON public.profile_roles(granted_by);
CREATE INDEX IF NOT EXISTS reconciliation_events_order_idx ON public.reconciliation_events(matched_order_id);
CREATE INDEX IF NOT EXISTS reviews_author_idx ON public.reviews(author_profile_id);
CREATE INDEX IF NOT EXISTS reviews_order_idx ON public.reviews(order_id);
CREATE INDEX IF NOT EXISTS seller_settlements_order_idx ON public.seller_settlements(order_id);

-- Domains are intentionally broad. Nodes are the extensible graph: categories,
-- subcategories, styles, materials, moods and palettes can grow without a
-- businesses-table migration.
INSERT INTO public.aesthetic_domains (slug, name, description, sort_order, is_active) VALUES
  ('personal-style', 'Personal style', 'Clothing, accessories, beauty, grooming and body art.', 10, true),
  ('home-living', 'Home + living', 'Interiors, furniture, decor, materials and small spaces.', 20, true),
  ('spaces-places', 'Spaces + places', 'Architecture, landscape, hospitality and spatial identity.', 30, true),
  ('food-hospitality', 'Food + hospitality', 'Food, beverage, table culture and service environments.', 40, true),
  ('mobility-vehicles', 'Mobility + vehicles', 'Vehicles, detailing, transport and mobility culture.', 50, true),
  ('digital-creative', 'Digital + creative', 'Digital products, gaming, creator work and creative technology.', 60, true),
  ('objects-craft', 'Objects + craft', 'Pets, collectibles, functional objects and maker culture.', 70, true),
  ('events-occasions', 'Events + occasions', 'Celebrations, gifting, weddings and commissioned moments.', 80, true),
  ('beauty-wellness', 'Beauty + wellbeing', 'Care, grooming, fragrance and self-directed rituals.', 90, true)
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description, sort_order = EXCLUDED.sort_order, is_active = true;

WITH seed(domain_slug, slug, name, node_type, affordability, kenya_relevance, metadata) AS (VALUES
  ('personal-style','clothing','Clothing','category','everyday_edit','Fit, climate, use context and customer-led expression.', '{"signals":["fit","fabric","occasion"]}'::jsonb),
  ('personal-style','tailoring','Tailoring','subcategory','considered_edit','Local fit is confirmed by the maker, not inferred by SURA.', '{"signals":["structured","personal"]}'::jsonb),
  ('personal-style','thrift-remix','Thrift Remix','style','everyday_edit','Second-hand, reworked and layered sourcing with budget transparency.', '{"palette":["brick","moss","denim"]}'::jsonb),
  ('personal-style','soft-power','Soft Power','style','considered_edit','Warm, composed styling for work, occasion and repeat wear.', '{"palette":["ink","parchment","cognac"]}'::jsonb),
  ('personal-style','beauty-grooming','Beauty + grooming','category','everyday_edit','Consent-led grooming and styling without body judgement.', '{"signals":["maintenance","hygiene"]}'::jsonb),
  ('personal-style','tattoo-concept','Tattoo concept','subcategory','commissioned_edit','Concept exploration only; artist consultation and aftercare remain essential.', '{"caution":"permanence and healing require practitioner guidance"}'::jsonb),
  ('home-living','small-space','Small-space living','category','everyday_edit','Affordable room edits for renters, first homes and flexible spaces.', '{"signals":["modular","low-waste"]}'::jsonb),
  ('home-living','furniture','Furniture','category','considered_edit','Prioritize proportion, durability, repairability and local fabrication.', '{"signals":["scale","repairable"]}'::jsonb),
  ('home-living','savanna-atelier','Savanna Atelier','style','signature_edit','Grounded architectural space direction using stone, sisal, wood and shadow.', '{"palette":["acacia","sandstone","umber"]}'::jsonb),
  ('home-living','ink-ivory','Ink & Ivory','style','signature_edit','Gallery-like restraint with intentional negative space.', '{"palette":["ink","ivory","graphite"]}'::jsonb),
  ('home-living','natural-fibre','Natural fibre','material','everyday_edit','Sisal, cotton, woven and plant-led material cues.', '{"signals":["tactile","repairable"]}'::jsonb),
  ('home-living','warm-light','Warm light','mood','everyday_edit','Layered lighting prompts; electrical work requires a qualified professional.', '{"caution":"not electrical approval"}'::jsonb),
  ('spaces-places','hospitality','Hospitality','category','signature_edit','Arrival, comfort, service and local place identity are designed together.', '{"signals":["welcome","flow"]}'::jsonb),
  ('spaces-places','landscape','Landscape','subcategory','considered_edit','Shade, planting, drainage and maintenance are visible design inputs.', '{"signals":["climate","care"]}'::jsonb),
  ('spaces-places','heritage-modern','Heritage Modern','style','considered_edit','Contemporary forms with local material intelligence; no cultural costume claims.', '{"palette":["charcoal","terracotta","sisal"]}'::jsonb),
  ('spaces-places','coastal-ease','Coastal Ease','style','everyday_edit','Airy, sunlit, material-led direction for warm climates.', '{"palette":["teal","shell","coral-clay"]}'::jsonb),
  ('food-hospitality','food-menu','Food + menu','category','everyday_edit','Price, portion, diet and service clarity stay visible.', '{"signals":["portion","freshness","value"]}'::jsonb),
  ('food-hospitality','table-culture','Table culture','subcategory','considered_edit','Table, vessel and hosting cues can be everyday or commissioned.', '{"signals":["hosting","material"]}'::jsonb),
  ('food-hospitality','tangerine-social','Tangerine Social','style','everyday_edit','Joyful, expressive direction for social and creative life.', '{"palette":["tangerine","mint","espresso"]}'::jsonb),
  ('mobility-vehicles','detailing','Vehicle detailing','category','everyday_edit','Maintenance menus are clear about finish versus mechanical safety.', '{"signals":["finish","care"]}'::jsonb),
  ('mobility-vehicles','fleet-identity','Fleet identity','subcategory','commissioned_edit','Graphics, downtime, legal visibility and aftercare are scoped separately.', '{"signals":["identity","uptime"]}'::jsonb),
  ('mobility-vehicles','quiet-utility','Quiet utility','style','everyday_edit','Useful, durable and calm; a visual language for daily movement.', '{"palette":["graphite","stone","olive"]}'::jsonb),
  ('digital-creative','digital-products','Digital products','category','considered_edit','A clear, fast, accessible experience is part of the aesthetic.', '{"signals":["clarity","trust","speed"]}'::jsonb),
  ('digital-creative','gaming-worlds','Gaming worlds','subcategory','signature_edit','Gameplay, world-building, social play and visual identity move together.', '{"signals":["loop","world","community"]}'::jsonb),
  ('digital-creative','thermal-bloom','Thermal Bloom','style','signature_edit','Futuristic, vivid and expressive; use energy with intent.', '{"palette":["ink","infrared","violet"]}'::jsonb),
  ('digital-creative','studio-calm','Studio Calm','style','everyday_edit','Quiet tool-like order with an editorial edge.', '{"palette":["paper","ink","moss"]}'::jsonb),
  ('objects-craft','maker-objects','Maker objects','category','everyday_edit','Functional objects, material provenance and repairability.', '{"signals":["process","function"]}'::jsonb),
  ('objects-craft','pet-accessory','Pet accessories','subcategory','everyday_edit','Sizing, safe materials and species-appropriate use come first.', '{"caution":"not veterinary advice"}'::jsonb),
  ('objects-craft','object-story','Object story','style','considered_edit','A collectible or keepsake with a clear maker/process story.', '{"signals":["provenance","meaning"]}'::jsonb),
  ('events-occasions','celebration','Celebration','category','considered_edit','Occasion styling that respects budget, tradition and guest experience.', '{"signals":["meaning","flow"]}'::jsonb),
  ('events-occasions','gifting','Gifting','subcategory','everyday_edit','Useful, personal and easy to deliver or collect.', '{"signals":["recipient","use"]}'::jsonb),
  ('events-occasions','orchid-after-dark','Orchid After Dark','style','signature_edit','Romantic, artistic and cinematic with a deliberate focal point.', '{"palette":["aubergine","rose","candle"]}'::jsonb),
  ('beauty-wellness','hair-care','Hair care','category','everyday_edit','Texture, maintenance, hygiene and customer preference remain explicit.', '{"signals":["texture","care"]}'::jsonb),
  ('beauty-wellness','fragrance','Fragrance','subcategory','considered_edit','Scent is described through notes, intensity, use and preference.', '{"signals":["notes","intensity"]}'::jsonb),
  ('beauty-wellness','comfort-official','Comfort Official','style','everyday_edit','Useful, elevated, relaxed direction for repeat rituals.', '{"palette":["cocoa","oat","olive"]}'::jsonb)
)
INSERT INTO public.aesthetic_nodes (domain_id, slug, name, node_type, affordability, kenya_relevance, metadata, is_active)
SELECT d.id, s.slug, s.name, s.node_type, s.affordability::public.affordability_band, s.kenya_relevance, s.metadata, true
FROM seed s JOIN public.aesthetic_domains d ON d.slug = s.domain_slug
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, node_type = EXCLUDED.node_type, affordability = EXCLUDED.affordability, kenya_relevance = EXCLUDED.kenya_relevance, metadata = EXCLUDED.metadata, is_active = true;

-- Add a small amount of parent structure without making the graph rigid.
UPDATE public.aesthetic_nodes child SET parent_id = parent.id
FROM public.aesthetic_nodes parent
WHERE (child.slug, parent.slug) IN (
  ('tailoring','clothing'), ('beauty-grooming','clothing'), ('tattoo-concept','beauty-grooming'),
  ('furniture','small-space'), ('warm-light','furniture'), ('landscape','hospitality'),
  ('table-culture','food-menu'), ('fleet-identity','detailing'), ('gaming-worlds','digital-products'),
  ('pet-accessory','maker-objects'), ('gifting','celebration'), ('fragrance','hair-care')
);
