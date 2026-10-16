# Snap-to-Pay → Ubot: integration requirements

## Demo and boundaries

The standalone `/ubot` page is reached through the single **UBot** button to the left of Dashboard. It renders only a message log and composer, with the receipt/QR, bill summary, voice waveform and two wallet profiles contained inside left/right chat bubbles. Confirmation creates local pending demo requests. Typed replies and microphone interactions are scripted; microphone capture and backend/LLM calls are not used. The voice preview optionally uses browser speech synthesis, with a visual waveform fallback. No integration capabilities are added by this additional presentation of the mock.

Open **Scan → Scan** or `/dashboard/scan`. The main navigation is Dashboard / Scan / Wallets / Pay / Card / Profile. Scan has local Scan / Receive / Swap / Send tabs; Receive embeds the existing deposit interface, and Swap and Send reuse existing controls inside the Scan page. Dashboard shortcuts point to these tabs. The previous `/dashboard/pay/snap-to-pay` URL remains an alias. Scan the sample QR, review the ฿1,200 dinner, confirm the simulated payment, then open Ubot. Tap the microphone to simulate “Split this bill with Daniel and Lora.” Ubot matches two fictional wallets and previews three equal ฿400 shares. After confirmation, it shows two ฿400 repayment requests to your wallet, each awaiting payment.

The new route runs entirely in the browser. It does not use the existing U-Ready APIs, request camera/microphone permission, call an LLM, send notifications, move funds, or write to the payment ledger. Refreshing or leaving the route resets it. Existing U-Ready payment functionality from `origin/main` remains independently accessible through **Scan Thai QR**.

The QR encodes a demo marker, not a PromptPay payload. The merchant, bill, U-Tags and `DEMO-*` wallet identifiers are fictional. “Wallet matched” means a match in the local fixture. “Requests created” means local UI state, not delivery or settlement. Pending requests never become “paid” in this demo.

## What REA actually established

The [retained investigation](rea/ubot/README.md) successfully analyzed the public Ubot frontend. Its captured application code contains recording/transcription, chat, history and speech synthesis paths. The public page exposes the logo/orb and “Ask it. Snap it. Build it.” branding. The signed-in assistant UI and server behavior were not observed.

Existing frontend references are useful starting points, not proof of working integrations. A future implementation should reuse or extend those paths where possible. Wallet tools and durable identity memory below are requirements to verify with Ubot's maintainers, not claims that its backend lacks them.

## Capabilities to add, connect or verify

| Capability | Required behavior | Existing evidence and remaining work |
| --- | --- | --- |
| Receipt context handoff | Pass a verified paid receipt, amount, currency, payer wallet and transaction reference into the assistant session. Keep the original receipt available throughout the conversation. | New integration. A chat transcript alone is not authoritative payment context. |
| Agent harness | Coordinate receipt retrieval → intent extraction → contact resolution → split calculation → approval → request creation → status tracking. Pause for missing identities or user decisions. | Existing `/api/chat` source reference; tool orchestration and its contract remain unverified. |
| Voice input/output | Transcribe the request, expose the transcript for correction, optionally speak the preview, and provide a text fallback. | Recording, `/api/transcribe`, and `speechSynthesis` appear in captured code. Verify their signed-in behavior before extending them. Voice is scripted in this mockup. |
| Wallet sharing plugin | Resolve people to permissioned wallet identities and create repayment requests addressed to those people, with repayments directed to the payer wallet. | Proposed plugin contract below; production transport, wallet authorization and payment rails need integration. |
| Contact and wallet memory | Remember approved name/alias → wallet mappings with owner, provenance, currency/network compatibility, consent and last verification. Let the user edit or forget a mapping. | Chat history appears in the bundle. History does not establish a durable, verified contact-to-wallet memory system. |
| Structured split calculator | Calculate in integer minor units; include the payer; show each share and ensure the shares sum to the original bill. | Implemented locally for the mock. A production harness should use deterministic tool output for amounts. |
| Approval interface | Show identities, wallet destinations, currency, amounts and fees before creating requests. Bind approval to that exact preview; edits invalidate it. | New review card in the mock. The real tool runner must enforce approval outside model-generated text. |
| Request delivery and lifecycle | Track creation, delivery, pending, declined, expired and paid states. Use an idempotency key per receipt/split revision/contact. | Mock stops at “Awaiting payment.” Real delivery and settlement are future integrations. |
| Action log and recovery | Record the receipt reference, resolved identities, preview, user approval, tool outcomes and request IDs. Retry safely after interruption. | Proposed durable harness capability; the mock only holds session-local state. |

