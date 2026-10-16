import { db, nowIso } from "./db";

export type UnlockWarning = {
  tokenId: string; date: string; valueToMarketCap: number; cliffValueUsd: number; sample: boolean; sampleReason?: string;
};

const THRESHOLD = Number(process.env.UNLOCK_THRESHOLD_PCT ?? 2);
const KEY = process.env.TOKENOMIST_API_KEY;

type Event = { unlockDate: string; cliffUnlocks?: { cliffValue?: number; valueToMarketCap?: number } };

// Last call result, shown on the Integrations panel.
let status: "live" | "error" | "nokey" = KEY ? "error" : "nokey";
let lastError = "";
export const tokenomistStatus = () => ({ status, lastError });

// Labelled sample so the flow can be shown when the API isn't available.
function sample(tokenId: string, reason: string): UnlockWarning {
  const d = new Date(Date.now() + 3 * 864e5).toISOString().slice(0, 10);
  return { tokenId, date: d, valueToMarketCap: 2.8, cliffValueUsd: 0, sample: true, sampleReason: reason };
}

// Fetch upcoming unlocks for the next 7 days, cached for 24 hours per token.
export async function upcomingUnlock(tokenId: string): Promise<UnlockWarning | null> {
  if (!KEY) return sample(tokenId, "no Tokenomist key set");
  const cached = db.prepare("SELECT payload, fetched_at FROM unlock_cache WHERE token_id = ?").get(tokenId) as
    | { payload: string; fetched_at: string }
    | undefined;
  let events: Event[];
  if (cached && Date.now() - new Date(cached.fetched_at).getTime() < 864e5) {
    events = JSON.parse(cached.payload);
  } else {
    const start = new Date().toISOString().slice(0, 10);
    const end = new Date(Date.now() + 7 * 864e5).toISOString().slice(0, 10);
    try {
      const res = await fetch(`https://api.tokenomist.ai/v5/unlock/events/${tokenId}?start=${start}&end=${end}`, {
        headers: { "x-api-key": KEY },
        signal: AbortSignal.timeout(6000),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { errorMessage?: string };
        throw new Error(`HTTP ${res.status}${body.errorMessage ? `: ${body.errorMessage}` : ""}`);
      }
      const body = (await res.json()) as { data?: Event[] };
      events = body.data ?? [];
      db.prepare("INSERT OR REPLACE INTO unlock_cache VALUES (?, ?, ?)").run(tokenId, JSON.stringify(events), nowIso());
      status = "live";
      lastError = "";
    } catch (e) {
      status = "error";
      lastError = (e as Error).message;
      return sample(tokenId, `Tokenomist unavailable (${lastError})`);
    }
  }
  status = "live";
  const big = events
    .filter((e) => (e.cliffUnlocks?.valueToMarketCap ?? 0) >= THRESHOLD)
    .sort((a, b) => a.unlockDate.localeCompare(b.unlockDate))[0];
  if (!big) return null;
  return {
    tokenId,
    date: big.unlockDate.slice(0, 10),
    valueToMarketCap: big.cliffUnlocks?.valueToMarketCap ?? 0,
    cliffValueUsd: big.cliffUnlocks?.cliffValue ?? 0,
    sample: false,
  };
}
