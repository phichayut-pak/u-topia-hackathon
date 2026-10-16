import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseThaiQR } from "@/lib/thaiqr";
import { explainPayee } from "@/lib/ai";
import { log } from "@/lib/events";

export const runtime = "nodejs";

// Parse the QR and check who really gets paid. The verdict is a fixed rule; the AI only explains it.
export async function POST(req: Request) {
  const { raw } = (await req.json()) as { raw: string };
  const qr = parseThaiQR(String(raw ?? ""));
  if (!qr.ok) {
    log("warn", `Rejected QR: ${qr.reason}`);
    return NextResponse.json({ ok: false, reason: qr.reason });
  }
  // Production: the payment rail's name inquiry. Demo: a seeded directory.
  const reg = db.prepare("SELECT registered_name, kind FROM payee_directory WHERE payee_id = ?").get(qr.id) as
    | { registered_name: string; kind: string }
    | undefined;
  const timesPaid = (
    db.prepare("SELECT COUNT(*) AS n FROM payments WHERE payee_id = ? AND status = 'confirmed'").get(qr.id) as { n: number }
  ).n;
  const verdict: "ok" | "warn" = reg && reg.kind === "shop" ? "ok" : "warn";
  const note = await explainPayee({
    verdict,
    qrName: qr.name,
    registeredName: reg?.registered_name ?? "an unknown account",
    registeredKind: reg?.kind ?? "unknown",
    timesPaid,
    amount: qr.amount,
  });
  log(verdict === "ok" ? "ok" : "warn", `Payee check: ${verdict === "ok" ? "verified shop" : "possible swapped QR"} (${qr.kind} ${qr.id})`);
  return NextResponse.json({ ok: true, qr, registered: reg ?? null, timesPaid, verdict, note });
}
