# SURA AI-Commerce Design

## Product intent

SURA’s commerce layer helps a member move from an aesthetic goal to a local, purchasable direction. A member may start with a **home refresh**, **personal outfit**, **footwear**, or **occasion** brief. They can upload or capture an image only after an explicit purpose-specific consent, add their city and practical fit details, and receive a structured plan with inspiration, product options, an indicative delivery estimate, and a transparent commission split.

The first release is an **assistive planning and marketplace workflow**, not a claim that SURA can guarantee fit, exact stock availability, interior-design outcomes, or delivery times. Company listings remain the source of truth for product details, availability, and fulfilment.

## AI assistance

The server-side assistant should return structured, reviewable content rather than an opaque shopping answer. It may identify visible design attributes such as palette, material impression, silhouette, space function, and stated goal. It must not infer sensitive traits, diagnose a body or health condition, identify a person, or make suitability claims from appearance.

| Brief type | Member input | Structured SURA output |
|---|---|---|
| Home refresh | Room photo, room purpose, budget, aesthetic | Design notes, a shoppable local edit, ranges, an optional generated after-concept |
| Personal style | Optional private photo, height, usual sizes, occasion, budget, aesthetic | Outfit direction, clothing and shoe fit filters, inspiration references, local options |
| Footwear | Usual shoe size, occasion, desired comfort/formality | Shoe category, size-aware option filters, pairing direction |
| Inspiration only | Aesthetic, goal, budget | Image references and a non-purchasing mood direction |

An uploaded image is private by default. The member can revoke the request from their account, which removes the active database reference. Generated images are labelled **AI concept** and are not presented as a guaranteed final result.

## Consent and browser permissions

Camera access is requested only when the member chooses **Take a photo**. Location access is requested only when they choose **Use my location**, and an editable city fallback remains available. Files are selected through the browser’s native picker. SURA stores only the member’s uploaded image reference, stated consent purpose, and request metadata needed to run the assistance flow.

## Pricing, delivery, and commission

Each purchasable recommendation shows the following lines before checkout:

| Line | Calculation | Recipient |
|---|---|---|
| Merchandise subtotal | Seller’s listed product price | Split between seller and SURA |
| SURA commission | `round(subtotal × rate / 100)` where rate is 20–50% | SURA platform |
| Seller settlement | `subtotal − SURA commission` | Verified company seller |
| Delivery estimate | Quote tied to city, distance band, and item category | Delivery partner / fulfilment provider |
| Member total | `merchandise subtotal + delivery estimate` | Collected only through the configured gateway |

The platform never takes an M-Pesa PIN. A real payment request requires a configured gateway, merchant shortcode, STK Push passkey, server-side callback verification, order reconciliation, and seller settlement process. The currently supplied M-Pesa application is treated as sandbox-only until those requirements are present.

## Reviews and trust

Reviews are permitted only after a completed paid and delivered purchase. SURA will not create, prefill, seed, or otherwise simulate customer ratings, reviews, or testimonials. A verified review contains a rating, optional text, purchase reference, and moderation status. Companies may respond, but cannot alter the member’s review.
