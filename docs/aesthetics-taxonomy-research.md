# SURA aesthetics taxonomy research

**Status:** First-release taxonomy seed and matching rules  
**Scope:** Personal style, fashion, accessories, beauty, body art, interiors, places, mobility, food, digital creativity, makers, pets, events and gifting  
**Geography lens:** Kenya-aware by default, without assuming a single Kenyan aesthetic  
**Evidence basis:** The supplied domain research results and their linked sources

## Executive summary

SURA should treat an “aesthetic” as more than a visual label. A useful result must connect a **domain** (what area of life is being changed) to a **category** (the kind of object, space, service or experience), a **subcategory** (the concrete use or format), and an optional **style language** (the visual or emotional vocabulary). Search and onboarding should also match on occasion, constraints, fit, quality, trust, maintenance and safety.

For the first release, keep the taxonomy broad and stable: use the nine supplied domains as top-level IDs; seed only high-frequency, discoverable categories and subcategories; keep styles as optional, cross-cutting tags; and preserve an extensible attribute layer rather than encoding every nuance in the tree. A listing may belong to one primary category and several secondary categories, but it should not need a new category merely because its color, material, price band or cultural context changes.

Affordability is best presented as four **scope/value bands**, not as numeric price thresholds. The bands describe what changes in labor, personalization, materials, coordination, assurance, timeline and aftercare. Prices must still be shown in Kenyan shillings where the Kenya market is selected, with materials, labor, alterations, delivery, deposits, import/customs exposure and maintenance made legible.

## 1. Hierarchy model

### 1.1 Canonical structure

```text
SURA aesthetics
└── Domain
    └── Category
        └── Subcategory
            └── Optional style language / visual vocabulary
                └── Listing, service, place, experience or commissioned brief
```

**Style is intentionally optional and cross-cutting.** It can be attached to a subcategory or used as a search facet across categories. A style is not a demographic, nationality, body type, faith, county or presumed identity. Where the research supplied explicit style vocabularies, those are seeded below. Elsewhere, use descriptive facets and user-authored tags until user evidence supports a controlled style label.

### 1.2 What each level means

| Level | Implementation meaning | Example | Rules |
|---|---|---|---|
| Domain | Stable top-level area of intent | `sura_personal_style_fashion_beauty_body_art` | Keep IDs stable; do not use affordability or geography as domains. |
| Category | Broad discoverability bucket | Clothing and styling; Lighting and visual comfort; Interior reset | Prefer user-recognizable nouns and verbs. |
| Subcategory | Concrete product, service or use format | Braids; under-bed storage; ceramic coating; digital invitations | A listing may have one primary and multiple secondary subcategories. |
| Style language | Optional look, mood or vocabulary | Minimalist/Japandi; retro/Y2K/Flash nostalgia; joyful/color-forward | User-selectable or evidence-backed; never infer from appearance or nationality. |
| Attributes/signals | Searchable facts and constraints | Occasion, fit, material, care, delivery, permanence, accessibility, safety | Attributes are facets, not extra tree depth. |

### 1.3 IDs and extensibility

Use lowercase, stable, machine-readable IDs with human-readable labels. Preserve the supplied domain IDs as the seed IDs, normalizing separators only if the implementation requires one convention. A practical record shape is:

```text
id
parent_id
display_name
level                 # domain | category | subcategory | style
aliases[]
domain_id
attributes{}          # faceted, not hierarchical
safety_flags[]
affordability_band[]
source_refs[]
status                # seed | proposed | validated | deprecated
```

Do not create a new category for a color, size, material, price, county, occasion, cultural reference, finish, maintenance level or service scope. These should remain facets. Add a new subcategory only when it represents a recurrent, user-searchable use or format that cannot be understood through existing parents.

## 2. Canonical taxonomy seed for release 1

This seed prioritizes broad discovery and future extension. The subcategory lists are deliberately representative rather than exhaustive. The style column contains only style languages or visual descriptors present in the supplied research; “hold as facet” means the domain has useful descriptors but no supplied controlled style list.

