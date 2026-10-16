import { NextResponse } from "next/server";
import { quote } from "@/lib/ledger";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Which coin would pay this amount, and how much of it.
export async function GET(req: Request) {
  const amount = Number(new URL(req.url).searchParams.get("amount"));
  if (!(amount > 0)) return NextResponse.json({ quote: null });
  return NextResponse.json({ quote: await quote(amount) });
}
