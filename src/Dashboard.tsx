import { useRef, useState } from 'react';
import { ArrowDownRight, ArrowUpRight, Eye, EyeOff, RefreshCw, ScanLine } from 'lucide-react';
import { baht, CoinIcon, coinAmt, useUReady, type Activity } from './uready/client';
import { WorkspaceIconButton } from './components/WorkspaceIconButton';

type Props = { navigate: (path: string) => void; onReceive: () => void };
type Period = '7d' | '30d' | '1y';
const periods: Period[] = ['7d', '30d', '1y'];
const titles: Record<Period, string> = { '7d': 'Weekly Spending', '30d': 'Monthly Spending', '1y': 'Yearly Spending' };

function useBalanceVisibility() {
  const [visible, setVisible] = useState(() => {
    try { return localStorage.getItem('utopia:dashboard-total:visible') !== 'false'; } catch { return true; }
  });
  return [visible, () => setVisible(current => {
    try { localStorage.setItem('utopia:dashboard-total:visible', String(!current)); } catch { /* Storage can be unavailable in private contexts. */ }
    return !current;
  })] as const;
}

export function EmptyTransactions({ transactionPage = false }: { transactionPage?: boolean }) {
  return <div className="empty-state"><p>No activity yet.</p><p>{transactionPage ? 'Your transactions will appear here.' : 'Start by making your first transaction!'}</p></div>;
}

function chartBuckets(period: Period) {
  const today = new Date();
  if (period === '1y') return Array.from({ length: 12 }, (_, i) => {
    const date = new Date(today.getFullYear(), today.getMonth() - 11 + i, 1);
    return { label: date.toLocaleDateString('en-US', { month: 'short' }), detail: date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) };
  });
  if (period === '7d') return Array.from({ length: 7 }, (_, i) => {
    const date = new Date(today); date.setDate(today.getDate() - 6 + i);
    return { label: date.toLocaleDateString('en-US', { weekday: 'short' }), detail: date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) };
  });
  return Array.from({ length: 4 }, (_, i) => {
    const start = new Date(today); start.setDate(today.getDate() - 29 + i * 8);
    const end = new Date(start); end.setDate(start.getDate() + 7);
    if (end > today) end.setTime(today.getTime());
    const dateFormat: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return { label: `Week ${i + 1}`, detail: `Week ${i + 1} · ${start.toLocaleDateString('en-US', dateFormat)} – ${end.toLocaleDateString('en-US', dateFormat)}` };
  });
}

function SpendingChart({ period }: { period: Period }) {
  const buckets = chartBuckets(period);
  return <div className="chart" role="img" aria-label={`${titles[period]}: $0.00. No spending in this period.`}>
    <div className="chart-body">
      <div className="chart-plot">
        <div className="chart-rule top" /><div className="chart-rule middle" /><div className="chart-rule bottom" />
        <div className={`chart-columns ${buckets.length > 8 ? 'many' : ''}`}>
          {buckets.map(bucket => <div className="chart-column" key={bucket.detail} tabIndex={0} aria-label={`${bucket.detail}: $0.00`}>
            <div className="chart-tooltip"><strong>$0.00</strong><span>{bucket.detail}</span></div>
            <div className="chart-bar" />
          </div>)}
        </div>
      </div>
      <div className="chart-labels">{buckets.map(bucket => <span key={bucket.detail}>{bucket.label}</span>)}</div>
    </div>
    <div className="chart-scale"><span>$100</span><span>$50</span><span>$0</span></div>
  </div>;
}

