'use client'
import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, CircleCheck, ShieldAlert, ShieldCheck } from 'lucide-react'
import Scanner from '@/components/Scanner'
import { WorkspaceIconButton } from '@/components/WorkspaceIconButton'
import { AiTag, api, baht, CoinIcon, coinAmt, type Quote, type Sample, type ScanResult } from './client'

type Props = { navigate: (path: string) => void }
type Success = { id: string; amount: number; payee: string; symbol: string; coinAmount: number; rate: number; latency?: number; explorer?: string }

// Scan any Thai QR (PromptPay) and pay it from crypto: the shop receives baht, the user's coin is deducted at the live rate.
export function PayQR({ navigate }: Props) {
  const [samples, setSamples] = useState<Sample[]>([])
  const [scanning, setScanning] = useState(true)
  const [scan, setScan] = useState<{ raw: string; result: ScanResult; key: string } | null>(null)
  const [amount, setAmount] = useState('')
  const [quote, setQuote] = useState<Quote>(null)
  const [error, setError] = useState('')
  const [dup, setDup] = useState(false)
  const [paying, setPaying] = useState(false)
  const [success, setSuccess] = useState<Success | null>(null)
  const payId = useRef<string | null>(null)

  useEffect(() => {
    api.samples().then(j => setSamples(j.items)).catch(() => {})
    const es = new EventSource('/api/events')
    es.onmessage = m => {
      const e = JSON.parse(m.data)
      if (e.id !== payId.current) return
      if (e.type === 'payment' && e.status === 'confirmed') { setSuccess(s => (s ? { ...s, latency: e.latencyMs } : s)); setPaying(false) }
      if (e.type === 'chain') setSuccess(s => (s ? { ...s, explorer: e.explorer } : s))
    }
    return () => es.close()
  }, [])

  async function onScan(raw: string) {
    setScanning(false); setError(''); setDup(false); setAmount(''); setQuote(null)
    const result = await api.scan(raw)
    setScan({ raw, result, key: crypto.randomUUID() })
    if (result.ok && result.qr.amount) setQuote((await api.quote(result.qr.amount)).quote)
  }

  async function changeAmount(value: string) {
    const v = value.replace(/[^0-9.]/g, '')
    setAmount(v)
    setQuote(Number(v) > 0 ? (await api.quote(Number(v))).quote : null)
  }

  async function pay() {
    if (!scan?.result.ok) return
    setPaying(true); setError('')
    const res = await api.pay(scan.raw, scan.key, Number(amount) || undefined)
    if (!res.ok) { setError(res.error); setPaying(false); return }
    if (res.duplicate) { setDup(true); return }
    payId.current = res.id
    setSuccess({ id: res.id, amount: scan.result.qr.amount ?? Number(amount), payee: scan.result.registered?.registered_name ?? scan.result.qr.name, symbol: res.symbol, coinAmount: res.coinAmount, rate: res.rateThb })
  }

  function again() { setScan(null); setSuccess(null); setScanning(true) }

  const r = scan?.result

  if (success) return <div className="secondary-page ur-page">
    <div className="ur-success">
      <span className="ur-check"><CircleCheck size={44} /></span>
      <h1>{baht(success.amount)} paid</h1>
      <p className="muted">to {success.payee}</p>
      <dl className="ur-receipt">
        <div><dt>From your crypto wallet</dt><dd><strong>−{coinAmt(success.coinAmount, success.symbol)} {success.symbol}</strong></dd></div>
        <div><dt>Rate</dt><dd>{baht(success.rate)} / {success.symbol}</dd></div>
        <div><dt>Time</dt><dd>{success.latency ? `${(success.latency / 1000).toFixed(1)} s` : 'Confirming…'}</dd></div>
        <div><dt>Payout to shop</dt><dd><span className="ur-tag sim">simulated PromptPay</span></dd></div>
      </dl>
      {success.explorer && <a className="ur-link" href={success.explorer} target="_blank" rel="noreferrer">View on Snowtrace (Avalanche Fuji)</a>}
      {dup && <p className="ur-note warn">Second tap ignored: charged once.</p>}
      <button className="button-primary secondary-primary" onClick={() => navigate('/dashboard')}>Done</button>
      <button className="ur-secondary" onClick={again}>Scan another QR</button>
    </div>
  </div>

  return <div className="secondary-page ur-page">
    <header className="secondary-heading">
      <WorkspaceIconButton className="secondary-icon-button back-button" label="Go back" onClick={() => navigate('/dashboard/pay')}><ArrowLeft size={20} /></WorkspaceIconButton>
      <div><h1>Scan to Pay</h1><p>Pay any Thai QR from your crypto</p></div>
    </header>

    {!scan && <>
      {scanning && <Scanner onScan={onScan} />}
      <section className="ur-demo">
        <h2>Demo QR codes</h2>
        <p className="muted">Test codes only. They use placeholder IDs that real banks reject.</p>
        <div className="ur-demo-grid">
          {samples.map(s => <button key={s.key} onClick={() => onScan(s.raw)}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={s.image} alt="" /><span>{s.label}</span>
          </button>)}
        </div>
      </section>
    </>}

    {r && !r.ok && <section className="ur-card danger">
      <div className="ur-merchant"><span className="ur-avatar danger"><ShieldAlert size={22} /></span><div><strong>Can&apos;t pay this QR</strong><p className="muted">{r.reason}.</p></div></div>
      <button className="button-primary secondary-primary" onClick={again}>Scan again</button>
    </section>}

    {r && r.ok && r.verdict === 'warn' && <section className="ur-card danger">
      <div className="ur-merchant"><span className="ur-avatar danger">{(r.registered?.registered_name ?? '?')[0]}</span><div><strong>{r.registered?.registered_name ?? 'Unknown account'}</strong><p className="ur-bad">Personal account · not a shop</p></div></div>
      <div className="ur-note danger"><strong>Stop</strong><p>{r.note.en}</p><p lang="th">{r.note.th}</p><AiTag s={r.note.source} /></div>
      <button className="button-primary secondary-primary" onClick={() => navigate('/dashboard')}>Don&apos;t pay</button>
      <button className="ur-secondary" onClick={again}>Scan another QR</button>
    </section>}

    {r && r.ok && r.verdict === 'ok' && <section className="ur-card">
      <div className="ur-merchant">
        <span className="ur-avatar">{(r.registered?.registered_name ?? r.qr.name ?? '?')[0]}</span>
        <div><strong>{r.registered?.registered_name ?? r.qr.name}</strong><p className="ur-good"><ShieldCheck size={15} /> Verified shop{r.timesPaid ? ` · paid ${r.timesPaid}×` : ''}</p></div>
      </div>
      {r.qr.amount != null
        ? <p className="ur-amount">{baht(r.qr.amount)}</p>
        : <label className="ur-amount-input">Amount (THB)<input inputMode="decimal" placeholder="0.00" value={amount} onChange={e => changeAmount(e.target.value)} autoFocus /></label>}
      {quote
        ? <div className="ur-paywith"><CoinIcon s={quote.symbol} /><div><strong>Pay with {quote.symbol}</strong><p className="muted">at {baht(quote.rateThb)} per {quote.symbol} · live Bitkub</p></div><strong>−{coinAmt(quote.coinAmount, quote.symbol)}</strong></div>
        : (r.qr.amount != null || Number(amount) > 0) && <p className="ur-bad">Not enough crypto in your spending order.</p>}
      <div className="ur-note"><p>{r.note.en}</p><AiTag s={r.note.source} /></div>
      {error && <p className="ur-bad" role="alert">{error}</p>}
      {dup && <p className="ur-note warn">Second tap ignored: this payment is already going through (charged once).</p>}
      <button className="button-primary secondary-primary" disabled={!quote} onClick={pay}>{paying ? 'Paying…' : `Pay ${baht(r.qr.amount ?? (Number(amount) || 0))}`}</button>
      <button className="ur-secondary" onClick={again}>Cancel</button>
    </section>}
  </div>
}
