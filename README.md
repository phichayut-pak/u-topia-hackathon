# U-Topia dashboard recreation

A fresh React and TypeScript frontend reconstructed from the authenticated [U-Topia dashboard](https://app.u-topia.com/dashboard), using REA runtime captures, REA analysis of its shipped dashboard bundle, and measured DOM/computed styles.

See the [U-Topia project context](docs/context/u-topia-google-docs.md) imported from the shared Google Doc for the research, interview notes, judging criteria, and Snap-to-Pay findings.

```sh
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY for live U-Bot explanations
npm run dev                  # http://localhost:3000/dashboard
npm run build
```

The app now runs on Next.js (App Router). The recreated dashboard renders client-side through `src/app/[[...slug]]/page.tsx`, and the U-Ready backend lives in `src/app/api/*` with its logic in `src/lib/*`.

## Snap-to-Pay × Ubot mockup

The separate **UBot** button to the left of Dashboard opens `/ubot`: a conversation and composer only. The chat contains a QR receipt, bill summary, a voice waveform, and Daniel/Lora wallet profiles with a mock split confirmation. Text replies and voice recording are scripted locally; voice preview uses browser speech synthesis where available. No microphone or backend is used.

Open the top-level **Scan** tab, or visit `/dashboard/scan`. Scan contains **Scan / Receive / Swap / Send** tabs; the old `/dashboard/pay/snap-to-pay` URL remains an alias. Scan a sample ฿1,200 dinner bill, confirm its simulated payment, then tap Ubot's microphone to split it with Daniel and Lora. Review the demo wallets and approve two ฿400 repayment requests. You can edit participants, cancel, or restart.

This route is entirely local: payment, voice, contact matching and requests are simulated. It needs no keys, backend services, camera or microphone permission. It does not send messages or move funds. See [Ubot integration requirements](docs/ubot-integration.md) for the proposed harness, wallet plugin, memory and approval capabilities, and [Ubot REA evidence](docs/rea/ubot/README.md) for observed behavior and limitations.

## U-Ready: pay any Thai QR from crypto

- **Scan Thai QR** (Pay → Scan Thai QR): scan or upload a Thai PromptPay QR. The QR checksum and payee are verified; a QR that pays a personal account instead of the shop shows **Stop**.
- **Pay from crypto**: the shop receives baht (payout simulated; production uses a licensed e-money partner) and the first coin in the user's spending order is deducted at the live Bitkub rate. Payments are idempotent (a double tap charges once) and recorded in a double-entry ledger.
- **Wallets**: real holdings at live prices; the Spending Wallet tab shows the monthly budget, a U-Bot budget check (Claude, English and Thai, with Thai voice), the coin spending order, and live 24-hour price-move warnings.
- **Transactions**: real QR payments with the crypto that paid for them.
- `/merchant` shows the shop's "received" screen with a sound; `/qrs` prints test QR codes (placeholder IDs that real banks reject).

Environment variables are documented in `.env.example`. Without keys, AI text falls back to labelled templates and on-chain settlement is skipped. The SQLite database is created in `data/` (or `DATA_DIR`).

Open `/dashboard`. The development server also supports direct links to wallets, swap, pay, card, profile, transactions, and notifications. Assets and the app-wide Inter variable font are served locally; the original reference Satoshi asset is retained.

The dashboard includes persisted balance visibility, refresh feedback, keyboard-accessible spending tabs, chart tooltips, and the Crypto/U-Tag receive dialog with copy, download, and sharing. Linked screens reproduce their observed empty account states. Account identity, balances, and notifications are captured display fixtures; the app does not authenticate against U-Topia, fetch live account data, execute transfers, swap assets, or submit identity documents.

## REA requirement

`npm run build` runs `scripts/verify-rea.mjs` first and exits with an error if the successful REA analysis, authenticated runtime capture, screenshot, Receive scenario, or archived evidence integrity cannot be established. It validates retained evidence; it does not repeat live analysis on every build.

The same gate also verifies the retained Ubot analysis (14 scripts, zero parse failures), captured application sources and public-page screenshot before building the mockup. Missing, altered or failed Ubot evidence is a hard failure.

See [the evidence ledger](docs/rea/README.md) for evidence IDs, source identity, limitations, and reproduction decisions. Full static and runtime REA evidence is retained in compressed archives under `docs/rea/`. The archived shipped bundle is evidence only and is never imported into the application.

The previous app was archived at `/private/tmp/utopia-before-rebuild-20261016.tar.gz` before its application files were replaced. Git metadata was retained.
