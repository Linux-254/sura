# SURA Commission Control Validation

The company-level commission rate is held server-side and used by the quote and order path; the buyer never submits a rate. Only the administrator procedure can update the rate, and its request contract accepts whole percentages from **20** through **50** inclusive.

| Control | Validation outcome |
| --- | --- |
| Non-admin access | Rejected before database access by the server-side admin guard. |
| Rate lower than 20% or higher than 50% | Rejected by the procedure input contract before mutation. |
| Seller settlement visibility | The administrator view explains that the seller receives the merchandise subtotal less the SURA commission; delivery is separate. |
| Empty records | The UI states that no company rate records exist rather than inventing company or order data. |
| Responsive review | The commission control was reviewed at 1280 × 900 and 390 × 844; the policy boundary and empty state remain readable and the admin navigation collapses cleanly on mobile. |

This is a **configuration and quote-allocation control**, not a payment-splitting system. Actual fund movement, settlement, and reconciliation remain dependent on a verified live payment-provider workflow.
