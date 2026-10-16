import { db, newId, nowIso } from "./db";
import { emit, log } from "./events";
import { parseThaiQR } from "./thaiqr";
import { tickers } from "./pricemoves";
import { settleOnChain } from "./chain";
import { monthToDate } from "./forecast";

const USER = 1;

function post(ref: string, entries: [string, number][]) {
  const sum = entries.reduce((a, [, d]) => a + d, 0);
  if (Math.abs(sum) > 0.001) throw new Error("Unbalanced ledger entry");
  const ins = db.prepare("INSERT INTO ledger_entries (ref, account, delta_thb, created_at) VALUES (?, ?, ?, ?)");
  const at = nowIso();
  for (const [acct, d] of entries) ins.run(ref, acct, d, at);
}

export type Holding = { symbol: string; name: string; amount: number; priceThb: number | null; valueThb: number | null; changePct: number | null };

export async function portfolio(userId = USER) {
  const { rows, live } = await tickers();
  const list = db.prepare("SELECT symbol, name, amount FROM holdings WHERE user_id = ? ORDER BY rowid").all(userId) as {
    symbol: string; name: string; amount: number;
  }[];
  const holdings: Holding[] = list.map((h) => {
    const t = rows.get(h.symbol);
    return { ...h, priceThb: t?.lastThb ?? null, valueThb: t ? h.amount * t.lastThb : null, changePct: t?.changePct ?? null };
  });
  const totalThb = holdings.reduce((a, h) => a + (h.valueThb ?? 0), 0);
  return { holdings, totalThb, live };
}

// Which coin pays: the first coin in the user's order (never-spend coins excluded) with enough balance.
export async function quote(amountThb: number, userId = USER) {
  const { rows } = await tickers();
  const order = db
    .prepare(
      `SELECT c.symbol, h.amount FROM coin_order c JOIN holdings h ON h.user_id = c.user_id AND h.symbol = c.symbol
       WHERE c.user_id = ? AND c.never_spend = 0 ORDER BY c.position`,
    )
    .all(userId) as { symbol: string; amount: number }[];
  for (const c of order) {
    const price = rows.get(c.symbol)?.lastThb;
    if (!price) continue;
    const coinAmount = amountThb / price;
    if (c.amount >= coinAmount) return { symbol: c.symbol, coinAmount, rateThb: price };
  }
  return null;
}

export type PayResult =
  | { ok: true; id: string; status: string; duplicate: boolean; symbol?: string; coinAmount?: number; rateThb?: number }
  | { ok: false; error: string };

