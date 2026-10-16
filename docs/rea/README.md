# REA investigation ledger

Target: `https://app.u-topia.com/dashboard`, observed in an authenticated user-controlled Chrome session on 2026-10-16. REA server: `rea-agents` 6.5.0.

## Evidence and scope

| Question | Evidence | Status |
| --- | --- | --- |
| Is the actual authenticated dashboard accessible? | `ev_0297df0acd4b8dbef5fb4ebef0e8be40771d744ac158885d110975004bdb988f` (`inspect_web_page`) | Observed dashboard DOM, accessibility, and resources |
| What does the visible reference look like? | `ev_ff3457f4a173397bb836d14c0dd5ae1858d1b743a3ca15b8b70114999dabfd6c` (`capture_web_screenshot`) | Complete within the captured viewport |
| Does REA successfully analyze the shipped dashboard? | `ev_6eefad4ac63d994d6647ff56840baf733a303d59ce9ad1878c0865b86501f841` (`analyze_javascript_application`) | One selected JavaScript file parsed, 34,722 bytes, 9,105 AST nodes, zero parse failures |
| What code observations are retained? | `ev_2db36477bccbd71364f4e6379ef5b0388784093ef1be6c4b0993fea610255173` (source module view) | Receive modal state; Swap/Pay navigation; visibility state; period constants |
| Does Receive open the observed dialog? | `ev_7cf9b22b94047e0c2c0c23eacabf73dda47a2c2528f37bc7706585611893bd0c` (`capture_browser_scenario`) | Declared actions completed; Crypto Deposit dialog observed |
| What are the dashboard control and linked page states? | `ev_36791ba4e6261b6c9a623792c0f905e961ab1900b82b82ecb301e2af724bde89` (`capture_browser_scenario`) | Declared period, visibility, and route actions completed; some immediate captures show transitional loading |

The analyzed bundle `3hq3-089hxjd5.js` has SHA-256 `f3229a9e4cb4e0caa3d79ebbe2a51d243c87758de2680c9608fc3165d4c8b223`. Its exact captured bytes are retained as `shipped-dashboard.js`. `analysis.json` identifies the source and evidence archive digests checked by the build gate.

## Observed implementation facts

The dashboard starts with 30d / Monthly Spending selected. Receive opens Crypto Deposit; Swap navigates to `/dashboard/swap`; Send navigates to `/dashboard/pay`. A single visibility boolean controls all three balances. Zero analytics retain 4% chart bars and an axis of $100/$50/$0. The current account has zero balances and no transaction history.

Desktop geometry: 135px sticky header; 1024px centered content; first heading at (208,151) in a 1440×1000 viewport; balance card (208,235,1024,217); action row (208,476,1024,58); spending section begins at y558. Mobile geometry: 125px sticky header; 16px content gutters; first heading at (16,137) in a 390×844 viewport; balance card (16,209,358,197); action row (16,426,358,50); spending section begins at y496.

Additional browser/CDP inspection measured computed styles and bounding boxes in `desktop.json` and `mobile.json`. These files are supplemental browser observations, not REA-produced Evidence records. No page-provided instructions were executed.

## Decisions and limitations

- The original UI uses Satoshi. The user explicitly chose Satoshi for this recreation, superseding the earlier global Inter preference for this task.
- Main containers use `p-2`; child content offsets reproduce the measured outer gutters and vertical position. Top-bar actions use `WorkspaceIconButton`.
- REA's initial connected scenario failed with `target_not_allowed` under its default service-worker blocking. Inspecting the provider identified the existing service-worker conflict; changing the declared scenario environment to `service_workers: "allow"` resolved it. The successful retry and subsequent scenarios are retained.
- A diagnostic CLI reported registration drift and missing optional native engines. Those do not prevent the connected MCP's successful browser and JavaScript analyses; no client configuration or native engines were changed.
- Static coverage is intentionally selected-source coverage: 32 other inventoried files were excluded and semantic unknowns remain. Successful parsing does not establish complete application behavior or execution.
- Runtime observations cover the declared actions and attached windows. Backend calls, production authentication, populated financial states, identity verification, and unvisited deeper flows were not reconstructed.
- Display fixtures use the account identity and public wallet address visible in the user-authorized reference. Browser cookies, access tokens, passwords, and secret values were not copied into the app.
- Matching measured geometry and screenshots is evidence of visual fidelity for captured states and viewports. It does not prove universal pixel equality across operating systems, every viewport, or live data state.

The exact REA records are in `static-evidence.json.gz` and `runtime-evidence.json.gz`. Browser verification results are recorded separately after comparison.

## Final validation

The production build and REA prerequisite passed. The hard-failure case was also checked in an isolated temporary copy: a retained analysis reporting one parse failure exited with code 1. The browser checks passed 35 assertions, including balance persistence, period and keyboard controls, navigation, empty-wallet validation, notification counts, and horizontal overflow at 320/390/768/1024/1440/1920px.

Final direct viewport screenshots were compared using REA at zero channel tolerance: 1440×1000 desktop differs in 1 of 1,440,000 pixels (maximum channel delta 4/255); 390×844 mobile differs in 485 of 329,160 pixels (maximum channel delta 3/255). Mobile differences are confined to the header controls; primary content geometry matches the measured reference. `visual-comparison.json` retains complete comparison Evidence records, and `screenshots/` retains the actual compared PNGs.

An earlier native screenshot comparison was exactly identical, but connected native capture can reflect the browser window metrics after emulation changes. Its result is supplemental; it is not used to claim exact equality at every requested CSS viewport. Some scenario captures mark the events section incomplete while retaining complete screenshot artifacts. Final pixel conclusions come only from the self-verifying PNG artifacts and their recorded dimensions.
