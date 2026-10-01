# SURA Brand Specification

## Design read

SURA is an **affordability-aware visual network** for Nairobi-first discovery: people, businesses, objects, spaces, style, food, mobility, pets, events, and the details that make a life feel coherent. The product surface is an editorial tool with a commerce spine, not a generic marketplace.

SURA is being built as a **company and category**, not only a platform. The long-term ambition is an Africa-first visual network: identity, discovery, media, community, trust and commerce infrastructure for the people and businesses shaping how Africa feels. Nairobi is the wedge; Africa is the network. See `docs/company-thesis.md` for the product and company expansion thesis.

The v2 direction is a warm-dark **signal room**: charcoal ink, acid lime, mineral paper, clay and soft blue accents; geometric display type paired with a calm humanist sans; sharp editorial cards softened by large image crops; motion that feels like a camera finding a detail rather than a dashboard animating itself. The landing now uses an original East African geometric rhythm — diamonds, grid lines and signal dots — as a system, not as a pasted stock textile. The primary mark now makes the company promise explicit: a recognizable African continent silhouette carrying a bold lime pattern print; the same print is repeated between the icon and SURA and clipped into the wordmark.

| Dial | Decision |
| --- | --- |
| Visual variance | 8/10 — expressive enough to speak aesthetics, consistent enough to scale across niches |
| Motion intensity | 6/10 — logo/hero reveals and restrained hover choreography; reduced-motion fallback everywhere |
| Information density | 6/10 — compact discovery cards, progressive disclosure for onboarding and checkout |
| Asset dependence | 8/10 — real SURA marks and local visual assets lead the experience |
| Brand fidelity | 9/10 — use the Africa-network symbol and SURA lime/charcoal/clay system consistently |

## Asset map

- Primary wordmark: `client/public/sura-wordmark.svg`
- Primary app mark: `client/public/sura-logo-africa-rhythm.png` — the supplied Africa silhouette with diagonal lime print and diamond accents
- Primary favicon: `client/public/sura-favicon-africa-rhythm.png` — compact paper tile using the same Africa pattern
- Previous signal SVG retained for rollback: `client/public/sura-mark-signal.svg`
- Geometric pattern tile: `client/public/sura-pattern-grid.svg`
- Legacy neon mark retained for rollback: `client/public/sura-mark-neon.svg`
- Monochrome mark: `client/public/sura-mark.svg`
- Hero visual: `client/public/assets/sura-auth-hero.jpg`
- Interior visual: `client/public/assets/sura-auth-interior.jpg`
- Street visual: `client/public/assets/sura-auth-street.jpg`

## Tokens

- Ink: `#11130f`
- Deep field: `#181b15`
- Lime: `#caff32`
- Paper: `#f3f0e7`
- Soft paper: `#e7e4d9`
- Mineral: `#b8d9e1`
- Clay: `#e79b76`
- Muted ink: `#7d8274`
- Display: Space Grotesk
- Body: Manrope
- Meta: DM Mono
- Spacing: 4px base, 8px rhythm
- Radius: 2px editorial cards, 999px status pills
- Motion: cubic-bezier(.22, 1, .36, 1), 160ms interaction, 700ms hero; ScrollTrigger horizontal field rail; sticky stacking gallery; CSS marquee; low-power native swipe and reduced-motion fallback

## Copy system

Use verbs such as **see, shape, source, carry, make, meet, move**. Never describe a lower budget as a compromise. Say **everyday edit**, **considered edit**, **signature edit**, and **commissioned edit**. The user is building a point of view, not shopping for a personality.
