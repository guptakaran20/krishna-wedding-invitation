'use client';

import { useEffect, useRef, useState } from 'react';
import { guestName, hasGuestName } from '../lib/guest';
import { invite } from '../invite';
import { sfx } from '../lib/sound';
import { useLang } from '../lib/lang';
import './Rsvp.css';

const REPLY_REVEAL_MS = 1320;

function ReplyRule() {
  return <span className="rsvp-rule" aria-hidden="true"><i /></span>;
}

export default function Rsvp() {
  const { lang, t, invite } = useLang();
  const [named, setNamed] = useState('');
  // the guest named in the link stays as written; with none, the invitation addresses everyone in the chosen language
  const guest = { name: named || t('Family & Friends'), named: !!named };
  const [phase, setPhase] = useState('waiting');
  const thanksTitle = useRef(null);
  const ready = phase === 'ready';
  const casting = phase === 'casting';

  useEffect(() => {
    if (hasGuestName()) setNamed(guestName());
  }, []);

  useEffect(() => {
    if (ready) thanksTitle.current?.focus({ preventScroll: true });
    if (!casting) return undefined;
    const timer = setTimeout(() => setPhase('ready'), REPLY_REVEAL_MS);
    return () => clearTimeout(timer);
  }, [casting, ready]);

  function castReply() {
    if (phase !== 'waiting') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setPhase(reduced ? 'ready' : 'casting');
    // the reply is cast into the lotus pond (it strikes at .55s, see Rsvp.css): a splash, ripples, and the lotus blooms
    sfx.whoosh(0, .55, .16, 500, 2600);
    sfx.splash(reduced ? 0 : .55);
    sfx.bloom(reduced ? .2 : .75);
  }

  return (
    <section className={`rsvp-block rsvp-${phase}`} id="rsvp" aria-labelledby="rsvp-title">
      <div className="rsvp-pond" aria-hidden="true">
        <img className="rsvp-pond-painting" src="/art/rsvp-lotus-pond-portrait.webp" alt="" loading="lazy" draggable="false" />
        <span className="rsvp-impact" />
        <span className="rsvp-ripple" />
        <span className="rsvp-ripple rsvp-ripple-late" />
        <img className="rsvp-lightning" src="/art/rsvp-gold-lightning.webp" alt="" loading="lazy" draggable="false" />
        <div className="rsvp-lotus">
          <img className="rsvp-bud" src="/art/rsvp-lotus-bud.webp" alt="" loading="lazy" draggable="false" />
          <img className="rsvp-bloom" src="/art/rsvp-lotus-bloom.webp" alt="" loading="lazy" draggable="false" />
        </div>
      </div>

      <header className="rsvp-heading" data-reveal>
        {ready ? (
          <div className="rsvp-confirmation">
            <h2 id="rsvp-title" ref={thanksTitle} tabIndex={-1} className="rsvp-thanks-title script">{t('Thank you')}</h2>
            <p className="rsvp-reply-message">{lang === 'hi'
              ? `${guest.named ? `${guest.name}, ` : ''}${t('We can’t wait to celebrate with you')}।`
              : `We can’t wait to celebrate with you${guest.named ? `, ${guest.name}` : ''}.`}</p>
          </div>
        ) : (
          <>
            <h2 id="rsvp-title">{t('Kindly Reply')}</h2>
            <ReplyRule />
            {invite.rsvp?.by && <p className="rsvp-deadline">{invite.rsvp.by}</p>}
            <p className="rsvp-question">{t('Will you join us?')}</p>
            <p className="rsvp-name script">{guest.name}</p>
          </>
        )}
      </header>

      {!ready && (
        <div className="rsvp-reply-position">
          <button type="button" className="rsvp-choice rsvp-action" aria-disabled={casting} onClick={castReply}>
            {t('Yes, I’ll be there')}
          </button>
        </div>
      )}
    </section>
  );
}
