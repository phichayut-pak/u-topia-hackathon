import { useEffect, useRef, useState } from 'react';
import { AtSign, Check, ChevronDown, Copy, Download, Info, QrCode, Share2, X } from 'lucide-react';
import { WorkspaceIconButton } from './components/WorkspaceIconButton';

const address = '0x1F0a33d4B8860E43Bf4cd1B33F59E9bfc51c9Aa7';
const networks = ['BNB Smart Chain', 'Ethereum', 'Base', 'Polygon'];
const tokens = ['USDC', 'USDT', 'BNB'];

export function ReceiveModal({ onClose, embedded = false }: { onClose: () => void; embedded?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const [method, setMethod] = useState<'crypto' | 'utag'>('crypto');
  const [network, setNetwork] = useState(networks[0]);
  const [token, setToken] = useState(tokens[0]);
  const [selector, setSelector] = useState<'network' | 'token' | null>(null);
  const [copied, setCopied] = useState(false);
  const [status, setStatus] = useState('');
  const isCrypto = method === 'crypto';
  const qrPath = isCrypto ? '/assets/qr-crypto.svg' : '/assets/qr-utag.svg';
  useEffect(() => {
    if (embedded) return;
    const dialog = ref.current;
    const oldOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog?.showModal();
    return () => { dialog?.close(); document.body.style.overflow = oldOverflow; };
  }, [embedded]);
  async function copy() {
    try { await navigator.clipboard.writeText(isCrypto ? address : '@tanntnny'); setCopied(true); setStatus('Copied'); }
    catch { setStatus('Copy is unavailable. Select and copy the text below.'); }
  }
  function save() {
    const link = document.createElement('a'); link.href = qrPath; link.download = isCrypto ? 'utopia-wallet-qr.svg' : 'utopia-utag-qr.svg'; link.click();
  }
  async function share() {
    const text = isCrypto ? `${token} on ${network}: ${address}` : '@tanntnny';
    try {
      if (navigator.share) await navigator.share({ title: isCrypto ? `Deposit ${token}` : 'My U-Tag', text });
      else { await navigator.clipboard.writeText(text); setStatus('Share details copied'); }
    } catch (error) { if (!(error instanceof DOMException && error.name === 'AbortError')) setStatus('Sharing is unavailable. Use Copy to share your details.'); }
  }
  const content = <>
    <div className="receive-heading"><h3 id="receive-title">{isCrypto ? 'Crypto Deposit' : 'My U-Tag'}</h3>{!embedded && <WorkspaceIconButton label="Close" onClick={onClose}><X /></WorkspaceIconButton>}</div>
    <div className="receive-content">
      <div className="receive-tabs" role="tablist" aria-label="Receive method">
        <button role="tab" aria-selected={isCrypto} className={isCrypto ? 'selected' : ''} onClick={() => { setMethod('crypto'); setCopied(false); setSelector(null); }}><QrCode />Crypto</button>
        <button role="tab" aria-selected={!isCrypto} className={!isCrypto ? 'selected' : ''} onClick={() => { setMethod('utag'); setCopied(false); setSelector(null); }}><AtSign />U-Tag</button>
      </div>
      {isCrypto && <>
        <div className="receive-network"><label>Network</label><button className="receive-select" aria-expanded={selector === 'network'} onClick={() => setSelector(selector === 'network' ? null : 'network')}><img src="/assets/bnb.png" alt="" width="28" height="28" /><span>{network}</span><ChevronDown /></button></div>
        {selector === 'network' && <div className="receive-options">{networks.map(item => <button key={item} onClick={() => { setNetwork(item); setSelector(null); }}>{item}{network === item && <Check size={16} />}</button>)}</div>}
        <button className="receive-select token-select" aria-label={`Token ${token}`} aria-expanded={selector === 'token'} onClick={() => setSelector(selector === 'token' ? null : 'token')}><img src={token === 'BNB' ? '/assets/bnb.png' : '/assets/usdc.png'} width="36" height="36" alt="" /><span><small>Token</small><span>{token}</span></span><ChevronDown /></button>
        {selector === 'token' && <div className="receive-options">{tokens.map(item => <button key={item} onClick={() => { setToken(item); setSelector(null); }}>{item}{token === item && <Check size={16} />}</button>)}</div>}
      </>}
      <div className="deposit-card">
        <h4>{isCrypto ? `Deposit ${token}` : 'Pay with U-Tag'}</h4>
        <div className="qr-area"><div className="qr-box"><img className="qr-code" src={qrPath} width="200" height="200" alt={isCrypto ? 'Wallet address QR code' : 'U-Tag QR code'} /><div className="qr-logo"><img src={isCrypto ? '/assets/usdc.png' : '/assets/logo.png'} width="40" height="40" alt="" /></div></div></div>
        <div className="deposit-details">
          {isCrypto ? <><div className="deposit-network"><span>Network</span><strong>{network}</strong></div><div className="deposit-address"><div><span>Wallet Address</span><button aria-label="Copy wallet address" onClick={copy}>{copied ? <Check /> : <Copy />}{copied ? 'Copied' : 'Copy'}</button></div><p><span>{address.slice(0, 6)}</span>{address.slice(6, -6)}<span>{address.slice(-6)}</span></p></div></> : <div className="deposit-tag"><span>U-Tag</span><div><strong>@tanntnny</strong><button aria-label="Copy U-Tag" onClick={copy}>{copied ? <Check size={16} /> : <Copy size={16} />}</button></div></div>}
        </div>
        <div className="deposit-brand"><img src="/assets/logo.png" width="24" height="24" alt="" /><span>u‑topia</span></div>
      </div>
      {isCrypto ? <div className="deposit-warning"><Info /><p>Send only <strong>{token}</strong> to this address on <strong>{network.toUpperCase()}</strong>. Sending other assets may result in loss.</p></div> : <p className="utag-description">Anyone can scan this QR or search your U-Tag to send you crypto.</p>}
      <div className="receive-actions"><button onClick={save}><Download />Save Image</button><button className="button-primary" onClick={share}><Share2 />Share</button></div>
      <p role="status" className={status ? 'receive-status' : 'sr-only'}>{status}</p>
    </div>
  </>;
  return embedded ? <section className="receive-inline" aria-labelledby="receive-title">{content}</section> : <dialog ref={ref} className="receive-dialog" aria-labelledby="receive-title" onCancel={event => { event.preventDefault(); onClose(); }} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>{content}</dialog>;
}