| Domain ID | Domain | Release-1 categories | Subcategory seed examples | Style seed / treatment | High-value facets to capture |
|---|---|---|---|---|---|
| `sura_personal_style_fashion_beauty_body_art` | Personal style, fashion, accessories, beauty and body art | Clothing and styling; Footwear; Accessories; Hair and grooming; Body art and adornment; Style systems and services | Tops, bottoms, dresses, skirts, outerwear, knitwear, tailoring, occasionwear, workwear, activewear, modestwear; sandals, flats, heels, boots, sneakers, formal shoes; bags, belts, headwear, scarves, eyewear, watches, jewelry, hair and tech accessories; natural/relaxed hair, braids, locs, wigs/extensions, barbering, nails, makeup, skincare, fragrance; tattoos, temporary body art, piercings, henna, permanent makeup; alterations, styling, personal shopping, rentals, resale/mitumba, upcycling, made-to-measure, bridal/event packages | Hold as facet at launch. Use silhouette, fit, fabric, color, print, finish, occasion and statement-versus-everyday descriptors rather than inventing style labels. | Size/fit, body evidence, material, comfort, weather, condition, maintenance, shade range, ingredients/claims, service duration, permanence, placement, artist, aftercare, price and provenance |
| `sura_interior_styling_furniture_decor_small_space_living` | Interior styling, furniture, decor and small-space living | Space planning and room function; Furniture; Storage and organization; Surface and material styling; Lighting and visual comfort; Textiles and soft furnishings; Decor and identity; Style languages and briefs; Small-space living systems | Circulation, zoning, entry/drop zones, living/dining/bedroom/work-from-home; seating, beds, tables, storage, lighting; open/closed, wardrobe, under-bed, vertical/over-door and concealed storage; wall color, timber, metal, stone, ceramic, glass, woven fibres, upholstery; daylight, task/ambient/accent, glare control, mirrors, window treatments; rugs, curtains, cushions, bedding, throws, slipcovers; artwork, plants, books, ceramics, local craft, keepsakes, focal walls; convertible sofa/bed, folding or nesting tables, storage ottoman, wall-mounted desk, room dividers; reversible or anchored solutions | Minimalist/Japandi; Scandinavian; contemporary; mid-century; industrial; rustic; bohemian; coastal; traditional; transitional; maximalist; biophilic. Treat as visual vocabularies, not rigid identities. | Room/function, dimensions, tenure, material/build, storage capacity, flexibility, daylight, ventilation, comfort, safety, installation, repairability, delivery and maintenance |
| `sura_architecture_landscape_hospitality_spatial_identity` | Architecture, landscape, hospitality and spatial identity | Arrival, threshold and wayfinding; Spatial planning and experience zones; Materiality, colour and craft; Light, sound, thermal and sensory comfort; Landscape and ecology; Identity and storytelling; Operations, safety and inclusion | Frontage, entrance, reception, signage, drop-off, accessible routes; public/private gradients, dining, work, rest, gathering, service/back-of-house, indoor–outdoor; floors, walls, ceilings, joinery, textiles, reclaimed/local finishes; daylight, glare, artificial light, acoustics, ventilation, shade, odour, privacy; planting, shade trees, courtyards, stormwater, soil, habitat, seating, play, views; brand promise, landmarks, art/craft commissions, history, community-authored interpretation; cleaning, servicing, crowd flow, security, fire/life safety, toilets, universal design, maintenance | Hold as facet at launch. Use material, climate, community and identity descriptors only when supplied or validated. | Site/climate, orientation, use, access, safety, operations, maintenance, material provenance, approvals, comfort, lifecycle value and storytelling consent |
| `sura_vehicles_detailing_transport_mobility_culture` | Vehicles, detailing, transport and mobility culture | Routine exterior care; Interior reset; Paint appearance; Protection; Personalisation and identity; Functional mobility care; Mobility culture and vehicle types | Wash/dry/wheels/glass; vacuum, upholstery/carpet, leather/vinyl, mats, odour; decontamination, scratch/swirl reduction, polish, wax/sealant, headlight restoration; ceramic coating, PPF and high-wear protection; decals, wraps, tint where legal, trim/wheel/tyre finish, fleet graphics; lights/glass, mirrors, tyres, brakes, leaks, load areas and referrals; private cars, motorcycles/boda bodas, matatus/minibuses, tuk-tuks, vans, pickups, trucks and fleet/service vehicles | Hold as facet. Capture gloss, matte/satin and graphics/identity only as finish or personalization attributes; do not treat appearance as roadworthiness. | Vehicle type/use intensity, condition evidence, coverage, material/product provenance, turnaround, downtime, legal visibility, safety exclusions, warranty, aftercare and site constraints |
| `sura_food_beverage_table_culture_hospitality` | Food, beverage, table culture and hospitality | Food and menu experience; Beverages; Table culture and serviceware; Hospitality environments; Retail and packaged presentation; Occasion and identity | Everyday staples, quick-service, casual/fine dining, dietary/health-oriented, plant-forward, seasonal/local, celebration/catering; water, tea/coffee, juices/smoothies, soft drinks, alcoholic/zero-proof, functional drinks; shareable/community, individual plated, family-style, formal setting, buffet/self-service, takeaway/delivery; street/market/kiosk, café, restaurant, hotel/venue, event/private dining, workplace/institutional; fresh/perishable, pantry, chilled/frozen, ready-to-eat, gift/occasion; daily, social, business, celebration, tourism, home-hosting | Hold as facet. Use mood, occasion, provenance, language and service format only after the user confirms them. | Price, portion, freshness, provenance, dietary/allergen clarity, temperature, hygiene, service reliability, accessibility, packaging, storage/date, payment and operating hours |
| `sura_digital_products_gaming_creative_technology_creator_aesthetics` | Digital products, gaming, creative technology and creator aesthetics | Digital product utility; Gaming experiences; Creator production; Creative technology; Creator aesthetics | Mobile/web apps, e-commerce, fintech, education, productivity, AI-assisted tools; mobile, PC/console, web/HTML5, esports/streaming, serious/impact games; short-form video, livestreaming, podcasts, photography, illustration, music, 3D, digital fashion; generative AI, AR/VR, 3D, motion, interactive installations, no-code, immersive web; workflow/trust/personalization/accessibility, gameplay/narrative/social/monetization, capture/edit/distribution/community | Minimalist/editorial; bold type and color; retro/Y2K/Flash nostalgia; sci-fi gaming UI; glow/3D depth; hand-made/local texture; intentionally raw/lo-fi. These are selectable visual systems, not demographic labels. | Device/data, load/performance, accessibility, privacy/security, rights/licensing, creator identity, portfolio, updates, support, originality, language and purchase model |
| `sura_pets_collectibles_objects_crafts_maker_culture` | Pets, collectibles, objects, crafts and maker culture | Pet care and enrichment; Wearables and small personal goods; Home objects and decor; Collectibles and fandom; Maker tools and workshop outputs; Gifts and personalization; Heritage and contemporary craft | Collars/leashes, beds, toys, feeding, grooming, memorial/portrait; jewelry, beadwork, bags, wallets, scarves, hair accessories, upcycled fashion; baskets, ceramics, woodwork, woven goods, candles, planters, lamps, wall art, storage; stamps, coins, cards, figurines, toys, books/prints, memorabilia, souvenirs; 3D-printed, laser-cut, electronics kits, repaired/upcycled, DIY kits/classes; names/dates/portraits, corporate/event favors, wedding/celebration; traditional techniques, contemporary adaptations, provenance-led pieces | Hold as facet. Use contemporary, heritage-linked, imported or collaboration status only when documented; do not infer cultural ownership from a motif. | Dimensions, materials, origin, handmade/machine-made, durability, care, provenance, personalization, repair, safety, delivery and secure payment |
| `sura_events_occasion_aesthetics` | Events, weddings, gifting, celebrations and occasion aesthetics | Event identity and mood; Ceremony and spatial styling; Tablescape and dining; Floral, botanical and material language; Personalization and storytelling; Guest experience and keepsakes; Lifecycle occasions | Intimate/minimal, joyful/color-forward, elegant/luxe, rustic/natural, playful/child-friendly, corporate/brand-led; welcome/signage, aisle/altar/backdrop, seating/circulation, stage/dance, lighting/sound; linens, place settings, menus, centerpieces, food/display, cake/dessert; fresh/dried florals, foliage, sculptural forms, textiles, ceramics, wood, metal, paper; monograms, names, photos, stationery, meaningful objects, color narratives; favors, gifting, photo moments, entertainment, comfort amenities, scent, mocktail/food stations; proposals/engagements, weddings, birthdays, graduations, baby/family celebrations, cultural/religious milestones, memorials, launches, seasonal gifting | Listed mood labels are seed styles. Keep them client-selectable; do not assign traditions, colors or rituals without confirmation. | Occasion, stakeholder approvals, guest count, weather/power, setup/strike, reusable/rental, accessibility, faith/dietary/modesty needs, logistics, deposits and contingency |

