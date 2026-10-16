"use client";
import { useEffect, useRef, useState } from "react";

type Cam = { start: (...a: unknown[]) => Promise<unknown>; stop: () => Promise<void>; isScanning?: boolean };

// Full-screen style QR scanner: live camera (html5-qrcode) with a photo-upload fallback.
export default function Scanner({ onScan }: { onScan: (raw: string) => void }) {
  const [active, setActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cam = useRef<Cam | null>(null);
  const mounted = useRef(true);
  const done = useRef(false);

  async function stopCam() {
    const c = cam.current;
    cam.current = null;
    try {
      if (c?.isScanning) await c.stop();
    } catch {
      /* already stopped */
    }
  }

  useEffect(() => {
    mounted.current = true;
    start();
    return () => {
      mounted.current = false;
      void stopCam();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function start() {
    setError(null);
    done.current = false;
    try {
      const { Html5Qrcode } = await import("html5-qrcode");
      if (!mounted.current) return;
      const scanner = new Html5Qrcode("reader", { verbose: false }) as unknown as Cam;
      cam.current = scanner;
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 230, height: 230 } },
        (text: string) => {
          if (done.current) return;
          done.current = true;
          void stopCam().then(() => onScan(text));
        },
        () => {},
      );
      if (!mounted.current) return void stopCam();
      setActive(true);
    } catch {
      if (!mounted.current) return;
      setActive(false);
      setError("Camera not available here. Upload a photo of the QR, or use a demo code below.");
    }
  }

  async function fromFile(file: File) {
    setError(null);
    try {
      await stopCam();
      setActive(false);
      const { Html5Qrcode } = await import("html5-qrcode");
      const s = new Html5Qrcode("reader-file", { verbose: false });
      onScan(await s.scanFile(file, false));
    } catch {
      setError("No QR code found in that photo. Try a closer, sharper photo.");
    }
  }

  return (
    <div className="scanner">
      <div className="viewfinder">
        <div id="reader" />
        <span className="corner tl" /><span className="corner tr" /><span className="corner bl" /><span className="corner br" />
        {!active && <p className="vf-hint">{error ?? "Starting camera…"}</p>}
      </div>
      <div id="reader-file" hidden />
      <p className="scan-title">Point at any Thai QR code</p>
      <div className="scan-actions">
        {!active && error && <button className="pill-btn" onClick={start}>Try camera again</button>}
        <label className="pill-btn">
          Upload photo
          <input type="file" accept="image/*" hidden onChange={(e) => e.target.files?.[0] && fromFile(e.target.files[0])} />
        </label>
      </div>
    </div>
  );
}
