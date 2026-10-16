import QRCode from "qrcode";
import { sampleQRs } from "@/lib/thaiqr";

export const dynamic = "force-dynamic";

// Printable sheet of test QR codes for the stage demo.
export default async function Sheet() {
  const items = await Promise.all(sampleQRs().map(async (q) => ({ ...q, image: await QRCode.toDataURL(q.raw, { margin: 2, width: 520 }) })));
  return (
    <main className="sheet">
      <p style={{ gridColumn: "1 / -1", margin: 0, fontWeight: 700 }}>
        TEST QR CODES FOR THE U-READY DEMO ONLY. They use placeholder IDs that real banks reject. Do not scan with a banking app.
      </p>
      {items.map((q) => (
        <figure key={q.key}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={q.image} alt={`Test QR: ${q.label}`} />
          <figcaption>
            <b>{q.label}</b>
            <br />
            <small>Demo only · not a real payee</small>
          </figcaption>
        </figure>
      ))}
    </main>
  );
}
