# Ubot REA evidence

Target: https://u.bot/ · captured 2026-10-16 · public unauthenticated browser session.

`evidence.json.gz` is the complete five-record REA export, compressed without modifying the records. `analysis.json` records its SHA-256 and the exact evidence IDs used by the build gate. `reference.png` is the screenshot from the archived record, not a recreation.

| Evidence | Result |
| --- | --- |
| `ev_5f9075f567cd0747ce46234c10310a574f0eb3485aa0f4d9a24ac715ab89bde4` · analyze_web_bundle | 14 observed scripts analyzed, 14 parsed, zero parse failures, 424,974 AST nodes visited. Complete within captured-source scope. |
| `ev_5a48362f4603bd6edff2b5ad9cb39a5a81f01ccad81595712999749327d652d8` · inspect_web_page | Public sign-in DOM and 12 retained script sources; source hashes checked against the analysis. Policy-filtered and limited to the attach window. |
| `ev_1d3c33df13dca98e1fc6a66bfccb930cbebff4967dbd5165c266b4383c9d6866` · capture_web_screenshot | Public sign-in screenshot at 1440 × 913; original PNG bytes and digest retained. |
| `ev_7c21a05dfbc094fcdd994ce6249ed5b9cd50f49333c7714eb44d7f469ef27cf6` · capture_browser_scenario | Earlier successful isolated-browser visit at 1440 × 1000, including DOM, accessibility and screenshot. |
| `ev_a407db750aa394252a90667abb3a7689dd92e7b9a25b9d0544c4d6c17a148fc7` · list_browser_targets | Recovered browser connection scoped to the u.bot origin. |

## Observations and limits

- The public screen says “Ask it. Snap it. Build it.” and uses a blue/purple orb, Ubot logo, rounded controls and a pale background. The local mockup reuses the observed public logo/orb, downloaded from their exact observed asset URLs. It uses Inter per the current project instruction.
- The application chunk `2_z0u830c8l4-.js`, SHA-256 `02231d8289566f1ad4ba7d0ea275ac6c65e7ffdcb92a328064dba48ef58b0f6c`, contains microphone recording with `MediaRecorder`, a transcription fetch to `/api/transcribe`, browser speech synthesis, `/api/chat`, `/api/history`, and local chat history under `ubot_chats`.
- These are static source observations. They do not prove endpoint availability, authenticated execution, model behavior, or backend implementation. No authentication was performed, and no wallet or payment action was attempted against Ubot.
- No wallet, memory, plugin or harness string was found in the focused application chunk search. This bounded search cannot establish that these capabilities are absent elsewhere or server-side. The integration requirements document treats them as proposed or requiring verification.
- The new conversation UI, contacts, wallet identities, receipt and requests are local design choices. They do not reproduce an observed signed-in Ubot bill-splitting feature.

## Recovery and build gate

The earlier debug endpoint was unavailable, and a short-lived Chrome launch ended before REA could attach. Recovery kept the isolated Chrome process attached to a persistent command session until analysis, passive inspection and evidence export finished. Chrome was then closed. No REA/client configuration or native engines were changed.

`npm run verify:rea` and `npm run build` require this evidence as well as the existing dashboard evidence. The Ubot gate fails for missing or changed archives, failed/incomplete parsing, unbound or changed sources, and missing or altered screenshots. Builds read retained evidence; they do not depend on a live REA server or browser.

The implementation and proposed additions are described in [Ubot integration requirements](../../ubot-integration.md).

## Mockup verification

The initial mockup Next.js production build passed on Node 22. Before the navigation revision, browser validation passed 38 checks, including the full QR-to-voice journey, participant edits, cancelled edits followed by a fresh voice command, timer cancellation, duplicate confirmation, direct loading, local Inter rendering, and viewport overflow checks from 320px to 1920px. The demo made zero API calls and requested no camera/microphone access. The browser reported no runtime errors.

Six isolated evidence-gate checks passed: intact evidence was accepted; a missing archive, altered archive, recorded parse failure (even with a recomputed archive digest), changed source text, and changed screenshot were rejected. The originals were never modified by these checks.

Results: [browser validation](mockup-validation.json), [gate validation](gate-validation.json). Local rendered screens: [desktop](mockup-desktop.png), [desktop split](mockup-split-desktop.png), [mobile](mockup-mobile.png), [mobile split](mockup-split-mobile.png). These local checks and screenshots are supplemental implementation validation, not REA-produced reference Evidence or a claim of signed-in Ubot visual parity.

The navigation revision places the mockup at `/dashboard/scan`, with Receive / Swap / Send as local tabs. The earlier Pay entry validation and screenshots above describe the initial layout; they are retained as historical results. The old demo URL remains an alias.
