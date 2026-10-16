// Live USDT/THB from Bitkub's public API, with a labelled fallback.
const FALLBACK_RATE = 33.47;
let cache: { rate: number; at: number; live: boolean } | null = null;

export async function usdtThb(): Promise<{ rate: number; live: boolean }> {
  if (cache && Date.now() - cache.at < 60_000) return cache;
  try {
    const res = await fetch("https://api.bitkub.com/api/v3/market/ticker?sym=usdt_thb", {
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    const rows = (await res.json()) as { symbol: string; last: string }[];
    const rate = Number(rows?.[0]?.last);
    if (!Number.isFinite(rate) || rate <= 0) throw new Error("bad rate");
    cache = { rate, at: Date.now(), live: true };
  } catch {
    cache = { rate: FALLBACK_RATE, at: Date.now(), live: false };
  }
  return cache;
}

// Bitkub's published fees: 0.25% on THB pairs, ฿20 per baht withdrawal up to ฿100,000.
export const TRADE_FEE = 0.0025;
export const WITHDRAW_FEE = 20;
export const topupFee = (amountThb: number) => Math.round((amountThb * TRADE_FEE + WITHDRAW_FEE) * 100) / 100;
