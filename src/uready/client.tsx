'use client'
import { useCallback, useEffect, useState } from 'react'

// Client for the U-Ready API (Next.js route handlers under /api).

export type Bilingual = { en: string; th: string; source: 'claude' | 'template' }
export type Coin = { symbol: string; position: number; never: boolean }
export type Holding = { symbol: string; name: string; amount: number; priceThb: number | null; valueThb: number | null; changePct: number | null }
export type Activity = {
  id: string; amount_thb: number; payee_name: string; coin_symbol: string; coin_amount: number; rate_thb: number
  status: string; latency_ms: number | null; tx_hash: string | null; created_at: string
}
export type UState = {
  user: { name: string; tier: string; budget: number }
  portfolio: { holdings: Holding[]; totalThb: number; live: boolean }
  month: { used: number; day: number; daysInMonth: number; projected: number }
  coins: Coin[]
  activity: Activity[]
  integrations: { claude: boolean; bitkub: boolean; elevenlabs: boolean; avalanche: boolean }
}
export type Plan = { pace: { budget: number; used: number; remaining: number; projected: number; offPace: boolean; daysLeft: number }; explanation: Bilingual }
export type Warning =
  | { kind: 'price'; symbol: string; changePct: number; lastThb: number; sample: false; note: Bilingual }
  | { kind: 'unlock'; symbol: string; date: string; valueToMarketCap: number; sample: boolean; note: Bilingual }
export type ScanResult =
  | { ok: false; reason: string }
  | { ok: true; qr: { kind: string; id: string; amount: number | null; name: string }; registered: { registered_name: string; kind: string } | null; timesPaid: number; verdict: 'ok' | 'warn'; note: Bilingual }
export type Quote = { symbol: string; coinAmount: number; rateThb: number } | null
export type Sample = { key: string; label: string; raw: string; image: string }

export const baht = (n: number) => '฿' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
export const bahtShort = (n: number) => '฿' + Math.round(n).toLocaleString('en-US')
export const coinAmt = (n: number, sym: string) => (sym === 'BTC' ? n.toFixed(6) : n.toLocaleString('en-US', { maximumFractionDigits: 4 }))
export const COIN_COLORS: Record<string, string> = { USDT: '#26A17B', USDC: '#2775CA', ARB: '#2D9CDB', BTC: '#F7931A' }

const json = (r: Response) => r.json()
export const api = {
  state: (): Promise<UState> => fetch('/api/state').then(json),
  plan: (): Promise<Plan> => fetch('/api/plan').then(json),
  coins: (): Promise<{ warnings: Warning[] }> => fetch('/api/coins').then(json),
  setOrder: (order: string[], never: string[]) => fetch('/api/coins', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ order, never }) }).then(json),
  samples: (): Promise<{ items: Sample[] }> => fetch('/api/samples').then(json),
  scan: (raw: string): Promise<ScanResult> => fetch('/api/scan', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ raw }) }).then(json),
  quote: (amount: number): Promise<{ quote: Quote }> => fetch('/api/quote?amount=' + amount).then(json),
  pay: (raw: string, idempotencyKey: string, amount?: number) =>
    fetch('/api/pay', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ raw, amount, idempotencyKey }) }).then(json),
  reset: () => fetch('/api/reset', { method: 'POST' }).then(json),
}

// Shared live state: refetches whenever the server reports a payment.
export function useUReady() {
  const [state, setState] = useState<UState | null>(null)
  const refresh = useCallback(() => api.state().then(setState).catch(() => {}), [])
  useEffect(() => {
    refresh()
    const es = new EventSource('/api/events')
    es.onmessage = m => { const e = JSON.parse(m.data); if (e.type !== 'log') refresh() }
    return () => es.close()
  }, [refresh])
  return { state, refresh }
}

export function CoinIcon({ s, size = 36 }: { s: string; size?: number }) {
  return <span className="ur-coin" style={{ background: COIN_COLORS[s] ?? '#4b5563', width: size, height: size }}>{s.slice(0, 4)}</span>
}

export function AiTag({ s }: { s: 'claude' | 'template' }) {
  return <span className={`ur-tag ${s === 'claude' ? 'ai' : 'sim'}`}>U-Bot · {s === 'claude' ? 'Claude' : 'template'}</span>
}

export async function speakThai(text: string) {
  try {
    const res = await fetch('/api/voice?text=' + encodeURIComponent(text))
    if (res.ok) { await new Audio(URL.createObjectURL(await res.blob())).play(); return }
  } catch { /* fall back to the browser voice */ }
  try { const u = new SpeechSynthesisUtterance(text); u.lang = 'th-TH'; speechSynthesis.cancel(); speechSynthesis.speak(u) } catch { /* no voice available */ }
}
