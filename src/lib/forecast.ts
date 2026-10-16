import { db } from "./db";
import { topupFee } from "./rates";

type Row = { day: string; total: number };

// Baseline spending forecast: average spend for each weekday over the last 8 weeks.
export function forecastWeek(userId: number, extraTripThb = 0) {
  const rows = db
    .prepare(
      `SELECT day, SUM(amount_thb) AS total FROM spend_history
       WHERE user_id = ? AND day >= date('now', '-56 day') GROUP BY day`,
    )
    .all(userId) as Row[];
  const byDow: number[][] = [[], [], [], [], [], [], []];
  for (const r of rows) byDow[new Date(r.day + "T00:00:00").getDay()].push(r.total);
  const avg = byDow.map((xs) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : 0));
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(Date.now() + i * 864e5);
    return { date: d.toISOString().slice(0, 10), expected: Math.round(avg[d.getDay()]) };
  });
  const week = days.reduce((a, d) => a + d.expected, 0) + extraTripThb;
  const dailyAvg = Math.round(rows.reduce((a, r) => a + r.total, 0) / Math.max(1, rows.length));
  return { days, week, dailyAvg };
}

export function monthToDate(userId: number) {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
  const hist = db
    .prepare("SELECT COALESCE(SUM(amount_thb),0) AS s FROM spend_history WHERE user_id = ? AND day >= ?")
    .get(userId, monthStart) as { s: number };
  const paid = db
    .prepare(
      "SELECT COALESCE(SUM(amount_thb),0) AS s FROM payments WHERE user_id = ? AND status != 'failed' AND qr_raw IS NOT NULL AND created_at >= ?",
    )
    .get(userId, monthStart) as { s: number };
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const day = now.getDate();
  const used = Math.round(hist.s + paid.s);
  const projected = Math.round((used / Math.max(1, day - 1 || 1)) * daysInMonth);
  return { used, day, daysInMonth, projected };
}

// How much to prepare now, and what batching saves versus daily top-ups.
export function planTopup(weekNeed: number, potBalance: number, dailyAvg: number, remainingBudget = Infinity) {
  const wanted = Math.max(0, Math.ceil((weekNeed - potBalance) / 500) * 500);
  const amount = Math.max(0, Math.min(wanted, Math.floor((remainingBudget - potBalance) / 500) * 500));
  const dailyTopups = 7;
  const perDay = Math.ceil(weekNeed / dailyTopups / 50) * 50;
  const dailyFee = Math.round(dailyTopups * topupFee(perDay));
  const batchedFee = amount > 0 ? Math.round(topupFee(amount)) : 0;
  return {
    amount,
    cappedByBudget: amount < wanted,
    batchedFee,
    dailyFee,
    saved: Math.max(0, dailyFee - batchedFee),
    batchedPct: amount ? +((batchedFee / amount) * 100).toFixed(2) : 0,
    dailyPct: weekNeed ? +((dailyFee / weekNeed) * 100).toFixed(2) : 0,
    dailyAvg,
  };
}
