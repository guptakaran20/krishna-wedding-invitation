'use client';

import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/sound';
import SectionTitle from './SectionTitle';
import { Chevron, useSwipe, pad } from './PhotoViewer';
import { useLang } from '../lib/lang';
import './GoodToKnow.css';

// A painted postcard and two tips per slide, with map links where helpful.
// The buttons, image swipes and arrow keys all advance the same carousel.
const OUT_MS = 520;
const mapUrl = (query) => `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

// letters as the eye sees them: a Hindi letter keeps its vowel signs (splitting by code point would tear them off)
const letters = (text) => (typeof Intl !== 'undefined' && Intl.Segmenter
  ? Array.from(new Intl.Segmenter(undefined, { granularity: 'grapheme' }).segment(text), (part) => part.segment)
  : Array.from(text));

function Word({ text }) {
  return (
    <h3 className="gtk-word script" aria-label={text}>
      {letters(text).map((letter, index) => <span key={index} style={{ '--i': index }} aria-hidden="true">{letter}</span>)}
    </h3>
  );
}

export default function GoodToKnow() {
  const { t, invite } = useLang();
  const cards = invite.goodToKnow || [];
  const [index, setIndex] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const busy = useRef(false);
  const card = cards[index];

  function go(by) {
    if (busy.current || cards.length < 2) return;
    busy.current = true;
    sfx.cardFlip();
    setLeaving(true);
    setTimeout(() => {
      setIndex((current) => (current + by + cards.length) % cards.length);
      setLeaving(false);
      setTimeout(() => { busy.current = false; }, 400);
    }, OUT_MS);
  }
  const swipe = useSwipe({ onSwipe: (side) => go(side < 0 ? 1 : -1) });
  const box = useRef(null);
  useEffect(() => {
    const el = box.current;
    const key = (event) => {
      if (event.key === 'ArrowRight') go(1);
      if (event.key === 'ArrowLeft') go(-1);
    };
    el.addEventListener('keydown', key);
    return () => el.removeEventListener('keydown', key);
  });

  if (!cards.length) return null;
  return (
    <section className="gtk-block" aria-labelledby="gtk-title">
      <SectionTitle eyebrow={t('Before you travel')} title={t('Good to Know')} id="gtk-title" />
      {/* the reveal sits on a wrapper: React rewrites the card's own class as it changes */}
      <div data-reveal>
        <div
          className={`gtk gtk-${card.tone || 'cream'}${leaving ? ' is-leaving' : ''}`}
          ref={box}
          role="region"
          aria-roledescription="carousel"
          aria-label={t('Good to Know')}
          tabIndex={0}
        >
          <div className="gtk-scenes" {...swipe}>
            {cards.map((item, i) => {
              const place = (i - index + cards.length) % cards.length;
              return <img key={item.art} className="gtk-scene" data-place={Math.min(place, 2)} src={item.art} alt="" draggable="false" loading={i < 2 ? 'eager' : 'lazy'} />;
            })}
          </div>
          <div className="gtk-content" aria-live="polite">
            <header className="gtk-heading">
              <p className="gtk-kicker">{card.kicker}</p>
              <Word key={card.word} text={card.word} />
            </header>
            <ul className="gtk-items" key={`items-${card.word}`}>
              {card.items.map((item, i) => (
                <li key={i} style={{ '--i': i }}>
                  <div>
                    <p className="gtk-name">{item.name}</p>
                    {item.note && <p className="gtk-note">{item.note}</p>}
                  </div>
                  {item.map && (
                    <a className="gtk-loc" href={mapUrl(item.map)} target="_blank" rel="noreferrer" aria-label={`${t('Map')}: ${item.name}`}>
                      <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.4" /></svg>
                      {t('Map')}
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="gtk-nav">
            <span className="gtk-count">{pad(index + 1)} <i /> {pad(cards.length)}</span>
            <div className="gtk-buttons">
              <button type="button" onClick={() => go(-1)} aria-label={t('Previous')}>
                <Chevron left />
              </button>
              <button type="button" className="gtk-next" onClick={() => go(1)} aria-label={`${t('Next')}: ${cards[(index + 1) % cards.length].word}`}>
                <Chevron />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
