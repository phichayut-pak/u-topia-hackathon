import { NextResponse } from "next/server";
import QRCode from "qrcode";
import { sampleQRs } from "@/lib/thaiqr";

export const runtime = "nodejs";

export async function GET() {
  const items = await Promise.all(
    sampleQRs().map(async (q) => ({ ...q, image: await QRCode.toDataURL(q.raw, { margin: 1, width: 360, errorCorrectionLevel: "M" }) })),
  );
  return NextResponse.json({ items });
}
