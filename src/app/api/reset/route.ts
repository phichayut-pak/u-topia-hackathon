import { NextResponse } from "next/server";
import { db, seed } from "@/lib/db";
import { log } from "@/lib/events";

export const runtime = "nodejs";

// Resets the demo data so the stage demo always starts the same way.
export async function POST() {
  db.transaction(() => seed(db))();
  log("info", "Demo data reset");
  return NextResponse.json({ ok: true });
}