### 2.1 Recommended release-1 taxonomy behavior

- **Browse:** show domains first, then the most common categories, then subcategories. Do not force a style selection.
- **Search:** search across names, aliases, descriptions and maker/service terms; map synonyms to the nearest canonical node while preserving the user’s query.
- **Facets:** expose occasion, budget band, location/delivery, style, material, fit/size, condition, service type, maintenance and relevant safety/compatibility fields.
- **Cross-domain:** allow a user to combine nodes, for example `occasion = wedding` + `domain = personal style` + `category = hair and grooming`, or `small-space living` + `storage` + `accessible investment`.
- **Extensibility:** add aliases and subcategories without renaming stable parents. Keep style and attribute vocabularies versioned so labels can be merged or deprecated without losing listing history.

## 3. Four affordability bands

The research contains several domain-specific ladders with four or five steps. SURA should present one four-band user-facing model. The fifth step appearing in some results (for example, professional/commissioned schemes or institutional/collector orders) should map to **Band 4** with an additional scope tag such as `institutional`, `collector`, `architect-led`, `fleet` or `project-managed`. These are not numeric prices: the supplied research does not provide universal Kenya price thresholds.

| Canonical band | User-facing label | What changes | Typical examples from the research |
|---|---|---|---|
| 1 | **Everyday edit** | Lowest cash outlay and lowest coordination. Reuse, remix, repair, resale/thrift/mitumba, shop-supplied basics, platform-native templates or DIY changes. The value proposition is visible impact per shilling, speed and repeatability. Safety, hygiene and truthful claims do not reduce at this band. | Re-wearing and tailoring a garment; rearranging furniture; cleaning a vehicle; menu/signage reset; phone capture and self-editing; small repair or simple maker good; one event focal detail. |
| 2 | **Accessible upgrade** | One or a small number of high-impact purchases or services. More choice, basic tailoring/fabrication, local-market accessories, defined templates, simple coordination and clear fixed scope. Show price, size/fit, care, inclusions, delivery and any deposit. | One statement item; salon/barber/nail service; paint/hooks/mirror; targeted vehicle treatment; coordinated menu/packaging kit; entry design item; simple personalization. |
| 3 | **Premium ready-to-use / professional** | Better materials or construction, a coordinated system or capsule, skilled service and documented process. More measurement, quality assurance, before/after evidence, professional labor, durability and aftercare; quote preparation and maintenance separately where material. | Branded/locally designed pieces; quality furniture and layered lighting; measured design refresh; scheduled vehicle detail and protection; professional makeup/hair; launch or fit-out package; branded content kit; small-batch craft. |
| 4 | **Custom and commissioned** | High personalization and coordination. Consultation, measured brief, original design, specialist labor, fabrication or project management, revisions, approvals, timeline, deposit/milestones, installation/strike, licensing, maintenance and aftercare become explicit line items. | Made-to-measure or bridal; bespoke furniture or spatial scheme; architect-led work; correction/coating/wrap or fleet livery; research-led hospitality; bespoke app/game/AR work; commissioned jewelry/body art; institutional/collector order. |

