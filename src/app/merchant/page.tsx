"use client";
import { useEffect, useRef, useState } from "react";

// What the shop sees: a live "received" screen with a sound, like Thai payment speakers.
export default function Merchant() {
  const [amount, setAmount] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);
  const [armed, setArmed] = useState(false);
  const ctx = useRef<AudioContext | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/events");
    es.onmessage = (m) => {
      const e = JSON.parse(m.data);
      if (e.type === "payment" && e.status === "confirmed") {
        setAmount("฿" + Math.round(e.amount).toLocaleString("en-US"));
        setFlash(true);
        setTimeout(() => setFlash(false), 1500);
        ding();
      }
    };
    return () => es.close();
  }, []);

  function ding() {
    const a = ctx.current;
    if (!a) return;
    const o = a.createOscillator(), g = a.createGain();
    o.frequency.setValueAtTime(880, a.currentTime);
    o.frequency.setValueAtTime(1320, a.currentTime + 0.12);
    g.gain.setValueAtTime(0.0001, a.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, a.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + 0.5);
    o.connect(g).connect(a.destination);
    o.start();
    o.stop(a.currentTime + 0.55);
  }

  return (
    <main className={"merchant" + (flash ? " flash" : "")}>
      <div>
        <div className="shop">Noodle Shop Soi 11</div>
        {amount ? <div className="amt">{amount} received</div> : <div className="amt" style={{ fontSize: "clamp(32px, 6vw, 56px)" }}>Waiting for payment…</div>}
        {!armed && (
          <button className="button-primary" style={{ marginTop: 24 }} onClick={() => { ctx.current = new AudioContext(); setArmed(true); }}>
            Turn on sound
          </button>
        )}
        <p className="ur-muted" style={{ marginTop: 16 }}>PromptPay payout simulated · production uses a licensed e-money partner</p>
      </div>
    </main>
  );
}
