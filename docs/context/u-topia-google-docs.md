---
title: U-Topia context from Google Docs
source: "https://docs.google.com/document/d/1GYnjwJTHlFoTl0Enz8018Q5Yi5jVKieSqUeINZmfTUc/edit?usp=sharing"
captured: 2026-10-16
status: source snapshot
---

# U-Topia context from Google Docs


Source: [U-Topia Google Doc](https://docs.google.com/document/d/1GYnjwJTHlFoTl0Enz8018Q5Yi5jVKieSqUeINZmfTUc/edit?usp=sharing)  
Captured: 2026-10-16

This snapshot preserves the four populated tabs from the shared document. Its first tab, “U-Topia,” was empty when captured. Wording and claims are copied from the source and have not been independently verified.

## Research


Source tab: [Research](https://docs.google.com/document/d/1GYnjwJTHlFoTl0Enz8018Q5Yi5jVKieSqUeINZmfTUc/edit?tab=t.ccakv2i02676)

### U-Bot

U-Topia’s AI assistant. It chats, talks, books trips and builds mini-apps, but the user still approves every payment.

### Research gap

- The apps U-Bot builds cannot touch money because there is no wallet link.
- This gap is the opening for U-Bot Studio.

### Community & Sales

#### Pain point: transparency

- People cannot see what AI may do with their money: only 23% would let AI pay for them (Visa/Harris 2026), and 33% want to approve every agent payment (Global Payments).
- Fix: a permission card with limits, approve once, and a visible log of everything U-Bot did.

#### Why switch from a bank?

- Do not ask people to leave their bank: “Keep your bank, add U-Topia.”
- Show the licence on the first screen, the Visa logo, proof of reserves and Thai human support.

#### Go-to-market

- U-Center Money Buddies help newcomers in person.
- Buddies are rewarded for a completed safety checklist, not for sign-ups.

### U-Topia

#### Do it simple

- Baht-first balances; call USDT a “digital dollar”.
- Hide the chain, gas and seed phrase (Face ID login, family-guardian recovery).
- Use plain Thai with no jargon: only 43% of people could recognise a seed phrase (CMU, CHI 2025).

#### AI chat friendly

- U-Bot explains any screen in plain Thai and previews each action first, for example: “You send ฿500. Mom gets 14 USDC. Fee ฿0.”
- U-Bot checks before you sign, with scam and wrong-network warnings (฿115.3B lost to scams in Thailand, GASA 2025).

#### Crypto

- Crypto is an add-on, not a replacement: lead with digital dollars, gold and the Visa card.
- The Thai SEC has banned crypto as payment for goods since April 2022, so the card or QR payment must convert to baht at checkout.

## Interview


Source tab: [Interview](https://docs.google.com/document/d/1GYnjwJTHlFoTl0Enz8018Q5Yi5jVKieSqUeINZmfTUc/edit?tab=t.odtx8pmu50k6)

### U-Topia

#### Stage and plans

- Launch is tomorrow (at the time of the interview).
- The plan is to launch globally.
- If we want to build anything, build it for U-Bot.

#### Vision and principles

- Company vision: “Do it simple”.
- Users can transfer cryptocurrency directly from account to account.
- The AI chat is friendly enough that even a grandmother can use it.
- The company does not touch customers’ money.
- The company wants to be more transparent about the work environment.

### U-Bot

#### What it does

- A platform for using any agent.
- It can do anything in or outside the app, for example book a flight or a hotel.
- Publishing an agent earns a commission.

#### Models and tools

- Choose which LLM is best suited to each task.
- U Code: similar to Claude Code.
- A U-Topia LLM.

## Criteria


Source tab: [Criteria](https://docs.google.com/document/d/1GYnjwJTHlFoTl0Enz8018Q5Yi5jVKieSqUeINZmfTUc/edit?tab=t.o7cp0lbkq8yt)

| Weight | Criterion |
| --- | --- |
| 40% | Execution: it works in practice (feasibility) |
| 40% | Real users: people actually use it |
| 10% | Ease of use |
| 5% | Tokenomist AVAX |
| 5% | Use of U-Bot: does the project really use it? |

## Context: Snap-to-Pay findings


Source tab: [Context: Snap-to-Pay findings](https://docs.google.com/document/d/1GYnjwJTHlFoTl0Enz8018Q5Yi5jVKieSqUeINZmfTUc/edit?tab=t.9vueu4pm8puy)

### Snap-to-Pay: all findings (16 Oct 2026)

Idea 1 for U-Hackathon 2026: pay any Thai PromptPay QR from crypto. Prepared with Claude. Links: Playbook https://claude.ai/artifact/1ab5sCSNMygGFT6qJWdJFd · Demo https://claude.ai/artifact/MKCMnrJ8JsTP68b62ha1L6 · Deck https://claude.ai/artifact/X4UNkSE2YfCwxonQpgUxLr (private until shared).

#### The answer in one paragraph

Crypto pays the QR by travelling as baht. Thai rules stop licensed crypto firms from moving crypto to a merchant at the moment of payment, but nothing stops you from turning crypto into your own baht first. So Snap-to-Pay splits every payment in two: (1) charge a "Baht Battery" from crypto ahead of time through whichever bridge is open to you, (2) snap any QR, menu or bill and pay in baht in about 4 seconds. U-Bot (AI) decides how much to charge, picks the cheapest open bridge, reads the QR/menu, catches swapped QR stickers and explains every decision. Avalanche enforces the limits the AI cannot cross.

#### 1. Thailand: rules that shape the design

- 2022 payment ban: SEC Notification Gor Thor 5/2565, in force 1 Apr 2022. Binds only licensed digital-asset businesses (exchanges, brokers, dealers, fund managers, advisers), not merchants or individuals. Six prohibited activities: advertising readiness to accept crypto payments; building payment systems or tools; wallet services for payment; moving baht from a customer's account to someone else's; moving crypto from a customer to non-customers for payment; any other payment-support service. A 3 Sep 2024 amendment exempts sandbox participants.
- Unlicensed crypto exchange/dealer business for Thai users is a separate crime (2–5 years' prison, THB 200k–500k fines).
- TouristDigiPay (SEC with Finance Ministry, AMLO, Tourism Ministry; BOT regulates the wallet): announced 18 Aug 2025; operator applications 25 Sep – 26 Dec 2025; each approved operator gets up to 18 months (no single end date). Flow: licensed exchange → BOT-licensed e-money "tourist wallet" → Thai QR; merchants get baht only. Caps (Tilleke & Gibbins): THB 50k/month at small/personal QR, THB 500k/month at verified merchants. No cash withdrawal until the wallet closes; source-of-funds checks above THB 50k/month. Bitkub announced participation, Binance TH said it was ready; no primary source confirms a live operator or volumes as of Oct 2026 (one report said the crypto leg was "suspended pending review").
- Licences: converting crypto → baht needs an SEC licence (Emergency Decree on Digital Asset Businesses 2018). Holding baht for users or paying merchants for them is BOT-supervised under the Payment Systems Act B.E. 2560 (e-money etc.; reportedly ~THB 10m paid-up capital; majority-foreign owners also need a Foreign Business Licence). Whether a pure front-end that routes users to licensed partners needs registration is unanswered: ask Thai counsel.
- Residents: selling on a licensed Thai exchange and withdrawing to your OWN bank account is legal (exchanges enforce name matching). Bitkub: 0.25% trading fee, ฿20 per baht withdrawal, up to 24 h. Crypto gains on licensed Thai platforms are tax-exempt 1 Jan 2025 – 31 Dec 2029 (Ministerial Regulation 399).
- Unlicensed foreign exchanges blocked since 28 Jun 2025 (Bybit, OKX, CoinEx, XT.COM, 1000X); SEC criminal complaints against offshore platforms continue in 2026.
- Stablecoins: USDT and USDC approved trading pairs since 16 Mar 2025. SEC draft (consultation 11–25 Sep 2026, not final): own-name deposits/withdrawals only, no third-party transfers, THB 5m/person/day cap. Our flow only moves the user's coins to the user's own exchange account, so it fits.
- Travel rule: SEC Notification Sor Thor 9/2026 effective 27 Feb 2027; users must prove they own self-custody wallets.
- BOT enforcement 2025–26: domestic QR payments must be in baht through licensed gateways; ~5,000 accounts used for P2P yuan QR transfers suspended (Feb 2025 – May 2026); 11 arrests at unlicensed e-money firms (Mar 2025); unlicensed money transfer can mean up to 3 years' jail (Exchange Control Act 1942).
- BOT baht stablecoin: sandbox reopened 24 Dec 2025 with no deadline; tokens must be 1:1 baht, segregated reserves, redeemable; formal rules expected 2026 – early 2027; first phase for financial institutions (settlement).
- SEC digital-asset sandbox open since Aug 2024 (one-year tests, extendable; contact daregsandbox@sec.or.th).

#### 2. Southeast Asia

- Philippines: legal via licensed VASP + e-money. Coins.ph pays QR Ph merchants from USDT/USDC since Apr 2026 (~700k merchants; Betur Inc. VASP licence + DCPay e-money licence). Risks: VASP licence freeze since 2022; Sep 2026 draft would freeze new payment-operator registrations. GCash GCrypto: sell first (via PDAX), then pay.
- Singapore: OKX Pay (since 30 Sep 2025) pays GrabPay SGQR merchants from USDT/USDC via StraitsX; merchant gets SGD. MAS stablecoin law still a proposal. GrabPay crypto top-up via Triple-A (2024).
- Malaysia: crypto "not a payment instrument regulated by BNM"; ringgit stablecoins in B2B pilots; YouApp pays DuitNow from a ringgit stablecoin.
- Indonesia: June 2026 law says a stablecoin cannot be a direct means of payment; BI bars PSPs from crypto; OJK stablecoin rules targeted early 2027.
- Vietnam: crypto a legal asset from 1 Jan 2026 but not for payment; exchange pilot opened Jan 2026, none licensed by late Aug; fines VND 30–50m for unlicensed platforms from 1 Sep 2026.
- Cambodia: licensed crypto firms may not encourage crypto payment (Dec 2024 rule). Laos: banks told to block card payments to unlicensed crypto platforms (31 Jul 2026). Myanmar bans crypto. Brunei: unregulated. Timor-Leste: no law.
- Cross-border QR into Thai QR (BOT list): two-way with Cambodia, Malaysia, Vietnam, Indonesia, Hong Kong (Dec 2023), Laos (2024); inbound only from South Korea (Paybooc, Jun 2025) and China (UnionPay, Alipay, WeChat Pay, Oct 2025); Singapore PayNow–PromptPay (SGD 1,000 / THB 25,000 a day) and NETS–PromptPay. No link for Philippines, India, US, UK, EU, Russia wallets.
- Project Nexus: Nexus Global Payments set up 2025 (India, Malaysia, Philippines, Singapore, Thailand; Indonesia joined Feb 2026); PayNet–NETS JV to build it; launch targeted 2027.
- Pattern everywhere it is legal: two licences (crypto + e-money/payment) and the merchant receives local currency.

#### 3. Market numbers (dated)

- PromptPay: 2.66B transactions worth THB 4.61T in Jul 2026 (BOT, updated 30 Sep 2026) ≈ 86M a day. NITMX: 82.91M registrations end-May 2026.
- Tourists: 2025 had 32.97M arrivals spending THB 1.53T (≈ THB 46.4k per trip). Jan–Aug 2026: 20.94M arrivals (−3.08%). Cross-border QR spend by visitors: THB 1.51B in May 2026 (≈1.2% of tourist spend; +382% y/y; >60% Chinese).
- Crypto: Chainalysis 2026 index — Thailand #8 (up from #17), Indonesia #14, Vietnam #18, Philippines #19. 8 of Thailand's top-10 source markets are in the top 20. Thai exchanges: stablecoins ~66% of volume (secondary); ~121k active accounts Jul 2026 vs ~3.1M registered (single source).
- Scams: GASA estimates THB 115.3B lost in a year (Aug 2025); police data THB 207.7M lost in one week of Jul 2026.
- Trust in AI payments: Visa Trust Index (9 Sep 2026, US): 72% used an AI assistant, only 23% trust GenAI to pay for them.
- Costs tourists face: Thai ATMs charge ~THB 220 per foreign-card withdrawal; Revolut reportedly marks up THB 1.5%; Touch 'n Go cross-border QR ~1%.
- Gaps: no QR merchant count newer than 2021 (7M+ acceptance points); no survey of crypto ownership among tourists; QR sticker swaps poorly documented.

#### 4. Competitors (21 products studied; none uses AI in the payment flow)

- In Thailand: TouristDigiPay (sanctioned, operators unconfirmed); Bitget Wallet lists "Thai QR" (unverified, grey); SQRIL (Tether-backed) announced stablecoin → PromptPay API on 30 Mar 2026 (Thai partner undisclosed); PhantomPay pilot; PlebQR (Lightning P2P, ~1,270 payments / ~THB 670k self-reported, grey); Rubie Wallet (SCB 10X, Devcon 2024 sandbox: USDC → THBX → ~100 closed-loop merchants, ended); Moreta Pay (US MSB) explicitly bans crypto-funded spend in Thailand; RedotPay hiring for PromptPay; SuperRich + Krungsri tourist e-wallet planned.
- Regional/global: Coins.ph, OKX Pay, Bybit Pay (Pix, VietQR, QR Ph), Binance Pay (Pix; Bhutan tourism with DK Bank), Bitget Scan to Pay (no Thailand), RedotPay QR (9 countries), YouApp (DuitNow), Trust Wallet QR (shut after 6 weeks), Huione Pay (licence revoked, liquidated).
- Common architecture: crypto app + licensed local PSP pays the merchant in fiat.

#### 5. U-Topia and the hackathon

- U-TOPIA CORP: no published licences; card terms say it is not a bank or MSB; card issued by Third National (Puerto Rico money transmitter) on Rain. Card terms allow up to 1.5% FX + 1.5% cross-border fees. Swaps fee 2.50%. Wallet chains in app: BNB Smart Chain and Base (no Avalanche, no THB, no PromptPay).
- U-Bot: login-gated assistant ("Ask it. Snap it. Build it."); reads photos/PDFs; payments are hand-off cards the user approves (flights, hotels, rides, groceries). Snap-to-Pay fits as a fifth hand-off card.
- Hackathon: hosted by U-topia and Team1 at Avani Sukhumvit; tracks AI and Web3; teams ≤4; judges pick 6 finalists, then U-Center DAO votes live; THB 1M pool; surprise partner bounty. Not published: weights, judges, pitch length, submission requirements — ask organisers.

#### 6. The Baht Battery: 14 bridges from crypto to baht

- Tiers: Green = legal today · Amber = works today, grey zone · Blue = needs a sandbox or partner · Red = needs a rule change or is enforced against.
- 1 Licensed-exchange auction (residents) — Green.
- 2 TouristDigiPay battery (tourists) — Green.
- 3 AI batching: one sale a week instead of per payment; ฿20 fee drops from 4.3% to ≈0.3% of a ฿500 QR — Green.
- 4 Voucher bridge: buy TrueMoney credit (฿10–20,000) with crypto on Bitrefill; needs Thai ID, long-term visa or work permit — Amber.
- 5 Home-currency hop: off-ramp at home (Coins.ph, OKX SG), pay Thai QR over cross-border links — Green.
- 6 Baht token on Avalanche via a bank in the BOT stablecoin sandbox — Blue.
- 7 Purpose-bound tourist baht: token pays QR only, no cash-out, monthly cap (TouristDigiPay's rules as code) — Blue.
- 8 QR-to-mandate: AI turns a QR into a signed AP2-style cart mandate; ERC-7715-style daily cap — Green.
- 9 Solver race: licensed fillers compete to deliver baht to your wallet — Blue if solvers are licensed.
- 10 Send-to-self remittance funded by stablecoins (rails exist, no retail product) — Blue.
- 11 Crypto-collateral baht credit — Red (licensed crypto firms may not lend since 2023).
- 12 Crypto-card top-up of Thai e-wallets — Red in practice (TrueMoney reportedly stopped foreign cards late 2025).
- 13 Offshore QR switch (SQRIL, Bitget Wallet) — Red until a licensed Thai partner is named.
- 14 P2P liquidity providers (PlebQR) — Red (BOT account suspensions).

#### 7. Self-evaluation loop (5 measurable metrics)

- Metrics: (1) Reach: groups with an open bridge (tourists, residents, long-stay), target 3/3; (2) Legal tier by default, target Green; (3) Time at the QR, target ≤5 s; (4) All-in cost on ฿500, target ≤1%; (5) AI load: jobs that break without AI, target ≥6.
- L1 Convert per payment, tourists only: reach 1/3, Green, 45–75 s, 0.3–1%, 3 AI jobs. Fix time.
- L2 + Baht Battery (charge once a day): 1/3, Green, ≈4 s, 0.1–0.3%, 4. Fix reach.
- L3 + Residents (own-account sale, batched): 2/3, Green, ≈4 s, 0.3–1.5%, 5. Fix long-stay.
- L4 + Voucher (opt-in) and home-currency hop: 3/3, Green (Amber opt-in), ≈4 s, 0.1–2%, 6. Future-proof.
- L5 + Baht-token rail, QR-to-mandate, bridge auction: 3/3, Green now + Blue track, ≈4 s, 0.1–1%, 7. Stop: all targets met.
- Hackathon rubric at L5 (own scoring): Execution 8 · Real users 8.5 · Ease 9 · AVAX 9 · U-Bot 9.5 = 84.25/100.

#### 8. Three ways to build it

##### Path 1 — Licensed rails (Green, ship now)

Like exchanging money at an official counter. Morning: U-Bot estimates today's baht from your plan, asks several licensed exchanges for a price, sells your USDC at the best one, and the baht lands in your own wallet (tourist e-wallet via TouristDigiPay, or a resident's own bank account). All day you snap and pay in baht. The Permission Card on Avalanche lets U-Bot move coins only to your own exchange account within your limits. Weak spots: tourists need two accounts and passport KYC; no live operator confirmed yet. 90 days: partner MoUs, operator registration, airport pilot with 200 tourists.

##### Path 2 — Voucher bridge (Amber, opt-in)

Like buying a gift card. Pay USDC for TrueMoney credit on a voucher marketplace; it lands as baht in TrueMoney, which pays any PromptPay QR. Seconds, no Thai exchange account. Only for Thai IDs, long-term visas or work permits. Grey zone, spread unpublished, so offered as a labelled option only when it is cheaper or faster. 90 days: official reseller agreement, our own KYC, legal opinion.

##### Path 3 — Baht token rail (Blue, the crazy one)

Like a bank's digital cash. A Thai bank in the BOT baht-stablecoin sandbox mints 1:1 baht tokens on an Avalanche L1; you swap USDC in about 2 seconds and pay QRs; tokens turn back into baht for the merchant. Tourist tokens are purpose-bound: pay merchants only, no cash-out, monthly cap. Needs a bank partner and sandbox approval (6–12 months); BOT phase 1 is institutions only.

#### 9. Judging panel verdicts

- Accept: Baht Battery on licensed rails (lead); Voucher bridge (opt-in); Baht token rail (roadmap/vision).
- Park or testnet only: crypto-collateral credit; offshore QR switch; P2P solvers; send USDT to vendor; U-Card for PromptPay (can't pay a PromptPay QR).
- Meta-analyst: "Crowded theme, uncrowded answer: charge first, spend baht, and an AI that picks the tier for you. Open with the snap, not the statute."

#### 10. What was built

- Demo (claude.ai artifact): QR decoding (jsQR) + EMVCo/PromptPay parser with CRC-16 and Thai ID checksums (20 tests, matches promptpay-qr byte for byte); Claude reads uploaded photos; sticker-swap check; legal lane router; quotes; Permission Card; Baht Battery with three charge sources and AI pick; glass box showing every rule, partner call and chain step. Partner calls simulated; chain steps simulated until deployed.
- Contracts (Hardhat, Solidity 0.8.28): SnapMandate (Permission Card + intent lifecycle with licensed attestor), FairPriceOracle (staked crowd prices, median, rewards/slashing), MockUSDC. 37 tests passing. Not yet deployed to Fuji.
- Deck: 10 slides with speaker notes.

#### 11. Open questions before the pitch

- Is any TouristDigiPay operator live? Which e-money partner?
- Does a pure front-end routing to licensed partners need registration? (Thai counsel)
- Voucher resale legality and spread; TrueMoney's current foreign-card rules.
- SQRIL's Thai payout partner.
- Deploy contracts to Fuji; fill team name, contact and real-user count in the deck.
