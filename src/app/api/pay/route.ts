import { NextResponse } from "next/server";
import { pay } from "@/lib/ledger";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = (await req.json()) as { raw: string; amount?: number; idempotencyKey: string };
  if (!body.idempotencyKey) return NextResponse.json({ ok: false, error: "Missing idempotency key" }, { status: 400 });
  const res = await pay({ qrRaw: body.raw, amount: body.amount, idempotencyKey: body.idempotencyKey });
  return NextResponse.json(res, { status: res.ok ? 200 : 400 });
}