export function RecentPayments({ items, limit }: { items: Activity[]; limit?: number }) {
  const list = limit ? items.slice(0, limit) : items;
  return <div className="ur-list">{list.map(a => <div className="ur-row" key={a.id}>
    <CoinIcon s={a.coin_symbol} />
    <div className="mid"><strong>{a.payee_name}</strong><small>{new Date(a.created_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · Thai QR · {a.status}</small></div>
    <div className="right"><strong>−{baht(a.amount_thb)}</strong><small>−{coinAmt(a.coin_amount, a.coin_symbol)} {a.coin_symbol}</small></div>
  </div>)}</div>;
}

export function Dashboard({ navigate, onReceive }: Props) {
  const { state, refresh: reload } = useUReady();
  const [visible, toggleVisible] = useBalanceVisibility();
  const [period, setPeriod] = useState<Period>('30d');
  const [refreshing, setRefreshing] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const hide = (text: string) => (visible ? text : '••••••');
  const cryptoThb = state?.portfolio.totalThb ?? 0;
  const spendingLeft = state ? Math.max(0, state.user.budget - state.month.used) : 0;
  const amount = hide(baht(cryptoThb + spendingLeft));
  function refresh(section: string) {
    clearTimeout(timer.current); setRefreshing(section); setAnnouncement(''); reload();
    timer.current = setTimeout(() => { setRefreshing(null); setAnnouncement(`${section === 'balance' ? 'Balance' : 'Transactions'} updated.`); }, 650);
  }
  function changePeriod(next: Period) { setPeriod(next); }
  function tabKey(event: React.KeyboardEvent, index: number) {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % 3;
    else if (event.key === 'ArrowLeft') next = (index + 2) % 3;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = 2;
    else return;
    event.preventDefault(); changePeriod(periods[next]);
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role=tab]')[next].focus();
  }
  return <div className="page-content dashboard">
    <div className="welcome"><h1>Welcome!</h1><p>Peraga Puangtong</p></div>
    <section className="balance-card" aria-label="Wallet balances">
      <div className="balance-heading"><h2>Total Balance</h2><div className="balance-tools">
        <WorkspaceIconButton label="Refresh total balance" className={`quiet ${refreshing === 'balance' ? 'refreshing' : ''}`} onClick={() => refresh('balance')} disabled={refreshing === 'balance'}><RefreshCw /></WorkspaceIconButton>
        <WorkspaceIconButton label={visible ? 'Hide balance' : 'Show balance'} className="quiet" onClick={toggleVisible}>{visible ? <Eye /> : <EyeOff />}</WorkspaceIconButton>
      </div></div>
      <p className="total-amount" aria-live="polite">{amount}</p>
      <div className="wallet-balances"><div><p>Crypto Wallet</p><p>{hide(baht(cryptoThb))}</p></div><div><p>Spending Wallet</p><p>{hide(baht(spendingLeft))}</p></div></div>
    </section>
    <section className="quick-actions" aria-label="Wallet actions">
      <button className="ur-scan-cta" onClick={() => navigate('/dashboard/scan')}><ScanLine />Scan to Pay</button>
      <button onClick={() => navigate('/dashboard/scan/receive')}><ArrowDownRight />Receive</button>
      <button onClick={() => navigate('/dashboard/scan/swap')}><span className="swap-icon" aria-hidden="true" />Swap</button>
      <button onClick={() => navigate('/dashboard/scan/send')}><ArrowUpRight />Send</button>
    </section>
    <section className="spending-section" aria-labelledby="spending-heading">
      <h2 id="spending-heading">Spending Breakdown</h2>
      <div className="spending-card">
        <div className="spending-heading"><p>{titles[period]}</p><div className="period-tabs" role="tablist" aria-label="Spending period">
          {periods.map((item, index) => <button key={item} role="tab" aria-selected={item === period} tabIndex={item === period ? 0 : -1} onClick={() => changePeriod(item)} onKeyDown={event => tabKey(event, index)} className={item === period ? 'selected' : ''}>{item}</button>)}
        </div></div>
        <p className="spending-amount" aria-live="polite">{baht(state?.month.used ?? 0)}</p>
        <SpendingChart period={period} />
      </div>
    </section>
    <section className="transactions-section" aria-labelledby="transactions-heading">
      <div className="transactions-heading"><div><h2 id="transactions-heading">Recent Transactions</h2><WorkspaceIconButton label="Refresh transactions" onClick={() => refresh('transactions')} disabled={refreshing === 'transactions'} className={`quiet ${refreshing === 'transactions' ? 'refreshing' : ''}`}><RefreshCw /></WorkspaceIconButton></div><a href="/dashboard/transactions" onClick={event => { event.preventDefault(); navigate('/dashboard/transactions'); }}>All<span aria-hidden="true">›</span></a></div>
      {state?.activity.length ? <RecentPayments items={state.activity} limit={5} /> : <EmptyTransactions />}
    </section>
    <p className="sr-only" role="status">{announcement}</p>
  </div>;
}
