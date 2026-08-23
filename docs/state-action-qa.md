# SURA State and Action QA

## Scope and outcome

The current deployed SURA experience was reviewed at desktop (`1280 × 720`) and mobile (`390 × 844`) viewport sizes. The review covered the public home page, the secure `/join` email-entry page, and the connected-shop empty state at `/shop`. The visual hierarchy remained legible at both breakpoints: the primary navigation compacted appropriately on mobile, account-access controls stayed visible, and the connected-shop empty treatment preserved an actionable next step.

| Route and state | Desktop observation | Mobile observation | Action retained |
| --- | --- | --- | --- |
| `/` public landing and navigation | Editorial navigation, county selector, and primary build action remain distinct above the hero. | Compact county control, start action, and menu remain reachable without crowding the SURA mark. | **Build my edit / Start** remains visible. |
| `/join` signed-out email entry | Email sign-in, account creation, recovery, and legal links remain clearly grouped in the account panel. | The account benefits and email panel stack in a readable order with large inputs and controls. | **Sign in securely**, **Create account**, and **Recover** remain visible. |
| `/shop` no-connected-inventory state | The empty message is visually separated from filters and the next action is centered. | The empty message and next action retain adequate touch size and spacing. | **Create an AI direction** remains visible. |

## Regression evidence

Route-level browser-like tests additionally cover recovery and primary-action availability for account, admin, company catalog/detail, connected shop, and AI Studio. AI Studio and company delivery controls have explicit pending-state assertions, ensuring the busy action remains visible and safely disabled while the request is processing.

## Outstanding live-only validation

The authenticated live email callback check remains pending because Supabase has rate-limited email delivery. No account password, recovery token, or payment credential is retained for this validation.
