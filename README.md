# Sura — Local Network

Sura is an installable visual platform for local ideas, people, companies, products, and plans. It is not a traditional marketing website. People open Sura to discover something, save it, shape a direction, ask for help, or move toward a purchase.

> **Sura in one sentence:** See something worth keeping, give it a direction, and make the next step clear.

## Why Sura exists

People often have an idea but not a clear way to act on it. Local companies often have good work but no simple place to show it, explain it, and receive serious interest. Sura connects both sides through image-led discovery, structured briefs, private boards, AI-assisted planning, verified company profiles, and clear product offers.

The product is designed to create value quickly. A new user should understand the platform by seeing the feed, a fresh visual signal, a product or company, and one clear next action. A company should be able to publish a strong visual catalog, explain each product, run an approved offer, and receive a qualified quote or order request without building a separate website.

## The Sura product language

Sura uses its own vocabulary so the platform does not feel like a copy of another social network.

| Sura term | What it means |
|---|---|
| **Live Signal** | A horizontal stream of fresh visual discoveries on the home feed. |
| **Sura Shelf** | A compact image-led collection on a public profile. |
| **Local Edit** | A person’s or company’s visual direction, plan, or point of view. |
| **Field Note** | A short visual post about a place, product, person, or idea. |
| **Make a Signal** | The mobile-first action for creating a brief or starting an AI-assisted direction. |
| **Company Studio** | A verified company workspace for publishing products, offers, contacts, and public information. |

## Main experiences

The home feed is built around a local pulse rather than a hero banner. It includes the current user context, tabs for personal, following, and nearby discovery, a Live Signal rail, mobile quick actions, company and creator posts, saved actions, and entry points into Create and AI Studio.

The product experience is image-led. A product can contain a dominant primary image and up to seven supporting images. Users can select thumbnails, move through the gallery, and see the product description, company context, stock, options, price, discount, saving, minimum spend, and delivery estimate. Product cards open a full detail view instead of forcing the user to infer important information from a small tile.

The company flow is designed as a publishing studio. A company owner uploads a gallery, writes a structured description, adds price and stock details, previews the public presentation, and publishes to a verified catalog. A company may create a product-specific offer or a shop-wide offer. Offers remain private until an administrator approves them. Customers see the original price, effective price, saving, offer code, and important conditions together.

Public profiles use a Sura Shelf instead of generic story or highlight terminology. The shelf presents four visual windows such as Point of View, Field Notes, Made Here, and Next Signal. The structure is reusable for people and companies and remains image-first on small screens.

## Mobile-first platform behavior

Mobile is treated as a primary Sura experience, not a reduced desktop version. The mobile header opens a full navigation panel, the bottom navigation stays close to the thumb, the Live Signal rail scrolls horizontally, and the feed adds quick actions for Make a Signal, AI Lens, and Saved Shelf. Mobile users receive more immediate creation and discovery affordances than desktop users.

Desktop users receive a minimizable navigation rail. The rail can collapse to an icon-only mode to create more room for visual content while preserving Home, Explore, Create, Saved Board, and AI Studio access. The expanded or collapsed state is controlled in the current session; optional persistence can be added through the consent-aware preference utility.

## Themes, consent, and session security

Sura supports three interface modes: **Light**, **Dark**, and **System**. System mode follows the device’s live `prefers-color-scheme` setting. The existing Sura aesthetic directions remain separate from the interface tone, so a person can choose both a visual direction and a light/dark/system mode.

Sura distinguishes required authentication cookies from optional preference cookies.

| Cookie category | Purpose | Consent behavior |
|---|---|---|
| Required session cookie | Keeps a signed-in user authenticated. | Used when authentication requires it. It is not blocked by optional preference consent. |
| Consent cookie | Remembers whether the person accepted or declined optional preference storage. | Written when the person makes a choice. |
| Optional theme cookie | Remembers Light, Dark, or System mode. | Written only after acceptance. |
| Optional aesthetic cookie | Remembers the selected Sura visual direction and preference mix. | Written only after acceptance. |
| Optional sidebar cookie | Remembers supported sidebar layout state. | Written only after acceptance. |

The consent banner explains this difference in plain language. Accepting optional preferences enables theme, aesthetic, and layout persistence. Declining optional preferences removes those optional values and keeps the experience usable for the current session without writing them again.

## Installable app behavior

Sura includes a web app manifest, a recognizable Sura monogram, mobile web-app metadata, a favicon, an Apple touch icon, a conservative service worker, and an install prompt when the browser supports installation. API and session requests are not cached by the service worker. Static assets can be reused for a faster standalone experience.

The primary brand assets are:

