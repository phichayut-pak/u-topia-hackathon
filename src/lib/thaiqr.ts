// Thai QR (EMVCo merchant-presented mode) for PromptPay: build, checksum, parse.
// Spec reference: BOT Thai QR Payment standard; tag 29 = PromptPay credit transfer, tag 30 = bill payment.

export const PROMPTPAY_AID = "A000000677010111";
export const BILLPAY_AID = "A000000677010112";

export function crc16(input: string): string {
  let crc = 0xffff;
  for (let i = 0; i < input.length; i++) {
    crc ^= input.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
      crc &= 0xffff;
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, "0");
}

const tlv = (id: string, value: string) => id + String(value.length).padStart(2, "0") + value;

export type PayeeKind = "phone" | "nationalId" | "ewallet" | "biller";

export function buildPromptPay(opts: { kind: "phone" | "nationalId" | "ewallet"; id: string; amount?: number; name?: string }): string {
  const sub =
    opts.kind === "phone"
      ? tlv("01", "0066" + opts.id.replace(/^0/, ""))
      : opts.kind === "nationalId"
        ? tlv("02", opts.id)
        : tlv("03", opts.id);
  let p = tlv("00", "01") + tlv("01", opts.amount ? "12" : "11") + tlv("29", tlv("00", PROMPTPAY_AID) + sub) + tlv("53", "764");
  if (opts.amount) p += tlv("54", opts.amount.toFixed(2));
  p += tlv("58", "TH");
  if (opts.name) p += tlv("59", opts.name);
  p += "6304";
  return p + crc16(p);
}

function parseTLV(s: string): Record<string, string> {
  const out: Record<string, string> = {};
  let i = 0;
  while (i < s.length) {
    const id = s.slice(i, i + 2);
    const len = parseInt(s.slice(i + 2, i + 4), 10);
    if (Number.isNaN(len) || i + 4 + len > s.length) throw new Error("Malformed QR data");
    out[id] = s.slice(i + 4, i + 4 + len);
    i += 4 + len;
  }
  return out;
}

export type ParsedQR =
  | { ok: true; kind: PayeeKind; id: string; ref1?: string; ref2?: string; amount: number | null; name: string; dynamic: boolean }
  | { ok: false; reason: string };

export function parseThaiQR(raw: string): ParsedQR {
  const s = raw.trim();
  if (s.length < 12 || s.slice(-8, -4) !== "6304") return { ok: false, reason: "This isn't a Thai QR payment code" };
  if (crc16(s.slice(0, -4)) !== s.slice(-4).toUpperCase())
    return { ok: false, reason: "Checksum mismatch: the QR was altered or damaged" };
  let t: Record<string, string>;
  try {
    t = parseTLV(s);
  } catch {
    return { ok: false, reason: "The QR data is malformed" };
  }
  if (t["53"] && t["53"] !== "764") return { ok: false, reason: "This QR isn't in Thai baht" };
  const amount = t["54"] ? Number(t["54"]) : null;
  const name = t["59"] ?? "";
  const dynamic = t["01"] === "12";

  if (t["29"]) {
    const pp = parseTLV(t["29"]);
    if (pp["00"] !== PROMPTPAY_AID) return { ok: false, reason: "Unknown payment network" };
    if (pp["01"]) return { ok: true, kind: "phone", id: "0" + pp["01"].slice(4), amount, name, dynamic };
    if (pp["02"]) return { ok: true, kind: "nationalId", id: pp["02"], amount, name, dynamic };
    if (pp["03"]) return { ok: true, kind: "ewallet", id: pp["03"], amount, name, dynamic };
    return { ok: false, reason: "PromptPay QR without a payee ID" };
  }
  if (t["30"]) {
    const bp = parseTLV(t["30"]);
    if (bp["00"] !== BILLPAY_AID) return { ok: false, reason: "Unknown bill-payment network" };
    return { ok: true, kind: "biller", id: bp["01"] ?? "", ref1: bp["02"], ref2: bp["03"], amount, name, dynamic };
  }
  return { ok: false, reason: "Not a PromptPay or bill-payment QR" };
}

// Demo QR codes used on the printable sheet and the "sample" buttons.
export function sampleQRs() {
  const noodle = buildPromptPay({ kind: "ewallet", id: "000000000000001", amount: 60, name: "NOODLE SHOP SOI 11" });
  const swapped = buildPromptPay({ kind: "phone", id: "0000000099", amount: 60, name: "NOODLE SHOP SOI 11" });
  const damaged = noodle.replace("540560.00", "540590.00"); // amount edited, old checksum kept
  const coffee = buildPromptPay({ kind: "ewallet", id: "000000000000002", name: "KAFAE BORAN" }); // static, no amount
  return [
    { key: "noodle", label: "Noodle stall · ฿60", raw: noodle },
    { key: "coffee", label: "Coffee cart · any amount", raw: coffee },
    { key: "swapped", label: "Swapped sticker", raw: swapped },
    { key: "damaged", label: "Damaged QR", raw: damaged },
  ];
}
