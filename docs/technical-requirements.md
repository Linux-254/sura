# VibeBuild Kenya — Technical Requirements

## Application architecture

The application uses the existing React, Node.js, Express, tRPC, Drizzle, and managed MySQL foundation. tRPC is the only client-to-server data boundary. Public queries serve landing content, vendor discovery, profiles, and build recommendations. Auth-protected mutations save planning selections, manage personal build boards, create public-sharing tokens, and submit inquiries.

| Layer | Responsibility |
| --- | --- |
| Client | Public routes, guided brief, searchable directory, vendor details, build board, share view, responsive states. |
| tRPC API | Input validation, matching orchestration, filterable data access, save/inquiry mutations, authorization. |
| Database | Normalized vendors, services, example portfolio images, curated build templates, saved selections, inquiries, and public build shares. |
| Auth | Existing Manus OAuth for gated saving and build-board ownership. Public matching and vendor browsing remain accessible without sign-in. |

## Data model

The model extends the template user table with vendors, vendor services, curated build templates, build line items, saved vendors, saved build selections, public shares, and inquiries. Vendor pricing is stored as **indicative lower and upper ranges** so the interface stays transparent about estimates. Demonstration vendors carry an explicit `isDemo` marker and a visible label in the experience.

The matching endpoint is intentionally deterministic. It scores curated build templates by compatible city, lifestyle, aesthetic, and spend-fit, then returns the closest plan with an itemized estimate and recommended vendors. No AI, scraping, claims of live inventory, or background workers are introduced for the MVP.

## Security and quality

Mutating endpoints require authenticated users unless the action is a low-friction public inquiry. Public inquiries are validated and rate-limited at the API boundary in a future hardening pass; the MVP validates field shape, normalizes text, and records the source context. Private boards are scoped to the authenticated user. Public shares expose only a non-guessable token and selected public build information.

Client interactions must surface loading, empty, recoverable error, and success states. Server coverage must include matching selection, vendor filtering, saving a vendor/build selection, and inquiry validation. The primary layout will be verified at mobile and desktop breakpoints.