### 3.1 Band presentation rules

1. Show a **band label plus scope**, not a vague quality claim. “Band 3 — Premium ready-to-use / professional” should be accompanied by the actual inclusions.
2. Never imply that expensive means more culturally authentic, safer, more flattering, more sustainable or more meaningful. Match quality and safety evidence separately.
3. For services and commissions, show materials, labor, delivery/transport, alterations or installation, deposit, taxes/customs exposure when applicable, revision limits, lead time, cancellation and maintenance/aftercare.
4. Support staged scopes and modular upgrades where feasible: repair before replacement, room-by-room interiors, off-peak fleet service, reusable event rentals, smaller food portions/value bundles and data-light digital options.
5. Use **KES** for Kenya-facing prices and disclose whether a price is fixed, estimated or quote-after-assessment. No supplied result establishes a universal amount for any band.

## 4. Matching signals for search and onboarding

### 4.1 Shared signal model

Use two classes of signals:

- **Hard constraints:** must be satisfied or clearly disclosed—safety, legal visibility, size/fit requirements, allergies/dietary constraints, accessibility, delivery area, device/data limit, permanence, approval/tenure restrictions, service availability and budget ceiling where the user sets one.
- **Soft matches:** improve ordering but should not silently exclude—style language, color/material, mood, social proof, local maker, sustainability, convenience, personalization and perceived value.

Every recommendation should be explainable with a small set of matched facts, for example: “matches your **wedding** occasion, **Band 2**, **M-Pesa-compatible payment**, **breathable material**, and **braid maintenance level**.” Do not infer body shape, skin tone, hair texture, religion, gender, county, income or cultural identity from an image, name or nationality.

### 4.2 Signal groups to index

