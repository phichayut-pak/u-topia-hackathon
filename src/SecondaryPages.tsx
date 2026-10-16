import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowDownRight, ArrowLeft, ArrowLeftRight, ArrowUpRight, AtSign, Bell, Camera, ChevronDown, ChevronRight, CircleHelp, CircleUserRound, Eye, EyeOff, Fingerprint, Info, Lock, LogOut, RefreshCw, ScanLine, Search, Send, ShieldCheck, Sparkles, Users, Wallet, WalletCards, X } from 'lucide-react'
import { WorkspaceIconButton } from './components/WorkspaceIconButton'
import { baht, useUReady } from './uready/client'
import { PayQR } from './uready/PayQR'
import { Holdings, SpendingPanel } from './uready/WalletExtras'
import { RecentPayments } from './Dashboard'

type Props = { path: string; navigate: (path: string) => void; onReceive: () => void }
type Navigate = Props['navigate']

function PageHeader({ title, subtitle, back, navigate, small = false, children }: { title: string; subtitle?: ReactNode; back?: string; navigate: Navigate; small?: boolean; children?: ReactNode }) {
  return <header className={`secondary-heading ${small ? 'small-heading' : ''}`}>
    {back && <WorkspaceIconButton className="secondary-icon-button back-button" label="Go back" onClick={() => navigate(back)}><ArrowLeft size={20} /></WorkspaceIconButton>}
    <div><h1>{title}</h1>{subtitle && <p>{subtitle}</p>}</div>{children}
  </header>
}

function Segments({ labels, selected, onSelect, counts }: { labels: string[]; selected: string; onSelect: (label: string) => void; counts?: Record<string, number> }) {
  return <div className="secondary-segments" role="tablist">{labels.map(label => <button role="tab" aria-selected={selected === label} key={label} className={selected === label ? 'active' : ''} onClick={() => onSelect(label)}>{label}{!!counts?.[label] && <span>{counts[label]}</span>}</button>)}</div>
}

function Empty({ title, subtitle, icon }: { title: string; subtitle: string; icon?: ReactNode }) {
  return <div className="secondary-empty">{icon && <span className="empty-icon">{icon}</span>}<h3>{title}</h3><p>{subtitle}</p></div>
}

function LocalDialog({ title, children, close }: { title: string; children: ReactNode; close: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null)
  useEffect(() => {
    const dialog = dialogRef.current
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog?.showModal()
    return () => {
      dialog?.close()
      document.body.style.overflow = previousOverflow
      if (previousFocus?.isConnected) previousFocus.focus()
    }
  }, [])
  return <dialog ref={dialogRef} aria-label={title} className="secondary-dialog-overlay" onCancel={event => { event.preventDefault(); close() }} onClick={event => { if (event.target === event.currentTarget) close() }}><section className="secondary-dialog"><WorkspaceIconButton className="secondary-icon-button dialog-close" label="Close" onClick={close}><X size={20} /></WorkspaceIconButton><h2>{title}</h2><div>{children}</div><button className="button-primary secondary-primary" onClick={close}>Close</button></section></dialog>
}

