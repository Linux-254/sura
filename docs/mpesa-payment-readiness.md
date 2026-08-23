# SURA M-Pesa Payment Readiness Contract

## Scope

This document defines the contract SURA will use **before** enabling any M-Pesa collection. It does not activate an M-Pesa gateway, submit an STK Push request, or collect a customer PIN. Safaricom describes M-Pesa Express as an asynchronous, merchant-initiated customer-to-business payment flow: the provider sends the PIN prompt to the customer’s registered phone and then returns the eventual outcome to the merchant callback URL.[1]

> **Safety boundary:** SURA must never ask for, transmit, store, log, or display a customer’s M-Pesa PIN, card data, or a provider secret. The customer enters a PIN only in the provider-controlled M-Pesa prompt.

## Proposed order-payment lifecycle

| SURA state | Created by | Required evidence | Customer-facing rule |
| --- | --- | --- | --- |
| `created` | SURA order service | Fixed order ID, KES amount, seller, delivery estimate, and commission snapshot | No funds requested. |
| `prompt_requested` | Server-only payment adapter | Idempotency key and provider submission acknowledgment | Explain that the provider prompt is being sent; never collect a PIN in SURA. |
| `pending_callback` | Server-only payment adapter | Provider `MerchantRequestID` and `CheckoutRequestID` | Do not mark paid from the initial acknowledgment alone. |
| `paid` | Verified callback + reconciliation | `ResultCode = 0`, matching request IDs, expected amount, and receipt record | Show a receipt reference with appropriate redaction. |
| `cancelled` | Verified callback | Non-success callback representing cancellation | Offer retry only after a short pause; preserve the order. |
| `failed` | Verified callback or terminal provider error | Result code/description retained server-side | Keep the order unpaid; display a non-sensitive recovery message. |
| `discrepancy` | Reconciliation job or operator review | Amount, request ID, or receipt mismatch | Freeze fulfilment and require staff review; never retry automatically. |

Safaricom’s initial M-Pesa Express response acknowledges request acceptance and returns `MerchantRequestID` and `CheckoutRequestID`; it does **not** establish successful payment.[1] SURA therefore records those identifiers server-side and waits for the callback before changing an order to `paid`.

## Server-only initiation contract

The protected SURA initiation endpoint must receive only a signed-in account, an owned unpaid order, and a normalized M-Pesa phone number. It must calculate the final KES amount from the persisted order snapshot—not from a browser-supplied price—and create one idempotent payment attempt. The adapter sends the provider request from the server, saves the resulting request identifiers, and returns only a safe attempt status to the browser.

The adapter must send a stable, low-information account reference based on SURA’s payment attempt ID, within the provider’s stated field limit. Safaricom documents `AccountReference` as an alphanumeric identifier displayed in the M-Pesa prompt, with a maximum of 12 characters.[1] SURA must not place a customer name, email address, address, or full order content in that field.

## Callback, reconciliation, and failure contract

The provider callback endpoint is public but must be isolated from customer-facing routes. It must accept the expected payload shape, associate the callback with an existing pending attempt by `CheckoutRequestID` and `MerchantRequestID`, store the raw event only in protected audit storage, and process it idempotently. It must not trust any browser notification as payment proof.

For a reported success, SURA validates that the callback result is successful, the request identifiers match the pending attempt, the amount matches the immutable order snapshot, and a provider receipt reference is present before transitioning to `paid`. Safaricom’s callback structure includes a result code, result description, and—on successful requests—metadata such as amount, M-Pesa receipt number, transaction date, and phone number.[1] A mismatch produces `discrepancy`, blocks fulfilment, and alerts an authorized administrator.

Non-success callbacks preserve the original order and payment attempt. SURA shows a concise non-sensitive message such as “The payment was not completed; no order has been marked paid,” rather than exposing provider payload details. Retry attempts receive a new idempotency key only after the prior attempt reaches a terminal state or is expressly expired by the server.

## Required credentials and deployment prerequisites

| Requirement | Storage and handling rule | Readiness status |
| --- | --- | --- |
| Daraja consumer key and consumer secret | Server secret manager only; never bundle to client code or commit. | Required before sandbox adapter work. |
| Business shortcode and transaction type | Server configuration; validate against approved merchant onboarding data. | Required before sandbox and production. |
| M-Pesa passkey | Server secret manager only; never log or expose. | Required before request signing/encryption. |
| Public HTTPS callback URL | Fixed server route, reachable by provider; restrict routing and audit access. | Required before callback testing. |
| Sandbox app and simulator test data | Use only approved sandbox credentials and test values. | Required for non-live integration tests. |
| Production merchant onboarding | Live PayBill/Till, business operator approval, and production credentials. | Required before live collection. |
| Reconciliation owner and operational runbook | Named responsible business/admin role; discrepancy process and fulfilment hold. | Required before go-live. |

Safaricom’s current Daraja documentation states that a sandbox app provides a consumer key and secret, and that sandbox test data includes the passkey; production requires a live PayBill or Till and appropriate business operator onboarding.[1] The same documentation confirms that the API is asynchronous and provides separate sandbox and production authorization endpoints.[1]

## Explicit non-goals until provider setup is complete

SURA will not add a live payment button, expose provider credentials, collect M-Pesa PINs, collect card information, mark orders paid based on the initial API acknowledgment, or release fulfilment based on an unverified browser claim. Implementing the protected initiation endpoint, callback route, database attempt records, and reconciliation worker remains blocked until the provider credentials, merchant ownership, callback hosting details, and approved sandbox test plan are available.

## Reference

[1]: https://developer.safaricom.co.ke/apis/MpesaExpressSimulate "Safaricom Daraja — M-Pesa Express Simulate"
