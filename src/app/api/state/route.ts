import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { activity, ledgerView, portfolio } from "@/lib/ledger";
import { monthToDate } from "@/lib/forecast";
import { listCoins } from "@/lib/coins";
import { chainConfigured } from "@/lib/chain";
import { tokenomistStatus } from "@/lib/tokenomist";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const user = db.prepare("SELECT id, name, tier, monthly_budget_thb AS budget FROM users WHERE id = 1").get();
  const pf = await portfolio();
  return NextResponse.json({
    user,
    portfolio: pf,
    month: monthToDate(1),
    coins: listCoins(),
    activity: activity(),
    ledger: ledgerView(),
    integrations: {
      claude: Boolean(process.env.ANTHROPIC_API_KEY),
      bitkub: pf.live,
      tokenomist: tokenomistStatus().status === "live",
      elevenlabs: Boolean(process.env.ELEVENLABS_API_KEY),
      avalanche: chainConfigured(),
      warningSource: (process.env.WARNING_SOURCE ?? "bitkub").toLowerCase(),
    },
  });
}
