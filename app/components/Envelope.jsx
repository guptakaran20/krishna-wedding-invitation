'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView } from '../lib/sheet';
import { invite } from '../invite';
import './Envelope.css';


export default function Envelope() {
  const root = useRef(null);
  const visible = useInView(root, .55);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!visible || open) return undefined;
    const id = setTimeout(() => setOpen(true), 700);
    return () => clearTimeout(id);
  }, [visible, open]);

  return (
    <section className={`envelope-block${open ? ' is-open' : ''}`} ref={root} data-gap=".18" aria-labelledby="card-names">
      <div className="env-back" aria-hidden="true" />
      <div className="card-rise">
        <div className="invite-card">
          <div className="card-inner">
            <p className="card-om" aria-hidden="true">ॐ</p>
            <p className="card-line word" style={{ '--w': 0 }}>Together with their families</p>
            <h2 className="sr-only" id="card-names">{invite.groom} and {invite.bride}</h2>
            <p className="card-name script word ink" style={{ '--w': 1 }} aria-hidden="true">{invite.groom}</p>
            <p className="card-parents word" style={{ '--w': 2 }}>{invite.groomParents}</p>
            <p className="card-amp script word" style={{ '--w': 3 }} aria-hidden="true">&amp;</p>
            <p className="card-name script word ink" style={{ '--w': 4 }} aria-hidden="true">{invite.bride}</p>
            <p className="card-parents word" style={{ '--w': 5 }}>{invite.brideParents}</p>
            <p className="card-rule word" style={{ '--w': 6 }} aria-hidden="true"><i /><b>✦</b><i /></p>
            <p className="card-line word" style={{ '--w': 7 }}>{invite.occasionLine}</p>
            <p className="card-date word" style={{ '--w': 8 }}>{invite.dateShort}</p>
            <p className="card-line card-city word" style={{ '--w': 9 }}>{invite.city}</p>
          </div>
        </div>
      </div>
      <svg className="env-front" viewBox="0 0 400 260" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="envFront" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#9b3a55" /><stop offset="1" stopColor="#7a2742" /></linearGradient>
          <pattern id="envPaisley" width="34" height="34" patternUnits="userSpaceOnUse">
            <path d="M17 6c6 0 9 5 7 10s-9 7-11 2 2-6 4-4" fill="none" stroke="#f3cf8a" strokeOpacity=".16" strokeWidth="1" />
          </pattern>
        </defs>
        <path d="M0 0 L200 140 L400 0 V260 H0Z" fill="url(#envFront)" />
        <path d="M0 0 L200 140 L400 0 V260 H0Z" fill="url(#envPaisley)" />
        <path d="M0 260 L168 118 M400 260 L232 118" stroke="#f3cf8a" strokeOpacity=".4" strokeWidth="1.2" fill="none" vectorEffect="non-scaling-stroke" />
        <path d="M12 248 H388" stroke="#f3cf8a" strokeOpacity=".55" strokeDasharray="1 5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="env-flap" aria-hidden="true">
        <svg viewBox="0 0 400 170" preserveAspectRatio="none">
          <defs>
            <linearGradient id="envFlap" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#a8445f" /><stop offset="1" stopColor="#86304b" /></linearGradient>
          </defs>
          <path d="M0 0 H400 L200 170Z" fill="url(#envFlap)" />
          <path d="M0 0 H400 L200 170Z" fill="url(#envPaisley)" />
          <path d="M12 6 H388 L200 156Z" fill="none" stroke="#f3cf8a" strokeOpacity=".7" strokeDasharray="1 5" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
      <button type="button" className="wax-seal" onClick={() => setOpen(true)} aria-label="Open the invitation" disabled={open}>
        <span>S<i>&amp;</i>S</span>
      </button>
      <p className="env-hint">Tap the seal to open</p>
    </section>
  );
}