| Signal group | Search/onboarding prompts and listing fields | Applies especially to |
|---|---|---|
| Intent and occasion | What are you changing? What is the occasion or use? Daily, work, travel/commute, celebration, ceremony, tourism, hosting, work-from-home, fleet or creator use; allow user-defined occasion. | All domains |
| Affordability and scope | Band 1–4; fixed price vs quote; one-off vs repeat; staged work; deposit/milestones; delivery/setup/strike; source files/licensing; maintenance/aftercare. | All, especially services/commissions |
| Style and expression | Select one or more supplied style languages, or enter a description. Capture palette, pattern, material, finish, scale, texture, mood and statement/everyday role. | Interiors, digital, events, fashion, spaces, vehicles, objects |
| Fit, comfort and access | Size, dimensions, drape, mobility, softness, weight, breathability, seat/mattress/desk ergonomics, step-free route, readable type, captions, alt text, low-motion, language. | Fashion, interiors, places, digital, food/events |
| Build, quality and maintenance | Construction, seams/fastenings/lining/sole; dimensions/hardware/load; cleanability, repairability, colorfastness, care, durability, finish and replacement parts. | Fashion, interiors, vehicles, food/serviceware, maker goods |
| Beauty compatibility | Skin tone/shade range, hair/skin compatibility, ingredients and claims, patch testing, practitioner skill, hygiene, expected result, service duration and maintenance. | Beauty/grooming |
| Body-art safety and permanence | Temporary/permanent, placement/visibility, scale/motif, consent, practitioner portfolio, sterile single-use or properly sterilized equipment, allergy/infection disclosure, healing and aftercare access. | Body art/adornment |
| Space/site and operations | Measurement, circulation, privacy, climate, light/glare, acoustics, ventilation, water/power, maintenance capacity, tenure, approvals, crowd/service flow, storage and installation. | Interiors, architecture, hospitality, events |
| Vehicle compatibility | Vehicle type, age/condition, use intensity, coverage, parking/site constraints, downtime, finish, legal visibility, tint/wrap restrictions, handover checklist and exclusions. | Vehicles and mobility |
| Food and hospitality trust | Price/portion, freshness, provenance, dietary/allergen information, ingredient/storage/date, temperature, hygiene, queue/wait, opening hours, accessibility, payment and packaging. | Food, beverage, events |
| Digital usability and rights | Device/OS, bandwidth, offline need, media weight, performance, privacy/security, portfolio/demo, update/support, ownership, attribution, licensing, commercial rights and AI/voice/model consent. | Digital/creator work |
| Cultural and ethical context | User-confirmed reference, language, faith/work/modesty context, maker attribution, provenance, permission, fair payment/revenue sharing, non-tokenistic use. | All, especially fashion, craft, food, events, spaces |
| Trust and proof | Reviews, comparable portfolio, before/after, samples/mock-ups, warranty/return/exchange, communication reliability, quote clarity, authorized seller/practitioner, realistic claims. | All |
| Sustainability and lifecycle | Material origin, local labor, repair/resale/upcycling, reuse/rental, packaging, waste, water/energy demand, durability and specific evidence for environmental claims. | All |

### 4.3 Onboarding flow (minimum viable)

1. **Choose an area:** select one or more domains, with plain-language examples.
2. **Name the job:** browse, buy, book, commission, learn, repair, style, host or build.
3. **Set scope:** choose Band 1–4; optionally set a KES ceiling, quote preference and timeline.
4. **State context:** occasion/use, location or delivery/pickup need, indoor/outdoor, tenure, vehicle/device/item type, guest or household needs.
5. **Choose expression:** optional style language and descriptive preferences. Include “I’m not sure” and free text.
6. **Set constraints:** fit/dimensions, comfort, climate, maintenance, accessibility, dietary/allergen, permanence, safety, bandwidth or legal requirements.
7. **Set trust preferences:** local maker, portfolio/reviews, provenance, warranty/returns, authorized seller, repair/aftercare, reusable/rental.
8. **Show results with reasons:** display matched signals and any unresolved trade-off rather than one opaque score.

### 4.4 Ranking and safety behavior

- Apply hard constraints first; if no result satisfies them, say what is missing instead of relaxing a safety constraint silently.
- Rank soft signals by explicit user choices, then by listing evidence and freshness of information. Do not use price as a proxy for taste, safety or worth.
- Show trade-offs: “lower cost but more maintenance,” “locally made but longer lead time,” “permanent and requires aftercare,” or “quote required after measurement.”
- Keep safety gates domain-specific. A permanent body-art result cannot be ranked on visual appeal alone; detailing cannot be presented as mechanical inspection; decor cannot substitute for structural, fire, electrical or building-code advice; food claims must be truthful.
- Log query-to-node matches and zero-result queries to expand aliases and candidate subcategories. Promote a new node only after repeated demand and human review; preserve the original query and source evidence.

## 5. Kenya-aware product rules

These are product and content rules derived from the supplied Kenya relevance notes. They are not legal advice and do not replace current regulator or county guidance.

### 5.1 Market, access and pricing

