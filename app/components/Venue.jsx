'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useScrollControl } from '../lib/sheet';
import { invite } from '../invite';
import { sfx } from '../lib/sound';
import { useLang } from '../lib/lang';
import './Venue.css';

function PaintedCouple() {
  const strokes = 5;
  return (
    <div className="venue-couple" aria-hidden="true">
      {Array.from({ length: strokes }, (_, index) => (
        <img
          className="venue-brush"
          key={index}
          src="/art/venue-couple-walk.webp"
          alt=""
          loading="lazy"
          style={{
            '--stroke': index,
            '--stroke-top': `${Math.max(0, index / strokes * 100 - .12)}%`,
            '--stroke-bottom': `${Math.max(0, (1 - (index + 1) / strokes) * 100 - .12)}%`,
          }}
        />
      ))}
    </div>
  );
}

// the walk ends at 4.65s and the last address line at about 3.8s (see Venue.css)
const VENUE_MS = 4800;

export default function Venue() {
  const { t, invite } = useLang();
  const entrance = useRef(null);
  const address = useRef(null);
  const card = useRef(null);
  const visible = useInView(entrance, .3);
  const control = useScrollControl();
  const [playing, setPlaying] = useState(false);
  const [copyStatus, setCopyStatus] = useState('');
  const { venue } = invite;

  // The couple's walk and the address writing in play once, with the page held still: the mandap and the buttons
  // glide into view first, then scrolling comes back when the last address line is in.
  useEffect(() => {
    if (!visible || playing) return undefined;
    // passing by on the way back to the top: just show it
    if (control.travelling) { setPlaying(true); return undefined; }
    let timer = 0;
    let cancelled = false;
    (async () => {
      const view = control.root.clientHeight;
      const block = entrance.current.offsetHeight + card.current.offsetHeight;
      await control.glide(control.offsetOf(entrance.current) - Math.max(0, (view - block) / 2), .9);
      if (cancelled) return;
      control.lock();
      setPlaying(true);
      if (!control.reduced) {
        // the couple painted in with five brush strokes, then their walk up the steps (five strides of .72s from .5s,
        // see Venue.css); the words writing in stay silent
        for (let stroke = 0; stroke < 5; stroke += 1) sfx.brush(.18 + stroke * .11);
        sfx.walk(.55, 10, .36);
      }
      timer = setTimeout(() => control.unlock(), control.reduced ? 0 : VENUE_MS);
    })();
    return () => { cancelled = true; clearTimeout(timer); };
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(venue.address.join('\n'));
      setCopyStatus('copied');
    } catch {
      const selection = window.getSelection();
      const range = document.createRange();
      range.selectNodeContents(address.current);
      selection?.removeAllRanges();
      selection?.addRange(range);
      setCopyStatus('manual');
    }
  }

  return (
    <section className={`venue-block${playing ? ' is-in' : ''}`} aria-labelledby="venue-title">
      <div className="venue-entrance" ref={entrance}>
        <img className="venue-mandap" src={venue.art} alt="" loading="lazy" />
        <div className="venue-walk" aria-hidden="true">
          <PaintedCouple />
        </div>
        <div className="venue-entrance-copy">
          <p className="venue-kicker">{t('The Venue')}</p>
          <span className="venue-rule" aria-hidden="true" />
          <h2 className="venue-name script" id="venue-title">{venue.name}</h2>
          <span className="venue-rule venue-rule-lower" aria-hidden="true" />
          <address ref={address}>
            {venue.address.map((line, index) => <span key={index} style={{ '--line': index }}>{line}</span>)}
          </address>
        </div>
      </div>
      <div className="venue-card" ref={card}>
        <div className="venue-actions">
          <a className="venue-button venue-directions" href={venue.directionsUrl} target="_blank" rel="noreferrer">
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m4 11 16-7-7 16-2-7-7-2Z" /></svg>
            {t('Directions')}
          </a>
          <button className="venue-button venue-copy" type="button" onClick={copyAddress}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="8" y="8" width="12" height="12" rx="2.2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
            {copyStatus === 'copied' ? t('Copied') : t('Copy address')}
          </button>
        </div>
        <p className="venue-copy-status" role="status">{copyStatus === 'copied' ? t('Address copied') : copyStatus === 'manual' ? t('Use your device’s Copy command to copy the address.') : ''}</p>
      </div>
    </section>
  );
}
