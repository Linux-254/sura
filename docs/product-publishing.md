# Sura Product Publishing and Promotion Flow

## Product presentation

A public product card should lead with the strongest product image, show a compact strip of alternate images, include the product name and category, and expose a concise description before the user opens the full detail page. The full page uses a two-column editorial-commerce layout: a large primary image with selectable thumbnails and automatic slide progression on the left; product name, company, description, options, stock state, price, discount treatment, company identity, and delivery/order estimate on the right.

The first uploaded image is the hero image. Additional images can show alternate angles, material details, colourways, fit references, packaging, or scale. Sura accepts up to eight JPEG, PNG, or WebP images per product and stores them through managed object storage rather than the browser or the public source tree.

## Company workflow

A company owner opens the Product Publishing Studio from the secure company space. The owner enters the product name, category, customer-facing description, whole-KES price, stock quantity, options or sizes, and up to eight images. The studio shows a live customer preview before submission. The first image is marked as the hero, and the owner receives a publishing checklist that encourages honest material, fit, care, stock, and fulfilment information.

The browser sends selected images as bounded data URLs to the protected company procedure. The server first verifies ownership of the company, validates the image format and size, uploads each image to managed storage under a company-scoped key, and persists the returned storage paths together with the product record. Existing `imageUrl` values remain supported as a compatibility fallback, while new records store an ordered `imageUrls` JSON array.

Products are visible to customers only when the item is active and its parent company is verified. This preserves the existing safety boundary: a company can prepare a catalog entry before public visibility, while Sura remains the final gate for verified commerce discovery.

## Admin workflow

An administrator verifies the company before its active products can enter connected shops. Administrators review company discount offers in the existing engagement console. The review queue shows the promotion code, value, target scope, and pending state. The administrator can approve or reject the offer. Approval sets the offer public; rejection keeps it out of public results.

A future hardening pass can add a dedicated product moderation queue if Sura wants item-level review independent of company verification. The current implementation keeps the MVP rule simple: owner-managed product publishing plus admin-controlled company verification and discount approval.

## Discount workflow

A company owner can create either a whole-shop offer or a product-specific offer. Product-specific offers reference a product owned by the same company; the server rejects cross-company product references. Offers begin as `pending` and `isPublic=false`. An offer becomes eligible for display only when it is approved, public, inside its validity window, and the product price satisfies its minimum spend requirement.

On the public product card and detail page, the best eligible discount is selected. The interface shows the original price with a strikethrough, the effective member price, savings amount, discount title, code, and minimum-spend note when applicable. The public offers page labels the promotion as either `Product offer` or `Shop-wide` and links product-specific offers directly to the matching detail page.

Delivery quotes and order requests use the same effective sale price exposed to the user, so the visible promotion and the pricing breakdown do not diverge. Commission and seller-settlement calculations continue to use the existing transparent pricing breakdown.

## Public user experience

Customers discover items through the connected shop grid. Cards support a primary image and thumbnail slideshow, a visible description, verified-company context, stock state, regular or sale price, and a direct `View product` path. The detail page provides the full gallery, richer description, options, stock, company link, discount terms, and an expandable delivery/order estimate. Users can request an order only after the usual secure sign-in flow.

## Current API and data changes

| Area | Implementation |
|---|---|
| Product media | `company_products.imageUrls` stores the ordered gallery; `imageUrl` remains the hero compatibility field. |
| Product uploads | `companies.createProduct` validates and uploads up to eight image data URLs through managed storage. |
| Public detail | `commerce.product` returns verified active product data, normalized gallery URLs, company context, live discounts, and effective sale price. |
| Public catalog | `commerce.products` returns the same gallery and discount metadata for cards. |
| Promotion scope | `discount_offers.productId` is nullable: null means whole shop; a value targets one company product. |
| Promotion visibility | Only approved, public, currently valid offers are exposed publicly. |
| Company controls | Owners can select whole-shop or product-specific scope when submitting a discount. |
| Admin controls | Existing admin review queue approves or rejects offers and shows their target scope. |

## Recommended production hardening

Before enabling high-volume production catalog uploads, add server-side image malware scanning, EXIF stripping, dimension and aspect-ratio normalization, responsive thumbnail generation, and edit/archive operations. Before collecting live payments, persist the applied offer ID and discount amount on the order so historical orders remain immutable if an offer later expires or changes. A future promotion engine can also add redemption limits, per-user usage limits, stacking rules, and explicit checkout validation.
