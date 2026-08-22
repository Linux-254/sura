# VibeBuild Kenya — Implementation Plan

## Delivery sequence

The first implementation pass establishes the domain model and a compact, realistic demonstration dataset. It then exposes typed queries for matching, discovery, profiles, and public build sharing. The second pass builds the public experience around the editorial landing page, short brief, recommendation result, directory, and vendor detail route. The third pass adds authenticated planning actions and inquiry capture, followed by automated validation and responsive visual review.

| Milestone | Completion signal |
| --- | --- |
| Domain foundation | Schema and migrations exist for vendors, builds, selections, saved items, shares, and inquiries. |
| Public utility | A visitor can complete a brief, see why the plan fits, browse vendors, and inspect a full profile. |
| Personal planning | An authenticated user can save vendors and selections to a build board and create a public build link. |
| Contact capture | An inquiry stores its origin, contact details, selected vendor/build context, and confirmation state. |
| Quality gate | Tests pass, no TypeScript errors remain, and the major desktop/mobile routes are visually verified. |

The MVP will use clearly labelled local demonstration information. Before public launch, vendor details, imagery permissions, pricing ranges, availability, and contact channels must be verified with each vendor. Automated outbound SMS or email notification is deliberately deferred until contact permissions and delivery credentials are configured.

