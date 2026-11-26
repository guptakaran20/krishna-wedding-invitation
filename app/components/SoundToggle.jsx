'use client';

import { useEffect, useRef, useState } from 'react';
import { onSoundChange, setSoundEnabled, soundEnabled, unlockAudio } from '../lib/sound';
import { useLang } from '../lib/lang';
import './SoundToggle.css';

function Speaker({ on }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path className="speaker" d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" />
      {on ? (
        <>
          <path className="wave" d="M15.5 9a4 4 0 0 1 0 6" />
          <path className="wave" d="M18 6.5a7.5 7.5 0 0 1 0 11" />
        </>
      ) : <path d="m16 9.5 5 5m0-5-5 5" />}
    </svg>
  );
}

// The menu button in the corner opens a sidebar that slides in from the right: music and scene sounds on or off, and
// the invitation's language (English or Hindi).
export default function SoundToggle() {
  const { lang, setLang, t } = useLang();
  const [on, setOn] = useState(true);
  const [open, setOpen] = useState(false);
  const close = useRef(null);
  const opener = useRef(null);

  useEffect(() => {
    setOn(soundEnabled());
    const unlock = () => {
      unlockAudio();
    };
    const events = ['pointerdown', 'keydown', 'touchend'];
    events.forEach((name) => window.addEventListener(name, unlock, { capture: true, passive: true }));
    const off = onSoundChange(setOn);
    return () => {
      events.forEach((name) => window.removeEventListener(name, unlock, { capture: true }));
      off();
    };
  }, []);

  // Escape closes the sidebar; focus moves into it on opening and back to the button on closing
  useEffect(() => {
    if (!open) return undefined;
    close.current?.focus({ preventScroll: true });
    const key = (event) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', key);
    return () => {
      window.removeEventListener('keydown', key);
      opener.current?.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <button
        ref={opener}
        type="button"
        className="sound-toggle"
        aria-expanded={open}
        aria-controls="invite-sidebar"
        aria-label={t('Menu')}
        onClick={() => setOpen(true)}
      >
        <svg className="menu-bars" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 7h14M5 12h14M5 17h14" /></svg>
      </button>

      <div className={`sidebar-scrim${open ? ' is-open' : ''}`} onClick={() => setOpen(false)} aria-hidden="true" />
      <aside
        id="invite-sidebar"
        className={`invite-sidebar${open ? ' is-open' : ''}`}
        aria-label={t('Menu')}
        aria-hidden={!open}
        inert={!open}
        data-lenis-prevent
      >
        <header className="sidebar-head">
          <p className="sidebar-title script">{t('Menu')}</p>
          <button ref={close} type="button" className="sidebar-close" onClick={() => setOpen(false)} aria-label={t('Close')}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
        </header>
        <img className="sidebar-rule" src="/art/lotus-divider.webp" alt="" aria-hidden="true" />

        <section className="sidebar-group">
          <p className="sidebar-label">{t('Music')}</p>
          <button
            type="button"
            role="switch"
            className={`sidebar-switch${on ? ' is-on' : ''}`}
            aria-checked={on}
            aria-label={t('Music')}
            onClick={() => setSoundEnabled(!on)}
          >
            <Speaker on={on} />
            <span className="sidebar-switch-text">{on ? t('On') : t('Off')}</span>
            <span className="sidebar-knob" aria-hidden="true"><i /></span>
          </button>
        </section>

        <section className="sidebar-group">
          <p className="sidebar-label">{t('Language')}</p>
          <div className="sidebar-segment" role="radiogroup" aria-label={t('Language')}>
            <button type="button" role="radio" aria-checked={lang === 'en'} lang="en" onClick={() => setLang('en')}>English</button>
            <button type="button" role="radio" aria-checked={lang === 'hi'} lang="hi" onClick={() => setLang('hi')}>हिंदी</button>
          </div>
        </section>
      </aside>
    </>
  );
}
