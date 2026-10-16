import Database from "better-sqlite3";
import fs from "node:fs";
import path from "node:path";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY, name TEXT NOT NULL, wallet_address TEXT,
  tier TEXT NOT NULL, monthly_budget_thb REAL NOT NULL
);
CREATE TABLE IF NOT EXISTS holdings (
  user_id INTEGER NOT NULL, symbol TEXT NOT NULL, name TEXT NOT NULL,
  amount REAL NOT NULL CHECK (amount >= 0), PRIMARY KEY (user_id, symbol)
);
CREATE TABLE IF NOT EXISTS coin_order (
  user_id INTEGER NOT NULL, position INTEGER NOT NULL, symbol TEXT NOT NULL,
  tokenomist_id TEXT, never_spend INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (user_id, symbol)
);
CREATE TABLE IF NOT EXISTS payments (
  id TEXT PRIMARY KEY, idempotency_key TEXT NOT NULL UNIQUE, user_id INTEGER NOT NULL,
  amount_thb REAL NOT NULL, qr_raw TEXT, payee_kind TEXT, payee_id TEXT, payee_name TEXT,
  coin_symbol TEXT, coin_amount REAL, rate_thb REAL,
  status TEXT NOT NULL CHECK (status IN ('reserved','sent','confirmed','failed')),
  latency_ms INTEGER, tx_hash TEXT, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS ledger_entries (
  id INTEGER PRIMARY KEY AUTOINCREMENT, ref TEXT NOT NULL, account TEXT NOT NULL,
  delta_thb REAL NOT NULL, created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS spend_history (user_id INTEGER NOT NULL, day TEXT NOT NULL, category TEXT NOT NULL, amount_thb REAL NOT NULL);
CREATE TABLE IF NOT EXISTS payee_directory (payee_id TEXT PRIMARY KEY, registered_name TEXT NOT NULL, kind TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS unlock_cache (token_id TEXT PRIMARY KEY, payload TEXT NOT NULL, fetched_at TEXT NOT NULL);
`;

// Deterministic pseudo-random so the demo looks the same on every reset.
function rng(seed: number) {
  return () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };
}

export function seed(d: Database.Database) {
  d.exec(`DELETE FROM users; DELETE FROM holdings; DELETE FROM coin_order; DELETE FROM payments;
          DELETE FROM ledger_entries; DELETE FROM spend_history; DELETE FROM payee_directory;`);
  d.prepare("INSERT INTO users VALUES (1, 'Nok', ?, 'Plus', 30000)").run(process.env.DEMO_USER_ADDRESS ?? null);

  // Sample portfolio for the demo user.
  const holdings: [string, string, number][] = [
    ["USDT", "Tether USD", 850],
    ["USDC", "USD Coin", 400],
    ["ARB", "Arbitrum", 1500],
    ["BTC", "Bitcoin", 0.02],
  ];
  const insH = d.prepare("INSERT INTO holdings VALUES (1, ?, ?, ?)");
  for (const h of holdings) insH.run(...h);

  const coins: [number, string, string | null, number][] = [
    [1, "USDT", null, 0],
    [2, "USDC", null, 0],
    [3, "ARB", process.env.WATCH_TOKEN_ID ?? "arbitrum", 0],
    [4, "BTC", null, 1],
  ];
  const ins = d.prepare("INSERT INTO coin_order VALUES (1, ?, ?, ?, ?)");
  for (const c of coins) ins.run(...c);

  // Test payees. Placeholder IDs that real banks reject, so printed demo QRs can't pay a real person.
  d.prepare("INSERT INTO payee_directory VALUES (?, ?, ?)").run("000000000000001", "Noodle Shop Soi 11", "shop");
  d.prepare("INSERT INTO payee_directory VALUES (?, ?, ?)").run("000000000000002", "Kafae Boran Cart", "shop");
  d.prepare("INSERT INTO payee_directory VALUES (?, ?, ?)").run("0000000099", "Somchai S.", "person");

  // 60 days of everyday Bangkok spending (sample), weekends a little higher.
  const r = rng(42);
  const cats: [string, number, number][] = [
    ["Food", 380, 260],
    ["Transport", 160, 140],
    ["Coffee", 90, 60],
    ["Groceries", 300, 400],
    ["Shopping", 0, 900],
  ];
  const insS = d.prepare("INSERT INTO spend_history VALUES (1, ?, ?, ?)");
  const today = new Date();
  for (let i = 60; i >= 1; i--) {
    const day = new Date(today.getTime() - i * 864e5);
    const weekend = day.getDay() === 0 || day.getDay() === 6;
    for (const [cat, base, spread] of cats) {
      if (cat === "Shopping" && r() > 0.25) continue;
      if (cat === "Groceries" && r() > 0.45) continue;
      const amt = Math.round((base + r() * spread) * (weekend ? 1.35 : 1));
      if (amt > 0) insS.run(day.toISOString().slice(0, 10), cat, amt);
    }
  }
  // Past payments to the noodle stall, so the payee check has real history.
  const insP = d.prepare(
    `INSERT INTO payments (id, idempotency_key, user_id, amount_thb, qr_raw, payee_kind, payee_id, payee_name,
       coin_symbol, coin_amount, rate_thb, status, latency_ms, created_at)
     VALUES (?, ?, 1, 60, NULL, 'ewallet', '000000000000001', 'Noodle Shop Soi 11', 'USDT', ?, 33.5, 'confirmed', 900, ?)`,
  );
  for (let i = 1; i <= 6; i++) insP.run("PAY-HIST" + i, "hist-" + i, 60 / 33.5, new Date(today.getTime() - i * 3 * 864e5).toISOString());
}

declare global {
  var __ureadyDb: Database.Database | undefined;
}

function open() {
  const dir = process.env.DATA_DIR ?? path.join(process.cwd(), "data");
  fs.mkdirSync(dir, { recursive: true });
  const d = new Database(path.join(dir, "uready-v2.db"));
  d.pragma("busy_timeout = 5000"); // wait instead of failing if another process holds the lock
  d.pragma("journal_mode = WAL");
  d.exec(SCHEMA);
  d.transaction(() => {
    const has = d.prepare("SELECT COUNT(*) AS n FROM users").get() as { n: number };
    if (has.n === 0) seed(d);
  })();
  return d;
}

function getDb(): Database.Database {
  return globalThis.__ureadyDb ?? (globalThis.__ureadyDb = open());
}

// Opened lazily on first use, so `next build` (which loads routes in parallel workers) never touches the database.
export const db: Database.Database = new Proxy({} as Database.Database, {
  get(_target, prop) {
    const real = getDb();
    const value = Reflect.get(real, prop, real);
    return typeof value === "function" ? value.bind(real) : value;
  },
});

export const nowIso = () => new Date().toISOString();
export const newId = (prefix: string) => `${prefix}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
