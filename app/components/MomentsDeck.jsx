'use client';

import { useEffect, useRef, useState } from 'react';
import { sfx } from '../lib/sound';
import { createPortal } from 'react-dom';
import { useScrollControl } from '../lib/sheet';
import { Chevron, Viewer, pad, useSwipe } from './PhotoViewer';
import { useLang } from '../lib/lang';
import './MomentsDeck.css';

// The photo pile the gallery cube settles into: portrait photos in rounded gold frames, the ones beneath peeking out. Swipe left (or tap →) for the next photo, swipe right (or ←) to
// bring the last one back. Until the guest first swipes, the top postcard leans aside now and then and a hand shows
// the gesture. Tapping the top postcard opens it full size in the carved frame, where it can be swiped through too.
const FLY_MS = 420;

export default function MomentsDeck({ active = true }) {
  const { t, invite } = useLang();
  const photos = invite.moments;
  const root = useRef(null);
  const control = useScrollControl();
  const [order, setOrder] = useState(() => photos.map((_, index) => index));
  const [drag, setDrag] = useState(0);
  // the top card flying out (-1 left) or flying back in (entering)
  const [leaving, setLeaving] = useState(0);
  const [entering, setEntering] = useState(0);
  const [swiped, setSwiped] = useState(false);
  const [open, setOpen] = useState(null);
  const [screen, setScreen] = useState(null);
  const busy = useRef(false);

  useEffect(() => { setScreen(root.current.closest('.screen')); }, []);

  // next: the top card flies off to the left and goes to the bottom of the pile
  function next() {
    if (busy.current) return;
    busy.current = true;
    sfx.cardFlip();
    setSwiped(true);
    setLeaving(-1);
    setTimeout(() => {
      setOrder((current) => [...current.slice(1), current[0]]);
      setLeaving(0);
      setDrag(0);
      busy.current = false;
    }, FLY_MS);
  }
  // previous: the bottom card comes back in from the right onto the top
  function previous() {
    if (busy.current) return;
    busy.current = true;
    sfx.cardFlip();
    setSwiped(true);
    setDrag(0);
    setOrder((current) => [current[current.length - 1], ...current.slice(0, -1)]);
    setEntering(1);
    requestAnimationFrame(() => requestAnimationFrame(() => {
      setEntering(0);
      setTimeout(() => { busy.current = false; }, FLY_MS);
    }));
  }

  const swipe = useSwipe({
    onSwipe: (side) => (side < 0 ? next() : previous()),
    onTap: () => { sfx.whoosh(0, .4, .12, 600, 2200); setOpen(order[0]); },
    onDrag: setDrag,
  });

  // the full-size photo holds the invitation still underneath it
  useEffect(() => {
    if (open === null) return undefined;
    control.lock();
    return () => control.unlock();
  }, [open === null]); // eslint-disable-line react-hooks/exhaustive-deps

  const step = (by) => { sfx.flick(); setOpen((current) => (current + by + photos.length) % photos.length); };
  const topIndex = order[0];
  // only the top few postcards are drawn
  const shown = order.slice(0, 4);

  return (
    <div className={`moments-deck${active && !swiped ? ' is-hinting' : ''}`} ref={root} inert={!active}>
      <div className="deck">
        {shown.slice().reverse().map((photoIndex, reversed) => {
          const depth = shown.length - 1 - reversed;
          const photo = photos[photoIndex];
          const isTop = depth === 0;
          let style;
          if (isTop) {
            const x = leaving ? leaving * 130 : entering ? entering * 130 : 0;
            const rotate = leaving ? leaving * 18 : entering ? entering * 18 : 0;
            style = { '--x': `calc(${x}cqw + ${drag}px)`, '--r': `calc(${rotate}deg + ${drag / 22}deg)`, opacity: leaving || entering ? 0 : 1 };
          } else {
            // the cards beneath peek out, turned a little, like the pile the cube gathers into
            style = { '--x': `${[0, 2.2, -2.6, 1.4][depth] || 0}cqw`, '--y': `${[0, -1.6, 1.2, 2.2][depth] || 0}cqw`, '--r': `${[0, 5, -6, 3][depth] || 0}deg`, '--s': 1 - depth * .02 };
          }
          return (
            <figure
              key={photo.art}
              className={`deck-card${isTop ? ' is-top' : ''}${isTop && (drag || entering) ? ' is-held' : ''}`}
              style={style}
              {...(isTop ? swipe : {})}
              aria-hidden={!isTop}
            >
              <img loading="lazy" className="deck-photo" src={photo.art} alt={isTop ? photo.caption : ''} draggable="false" />
            </figure>
          );
        })}
        <div className="deck-hint" aria-hidden="true">
          <svg viewBox="0 0 24 24"><path d="M9 11V5.5a1.5 1.5 0 0 1 3 0V10m0-.5V8a1.5 1.5 0 0 1 3 0v2m0-.5a1.5 1.5 0 0 1 3 0V14a6 6 0 0 1-6 6h-.6a6 6 0 0 1-4.7-2.3L4.5 14.6a1.6 1.6 0 0 1 2.3-2.2L9 14" /></svg>
          <span>{t('swipe')}</span>
        </div>
      </div>

      {/* the top photo's number and caption, under the pile */}
      <p className="deck-caption" key={topIndex}>
        <span className="deck-count">{pad(topIndex + 1)} <i /> {pad(photos.length)}</span>
        <b className="script">{photos[topIndex].caption}</b>
      </p>

      <div className="moments-nav">
        <button type="button" className="moments-arrow" onClick={previous} aria-label={t('Previous photo')}><Chevron left /></button>
        <div className="moments-dots" aria-hidden="true">
          {photos.map((photo, index) => <i key={photo.art} className={index === topIndex ? 'is-on' : ''} />)}
        </div>
        <button type="button" className="moments-arrow" onClick={next} aria-label={t('Next photo')}><Chevron /></button>
      </div>
      <p className="moments-tip">{t('Swipe left for the next photo · tap a photo to see it in full')}</p>
      <p className="sr-only" aria-live="polite">{photos[topIndex].caption}</p>

      {open !== null && screen && createPortal(
        <Viewer photos={photos} index={open} onClose={() => setOpen(null)} onStep={step} />,
        screen,
      )}
    </div>
  );
}
