// Free, live 24-hour price moves from Bitkub's public ticker. Facts only: what already happened, never a forecast.
type Ticker = { symbol: string; last: string; percent_change: string };

let cache: { at: number; rows: Map<string, { lastThb: number; changePct: number }> } | null = null;
let live = false;

export async function tickers() {
  if (cache && Date.now() - cache.at < 60_000) return { rows: cache.rows, live };
  try {
    const res = await fetch("https://api.bitkub.com/api/v3/market/ticker", { cache: "no-store", signal: AbortSignal.timeout(5000) });
    const list = (await res.json()) as Ticker[];
    const rows = new Map<string, { lastThb: number; changePct: number }>();
    for (const t of list) {
      if (!t.symbol?.endsWith("_THB")) continue;
      rows.set(t.symbol.replace("_THB", ""), { lastThb: Number(t.last), changePct: Number(t.percent_change) });
    }
    cache = { at: Date.now(), rows };
    live = true;
  } catch {
    live = false;
    cache = cache ?? { at: Date.now(), rows: new Map() };
  }
  return { rows: cache.rows, live };
}

export const STABLE = new Set(["USDT", "USDC"]);
export const MOVE_THRESHOLD = Number(process.env.PRICE_MOVE_PCT ?? 5);
