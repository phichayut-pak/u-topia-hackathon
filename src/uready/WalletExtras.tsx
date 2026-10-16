'use client'
import { useEffect, useState } from 'react'
import { Volume2 } from 'lucide-react'
import { AiTag, api, baht, CoinIcon, coinAmt, speakThai, type Plan, type UState, type Warning } from './client'

// Crypto Wallet tab: the user's real holdings at live Bitkub prices.
export function Holdings({ state }: { state: UState | null }) {
  if (!state) return null
  return <div className="ur-list">{state.portfolio.holdings.map(h => <div className="ur-row" key={h.symbol}>
    <CoinIcon s={h.symbol} />
    <div className="mid"><strong>{h.symbol}</strong><small>{h.name}</small></div>
    <div className="right">
      <strong>{coinAmt(h.amount, h.symbol)}</strong>
      <small>{h.valueThb != null ? baht(h.valueThb) : '—'} {h.changePct != null && <span className={h.changePct >= 0 ? 'ur-up' : 'ur-down'}>{h.changePct >= 0 ? '+' : ''}{h.changePct.toFixed(1)}%</span>}</small>
    </div>
  </div>)}</div>
}

// Spending Wallet tab: monthly budget, U-Bot budget check, and the coin order that pays for QR payments.
export function SpendingPanel({ state, refresh }: { state: UState | null; refresh: () => void }) {
  const [plan, setPlan] = useState<Plan | null>(null)
  const [warnings, setWarnings] = useState<Warning[]>([])
  const [dismissed, setDismissed] = useState<string[]>([])
  useEffect(() => { api.plan().then(setPlan).catch(() => {}); api.coins().then(c => setWarnings(c.warnings ?? [])).catch(() => {}) }, [state?.month.used])

  async function save(order: string[], never: string[]) {
    await api.setOrder(order, never); refresh(); api.coins().then(c => setWarnings(c.warnings ?? []))
  }
  function move(symbol: string, dir: -1 | 1) {
    if (!state) return
    const spend = state.coins.filter(c => !c.never).map(c => c.symbol)
    const i = spend.indexOf(symbol), j = i + dir
    if (i < 0 || j < 0 || j >= spend.length) return
    ;[spend[i], spend[j]] = [spend[j], spend[i]]
    save(spend, state.coins.filter(c => c.never).map(c => c.symbol))
  }
  function toggleNever(symbol: string) {
    if (!state) return
    const coins = state.coins.map(c => (c.symbol === symbol ? { ...c, never: !c.never } : c))
    save(coins.filter(c => !c.never).map(c => c.symbol), coins.filter(c => c.never).map(c => c.symbol))
  }
  if (!state) return null
  const used = state.month.used, budget = state.user.budget
  return <>
    <section className="ur-card ur-budget">
      <div className="ur-row" style={{ borderBottom: 0, padding: 0 }}><div className="mid"><strong>Monthly budget · {state.user.tier}</strong><small>Day {state.month.day} of {state.month.daysInMonth}</small></div><div className="right"><strong>{baht(Math.max(0, budget - used))} left</strong><small>of {baht(budget)}</small></div></div>
      <div className={`ur-bar ${plan?.pace.offPace ? 'over' : ''}`}><i style={{ width: `${Math.min(100, (used / budget) * 100)}%` }} /></div>
      {plan && <div className="ur-note"><p>{plan.explanation.en}</p><p lang="th">{plan.explanation.th}</p><div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><AiTag s={plan.explanation.source} /><button className="ur-order-btn" onClick={() => speakThai(plan.explanation.th)}><Volume2 size={14} /> Listen in Thai</button></div></div>}
    </section>
    <section>
      <h2>Spending order</h2>
      <p className="muted" style={{ fontSize: 14, marginBottom: 8 }}>QR payments use the first coin with enough balance. You choose the order; the AI never picks for you.</p>
      <div className="ur-list">{state.coins.map((c, i) => {
        const h = state.portfolio.holdings.find(x => x.symbol === c.symbol)
        return <div className="ur-row" key={c.symbol}>
          <span className="muted" style={{ width: 14 }}>{c.never ? '–' : i + 1}</span>
          <CoinIcon s={c.symbol} size={32} />
          <div className="mid"><strong>{c.symbol}</strong><small>{h ? coinAmt(h.amount, c.symbol) : ''} {h?.changePct != null && <span className={h.changePct >= 0 ? 'ur-up' : 'ur-down'}>{h.changePct >= 0 ? '+' : ''}{h.changePct.toFixed(1)}% 24h</span>}</small></div>
          {!c.never && <button className="ur-order-btn" aria-label={`Move ${c.symbol} up`} onClick={() => move(c.symbol, -1)}>↑</button>}
          {!c.never && <button className="ur-order-btn" aria-label={`Move ${c.symbol} down`} onClick={() => move(c.symbol, 1)}>↓</button>}
          <button className="ur-order-btn" onClick={() => toggleNever(c.symbol)}>{c.never ? 'Allow' : 'Never'}</button>
        </div>
      })}</div>
    </section>
    {warnings.filter(w => !dismissed.includes(w.symbol)).map(w => <section className="ur-note warn" key={w.symbol}>
      <strong>Heads up · {w.symbol}</strong><p>{w.note.en}</p><p lang="th">{w.note.th}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <AiTag s={w.note.source} />{w.kind === 'price' && <span className="ur-tag live">live Bitkub</span>}
        <button className="ur-order-btn" onClick={() => setDismissed(d => [...d, w.symbol])}>Keep</button>
        <button className="ur-order-btn" onClick={() => { move(w.symbol, 1); setDismissed(d => [...d, w.symbol]) }}>Move down</button>
      </div>
    </section>)}
  </>
}
