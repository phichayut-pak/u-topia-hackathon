import { NextResponse } from "next/server";
import { coinMarket, coinWarnings, listCoins, setOrder } from "@/lib/coins";
import { MOVE_THRESHOLD } from "@/lib/pricemoves";
import { log } from "@/lib/events";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  const [warnings, { market, live }] = await Promise.all([coinWarnings(), coinMarket()]);
  return NextResponse.json({ coins: listCoins(), warnings, market, marketLive: live, threshold: MOVE_THRESHOLD });
}

export async function POST(req: Request) {
  try {
    const { order, never } = (await req.json()) as { order: string[]; never: string[] };
    const coins = setOrder(order, never ?? []);
    log("info", `You set the spending order: ${order.join(" → ")}${never?.length ? ` · never: ${never.join(", ")}` : ""}`);
    return NextResponse.json({ coins });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 400 });
  }
}
