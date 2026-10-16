'use client'

import { useEffect, useReducer, useRef } from 'react'
import { ArrowLeft, ArrowRight, AudioLines, Check, CheckCheck, ChevronRight, CircleCheck, Clock3, Coffee, LockKeyhole, Mic, QrCode, ReceiptText, RotateCcw, ScanLine, Send, ShieldCheck, Sparkles, Users, Wallet, X } from 'lucide-react'
import { WorkspaceIconButton } from '@/components/WorkspaceIconButton'
import { contacts, demoReducer, initialState, money, receipt, receivingWallet, splitDraft, type Action, type Stage } from './model'

const stageCopy: Record<Stage, string> = {
  scan: 'Ready to scan a sample QR', scanning: 'Reading the sample QR…', review: 'Sample bill ready for review', paying: 'Simulating your payment…',
  paid: 'Demo payment complete. Ready to split.', ready: 'Tap the microphone to try the voice demo', listening: 'Listening to your demo voice message…',
  resolving: 'Matching Daniel and Lora to saved demo wallets…', 'split-review': 'Review the wallets and amounts before sending', sent: 'Demo repayment requests created. Awaiting payment.',
}

export function SnapToPay({ navigate, embedded = false }: { navigate: (path: string) => void; embedded?: boolean }) {
  const [state, dispatch] = useReducer(demoReducer, initialState)
  const focusTarget = useRef<HTMLHeadingElement>(null)
  const { stage } = state
  const draft = splitDraft(state.selected)
  const prePayment = ['scan', 'scanning', 'review', 'paying'].includes(stage)
  const hasTranscript = ['resolving', 'split-review', 'sent'].includes(stage)
  const ubotActive = !prePayment && stage !== 'paid'
  const step = ['scan', 'scanning'].includes(stage) ? 0 : prePayment ? 1 : 2

  useEffect(() => {
    const timed: Partial<Record<Stage, { delay: number; action: Action }>> = {
      scanning: { delay: 1100, action: { type: 'SCANNED' } }, paying: { delay: 1100, action: { type: 'PAID' } },
      listening: { delay: 2400, action: { type: 'TRANSCRIBED' } }, resolving: { delay: 1400, action: { type: 'RESOLVED' } },
    }
    const next = timed[stage]
    if (!next) return
    const timer = window.setTimeout(() => dispatch(next.action), next.delay)
    return () => window.clearTimeout(timer)
  }, [stage])

  useEffect(() => {
    if (['review', 'paid', 'ready', 'split-review', 'sent'].includes(stage)) {
      focusTarget.current?.focus({ preventScroll: true })
      if (ubotActive && window.matchMedia('(max-width: 760px)').matches) {
        focusTarget.current?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' })
      }
    }
  }, [stage, ubotActive])

  return <div className="snap-page">
    <header className="snap-heading">
      <div className="snap-heading-main">
        {!embedded && <WorkspaceIconButton label="Back to Pay" onClick={() => navigate('/dashboard/pay')}><ArrowLeft /></WorkspaceIconButton>}
        <div><p className="snap-eyebrow">U-TOPIA / EVERYDAY MONEY</p><h1>Snap. Pay. Share.</h1></div>
      </div>
      <WorkspaceIconButton label="Restart demo" onClick={() => dispatch({ type: 'RESET' })}><RotateCcw /></WorkspaceIconButton>
    </header>
    <div className="snap-intro"><p>You cover dinner. Ubot takes care of the split.</p><span className="snap-demo-badge"><span />Interactive demo · no money moves</span></div>

    <ol className="snap-progress" aria-label="Payment progress">{['Snap the QR', 'Pay the bill', 'Split with Ubot'].map((label, i) => <li key={label} className={i === step ? 'current' : i < step ? 'complete' : ''} aria-current={i === step ? 'step' : undefined}><span>{i < step ? <Check size={14} /> : `0${i + 1}`}</span>{label}{i < 2 && <ChevronRight size={15} />}</li>)}</ol>

    <div className="snap-workspace">
      <section className="snap-payment" aria-label="QR payment">
        <div className="snap-panel-heading"><span><ScanLine size={18} /> SNAP-TO-PAY</span><span className="snap-small-label">THB</span></div>
        {['scan', 'scanning'].includes(stage) ? <>
          <div className={`snap-viewfinder ${stage === 'scanning' ? 'is-scanning' : ''}`}>
            <div className="snap-camera-grid" />
            <span className="snap-camera-label"><span />SAMPLE VIEWFINDER</span>
            <div className="snap-paper"><span className="snap-shop-symbol"><Coffee size={24} /></span><strong>Sukhumvit Table</strong><small>GOOD FOOD. BETTER COMPANY.</small><div className="snap-qr-frame"><img src="/assets/qr-snap-demo.svg" alt="Non-payment demo QR code" width="136" height="136" /><i /><i /><i /><i /></div><span className="snap-paper-price">฿1,200.00</span><span className="snap-paper-footer">SAMPLE BILL · TABLE 08</span></div>
            {stage === 'scanning' && <div className="snap-scan-beam" />}
            <span className="snap-viewfinder-caption"><LockKeyhole size={12} />Sample image · camera stays off</span>
          </div>
          <div className="snap-payment-body"><h2 ref={focusTarget} tabIndex={-1}>A little snap. Dinner, paid.</h2><p>Try this dinner bill to see how it works.</p><button className="snap-primary" disabled={stage === 'scanning'} onClick={() => dispatch({ type: 'SCAN' })}><ScanLine size={18} />{stage === 'scanning' ? 'Reading QR…' : 'Scan sample QR'}{stage === 'scan' && <ArrowRight size={18} />}</button><span className="snap-footnote">No camera or microphone permission needed.</span></div>
        </> : <div className="snap-payment-body snap-receipt-body">
          {!prePayment && <span className="snap-paid-icon"><CheckCheck size={24} /></span>}
          <p className="snap-eyebrow">{prePayment ? 'REVIEW YOUR BILL' : 'DEMO PAYMENT COMPLETE'}</p>
          <h2 ref={!ubotActive ? focusTarget : undefined} tabIndex={-1}>{prePayment ? receipt.merchant : 'Dinner is taken care of.'}</h2>
          <p>{prePayment ? receipt.description : receipt.merchant + ' · Table 08'}</p>
          <div className="snap-receipt-total">{money(receipt.totalMinor)}<span>THB</span></div>
          <div className="snap-bill-lines">{receipt.items.map(item => <div key={item.name}><span>{item.name}</span><span>{money(item.amountMinor)}</span></div>)}</div>
          <dl className="snap-payment-details"><div><dt>Paid from</dt><dd><Wallet size={14} />Demo spending wallet</dd></div><div><dt>Payment fee</dt><dd>฿0</dd></div><div><dt>Reference</dt><dd>{receipt.id}</dd></div></dl>
          {prePayment ? <><div className="snap-assurance"><ShieldCheck size={16} /><span>Sample merchant and payment details</span></div><button className="snap-primary" disabled={stage === 'paying'} onClick={() => dispatch({ type: 'PAY' })}>{stage === 'paying' ? 'Simulating payment…' : 'Confirm demo payment · ฿1,200'}<ArrowRight size={17} /></button><button className="snap-text-button" disabled={stage === 'paying'} onClick={() => dispatch({ type: 'RETAKE' })}>Back to scanner</button></> : <><div className="snap-paid-stamp"><CircleCheck size={15} />Paid · simulated</div>{stage === 'paid' ? <button className="snap-primary snap-purple" onClick={() => dispatch({ type: 'OPEN_UBOT' })}><Sparkles size={17} />Split with Ubot<ArrowRight size={17} /></button> : <div className="snap-attached-note"><ReceiptText size={16} /><span>This receipt is attached to Ubot</span><Check size={14} /></div>}</>}
        </div>}
      </section>

      <section className={`snap-ubot ${ubotActive ? 'is-active' : ''}`} aria-label="Ubot bill splitting">
        <div className="snap-ubot-header"><div><img src="/assets/ubot-logo.svg" alt="u.bot" width="77" height="28" /><span className="snap-online-dot" /></div><span className="snap-small-label">YOUR EVERYDAY ASSISTANT</span></div>
        {!ubotActive ? <div className="snap-ubot-welcome"><div className="snap-orb-halo"><img src="/assets/ubot-orb.svg" alt="" width="148" height="148" /></div><span className="snap-ubot-eyebrow">A LITTLE HELP FROM UBOT</span><h2>One bill.<br />One sentence.</h2><p>“Split this bill with Daniel and Lora.”</p><div className="snap-people"><span className="snap-avatar you">Y</span><span className="snap-avatar daniel">D</span><span className="snap-avatar lora">L</span><span>Dinner, shared fairly.</span></div><div className="snap-ubot-promise"><span><ReceiptText size={15} />Remembers the bill</span><span><Users size={15} />Finds your people</span><span><ShieldCheck size={15} />Asks before sending</span></div><span className="snap-unlock-note"><LockKeyhole size={13} />{stage === 'paid' ? 'Your receipt is ready. Open Ubot to split.' : 'Complete the demo payment to get started'}</span></div> : <div className="snap-chat">
          <div className="snap-context-chip"><ReceiptText size={15} /><span>{receipt.merchant}<strong>{money(receipt.totalMinor)} · Paid</strong></span><Check size={14} /></div>
          <div className="snap-bot-message"><span className="snap-bot-avatar"><img src="/assets/ubot-orb.svg" alt="" width="30" height="30" /></span><div><span className="snap-message-author">Ubot</span><p>Dinner’s paid. Tell me who you’d like to split it with — I’ll find their wallets and work out everyone’s share.</p></div></div>
          {stage === 'ready' && <div className="snap-voice-prompt"><h2 ref={focusTarget} tabIndex={-1}>Just say the names.</h2><p>Try: “Split this bill with Daniel and Lora.”</p><button className="snap-mic" aria-label="Start simulated voice message" onClick={() => dispatch({ type: 'START_VOICE' })}><Mic size={25} /></button><small>Tap to try the simulated voice</small></div>}
          {stage === 'listening' && <div className="snap-listening"><div className="snap-wave" aria-hidden="true">{Array.from({ length: 17 }, (_, i) => <i key={i} style={{ animationDelay: `${i * 70}ms`, height: `${12 + ((i * 13) % 32)}px` }} />)}</div><strong>Listening…</strong><span>Simulated voice · your microphone is off</span><button className="snap-text-button" onClick={() => dispatch({ type: 'CANCEL' })}>Cancel voice message</button></div>}
          {hasTranscript && <div className="snap-user-message"><span><AudioLines size={15} />VOICE MESSAGE · DEMO</span><p>Split this bill with Daniel and Lora.</p><small><CheckCheck size={13} />Transcribed</small></div>}
          {stage === 'resolving' && <div className="snap-resolving"><Sparkles size={16} className="snap-pulse" />Finding Daniel and Lora’s demo wallets…<button aria-label="Cancel wallet matching" onClick={() => dispatch({ type: 'CANCEL' })}><X size={15} /></button></div>}
          {stage === 'split-review' && <div className="snap-split-card">
            <div className="snap-split-heading"><div><span className="snap-eyebrow">READY FOR YOUR REVIEW</span><h2 ref={focusTarget} tabIndex={-1}>Split it {draft.participants.length + 1} ways.</h2></div><span className="snap-equal-badge">Equal split</span></div>
            <p>I matched Daniel and Lora to your saved demo contacts. Check the wallets before I send.</p>
            <div className="snap-share-row"><span className="snap-avatar you">Y</span><span><strong>You</strong><small>Your share · already paid</small></span><strong>{money(draft.yourShareMinor)}</strong></div>
            {draft.participants.map(contact => <div className="snap-share-row" key={contact.id}><span className={`snap-avatar ${contact.id}`}>{contact.name[0]}</span><span><strong>{contact.name}<span className="snap-wallet-match"><Check size={10} />Matched</span></strong><small>{contact.handle} · {contact.wallet}</small></span><strong>{money(draft.shareMinor)}</strong></div>)}
            <details className="snap-edit"><summary>Edit people</summary><fieldset><legend>Include in the split</legend>{contacts.map(contact => <label key={contact.id}><input type="checkbox" checked={state.selected.includes(contact.id)} onChange={() => dispatch({ type: 'TOGGLE', id: contact.id })} />{contact.name} <span>{contact.handle}</span></label>)}</fieldset></details>
            <div className="snap-destination"><Wallet size={16} /><span>Repayments go to your wallet<strong>{receivingWallet}</strong></span></div>
            <div className="snap-request-total"><span>Total to request</span><strong>{money(draft.requestTotalMinor)}</strong></div>
            <p className="snap-approval-note"><ShieldCheck size={14} />You approve every request. No automatic transfers.</p>
            <button className="snap-primary snap-purple" disabled={!draft.participants.length} onClick={() => dispatch({ type: 'CONFIRM' })}><Send size={16} />Confirm {draft.participants.length} {draft.participants.length === 1 ? 'request' : 'requests'} · {money(draft.requestTotalMinor)}</button>
            <button className="snap-text-button" onClick={() => dispatch({ type: 'CANCEL' })}>Cancel split</button>
          </div>}
          {stage === 'sent' && <div className="snap-sent-card"><span className="snap-sent-check"><CheckCheck size={24} /></span><h2 ref={focusTarget} tabIndex={-1}>Your part? Already done.</h2><p>{state.requests.length === 2 ? 'Daniel and Lora have' : `${state.requests[0]?.contact.name} has`} a demo request. You’ll see when each share is paid.</p><div className="snap-sent-total"><strong>{money(state.requests.reduce((sum, request) => sum + request.amountMinor, 0))}</strong><span>requested · simulated</span></div><div className="snap-request-list">{state.requests.map(request => <div key={request.id}><span className={`snap-avatar ${request.contact.id}`}>{request.contact.name[0]}</span><span><strong>{request.contact.name}</strong><small><Clock3 size={12} />{request.status}</small></span><strong>{money(request.amountMinor)}</strong></div>)}</div><div className="snap-destination"><Wallet size={16} /><span>Receiving wallet<strong>{receivingWallet}</strong></span></div><p className="snap-demo-disclosure">Demo only. No messages or payment requests were sent.</p><button className="snap-primary snap-purple" onClick={() => dispatch({ type: 'RESET' })}><RotateCcw size={16} />Try the demo again</button></div>}
        </div>}
        <div className="snap-ubot-footer"><ShieldCheck size={13} /><span>Your money. Your people. Your say.</span></div>
      </section>
    </div>
    <div className="snap-status" role="status" aria-live="polite">{stageCopy[stage]}</div>
    <footer className="snap-page-footer"><span><QrCode size={14} />Snap-to-Pay × Ubot</span><span>Built around your everyday.</span></footer>
  </div>
}
