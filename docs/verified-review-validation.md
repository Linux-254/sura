# SURA Verified-Review Validation

SURA does not create or display fabricated reviews. The review form appears only for an order whose persisted status is **delivered** and whose owner matches the current account; the server rechecks both conditions before inserting a pending review.

| Boundary | Validated behaviour |
| --- | --- |
| Order ownership | The database helper filters review submission by both the commerce-order ID and current user ID. |
| Delivery condition | The database helper requires `status = delivered`; all other statuses receive an eligibility explanation instead of a review form. |
| Publication | Submitted reviews begin as `pending`; no customer review is made public automatically. |
| Content contract | Rating is limited to 1–5 and an optional comment must be 12–1000 characters. |
| Empty order history | Desktop and mobile review confirms the honest no-orders state retains the connected-shop action and makes no claim that any review exists. |

The private order view was reviewed at **1280 × 900** and **390 × 844**. At present, the account has no actual orders, so the interface correctly shows no review form and no simulated customer feedback.

The final server regression suite exercises the concrete review-creation helper for missing orders, another account’s order, non-delivered status, a duplicate review, and a valid delivered order. Private order-card tests additionally verify that a persisted pending review replaces the form and that an awaiting-payment order exposes no submission action.

The browser-like private-order journey test selects a delivered-order rating, verifies the review mutation payload, and then re-renders the returned pending status to confirm the form is replaced. The current automated suite completes with **52 passing tests**.
