'use client'

import { useEffect, useReducer, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { ArrowUp, Check, Mic, Play, Square, Wallet } from 'lucide-react'
import { contacts, money, receipt, receivingWallet, splitDraft } from '@/snap-to-pay/model'

const voiceText = 'Split this bill with Daniel and Lora.'
const draft = splitDraft(contacts.map(contact => contact.id))
type Message = { id: number; role: 'user' | 'assistant'; kind: 'receipt' | 'voice' | 'split' | 'text'; text?: string }
type State = { messages: Message[]; recording: boolean; confirmed: boolean }
type Action = { type: 'record' | 'cancel' | 'voice' | 'confirm' } | { type: 'text'; text: string }
const initial: State = { recording: false, confirmed: false, messages: [
  { id: 1, role: 'assistant', kind: 'receipt' },
  { id: 2, role: 'user', kind: 'voice', text: voiceText },
  { id: 3, role: 'assistant', kind: 'split' },
] }

function reducer(state: State, action: Action): State {
  if (action.type === 'record') return { ...state, recording: true }
  if (action.type === 'cancel') return { ...state, recording: false }
  if (action.type === 'confirm') {
    if (state.confirmed) return state
    return { ...state, confirmed: true, messages: [...state.messages, { id: state.messages.length + 1, role: 'user', kind: 'text', text: 'Confirm the split.' }, { id: state.messages.length + 2, role: 'assistant', kind: 'text', text: 'Two demo requests created. ฿400 each, awaiting payment.' }] }
  }
  if (action.type === 'voice' && !state.recording) return state
  const text = action.type === 'text' ? action.text.trim() : voiceText
  if (!text) return state
  const reply = state.confirmed ? 'Daniel and Lora each have a ฿400 demo request.' : /split|daniel|lora|share/i.test(text) ? '฿400 each, including you. Check their wallets below the bill and confirm when you’re ready.' : 'The bill is ฿1,200. Your share is ฿400; Daniel and Lora owe ฿400 each.'
  return { ...state, recording: false, messages: [...state.messages,
    { id: state.messages.length + 1, role: 'user', kind: action.type === 'voice' ? 'voice' : 'text', text },
    { id: state.messages.length + 2, role: 'assistant', kind: 'text', text: reply },
  ] }
}

function Spectrum({ active = false }: { active?: boolean }) {
  return <span className={`ubot-spectrum ${active ? 'is-active' : ''}`} aria-hidden="true">{Array.from({ length: 35 }, (_, i) => <i key={i} style={{ height: `${5 + ((i * 17 + i * i * 3) % 25)}px`, animationDelay: `${(i % 7) * -0.13}s` }} />)}</span>
}

function VoiceBubble({ text }: { text: string }) {
  const [playing, setPlaying] = useState(false)
  useEffect(() => {
    if (!playing) return
    let utterance: SpeechSynthesisUtterance | undefined
    if ('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window) {
      utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'en-US'
      utterance.onend = () => setPlaying(false)
      window.speechSynthesis.cancel()
      window.speechSynthesis.speak(utterance)
    }
    const timer = window.setTimeout(() => setPlaying(false), 4000)
    return () => {
      window.clearTimeout(timer)
      if (utterance) { utterance.onend = null; utterance.onerror = null; window.speechSynthesis.cancel() }
    }
  }, [playing, text])
  return <><div className="ubot-voice-message"><button type="button" aria-label={playing ? 'Stop voice preview' : 'Play simulated voice preview'} onClick={() => setPlaying(value => !value)}>{playing ? <Square size={12} fill="currentColor" /> : <Play size={13} fill="currentColor" />}</button><Spectrum active={playing} /><span>0:04</span></div><p>{text}</p></>
}

export function UBotPage() {
  const [state, dispatch] = useReducer(reducer, initial)
  const [text, setText] = useState('')
  const log = useRef<HTMLDivElement>(null)
  const composer = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!state.recording) return
    const timer = window.setTimeout(() => dispatch({ type: 'voice' }), 2600)
    return () => window.clearTimeout(timer)
  }, [state.recording])

  useEffect(() => {
    if (log.current) log.current.scrollTop = log.current.scrollHeight
  }, [state.messages.length, state.confirmed])

  function send(event?: FormEvent) {
    event?.preventDefault()
    if (!text.trim() || state.recording) return
    dispatch({ type: 'text', text })
    setText('')
    if (composer.current) composer.current.style.height = '36px'
    composer.current?.focus()
  }
  function composerKey(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Escape' && state.recording) dispatch({ type: 'cancel' })
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) { event.preventDefault(); send() }
  }

  return <div className="ubot-chat-page">
    <div ref={log} className="ubot-conversation" role="log" aria-label="UBot demo conversation" aria-live="polite" aria-relevant="additions text" tabIndex={0}>
      {state.messages.map(message => <div key={message.id} className={`ubot-message ${message.role}`}>
        <div className="ubot-bubble">
          {message.kind === 'receipt' ? <>
            <span className="ubot-message-label">UBot <span>· Demo</span></span>
            <p>You paid this QR at Sukhumvit Table.</p>
            <div className="ubot-receipt-reminder"><img src="/assets/qr-snap-demo.svg" alt="Paid bill sample QR" width="64" height="64" /><div><strong>{receipt.merchant}</strong><span>Table 08 · Paid</span><b>{money(receipt.totalMinor)}</b></div><Check size={16} /></div>
            <dl className="ubot-bill-summary">{receipt.items.map(item => <div key={item.name}><dt>{item.name}</dt><dd>{money(item.amountMinor)}</dd></div>)}</dl>
          </> : message.kind === 'voice' ? <VoiceBubble text={message.text ?? voiceText} /> : message.kind === 'split' ? <>
            <p>Split three ways. <strong>฿400 each.</strong></p>
            <div className="ubot-wallet-profiles">{contacts.map(contact => <div className="ubot-wallet-profile" key={contact.id}><span className={`ubot-person ${contact.id}`}>{contact.name[0]}</span><div><strong>{contact.name}<Check size={12} /></strong><span>{contact.handle}</span><small><Wallet size={11} />{contact.wallet}</small></div><b>{money(draft.shareMinor)}</b></div>)}</div>
            <div className="ubot-split-destination"><span>Your share <strong>{money(draft.yourShareMinor)}</strong></span><span>Repay to <strong>{receivingWallet}</strong></span></div>
            <button type="button" className="ubot-confirm-split" disabled={state.confirmed} onClick={() => dispatch({ type: 'confirm' })}>{state.confirmed ? <><Check size={15} />Requests created · Demo</> : 'Request ฿400 from each'}</button>
          </> : <p>{message.text}</p>}
        </div>
      </div>)}
    </div>
    <form className="ubot-composer" onSubmit={send} aria-label="Chat composer">
      {state.recording ? <div className="ubot-recording" role="status"><Spectrum active /><span>Listening…</span></div> : <textarea ref={composer} rows={1} aria-label="Message UBot" placeholder="Message UBot…" value={text} onChange={event => { setText(event.target.value); event.target.style.height = 'auto'; event.target.style.height = `${Math.min(120, event.target.scrollHeight)}px` }} onKeyDown={composerKey} />}
      <button type="button" className={`ubot-composer-mic ${state.recording ? 'is-recording' : ''}`} aria-label={state.recording ? 'Finish simulated voice message' : 'Record simulated voice message'} onClick={() => dispatch({ type: state.recording ? 'voice' : 'record' })} onKeyDown={event => { if (event.key === 'Escape') dispatch({ type: 'cancel' }) }}>{state.recording ? <Square size={16} fill="currentColor" /> : <Mic size={20} />}</button>
      <button type="submit" className="ubot-composer-send" aria-label="Send message" disabled={!text.trim() || state.recording}><ArrowUp size={19} /></button>
    </form>
  </div>
}
