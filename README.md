# U-Topia dashboard recreation

A fresh React and TypeScript frontend reconstructed from the authenticated [U-Topia dashboard](https://app.u-topia.com/dashboard), using REA runtime captures, REA analysis of its shipped dashboard bundle, and measured DOM/computed styles.

```sh
npm install
npm run dev
npm run build
```

Open `/dashboard`. The development server also supports direct links to wallets, swap, pay, card, profile, transactions, and notifications. Assets and the reference Satoshi variable font are served locally.

The dashboard includes persisted balance visibility, refresh feedback, keyboard-accessible spending tabs, chart tooltips, and the Crypto/U-Tag receive dialog with copy, download, and sharing. Linked screens reproduce their observed empty account states. Account identity, balances, and notifications are captured display fixtures; the app does not authenticate against U-Topia, fetch live account data, execute transfers, swap assets, or submit identity documents.

## REA requirement

`npm run build` runs `scripts/verify-rea.mjs` first and exits with an error if the successful REA analysis, authenticated runtime capture, screenshot, Receive scenario, or archived evidence integrity cannot be established. It validates retained evidence; it does not repeat live analysis on every build.

See [the evidence ledger](docs/rea/README.md) for evidence IDs, source identity, limitations, and reproduction decisions. Full static and runtime REA evidence is retained in compressed archives under `docs/rea/`. The archived shipped bundle is evidence only and is never imported into the application.

The previous app was archived at `/private/tmp/utopia-before-rebuild-20261016.tar.gz` before its application files were replaced. Git metadata was retained.
