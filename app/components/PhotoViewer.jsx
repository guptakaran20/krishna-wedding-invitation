'use client';

import { useEffect, useRef, useState } from 'react';
import './PhotoViewer.css';
import { useLang } from '../lib/lang';

// The full-size photo in its carved arch frame, shared by the photo sections, with a swipe helper and the gold-rimmed
// round arrow button.
const SWIPE = 60; // px of drag that counts as a swipe
const TAP = 8; // px of movement still counted as a tap

export const pad = (value) => String(value).padStart(2, '0');

export function Chevron({ left }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d={left ? 'M14.5 5.5 8 12l6.5 6.5' : 'M9.5 5.5 16 12l-6.5 6.5'} />
    </svg>
  );
}

// a horizontal drag on an element: calls onSwipe(-1 | 1) for a swipe left / right, onTap for a tap
export function useSwipe({ onSwipe, onTap, onDrag }) {
  const start = useRef(null);
  return {
    onPointerDown(event) {
      start.current = { x: event.clientX, y: event.clientY, id: event.pointerId };
      event.currentTarget.setPointerCapture(event.pointerId);
    },
    onPointerMove(event) {
      if (!start.current) return;
      onDrag?.(event.clientX - start.current.x);
    },
    onPointerUp(event) {
      if (!start.current) return;
      const dx = event.clientX - start.current.x;
      const dy = event.clientY - start.current.y;
      start.current = null;
      if (Math.abs(dx) > SWIPE && Math.abs(dx) > Math.abs(dy)) onSwipe(dx < 0 ? -1 : 1);
      else if (Math.abs(dx) < TAP && Math.abs(dy) < TAP) onTap?.();
      else onDrag?.(0);
    },
    onPointerCancel() {
      start.current = null;
      onDrag?.(0);
    },
  };
}

export function Viewer({ photos, index, onClose, onStep }) {
  const { t } = useLang();
  const photo = photos[index];
  const close = useRef(null);
  const [drag, setDrag] = useState(0);
  const swipe = useSwipe({ onSwipe: (side) => { setDrag(0); onStep(side < 0 ? 1 : -1); }, onDrag: setDrag });

  useEffect(() => {
    close.current?.focus();
    const key = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') onStep(1);
      if (event.key === 'ArrowLeft') onStep(-1);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose, onStep]);

  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-label={`${photo.caption}, photo ${index + 1} of ${photos.length}`} onClick={onClose}>
      <div className="viewer-frame" onClick={(event) => event.stopPropagation()}>
        <div className="viewer-stage">
          <button ref={close} className="viewer-close" type="button" onClick={onClose} aria-label={t('Close photo')}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
          </button>
          <div className="viewer-photo" {...swipe} style={{ '--drag': `${drag}px` }}>
            <img className="viewer-picture" key={photo.art} src={photo.art} alt={photo.caption} draggable="false" />
            <img className="viewer-carving" src="/art/photo-frame.webp" alt="" aria-hidden="true" draggable="false" />
          </div>
        </div>
        <p className="viewer-count">{pad(index + 1)} <i /> {pad(photos.length)}</p>
        <p className="viewer-caption script">{photo.caption}</p>
        <div className="viewer-nav">
          <button type="button" className="moments-arrow" onClick={() => onStep(-1)} aria-label={t('Previous photo')}><Chevron left /></button>
          <span>{t('swipe to see more')}</span>
          <button type="button" className="moments-arrow" onClick={() => onStep(1)} aria-label={t('Next photo')}><Chevron /></button>
        </div>
      </div>
    </div>
  );
}