- `client/public/sura-mark.svg` — the Sura monogram used for the favicon, installed app icon, shell, and account surfaces.
- `client/public/manifest.webmanifest` — standalone web-app metadata.
- `client/public/sw.js` — static shell and asset caching without API caching.
- `client/public/assets/sura-auth-hero.jpg` — fallback sign-in visual.
- `client/public/assets/sura-auth-street.jpg` — fallback sign-in visual.
- `client/public/assets/sura-auth-interior.jpg` — fallback sign-in visual.

## Admin-managed sign-in visuals

Administrators can update the first impression without changing source code. Open **Admin → Engagement**, use **SURA / ENTRY VISUALS**, name the visual set, choose one to eight JPEG, PNG, or WebP images, review the thumbnails, and publish.

The first uploaded image becomes the lead image. The remaining images build the supporting collage and compact sign-in panel strip. Only one visual set is active at a time. If no active set exists, Sura uses the bundled fallback visuals. The API validates image type, size, and count before storing files in managed object storage.

The admin visual flow is intentionally separate from the user’s personal edits. Sign-in visuals are public brand content; personal edit images remain private and require their own consent and access rules.

## Revenue and engagement model

Sura is built to reduce the amount of work required to move from discovery to action.

| Revenue or growth path | How Sura creates the opportunity |
|---|---|
| Company product commissions | A verified company publishes products, Sura shows the product and offer clearly, and a quote or order request can carry the effective sale price. Existing commerce records include commission and settlement fields. |
| Qualified company inquiries | A person turns an idea into a brief and a company receives a more useful request than a generic social message. |
| Approved promotions | Product-specific and shop-wide offers make conversion easier while keeping conditions visible and moderator-controlled. |
| Company publishing services | Companies can use the studio as a lower-effort visual catalog instead of building and maintaining a separate storefront. |
| Membership expansion | Sura Free keeps discovery and planning open; a future paid tier can package stronger AI, company tools, analytics, or priority workflows. |
| Partner integrations | Delivery, payment, creator, venue, and local commerce partners can plug into clear moments in the user journey rather than buying an empty banner placement. |

The current product avoids pretending that all payments are live. Live M-Pesa payment collection remains disabled until provider credentials and the production payment workflow are configured. Sura never asks users to enter an M-Pesa PIN inside the product.

## Project structure

```text
client/
  index.html                         Install metadata and service-worker registration
  public/
    assets/                          Bundled editorial fallback images
    manifest.webmanifest             PWA manifest
    sura-mark.svg                    Sura brand mark
    sw.js                            Conservative service worker
  src/
    components/
      VibeLayout.tsx                 Platform shell and minimizable rail
      SuraSignalRail.tsx             Live Signal visual rail
      SuraShelf.tsx                  Public profile mini-showcase
      CookieConsentBanner.tsx        Optional preference consent
      InstallSuraPrompt.tsx           Browser installation affordance
      SuraStates.tsx                 Stable platform loading and empty states
    contexts/
      ThemeContext.tsx               Light, dark, and system mode
      AestheticThemeContext.tsx      Sura visual directions and palette tokens
    pages/
      AuthPage.tsx                   Image-led sign-in experience
      Home.tsx                       Mobile-first feed surface
      EngagementPages.tsx            Admin engagement and visual publishing
      PublicProfilePage.tsx          Public profile and Sura Shelf
server/
  auth-visuals.ts                    Secure admin visual upload helper
  db.ts                              Visual set persistence and public retrieval
  routers.ts                         Public query and admin mutation contracts
drizzle/
  schema.ts                          Auth visual set table
  0009_stiff_mole_man.sql            Auth visual set migration
docs/
  product-publishing.md              Product gallery, offer, and visibility workflow
```

## Local development

```bash
pnpm install --frozen-lockfile
pnpm dev
```

Run the validation suite before opening a pull request:

```bash
pnpm check
pnpm test
pnpm build
```

Apply the database migrations in the environment that contains the real `DATABASE_URL`. The new auth visual migration is `drizzle/0009_stiff_mole_man.sql`. A placeholder database URL can be used to generate migration files locally, but migrations should only be applied against the intended environment.

## Operational notes

Sura’s sign-in flow depends on the configured OAuth environment. The deployed environment must provide the OAuth portal URL, application ID, OAuth server URL, and JWT secret. The required session cookie remains HTTP-only, uses a secure cross-site policy on HTTPS, and uses a compatible local-development policy on HTTP.

The build may report warnings for unset analytics placeholders and large JavaScript chunks when those values are intentionally absent in local development. These warnings do not replace the required type check, test suite, or production build verification.

## Product principle

> Sura should make the next useful action feel obvious.

Every screen should answer three questions quickly: **What am I looking at? Why is it relevant to me? What can I do next?**