function Wallets({ navigate, onReceive }: Pick<Props, 'navigate' | 'onReceive'>) {
  const [tab, setTab] = useState('Crypto Wallet')
  const [visible, setVisible] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const crypto = tab === 'Crypto Wallet'
  const { state, refresh: reload } = useUReady()
  function refresh() { setRefreshing(true); reload(); window.setTimeout(() => setRefreshing(false), 650) }
  const balance = crypto ? state?.portfolio.totalThb ?? 0 : state ? Math.max(0, state.user.budget - state.month.used) : 0
  return <div className="secondary-page wallets-page">
    <h1>Your Wallets</h1>
    <div className="wallet-segments"><Segments labels={['Crypto Wallet', 'Spending Wallet']} selected={tab} onSelect={setTab} /></div>
    <section className="wallet-balance"><div><h2>{crypto ? 'Crypto Balance' : 'Spending Balance'}</h2><div className="balance-actions"><button aria-label="Refresh total balance" onClick={refresh}><RefreshCw size={16} className={refreshing ? 'secondary-spin' : ''} /></button><button aria-label={visible ? 'Hide balance' : 'Show balance'} onClick={() => setVisible(!visible)}>{visible ? <Eye size={16} /> : <EyeOff size={16} />}</button></div></div><p>{visible ? baht(balance) : '••••••'}</p></section>
    <section className="wallet-actions"><button onClick={onReceive}><ArrowDownRight />Receive</button><button onClick={() => navigate('/dashboard/pay/qr')}><ScanLine />Scan</button><button onClick={() => navigate('/dashboard/swap')}><ArrowLeftRight />Swap</button><button onClick={onReceive}><ArrowUpRight />Top Up</button></section>
    {crypto && <section><h2>Holdings</h2>{state?.portfolio.holdings.length ? <Holdings state={state} /> : <Empty icon={<Wallet size={20} />} title="No holdings yet" subtitle="Your crypto assets will appear here" />}</section>}
    {!crypto && <SpendingPanel state={state} refresh={reload} />}
    <section><div className="secondary-section-heading"><h2>Recent {crypto ? 'Crypto' : 'Spending'} Transactions</h2><button className="inline-refresh" aria-label="Refresh transactions" onClick={refresh}><RefreshCw size={16} className={refreshing ? 'secondary-spin' : ''} /></button><button className="all-link" onClick={() => navigate(`/dashboard/transactions?tab=${crypto ? 'crypto' : 'cards'}`)}>All ›</button></div>{state?.activity.length ? <RecentPayments items={state.activity} limit={5} /> : <Empty title="No activity yet." subtitle="Start by making your first transaction!" />}</section>
  </div>
}