1. **Do not ship a single “Kenyan look.”** Offer varied bodies, skin tones, hair textures, ages, faith/work contexts, urban and rural access patterns and customer-led cultural references. Ask; do not infer.
2. **Make KES costs legible.** Separate materials, labor, alterations, delivery, setup/installation, deposits, import/customs exposure, currency volatility and maintenance when they apply. Support staged payment or layaway where a provider offers it.
3. **Support dual routes.** Present resale/mitumba, repair, alteration, upcycling and second-hand options alongside locally made, designer, imported, professional and commissioned options. Explain trade-offs without ranking one market as inherently superior.
4. **Design for mobile/social discovery and offline access.** Use compressed visual merchandising, messaging-friendly catalogs, phone capture and pickup/courier options; retain non-digital or assisted paths for people with lower connectivity.
5. **Localize by county/site, not stereotype.** Climate, logistics, supply, power, water, housing, transport and audience differ. Validate beyond Nairobi and do not assume Nairobi/Mombasa conditions apply nationally.
6. **Credit and compensate local value chains.** Attribute makers, materials, techniques and provenance. Obtain permission for sacred, restricted or community-owned designs and use written collaboration or revenue-sharing terms where appropriate. Never treat Maasai, coastal or other motifs as generic decoration.
7. **Make sustainability specific.** State what is repaired, reused, local, durable, low-water, low-waste or ethically sourced; do not use vague environmental claims.

### 5.2 Domain safety, compliance and operational rules

| Area | Product rule |
|---|---|
| Beauty and cosmetics | Distinguish cosmetics from therapeutic claims. Show batch/ingredient, shade, patch-test, hygiene and authorized-seller information. The supplied research notes that Kenya’s Pharmacy and Poisons Board regulates cosmetics for safety, quality and truthful labeling, with special cosmetics subject to scrutiny before market placement. |
| Tattoos, piercings and permanent makeup | Discovery must surface practitioner portfolio, consent, sterile single-use or properly sterilized workflow, aftercare access, healing plan and allergy/infection disclosures. Comply with applicable county/public-health requirements and use evidence-based infection-control guidance. Permanent services must never be ranked by aesthetics alone. |
| Homes and interiors | Prefer freestanding, reversible, low-drill work for rental/insecure tenure. Anchor tall units and consider built-ins only after structure, moisture, services and approvals are checked. Do not present decor advice as structural, fire, electrical or building-code advice. |
| Architecture, landscape and hospitality | Use the National Building Code 2024 and county approvals as a baseline for regulated work; verify current statutory text and engage registered local professionals. Design for orientation, solar exposure, rainfall, wind, altitude, coastal humidity, heat, dust, water and local maintenance capacity. |
| Vehicles | Preserve plates, lamps, mirrors, PSV markings and required visibility. Confirm current NTSA registration, inspection, PSV and safety requirements before graphics, tint or modifications. Detailing/personalisation is not mechanical repair, statutory inspection, insurance or roadworthiness. Use qualified technicians/authorized installers for safety-critical or high-skill work. |
| Food and beverage | Show price, portion, ingredients/allergens, storage/date, dietary information and honest health/sustainability claims. Protect food safety, water/handwashing, cold chain/power, waste and accessibility. Monitor Kenya’s evolving nutrient-profiling and warning-label direction rather than hard-coding an unverified rule. |
| Digital products and creators | Offer lightweight flows, compressed media, offline/low-bandwidth fallbacks and device testing. Support mobile-money-compatible payments, receipts and milestone billing where available. Show data, platform fees and renewals. Capture ownership, licensing, attribution, model/voice consent and AI provenance; follow applicable Kenya data-protection and cybersecurity obligations. |
| Pets, crafts and maker goods | Provide KES prices, mobile-money-compatible payment, pickup/courier options and realistic lead times. Test pet products for species-appropriate use, sizing, non-toxic finishes and choking/entanglement/sharp-part hazards. Record material origin, provenance, cultural permission and care for dust, heat, humidity and rain. |
| Events and gifting | Confirm traditions, colors, attire, foods, rituals, faith, alcohol, modesty, accessibility, guest count, weather, power, setup/strike, transport and reusable/rental preferences. Use client-authorized and accurately attributed cultural references. |

## 6. Data and governance requirements for implementation

### 6.1 Listing/service minimum fields

At minimum, every listing or brief should store:

- Canonical domain, category and subcategory IDs; aliases and free-text description.
- Optional style IDs and descriptive visual facets.
- Affordability band; KES price or quote status; inclusions and exclusions.
- Availability, service area, delivery/pickup, lead time, deposit and payment options.
- Materials/ingredients, dimensions/size/fit, condition, care and maintenance.
- Portfolio, reviews, samples or before/after evidence where relevant.
- Provenance, maker/practitioner identity, attribution and licensing/usage terms.
- Domain-specific safety, regulatory, permanence, accessibility and compatibility fields.
- Source references and a status flag for claims that require verification.

### 6.2 Taxonomy governance

