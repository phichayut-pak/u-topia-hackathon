# U-Topia dashboard recreation

A fresh React and TypeScript frontend reconstructed from the authenticated [U-Topia dashboard](https://app.u-topia.com/dashboard), using REA runtime captures, REA analysis of its shipped dashboard bundle, and measured DOM/computed styles.

```sh
npm install
cp .env.example .env.local   # add ANTHROPIC_API_KEY for live U-Bot explanations
npm run dev                  # http://localhost:3000/dashboard
npm run build
```

The app now runs on Next.js (App Router). The recreated dashboard renders client-side through `src/app/[[...slug]]/page.tsx`, and the U-Ready backend lives in `src/app/api/*` with its logic in `src/lib/*`.

## U-Ready: pay any Thai QR from crypto

- **Scan to Pay** (Dashboard, Pay → Scan Thai QR, Wallets → Scan): scan or upload a Thai PromptPay QR. The QR checksum and payee are verified; a QR that pays a personal account instead of the shop shows **Stop**.
- **Pay from crypto**: the shop receives baht (payout simulated; production uses a licensed e-money partner) and the first coin in the user's spending order is deducted at the live Bitkub rate. Payments are idempotent (a double tap charges once) and recorded in a double-entry ledger.
- **Wallets**: real holdings at live prices; the Spending Wallet tab shows the monthly budget, a U-Bot budget check (Claude, English and Thai, with Thai voice), the coin spending order, and live 24-hour price-move warnings.
- **Transactions**: real QR payments with the crypto that paid for them.
- `/merchant` shows the shop's "received" screen with a sound; `/qrs` prints test QR codes (placeholder IDs that real banks reject).

Environment variables are documented in `.env.example`. Without keys, AI text falls back to labelled templates and on-chain settlement is skipped. The SQLite database is created in `data/` (or `DATA_DIR`).

Open `/dashboard`. The development server also supports direct links to wallets, swap, pay, card, profile, transactions, and notifications. Assets and the reference Satoshi variable font are served locally.

The dashboard includes persisted balance visibility, refresh feedback, keyboard-accessible spending tabs, chart tooltips, and the Crypto/U-Tag receive dialog with copy, download, and sharing. Linked screens reproduce their observed empty account states. Account identity, balances, and notifications are captured display fixtures; the app does not authenticate against U-Topia, fetch live account data, execute transfers, swap assets, or submit identity documents.

## REA requirement

`npm run build` runs `scripts/verify-rea.mjs` first and exits with an error if the successful REA analysis, authenticated runtime capture, screenshot, Receive scenario, or archived evidence integrity cannot be established. It validates retained evidence; it does not repeat live analysis on every build.

See [the evidence ledger](docs/rea/README.md) for evidence IDs, source identity, limitations, and reproduction decisions. Full static and runtime REA evidence is retained in compressed archives under `docs/rea/`. The archived shipped bundle is evidence only and is never imported into the application.

The previous app was archived at `/private/tmp/utopia-before-rebuild-20261016.tar.gz` before its application files were replaced. Git metadata was retained.
