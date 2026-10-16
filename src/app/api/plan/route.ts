import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forecastWeek, monthToDate } from "@/lib/forecast";
import { portfolio } from "@/lib/ledger";
import { listCoins } from "@/lib/coins";
import { explainBudget } from "@/lib/ai";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// AI budget update: pace for the month, the week ahead, and which coin pays.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const trip = url.searchParams.get("trip") ?? undefined;
  const tripThb = Math.max(0, Math.min(20000, Number(url.searchParams.get("tripThb") ?? 0) || 0));
  const { budget } = db.prepare("SELECT monthly_budget_thb AS budget FROM users WHERE id = 1").get() as { budget: number };
  const m = monthToDate(1);
  const fc = forecastWeek(1, tripThb);
  const { holdings } = await portfolio();
  const first = listCoins().find((c) => !c.never)?.symbol ?? "USDT";
  const firstCoinThb = Math.round(holdings.find((h) => h.symbol === first)?.valueThb ?? 0);
  const remaining = Math.max(0, budget - m.used);
  const daysLeft = m.daysInMonth - m.day + 1;
  const explanation = await explainBudget({
    dailyAvg: fc.dailyAvg, week: fc.week, budget, used: m.used, remaining, projected: m.projected,
    daysLeft, firstCoin: first, firstCoinThb, trip,
  });
  return NextResponse.json({
    pace: { budget, used: m.used, remaining, projected: m.projected, offPace: m.projected > budget, day: m.day, daysInMonth: m.daysInMonth, daysLeft },
    forecast: fc,
    firstCoin: first,
    explanation,
  });
}
