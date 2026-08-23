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
| **Repost to my direction** | Carry a verified business signal onto your own public Sura profile. |
| **Curate** | Like a signal to show interest and help it travel through the network. |
| **Following** | A personal stream built from followed people, verified studios, and signals liked by people you follow. |

## Main experiences

The home feed is built around a local pulse rather than a hero banner. It includes the current user context, tabs for personal, following, and nearby discovery, a Live Signal rail, mobile quick actions, company and creator posts, saved actions, and entry points into Create and AI Studio.

The product experience is image-led. A product can contain a dominant primary image and up to seven supporting images. Users can select thumbnails, move through the gallery, and see the product description, company context, stock, options, price, discount, saving, minimum spend, and delivery estimate. Product cards open a full detail view instead of forcing the user to infer important information from a small tile.

The company flow is designed as a publishing studio. A company owner uploads a gallery, writes a structured description, adds price and stock details, previews the public presentation, and publishes to a verified catalog. A company may create a product-specific offer or a shop-wide offer. Offers remain private until an administrator approves them. Customers see the original price, effective price, saving, offer code, and important conditions together.

Public profiles use a Sura Shelf instead of generic story or highlight terminology. The shelf presents four visual windows such as Point of View, Field Notes, Made Here, and Next Signal. The structure is reusable for people and companies and remains image-first on small screens.

Sura’s first social layer is deliberately focused. People can follow public people and verified companies, like company signals, and repost those signals to their own public profile with original attribution. The Following stream includes followed studios, followed people’s activity, and posts liked by followed people. Unique relationship constraints make repeated taps safe, while public visibility and server-side authentication checks protect private accounts and unverified company content.

The first release keeps business contact simple and accountable. People can contact a company through its published public route or the existing inquiry form. Sura does not launch open-ended direct messages yet because a message board would add moderation, abuse handling, unread states, notification delivery, and support work before the discovery loop has earned that complexity.

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

## AI Studio Showroom

AI Studio now includes a private SURA Showroom for shaping an aesthetic before asking for a full AI direction. A member can choose a lane for home, wardrobe, footwear, products, vehicles, detailing, tattoos, or pet accessories. Each lane exposes practical parts such as tops, bottoms, shoes, accessories, room anchors, layers, materials, car bodies, wheels, finishes, service types, placement, line, or pet pieces.

The Showroom uses a four-step visual rail—Front, Angle, Side, and Detail—with previous/next controls, direct view buttons, and a range slider. Generated concepts become the first view when available; bundled Sura editorial imagery keeps the stage visible while the first concept is being created or when managed media is unavailable. The current build can be sent back into the private AI brief instead of being lost as a visual experiment.

Wardrobe and footwear lanes include a height slider and a simple Petite, Balanced, or Broad reference. This is a visual proportion aid, not a sizing decision: the member must still confirm actual measurements with the maker. Vehicle and detailing lanes explain that final fit, parts, labour, service scope, and inspection determine the real quote. A future asset pipeline can replace the four-frame preview with approved multi-angle 3D or spin media without changing the user-facing Showroom contract.

## Revenue and engagement model

Sura is built to reduce the amount of work required to move from discovery to action. It gives businesses a visual publishing surface and gives people a way to carry the best local work into their own point of view, creating more organic reach without requiring a separate content system.

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
      PublicProfilePage.tsx          Public profile, follow controls, and repost shelf
server/
  auth-visuals.ts                    Secure admin visual upload helper
  post-media.ts                      Managed company-post image upload helper
  db.ts                              Feed, social graph, and profile persistence
  routers.ts                         Public, social, company, and admin contracts
drizzle/
  schema.ts                          Platform and social data tables
  0009_stiff_mole_man.sql            Auth visual set migration
  0010_fine_boomer.sql               Social network migration
docs/
  product-publishing.md              Product gallery, offer, and visibility workflow
  sura-social-model.md               Social, contact, and aesthetic model
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

Apply the database migrations in the environment that contains the real `DATABASE_URL`. The social rollout adds `drizzle/0010_fine_boomer.sql` after the auth visual migration. A placeholder database URL can be used to generate migration files locally, but migrations should only be applied against the intended environment.

## Operational notes

Sura’s sign-in flow depends on the configured OAuth environment. The deployed environment must provide the OAuth portal URL, application ID, OAuth server URL, and JWT secret. The required session cookie remains HTTP-only, uses a secure cross-site policy on HTTPS, and uses a compatible local-development policy on HTTP.

The build may report warnings for unset analytics placeholders and large JavaScript chunks when those values are intentionally absent in local development. These warnings do not replace the required type check, test suite, or production build verification.

## Product principle

> Sura should make the next useful action feel obvious.

Every screen should answer three questions quickly: **What am I looking at? Why is it relevant to me? What can I do next?**
