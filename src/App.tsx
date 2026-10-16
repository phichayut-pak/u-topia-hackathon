import { useEffect, useRef, useState } from 'react';
import { Bell, CreditCard, LayoutDashboard, LogOut, ScanLine, Send, User, Wallet, X } from 'lucide-react';
import { Dashboard } from './Dashboard';
import { SecondaryPages } from './SecondaryPages';
import { ReceiveModal } from './ReceiveModal';
import { WorkspaceIconButton } from './components/WorkspaceIconButton';
import { UBotPage } from './ubot/UBotPage';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Scan', path: '/dashboard/scan', icon: ScanLine },
  { name: 'Wallets', path: '/dashboard/wallets', icon: Wallet },
  { name: 'Pay', path: '/dashboard/pay', icon: Send },
  { name: 'Card', path: '/dashboard/cards', icon: CreditCard },
  { name: 'Profile', path: '/dashboard/profile', icon: User },
];

export function App() {
  const [path, setPath] = useState(location.pathname === '/' ? '/dashboard' : location.pathname + location.search);
  const [receiveOpen, setReceiveOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const logoutRef = useRef<HTMLDialogElement>(null);
  const [unread, setUnread] = useState(5);
  const route = path.split('?')[0];
  useEffect(() => {
    if (location.pathname === '/') history.replaceState(null, '', '/dashboard');
    const update = () => { setPath(location.pathname + location.search); setReceiveOpen(false); window.scrollTo(0, 0); };
    window.addEventListener('popstate', update);
    return () => window.removeEventListener('popstate', update);
  }, []);
  useEffect(() => {
    const update = () => {
      try {
        const read = JSON.parse(localStorage.getItem('utopia-read-notifications') || '[]');
        setUnread(Array.isArray(read) ? Math.max(0, 5 - read.length) : 5);
      } catch { setUnread(5); }
    };
    update(); window.addEventListener('utopia-notifications-read', update);
    return () => window.removeEventListener('utopia-notifications-read', update);
  }, []);
  useEffect(() => {
    const name = route.split('/').at(-1);
    document.title = `${route === '/ubot' ? 'UBot' : route.startsWith('/dashboard/scan') || name === 'snap-to-pay' ? 'Scan · Snap-to-Pay × Ubot' : name === 'dashboard' ? 'Dashboard' : name === 'sign-in' ? 'Account' : name === 'cards' ? 'Card' : (name ?? 'Dashboard').replace(/^./, letter => letter.toUpperCase())} | U-Topia`;
  }, [path]);
  useEffect(() => {
    if (logoutOpen) logoutRef.current?.showModal();
    else logoutRef.current?.close();
  }, [logoutOpen]);
  const navigate = (url: string) => {
    history.pushState(null, '', url); setPath(url); setReceiveOpen(false); window.scrollTo(0, 0);
  };
  if (route === '/sign-in') return <div className="sign-in-page">
    <a className="brand" href="/dashboard" onClick={event => { event.preventDefault(); navigate('/dashboard'); }}><img src="/assets/logo.png" alt="U-Topia" /><span><span>U-Topia</span></span></a>
    <main className="p-2"><div className="sign-in-card"><img src="/assets/logo.png" alt="U-Topia" /><h1>Welcome</h1><form onSubmit={event => { event.preventDefault(); navigate('/dashboard'); }}><label>Email<input type="email" placeholder="you@example.com" required /></label><label>Password<input type="password" placeholder="••••••••" required /></label><button className="button-primary">Login</button></form></div></main>
  </div>;
  return <>
    <header className="app-header">
      <div className="top-bar">
        <a className="brand" href="/dashboard" onClick={event => { event.preventDefault(); navigate('/dashboard'); }}><img src="/assets/logo-96.webp" srcSet="/assets/logo-48.webp 1x, /assets/logo-96.webp 2x" alt="U-Topia" width="40" height="40" /><span><span>U-Topia</span></span></a>
        <div className="account-controls">
          <div className="account-text"><p>Peraga Puangtong</p><p>personal.puangtong.t@gmail.com</p></div>
          <WorkspaceIconButton label="Open profile" className="avatar-button" onClick={() => navigate('/dashboard/profile')}><span>PP</span></WorkspaceIconButton>
          {route !== '/dashboard/profile' && <WorkspaceIconButton label={unread ? `${unread} unread notifications` : 'Notifications'} className="notification-button" onClick={() => navigate('/dashboard/notifications')}><Bell />{unread > 0 && <span className="notification-badge">{unread}</span>}</WorkspaceIconButton>}
          <WorkspaceIconButton label="Logout" className="logout-button" onClick={() => setLogoutOpen(true)}><LogOut /></WorkspaceIconButton>
        </div>
      </div>
      <nav aria-label="Main navigation"><div className="main-nav-group"><a className="ubot-nav-tab" href="/ubot" aria-current={route === '/ubot' ? 'page' : undefined} onClick={event => { event.preventDefault(); navigate('/ubot'); }}><img src="/assets/ubot-orb.svg" alt="" width="20" height="20" aria-hidden="true" />UBot</a><div className="nav-pill">
        {navItems.map(({ name, path: href, icon: Icon }) => {
          const legacyScan = route === '/dashboard/pay/snap-to-pay';
          const active = name === 'Dashboard' ? route === href : name === 'Scan' ? route.startsWith(href) || legacyScan : route.startsWith(href) && !legacyScan || (name === 'Wallets' && route === '/dashboard/swap');
          return <a className={`nav-tab ${active ? 'active' : ''}`} href={href} key={name} title={name} aria-current={active ? 'page' : undefined} onClick={event => { event.preventDefault(); navigate(href); }}><Icon strokeWidth={active ? 2.35 : 2} /><span>{name}</span></a>;
        })}
      </div></div></nav>
    </header>
    <main className={`page-shell p-2${route === '/ubot' ? ' ubot-shell' : ''}`}>
      {route === '/ubot' ? <UBotPage /> : route === '/dashboard' ? <Dashboard navigate={navigate} onReceive={() => setReceiveOpen(true)} /> : <SecondaryPages key={path} path={path} navigate={navigate} onReceive={() => setReceiveOpen(true)} />}
    </main>
    {receiveOpen && <ReceiveModal onClose={() => setReceiveOpen(false)} />}
    <dialog ref={logoutRef} className="confirmation-dialog" aria-labelledby="logout-title" onCancel={() => setLogoutOpen(false)} onClick={event => { if (event.target === event.currentTarget) setLogoutOpen(false); }}>
      <div className="confirmation-heading"><h2 id="logout-title">Logout</h2><WorkspaceIconButton label="Close" onClick={() => setLogoutOpen(false)}><X /></WorkspaceIconButton></div><p>Are you sure you want to log out?</p><div className="confirmation-actions"><button onClick={() => setLogoutOpen(false)}>Cancel</button><button className="button-primary" onClick={() => { setLogoutOpen(false); navigate('/sign-in'); }}>Logout</button></div>
    </dialog>
  </>;
}