## Proposed wallet plugin contracts

These names describe a future integration; they are not existing Ubot endpoints and are not implemented by this mockup.

| Tool | Input | Output / behavior |
| --- | --- | --- |
| `receipts.read` | Authorized receipt ID | Paid status, amount in minor units, currency, merchant, payer wallet and original reference. Refuse an unverified or unpaid receipt. |
| `contacts.resolve` | User ID and spoken name/alias | Zero, one or several authorized contact candidates with provenance. Ask the user when ambiguous. |
| `wallets.resolve` | Selected contact ID and request currency | Compatible verified wallet identities or an explicit missing/incompatible result. Never invent an address from a person's name. |
| `splits.preview` | Receipt ID, selected contacts and equal-split rule | Immutable draft ID/revision, identities, destination, integer shares, fees and total requested. Assign any rounding remainder to the payer and disclose it. |
| `repayments.create` | Draft ID/revision, explicit approval token and idempotency key | Per-recipient request IDs and statuses. Repeating the same approved operation returns the same requests. |
| `repayments.status` | Authorized request IDs | Delivery and settlement state from the payment provider. Creating or sending a request does not mark it paid. |

The contact memory should store structured approved mappings independently of chat history. Store receipt/session context separately from long-lived identity memory. Do not automatically save uncertain voice interpretations or arbitrary addresses from conversation text. Wallet access should use scoped provider authorization; never place private keys or seed phrases in model context or memory.

## Harness flow and failures

1. Receive a paid receipt from the payment application. Resolve which bill “this bill” refers to before continuing.
2. Transcribe the voice request and extract Daniel and Lora as candidate people. Let the user correct the transcript.
3. Resolve identities and compatible wallets. If a name is ambiguous, a wallet is missing, or the currency/network is incompatible, ask for a selection or connection; block that recipient's request until resolved.
4. Create a deterministic equal-split preview. In the sample, the payer retains ฿400 and requests ฿400 from each friend, for ฿800 in total.
5. Present the preview and wait for explicit approval. A request is an invitation to repay; it does not authorize a debit from the friend's wallet.
6. Create requests idempotently. If only one delivery succeeds, retain its ID and retry only the failed delivery. Surface outcomes per recipient.
7. Track later settlement independently. Cancellation before approval creates nothing. A changed recipient, amount or receiving wallet requires a fresh preview and approval.

## Local implementation

`src/snap-to-pay/model.ts` owns receipt/contact fixtures, integer split calculation and guarded workflow transitions. `SnapToPay.tsx` renders the scanner, receipt, voice states, wallet review and request status cards. Timed effects are cancelled on state changes/unmount so cancellation and restart cannot complete an old action later.

The reducer accepts confirmation only from review and only with at least one other participant. It creates deterministic local request IDs and ignores later confirmation events. Editing people always includes the payer and recalculates the split. No new API routes, database tables, secrets, contract deployments or backend dependencies were added.

The Next.js app was updated from `origin/main` commit `e521ce8` before these changes. The new route follows the existing client-side dashboard navigation and supports direct loading through the App Router catch-all. Inter is served locally under the included OFL license. The REA evidence gate checks retained Ubot analysis and source/screenshot integrity on every production build.

## Acceptance criteria

- Enter through Scan or load the demo URL directly; complete the whole journey without keys, live financial services or device permissions.
- Verify ฿1,200 = ฿400 + ฿400 + ฿400; requested total is ฿800; recipient and receiving wallets are explicit before confirmation.
- Cancel scan review, voice or split; restart at any stage; confirm rapidly twice without duplicate requests.
- Edit participants; a two-person split is ฿600 each, and no selected friends disables confirmation.
- Use the demo with keyboard controls, readable live status and reduced motion; check narrow mobile and desktop layouts for overflow.
- Verify there are no calls from the demo to payment, voice, chat or request APIs and no camera/microphone permission requests.
- The production build must fail when Ubot evidence is missing, changed, or reports parsing failure.
