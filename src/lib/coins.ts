import { db } from "./db";
import { upcomingUnlock } from "./tokenomist";
import { explainPriceMove, explainUnlock, type Bilingual } from "./ai";
import { MOVE_THRESHOLD, STABLE, tickers } from "./pricemoves";

export type Coin = { symbol: string; position: number; never: boolean; tokenomistId: string | null };

export function listCoins(userId = 1): Coin[] {
  return (
    db.prepare("SELECT symbol, position, never_spend, tokenomist_id FROM coin_order WHERE user_id = ? ORDER BY never_spend, position").all(userId) as {
      symbol: string;
      position: number;
      never_spend: number;
      tokenomist_id: string | null;
    }[]
  ).map((r) => ({ symbol: r.symbol, position: r.position, never: !!r.never_spend, tokenomistId: r.tokenomist_id }));
}

// The user sets the order. The app never reorders coins on its own.
export function setOrder(order: string[], never: string[], userId = 1) {
  const known = new Set(listCoins(userId).map((c) => c.symbol));
  if (order.some((s) => !known.has(s)) || never.some((s) => !known.has(s))) throw new Error("Unknown coin");
  const upd = db.prepare("UPDATE coin_order SET position = ?, never_spend = ? WHERE user_id = ? AND symbol = ?");
  db.transaction(() => {
    order.forEach((s, i) => upd.run(i + 1, 0, userId, s));
    never.forEach((s, i) => upd.run(100 + i, 1, userId, s));
  })();
  return listCoins(userId);
}

export type CoinWarning =
  | { kind: "price"; symbol: string; changePct: number; lastThb: number; sample: false; note: Bilingual }
  | { kind: "unlock"; symbol: string; date: string; valueToMarketCap: number; sample: boolean; sampleReason?: string; note: Bilingual };

// Warning source: "bitkub" (free 24h price moves, default) or "tokenomist" (unlock events).
const SOURCE = (process.env.WARNING_SOURCE ?? "bitkub").toLowerCase();

export async function coinMarket(userId = 1) {
  const { rows, live } = await tickers();
  const market = listCoins(userId).map((c) => {
    const t = rows.get(c.symbol);
    return { symbol: c.symbol, lastThb: t?.lastThb ?? null, changePct: t?.changePct ?? null };
  });
  return { market, live };
}

export async function coinWarnings(userId = 1): Promise<CoinWarning[]> {
  const out: CoinWarning[] = [];
  const coins = listCoins(userId).filter((c) => !c.never);
  if (SOURCE === "tokenomist") {
    for (const c of coins) {
      if (!c.tokenomistId) continue;
      const w = await upcomingUnlock(c.tokenomistId);
      if (!w) continue;
      const note = await explainUnlock({ symbol: c.symbol, date: w.date, valueToMarketCap: w.valueToMarketCap, sample: w.sample });
      out.push({ kind: "unlock", symbol: c.symbol, date: w.date, valueToMarketCap: w.valueToMarketCap, sample: w.sample, sampleReason: w.sampleReason, note });
    }
    return out;
  }
  const { rows } = await tickers();
  for (const c of coins) {
    if (STABLE.has(c.symbol)) continue;
    const t = rows.get(c.symbol);
    if (!t || Math.abs(t.changePct) < MOVE_THRESHOLD) continue;
    const note = await explainPriceMove({ symbol: c.symbol, changePct: t.changePct, lastThb: t.lastThb });
    out.push({ kind: "price", symbol: c.symbol, changePct: t.changePct, lastThb: t.lastThb, sample: false, note });
  }
  return out;
}