const networks = ['BNB Smart Chain', 'Ethereum', 'Polygon', 'Arbitrum', 'Base']
const tokens = ['BNB', 'USDT', 'USDC', 'ETH']
function Swap({ navigate }: { navigate: Navigate }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [amount, setAmount] = useState('')
  const [fromNetwork, setFromNetwork] = useState(networks[0])
  const [toNetwork, setToNetwork] = useState(networks[0])
  const [picker, setPicker] = useState<'from' | 'to' | null>(null)
  const [search, setSearch] = useState('')
  const [message, setMessage] = useState('')
  const tokenPicker = (side: 'from' | 'to', value: string) => <button className="token-selector" onClick={() => { setPicker(side); setSearch('') }}><span className={value ? '' : 'muted'}>{value || 'Select Token'}</span><ChevronDown size={16} /></button>
  const networkPicker = (network: string, change: (value: string) => void) => <label className="network-selector"><span className="network-coin">◈</span><select aria-label="Network" value={network} onChange={event => change(event.target.value)}>{networks.map(item => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label>
  return <div className="secondary-page swap-page">
    <PageHeader title="Swap" small subtitle={<><Info size={14} />Platform fee: <span className="orange">2.50%</span></>} back="/dashboard/wallets" navigate={navigate} />
    <h2>I want to <span className="orange">Swap Tokens</span></h2>
    <section className="swap-panel"><div className="swap-token-row">{tokenPicker('from', from)}<input aria-label="Amount to swap" inputMode="decimal" placeholder="0.00" value={amount} onChange={event => setAmount(event.target.value.replace(/[^0-9.]/g, ''))} /></div><div className="swap-balance"><span>Balance: 0</span><button onClick={() => setAmount('0')}>Max</button></div>{networkPicker(fromNetwork, setFromNetwork)}<hr /><div className="swap-token-row">{tokenPicker('to', to)}<strong>0</strong></div><div className="output-network">{networkPicker(toNetwork, setToNetwork)}</div></section>
    <button className="button-primary secondary-primary" disabled={!from || !to || !amount || Number(amount) <= 0} onClick={() => setMessage('Your wallet has insufficient balance for this swap.')}>{!from || !to ? 'Select tokens' : !amount || Number(amount) <= 0 ? 'Enter amount' : 'Review swap'}</button>
    {message && <p className="secondary-form-error" role="status">{message}</p>}
    {picker && <LocalDialog title="Select Token" close={() => setPicker(null)}><label className="secondary-search"><Search size={18} /><input autoFocus placeholder="Search token" value={search} onChange={event => setSearch(event.target.value)} /></label><div className="token-options">{tokens.filter(token => token.toLowerCase().includes(search.toLowerCase())).map(token => <button key={token} onClick={() => { picker === 'from' ? setFrom(token) : setTo(token); setPicker(null); setMessage('') }}><span className="token-symbol">{token[0]}</span><strong>{token}</strong><small>Balance: 0</small></button>)}</div></LocalDialog>}
  </div>
}

function Pay({ navigate }: { navigate: Navigate }) {
  return <div className="secondary-page pay-page"><PageHeader title="Pay" subtitle="Choose how you want to send" navigate={navigate} /><div className="pay-options">{[{ title: 'Scan Thai QR', subtitle: 'Pay any PromptPay QR from your crypto', icon: ScanLine, route: 'qr' }, { title: 'Send to U-tag', subtitle: 'Send to any U-tag user', icon: AtSign, route: 'u-tag' }, { title: 'Send crypto', subtitle: 'Send crypto on chain', icon: Send, route: 'crypto' }].map(({ title, subtitle, icon: Icon, route }) => <button key={route} onClick={() => navigate(`/dashboard/pay/${route}`)}><span className="pay-option-icon"><Icon size={20} /></span><span><strong>{title}</strong><small>{subtitle}</small></span><ChevronRight size={20} className="muted" /></button>)}</div></div>
}

function SendUTag({ navigate }: { navigate: Navigate }) {
  const [query, setQuery] = useState('')
  return <div className="secondary-page utag-page"><PageHeader title="Send to U-Tag" subtitle="Search by username or pick a contact" back="/dashboard/pay" navigate={navigate} /><label className="secondary-search utag-search"><Search size={16} /><input type="search" placeholder="Search @username" autoComplete="off" spellCheck={false} value={query} onChange={event => setQuery(event.target.value)} /></label><section><h2>U-TOPIA CONTACTS</h2><div className="contacts-empty"><span><Users size={28} /></span><h3>{query ? 'No matching contacts' : 'No U-topia contacts yet'}</h3><p>{query ? `No saved contact matches “${query}”.` : 'Search by U-Tag above to find friends on U-topia'}</p></div></section></div>
}

function SendCrypto({ navigate }: { navigate: Navigate }) {
  const [address, setAddress] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [notice, setNotice] = useState('')
  const valid = /^0x[a-fA-F0-9]{40}$/.test(address)
  async function paste() { try { setAddress((await navigator.clipboard.readText()).trim().slice(0, 42)); setNotice('') } catch { setNotice('Paste your wallet address into the destination field.') } }
  return <div className="secondary-page crypto-send-page"><PageHeader title="Destination" back="/dashboard/pay" navigate={navigate}><WorkspaceIconButton className="secondary-icon-button scan-button" label="Scan QR code" onClick={() => setNotice('Enter or paste a wallet address. QR scanning is unavailable.')}><ScanLine size={20} /></WorkspaceIconButton></PageHeader><div className="destination-field"><label htmlFor="pay-destination">Destination</label><div><input id="pay-destination" placeholder="0x…" maxLength={42} autoComplete="off" spellCheck={false} value={address} onChange={event => { setAddress(event.target.value); setNotice('') }} /><button onClick={paste}>Paste</button></div><p>Paste or scan the wallet address you want to send to</p>{address && !valid && <p className="secondary-form-error">Enter a valid 42-character wallet address.</p>}</div><label className="acknowledge"><input type="checkbox" checked={accepted} onChange={event => setAccepted(event.target.checked)} /><span>I acknowledge that sending funds to the wrong address may result in permanent loss of funds.</span></label><button className="button-primary secondary-primary" disabled={!valid || !accepted} onClick={() => setNotice('Your crypto wallet has no available assets to send.')}>Continue</button>{notice && <p role="status" className="secondary-notice">{notice}</p>}</div>
}

function Cards() {
  const [show, setShow] = useState(false)
  return <div className="secondary-page cards-page"><h1>Card</h1><div className="card-preview"><section><div><p>PERAGA PUANGTONG</p><strong>VISA</strong></div><p className="card-number">•••• •••• •••• ••••</p><div><p>U-topia</p><p>Expire: --/--</p></div></section><div className="card-dim" /><div className="verify-overlay"><div><span><ShieldCheck size={28} /></span><h3>Verify Your Identity</h3><p>Complete identity verification to unlock your card and spending features.</p><button onClick={() => setShow(true)}>Continue</button></div></div></div>{show && <LocalDialog title="Verify Your Identity" close={() => setShow(false)}><p>Identity verification is currently unavailable. Please try again later to unlock your card and spending features.</p></LocalDialog>}</div>
}

const notifications = [
  { title: 'New Login . Google', text: "A new login to your account was detected. If this wasn't you, secure your account immediately.", time: '11:57 AM', day: 'Today' },
  { title: 'Wallet created', text: 'A new embedded wallet was created on your account.', time: '4:30 PM', day: 'Yesterday' },
  { title: 'Wallet linked', text: 'A wallet was linked to your account.', time: '4:30 PM', day: 'Yesterday' },
  { title: 'U-Topia Tag Created', text: 'Wohoo! Your identity on U-Topia is now created. You have configured your U-Topia Tag. If you want to change it, please contact support at support@u-topia.com', time: '4:29 PM', day: 'Yesterday' },
  { title: 'Welcome', text: 'Welcome to U-topia! We hope to give you a meaningful journey. If you have any questions, our support team is here to help.', time: '4:29 PM', day: 'Yesterday' },
]
function Notifications({ navigate }: { navigate: Navigate }) {
  const [tab, setTab] = useState('All')
  const [read, setRead] = useState<string[]>(() => { try { return JSON.parse(localStorage.getItem('utopia-read-notifications') || '[]') } catch { return [] } })
  const [detail, setDetail] = useState<(typeof notifications)[number] | null>(null)
  function markRead(titles: string[]) { const next = Array.from(new Set([...read, ...titles])); setRead(next); localStorage.setItem('utopia-read-notifications', JSON.stringify(next)); window.dispatchEvent(new Event('utopia-notifications-read')) }
  const unread = notifications.filter(item => !read.includes(item.title)).length
  return <div className="secondary-page record-page notifications-page"><PageHeader title="Notifications" small back="/dashboard/profile" navigate={navigate} /><Segments labels={['All', 'Transactions', 'Security']} selected={tab} onSelect={setTab} counts={{ All: unread, Security: unread }} />{tab === 'Transactions' ? <Empty title="No notifications yet" subtitle="Your transaction notifications will appear here." /> : <div className="notification-groups">{['Today', 'Yesterday'].map(day => <section key={day}><div className="notification-group-heading"><h2>{day}</h2>{day === 'Today' && <button disabled={!unread} onClick={() => markRead(notifications.map(item => item.title))}>Mark all read</button>}</div><div className="notification-list">{notifications.filter(item => item.day === day).map(item => <button key={item.title} className={`notification-card ${read.includes(item.title) ? 'is-read' : ''}`} onClick={() => { markRead([item.title]); setDetail(item) }}><span className="notification-icon"><ShieldCheck size={22} /></span><span className="notification-copy"><strong>{item.title}</strong><span>{item.text}</span><small>{item.time}</small></span><span className="notification-dot">{!read.includes(item.title) && <i aria-label="Unread" />}</span></button>)}</div></section>)}</div>}{detail && <LocalDialog title={detail.title} close={() => setDetail(null)}><p>{detail.text}</p><p className="muted">{detail.day} · {detail.time}</p></LocalDialog>}</div>
}

function Transactions({ navigate, path }: { navigate: Navigate; path: string }) {
  const { state } = useUReady()
  const initial = new URLSearchParams(path.split('?')[1] || '').get('tab')
  const [tab, setTab] = useState(initial === 'crypto' ? 'Crypto' : initial === 'cards' ? 'Cards' : 'All')
  return <div className="secondary-page record-page transactions-page"><PageHeader title="Transactions" small back="/dashboard" navigate={navigate} /><Segments labels={['All', 'Crypto', 'Cards']} selected={tab} onSelect={setTab} />{tab !== 'Cards' && state?.activity.length ? <RecentPayments items={state.activity} /> : <div className="transaction-empty"><strong>No activity yet.</strong><p>Your transactions will appear here.</p></div>}</div>
}

function Profile({ navigate }: { navigate: Navigate }) {
  const [opened, setOpened] = useState('')
  const [dialog, setDialog] = useState('')
  const [photo, setPhoto] = useState('')
  const photoInput = useRef<HTMLInputElement>(null)
  const details: Record<string, ReactNode> = {
    'Personal Information': <dl><dt>Full name</dt><dd>Peraga Puangtong</dd><dt>Email Address</dt><dd>personal.puangtong.t@gmail.com</dd><dt>U-Tag</dt><dd>@tanntnny</dd></dl>,
    'Help & FAQ': <p>For help with your account, contact <a href="mailto:support@u-topia.com">support@u-topia.com</a>.</p>,
    'Legal & Privacy': <p>For privacy questions or legal requests, contact support@u-topia.com.</p>,
    'Login & Authentication': <p>Signed in with Google. To change your login method or secure your account, contact support@u-topia.com.</p>,
    'Card Security': <p>Complete identity verification to unlock your card and card security settings.</p>,
    'Manage Wallet': <><p>Manage your crypto and spending wallets.</p><button onClick={() => navigate('/dashboard/wallets')}>View wallets <ChevronRight size={16} /></button></>,
  }
  function accountRows(items: { label: string; icon: typeof Lock }[]) { return <div className="account-panel">{items.map(({ label, icon: Icon }) => <div key={label}><button className={label === 'Logout' ? 'logout-row' : ''} aria-expanded={opened === label} onClick={() => label === 'Logout' ? setDialog('Logout') : setOpened(opened === label ? '' : label)}><Icon size={20} /><span>{label}</span><ChevronRight size={20} className={opened === label ? 'expanded-chevron' : ''} /></button>{opened === label && <div className="account-detail">{details[label]}</div>}</div>)}</div> }
  return <div className="secondary-page profile-page"><div className="profile-top"><div className="profile-bell"><WorkspaceIconButton className="secondary-icon-button" label="Notifications" onClick={() => navigate('/dashboard/notifications')}><Bell size={20} /><span>5</span></WorkspaceIconButton></div><div className="profile-info"><div className="profile-avatar"><span>{photo ? <img src={photo} alt="Profile" /> : 'PP'}</span><button aria-label="Add profile photo" onClick={() => photoInput.current?.click()}><Camera size={16} /></button><input ref={photoInput} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={event => { const file = event.target.files?.[0]; if (file && file.size < 5 * 1024 * 1024) setPhoto(URL.createObjectURL(file)) }} /></div><h1>Peraga Puangtong</h1><span className="profile-tag">@ tanntnny</span><p><strong>Email Address:</strong> personal.puangtong.t@gmail.com</p><button className="verify-profile" onClick={() => setDialog('Continue Verification')}><Sparkles size={20} />Continue Verification</button></div></div><section><h2>Account</h2>{accountRows([{ label: 'Personal Information', icon: CircleUserRound }, { label: 'Help & FAQ', icon: CircleHelp }])}</section><section><h2>Account Security</h2>{accountRows([{ label: 'Legal & Privacy', icon: Lock }, { label: 'Login & Authentication', icon: Fingerprint }, { label: 'Card Security', icon: WalletCards }, { label: 'Manage Wallet', icon: ShieldCheck }, { label: 'Logout', icon: LogOut }])}</section>{dialog && <LocalDialog title={dialog} close={() => setDialog('')}><p>{dialog === 'Logout' ? 'Are you sure you want to log out?' : 'Identity verification is currently unavailable. Please try again later.'}</p>{dialog === 'Logout' && <button className="button-primary secondary-primary" onClick={() => { setDialog(''); navigate('/sign-in') }}>Logout</button>}</LocalDialog>}</div>
}

export function SecondaryPages({ path, navigate, onReceive }: Props) {
  const route = path.split('?')[0].replace(/\/$/, '')
  if (route === '/dashboard/wallets') return <Wallets navigate={navigate} onReceive={onReceive} />
  if (route === '/dashboard/swap') return <Swap navigate={navigate} />
  if (route === '/dashboard/pay/u-tag') return <SendUTag navigate={navigate} />
  if (route === '/dashboard/pay/crypto') return <SendCrypto navigate={navigate} />
  if (route === '/dashboard/pay/qr') return <PayQR navigate={navigate} />
  if (route === '/dashboard/pay') return <Pay navigate={navigate} />
  if (route === '/dashboard/card' || route === '/dashboard/cards') return <Cards />
  if (route === '/dashboard/profile') return <Profile navigate={navigate} />
  if (route === '/dashboard/notifications') return <Notifications navigate={navigate} />
  if (route === '/dashboard/transactions') return <Transactions key={path} navigate={navigate} path={path} />
  return <Pay navigate={navigate} />
}