// Pay a Thai QR. The shop is paid in baht (advanced by the partner) and the user's crypto is deducted at the live rate.
// Idempotent: the same key never charges twice.
export async function pay(input: { qrRaw: string; amount?: number; idempotencyKey: string }, userId = USER): Promise<PayResult> {
  const existing = db.prepare("SELECT id, status, coin_symbol, coin_amount FROM payments WHERE idempotency_key = ?").get(input.idempotencyKey) as
    | { id: string; status: string; coin_symbol: string; coin_amount: number }
    | undefined;
  if (existing) {
    log("warn", `Duplicate request ignored for ${existing.id} (same idempotency key)`);
    return { ok: true, id: existing.id, status: existing.status, duplicate: true, symbol: existing.coin_symbol, coinAmount: existing.coin_amount };
  }
  const qr = parseThaiQR(input.qrRaw);
  if (!qr.ok) return { ok: false, error: qr.reason };
  const amount = qr.amount ?? input.amount;
  if (!amount || amount <= 0 || amount > 50_000) return { ok: false, error: "Enter an amount between ฿1 and ฿50,000" };

  const { budget } = db.prepare("SELECT monthly_budget_thb AS budget FROM users WHERE id = ?").get(userId) as { budget: number };
  const used = monthToDate(userId).used;
  if (used + amount > budget) return { ok: false, error: `Over your monthly budget: ฿${Math.max(0, budget - used).toLocaleString()} left` };

  const q = await quote(amount, userId);
  if (!q) return { ok: false, error: "Not enough crypto in your spending order to cover this payment" };

  // Re-check after the await so a concurrent identical request can't double-charge.
  const again = db.prepare("SELECT id FROM payments WHERE idempotency_key = ?").get(input.idempotencyKey) as { id: string } | undefined;
  if (again) return { ok: true, id: again.id, status: "reserved", duplicate: true, symbol: q.symbol, coinAmount: q.coinAmount };

  const payee = db.prepare("SELECT registered_name FROM payee_directory WHERE payee_id = ?").get(qr.id) as { registered_name: string } | undefined;
  const payeeName = payee?.registered_name ?? (qr.name || qr.id);
  const id = newId("PAY");
  try {
    db.transaction(() => {
      const upd = db
        .prepare("UPDATE holdings SET amount = amount - ? WHERE user_id = ? AND symbol = ? AND amount >= ?")
        .run(q.coinAmount, userId, q.symbol, q.coinAmount);
      if (upd.changes !== 1) throw new Error("Balance changed, please try again");
      db.prepare(
        `INSERT INTO payments (id, idempotency_key, user_id, amount_thb, qr_raw, payee_kind, payee_id, payee_name,
           coin_symbol, coin_amount, rate_thb, status, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'reserved', ?)`,
      ).run(id, input.idempotencyKey, userId, amount, input.qrRaw, qr.kind, qr.id, payeeName, q.symbol, q.coinAmount, q.rateThb, nowIso());
      post(id, [
        [`user_crypto:${q.symbol}`, -amount],
        ["merchant_payout", amount],
      ]);
    })();
  } catch (e) {
    return { ok: false, error: (e as Error).message };
  }

  const t0 = Date.now();
  emit({ type: "payment", id, status: "reserved", amount, payee: payeeName });
  log("info", `${id}: ฿${amount} to ${payeeName} · deducted ${q.coinAmount.toFixed(4)} ${q.symbol} at ฿${q.rateThb}`);

  // Simulated partner payout (production: licensed e-money partner's PromptPay API).
  setTimeout(() => {
    db.prepare("UPDATE payments SET status = 'sent' WHERE id = ?").run(id);
    emit({ type: "payment", id, status: "sent", amount, payee: payeeName });
  }, 300);
  setTimeout(() => {
    const latency = Date.now() - t0;
    db.prepare("UPDATE payments SET status = 'confirmed', latency_ms = ? WHERE id = ?").run(latency, id);
    emit({ type: "payment", id, status: "confirmed", amount, payee: payeeName, latencyMs: latency });
    log("ok", `${id} confirmed in ${(latency / 1000).toFixed(1)} s (simulated payout)`);
    if (q.symbol === "USDT") {
      settleOnChain(q.coinAmount)
        .then((r) => {
          if (!r) return;
          db.prepare("UPDATE payments SET tx_hash = ? WHERE id = ?").run(r.txHash, id);
          emit({ type: "chain", id, txHash: r.txHash, explorer: r.explorer });
          log("ok", `${id} settled on Avalanche Fuji · ${r.txHash}`);
        })
        .catch((e) => log("error", `${id} on-chain settlement failed: ${(e as Error).message}`));
    }
  }, 700 + Math.random() * 600);

  return { ok: true, id, status: "reserved", duplicate: false, symbol: q.symbol, coinAmount: q.coinAmount, rateThb: q.rateThb };
}

export function activity(limit = 20, userId = USER) {
  return db
    .prepare(
      `SELECT id, amount_thb, payee_name, coin_symbol, coin_amount, rate_thb, status, latency_ms, tx_hash, created_at
       FROM payments WHERE user_id = ? ORDER BY created_at DESC LIMIT ?`,
    )
    .all(userId, limit);
}

export function ledgerView(limit = 30) {
  const rows = db.prepare("SELECT ref, account, delta_thb, created_at FROM ledger_entries ORDER BY id DESC LIMIT ?").all(limit);
  const total = (db.prepare("SELECT COALESCE(SUM(delta_thb),0) AS t FROM ledger_entries").get() as { t: number }).t;
  return { rows, total: Math.round(total * 100) / 100 };
}
