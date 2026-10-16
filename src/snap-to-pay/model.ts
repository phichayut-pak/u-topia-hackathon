export type BillReceipt = {
  id: string
  merchant: string
  description: string
  currency: 'THB'
  totalMinor: number
  items: { name: string; amountMinor: number }[]
}

export type ContactWallet = { id: string; name: string; handle: string; wallet: string }
export type SplitDraft = { participants: ContactWallet[]; shareMinor: number; yourShareMinor: number; requestTotalMinor: number }
export type RepaymentRequest = { id: string; contact: ContactWallet; amountMinor: number; destination: string; status: 'Awaiting payment' }

export const receipt: BillReceipt = {
  id: 'DEMO-1200', merchant: 'Sukhumvit Table', description: 'Dinner with good company', currency: 'THB', totalMinor: 120000,
  items: [{ name: 'Dinner for three', amountMinor: 76000 }, { name: 'Drinks', amountMinor: 28000 }, { name: 'Dessert', amountMinor: 16000 }],
}
export const contacts: ContactWallet[] = [
  { id: 'daniel', name: 'Daniel', handle: '@daniel', wallet: 'U-Wallet · DEMO-D204' },
  { id: 'lora', name: 'Lora', handle: '@lora', wallet: 'U-Wallet · DEMO-L809' },
]
export const receivingWallet = '@you · U-Wallet · DEMO-Y001'
export const money = (minor: number) => '฿' + (minor / 100).toLocaleString('en-US', { maximumFractionDigits: 2 })

export type Stage = 'scan' | 'scanning' | 'review' | 'paying' | 'paid' | 'ready' | 'listening' | 'resolving' | 'split-review' | 'sent'
export type DemoState = { stage: Stage; selected: string[]; requests: RepaymentRequest[] }
export const initialState: DemoState = { stage: 'scan', selected: contacts.map(c => c.id), requests: [] }
export type Action = { type: 'SCAN' | 'SCANNED' | 'RETAKE' | 'PAY' | 'PAID' | 'OPEN_UBOT' | 'START_VOICE' | 'TRANSCRIBED' | 'RESOLVED' | 'CANCEL' | 'CONFIRM' | 'RESET' } | { type: 'TOGGLE'; id: string }

export function splitDraft(selected: string[]): SplitDraft {
  const participants = contacts.filter(c => selected.includes(c.id))
  const shareMinor = Math.floor(receipt.totalMinor / (participants.length + 1))
  return { participants, shareMinor, yourShareMinor: receipt.totalMinor - shareMinor * participants.length, requestTotalMinor: shareMinor * participants.length }
}

export function demoReducer(state: DemoState, action: Action): DemoState {
  if (action.type === 'RESET') return { ...initialState, selected: [...initialState.selected] }
  if (action.type === 'TOGGLE') {
    if (state.stage !== 'split-review' || !contacts.some(c => c.id === action.id)) return state
    return { ...state, selected: state.selected.includes(action.id) ? state.selected.filter(id => id !== action.id) : [...state.selected, action.id] }
  }
  if (action.type === 'CANCEL' && ['listening', 'resolving', 'split-review'].includes(state.stage)) return { ...state, stage: 'ready' }
  if (action.type === 'START_VOICE' && state.stage === 'ready') return { ...state, stage: 'listening', selected: contacts.map(contact => contact.id) }
  if (action.type === 'CONFIRM') {
    if (state.stage !== 'split-review') return state
    const draft = splitDraft(state.selected)
    if (!draft.participants.length) return state
    return { ...state, stage: 'sent', requests: draft.participants.map(contact => ({ id: `${receipt.id}-${contact.id}`, contact, amountMinor: draft.shareMinor, destination: receivingWallet, status: 'Awaiting payment' })) }
  }
  const transitions: Partial<Record<Stage, { action: Action['type']; next: Stage }>> = {
    scan: { action: 'SCAN', next: 'scanning' }, scanning: { action: 'SCANNED', next: 'review' },
    review: action.type === 'RETAKE' ? { action: 'RETAKE', next: 'scan' } : { action: 'PAY', next: 'paying' },
    paying: { action: 'PAID', next: 'paid' }, paid: { action: 'OPEN_UBOT', next: 'ready' },
    listening: { action: 'TRANSCRIBED', next: 'resolving' },
    resolving: { action: 'RESOLVED', next: 'split-review' },
  }
  const transition = transitions[state.stage]
  return transition?.action === action.type ? { ...state, stage: transition.next } : state
}