- Maintain a versioned taxonomy file and an alias table. Never delete a used ID; deprecate it and map it to a replacement.
- Separate **controlled labels** from **free tags**. A style should enter the controlled list only after user testing and review of repeated search demand.
- Review culturally specific terms with knowledgeable contributors; require permission and attribution for community-owned or restricted references.
- Add human review for safety, legal, medical/therapeutic, food and cultural claims.
- Measure discovery quality with zero-result rate, reformulation rate, facet use, click-through by matched signal, conversion/booking, cancellation/return, aftercare issues and user-reported mismatch. These are product metrics to implement, not findings asserted by the supplied research.

## 7. Sources supplied with the research

The links below are reproduced from the input results and grouped by domain. They are the source list for this synthesis; the report does not claim that every page was independently re-verified during drafting.

### Personal style, fashion, beauty and body art

- [Shopify — Product category](https://help.shopify.com/en/manual/products/details/product-category)
- [Google Merchant Center — Product data/specification](https://support.google.com/merchants/answer/6324436?hl=en)
- [Scientific Reports article](https://www.nature.com/articles/s41598-024-80279-4)
- [Pharmacy and Poisons Board Kenya — registration/retention/variations](https://web.pharmacyboardkenya.org/registrationretentionvariations/)
- [Frontiers in Sustainability article](https://www.frontiersin.org/journals/sustainability/articles/10.3389/frsus.2025.1527365/full)
- [King’s College London report](https://kclpure.kcl.ac.uk/portal/files/344026719/Report_2025_final.pdf)
- [UNCTAD report](https://unctad.org/system/files/official-document/ditctsce2024d2_en.pdf)
- [UK government — tattooing and body piercing infection prevention](https://www.gov.uk/guidance/tattooing-and-body-piercing-infection-prevention-and-control)

### Interiors, furniture, decor and small-space living

- [House Beautiful — interior design styles](https://www.housebeautiful.com/design-inspiration/a41613197/types-of-interior-design-styles/)
- [IKEA — transformable multifunctional furniture](https://www.ikea.com/es/en/ideas/seven-transformable-multifunctional-furniture-solutions-for-small-spaces-pub254a6490/)
- [Interior Designers Society of Kenya — small spaces](https://idsk.or.ke/2025/11/10/big-impact-in-small-spaces-smart-interior-design-strategies-for-kenyan-homes/)
- [Buildings article — apartment study](https://www.mdpi.com/2075-5309/14/11/3526)
- [DOI for the apartment study](https://doi.org/10.3390/buildings14113526)
- [World Bank open knowledge report](https://openknowledge.worldbank.org/bitstreams/625a4e1c-18f6-46a7-ac70-184b038dacf6/download)

### Architecture, landscape, hospitality and spatial identity

- [TDP — architecture, hospitality and brand experience](https://www.tdp-arch.com/architecture-hospitality-brand-experience/)
- [Universal Design Ireland](https://universaldesign.ie/about-universal-design)
- [ASLA — universal design guide](https://www.asla.org/focus-areas/diversity,-equity,-inclusion/universal-design-guide)
- [ArchDaily — Kenya](https://www.archdaily.com/country/kenya)
- [National Building Code Kenya](https://www.nbck.co.ke/)
- [Kenya tourism strategy draft](https://www.tourism.go.ke/wp-content/uploads/2025/07/DRAFT-NATIONAL-TOURISM-STRATEGY-DRAFT-June-2025-2.pdf)
- [Stratford Journals — hospitality article](https://www.stratfordjournals.com/journals/index.php/Journal-of-Hospitality/article/download/1449/1884)

### Vehicles, detailing, transport and mobility culture

- [Meguiar’s automotive products](https://www.meguiars.com/products/automotive)
- [3M car personalization support](https://www.3m.com/3M/en_US/car-personalization-us/support/)
- [USITC — Kenya automotive sector briefing](https://www.usitc.gov/sites/default/files/publications/332/executive_briefings/ebot_kenya_automotive_sector.pdf)
- [National Transport and Safety Authority Kenya](https://ntsa.go.ke/)
- [World Bank urban transport material](https://documents1.worldbank.org/curated/en/099757201312239151/pdf/P15331109078a901e0af650dd2da651289e.pdf)

### Food, beverage, table culture and hospitality

- [Restaurant choice research](https://pmc.ncbi.nlm.nih.gov/articles/PMC7503372/)
- [National Restaurant Association — State of the Restaurant Industry 2025](https://go.restaurant.org/rs/078-ZLA-461/images/SOI-2025-Report.pdf?version=0)
- [ATNi — Kenya market assessment](https://accesstonutrition.org/index/kenya-market-assessment-eama/)
- [USDA FAS — tourism and U.S. products in Kenya](https://apps.fas.usda.gov/newgainapi/api/Report/DownloadReportByFileName?fileName=Tourism+to+create+opportunity+for+U.S.+products_Nairobi_Kenya_12-18-2018.pdf)

### Digital products, gaming, creative technology and creator aesthetics

- [Communications Authority of Kenya — mobile data and digital services](https://www.ca.go.ke/mobile-data-and-digital-services-rise-ca-report-shows)
- [Communications Authority of Kenya — smartphone and mobile money](https://www.ca.go.ke/increased-smartphone-adoption-and-mobile-money-drive-growth-telecoms-sector-report-shows)
- [Invest Kenya — creative economy](https://www.investkenya.go.ke/creative-economy/)
- [Africa Games Report — 2025 industry report](https://africagamesreport.com/wp-content/uploads/2024/12/2025-Africa-Games-Industry-Report-1.pdf)
- [Webflow — web design trends 2025](https://webflow.com/blog/web-design-trends-2025)
- [PMC article on design/technology and cultural resonance](https://pmc.ncbi.nlm.nih.gov/articles/PMC8359925/)
- [GDC — State of the Game Industry 2024](https://reg.gdconf.com/state-of-game-industry-2024)

### Pets, collectibles, objects, crafts and maker culture

- [UNESCO — Kenya’s creative economy](https://www.unesco.org/en/articles/kenyas-pioneering-steps-towards-thriving-creative-economy)
- [UNESCO — cultural heritage and women’s empowerment in Kenya](https://www.unesco.org/en/articles/art-all-bridging-policy-gaps-cultural-heritage-and-womens-empowerment-kenya)
- [UNESCO — traditional craftsmanship](https://ich.unesco.org/en/traditional-craftsmanship-00057)
- [Springer article on handmade/consumption](https://link.springer.com/article/10.1007/s11151-021-09844-9)
- [American Pet Products — industry trends and statistics](https://americanpetproducts.org/industry-trends-and-stats)
- [Invest Kenya — creative economy sector pack](https://www.investkenya.go.ke/wp-content/uploads/2026/03/202603_Invest-Kenya_Sector-pack_Creative-Economy_vPublish.pdf)

### Events, weddings, gifting and celebrations

- [Vogue — wedding trends 2026](https://www.vogue.com/article/wedding-trends-2026)
- [Reverie Social — 2026 event design trends](https://www.reveriesocial.com/articles/top-2026-wedding-event-design-trends-textures-color-palettes-and-tablescape-ideas/)
- [The Knot — Kenya wedding traditions](https://www.theknot.com/content/kenya-wedding-traditions)
- [UNDP — heritage enterprise and Africa’s creative economy](https://www.undp.org/africa/blog/heritage-enterprise-and-africas-creative-economy-five-young-african-women-creative-systems-turning-heritage-imagination-and-voice)
- [Deloitte — consumer behavior trends](https://www.deloitte.com/us/en/insights/industry/retail-distribution/consumer-behavior-trends-state-of-the-consumer-tracker.html)
- [PMC article on design/technology and cultural resonance](https://pmc.ncbi.nlm.nih.gov/articles/PMC8359925/)

## 8. Explicit caveats and limits

1. **This is a synthesis, not a new market study.** It organizes the supplied results into a product model; it does not add independently verified facts.
2. **The source set is heterogeneous.** It includes regulator and government pages, peer-reviewed research, industry reports, commercial guidance, media, and draft or trend material. Their methods, recency, authority and geographic relevance differ.
3. **URLs and claims were supplied in the input.** This report reproduces and operationalizes them; it does not establish that each URL is current, accessible, or applicable to every Kenyan county or every user segment.
4. **No numeric price thresholds were supplied.** The four affordability bands are scope labels. Product teams must research current KES prices, provider costs, payment behavior, delivery and import exposure before setting numbers.
5. **Kenya relevance is not a single national rule.** Climate, language, culture, infrastructure, regulation, supply and purchasing context vary by county, neighborhood and use case. Validate with users, makers, operators and professionals.
6. **Some research ladders had five bands.** They were collapsed into four for product simplicity; institutional, collector, architect-led, fleet and project-managed work should be represented as scope tags under Band 4, not treated as an extra consumer price tier.
7. **Style labels are not neutral facts.** They can be interpreted differently and may carry cultural or commercial assumptions. Use user-selected or user-authored labels, test comprehension, and avoid demographic inference.
8. **Regulatory and safety notes are not legal or clinical advice.** Verify current Kenya national and county requirements and refer regulated, structural, medical/therapeutic, food-safety, vehicle-safety and infection-control questions to qualified professionals.
9. **Product metrics in the governance section are recommendations.** They are not findings from the supplied evidence. Baseline them after launch.
10. **The taxonomy is a seed.** Its purpose is discoverability and extensibility, not to claim that the listed categories exhaust the domain or that every user will use the same vocabulary.
