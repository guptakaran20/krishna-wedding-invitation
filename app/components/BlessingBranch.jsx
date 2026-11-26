'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import SectionTitle from './SectionTitle';
import { Chevron, useSwipe } from './PhotoViewer';
import { guestName, hasGuestName } from '../lib/guest';
import { easeBetween, playFor, useScrollControl } from '../lib/sheet';
import { useLang } from '../lib/lang';
import { sfx } from '../lib/sound';
import './BlessingBranch.css';

const STORE = 'wedding-wishes';
const VISIBLE_POSTCARDS = 4;
const POSTCARD_FLIGHT = 1.63;

function animatePostcard({ control, section, card, target, source, onDone }) {
  const scroller = control.root;
  const startScroll = scroller.scrollTop;
  const sectionRect = section.getBoundingClientRect();
  const targetRect = target.getBoundingClientRect();
  const targetScroll = control.offsetOf(target) - scroller.clientHeight * .28;
  const tilt = parseFloat(getComputedStyle(target.firstElementChild).getPropertyValue('--wish-tilt'));
  const start = { x: source.left - sectionRect.left, y: source.top - sectionRect.top };
  const end = { x: targetRect.left - sectionRect.left, y: targetRect.top - sectionRect.top };
  const mix = (from, to, progress) => from + (to - from) * progress;

  function draw(time) {
    const lift = easeBetween(time, .37, .64);
    const flight = easeBetween(time, .59, POSTCARD_FLIGHT);
    const arc = Math.sin(Math.PI * flight);
    const rise = lift * (1 - flight);
    card.style.width = `${mix(source.width, targetRect.width, flight)}px`;
    card.style.height = `${mix(source.height, targetRect.height, flight)}px`;
    const x = mix(start.x, end.x, flight) + 24 * arc;
    const y = mix(start.y, end.y, flight) - 8 * rise - 25 * arc;
    const angle = mix(0, tilt, flight) + 4 * rise + 6 * arc;
    card.style.transform = `translate(${x}px, ${y}px) rotate(${angle}deg)`;
    card.style.setProperty('--wish-lift', Math.max(rise, arc));
    if (flight > 0) control.jump(mix(startScroll, targetScroll, flight));
  }

  control.lock();
  draw(0);
  const cancel = playFor(POSTCARD_FLIGHT, draw, finish);
  window.addEventListener('resize', finish, { once: true });

  function cleanup() {
    cancel();
    window.removeEventListener('resize', finish);
    control.unlock();
  }

  function finish() {
    control.jump(control.offsetOf(target) - scroller.clientHeight * .28);
    onDone();
  }

  return cleanup;
}

function Postmark() {
  return (
    <span className="wish-postmark" aria-hidden="true">
      <img src="/art/blessing-rose-stamp.webp" alt="" loading="lazy" draggable="false" />
    </span>
  );
}

function Postcard({ wish, index }) {
  return (
    <div className={`wish-paper wish-paper-${index % 4}`}>
      <Postmark />
      <div className="wish-message">
        <span className="wish-quote" aria-hidden="true">“</span>
        <p className="wish-text">{wish.text}</p>
        <p className="wish-signature">{wish.from}</p>
      </div>
    </div>
  );
}

export default function BlessingBranch() {
  const { t, invite } = useLang();
  // the guest's own postcards (kept as they wrote them), then the family's, in the chosen language
  const [mine, setMine] = useState([]);
  const wishes = [...mine, ...invite.wishes];
  const [current, setCurrent] = useState(0);
  const [named, setNamed] = useState('');
  const guest = named || t('Family & Friends');
  const [status, setStatus] = useState('');
  const [posting, setPosting] = useState(null);
  const section = useRef(null);
  const firstPostcard = useRef(null);
  const flyingCard = useRef(null);
  const draftSignature = useRef(null);
  const dialog = useRef(null);
  const control = useScrollControl();
  const count = wishes.length;
  const wish = wishes[current];
  const step = (direction) => { sfx.cardFlip(); setCurrent((index) => (index + direction + count) % count); };
  const swipe = useSwipe({ onSwipe: (direction) => step(-direction) });

  useEffect(() => {
    if (hasGuestName()) setNamed(guestName());
    try {
      const saved = JSON.parse(localStorage.getItem(STORE) || '[]');
      if (Array.isArray(saved)) {
        setMine(saved.filter((wish) => typeof wish?.text === 'string' && typeof wish.from === 'string'));
      }
    } catch { /* Storage is unavailable. */ }
  }, []);

  useLayoutEffect(() => {
    if (!posting) return undefined;
    const target = firstPostcard.current;
    return animatePostcard({
      control,
      section: section.current,
      card: flyingCard.current,
      target,
      source: posting.source,
      onDone() {
        sfx.click();
        sfx.sparkle(.1);
        setPosting(null);
        setStatus(posting.confirmation);
        const clip = target.querySelector('.wish-clip');
        clip.animate([
          { transform: 'translateY(-3px) rotate(-10deg)' },
          { transform: 'translateY(1px) rotate(3deg)', offset: .45 },
          { transform: 'translateY(0) rotate(0)' },
        ], { duration: 270, easing: 'ease-out' });
        requestAnimationFrame(() => {
          if (document.activeElement === document.body) target.firstElementChild.focus({ preventScroll: true });
        });
      },
    });
  }, [control, posting]);

  function openPostcard(index) {
    setCurrent(index);
    sfx.rustle(0, .5);
    dialog.current.showModal();
  }

  function handleKeys(event) {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }

  function add(event) {
    event.preventDefault();
    if (posting) return;
    const form = event.currentTarget;
    const text = new FormData(form).get('text').trim();
    if (!text) {
      setStatus(t('Write a blessing before adding your postcard.'));
      form.elements.text.focus();
      return;
    }

    const postcard = { text, from: guest, mine: true };
    const next = [postcard, ...mine];
    const field = form.elements.text;
    const rect = field.getBoundingClientRect();
    const source = { left: rect.left, top: rect.top, width: rect.width, height: draftSignature.current.getBoundingClientRect().bottom - rect.top };
    let confirmation = t('Your postcard was added to the wall.');
    setMine(next);
    setCurrent(0);
    try {
      localStorage.setItem(STORE, JSON.stringify(next));
    } catch {
      confirmation = t('Your postcard was added for this visit.');
    }
    form.reset();
    if (control?.root && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (form.contains(document.activeElement)) document.activeElement.blur();
      setStatus('');
      sfx.rustle(0, .4);
      sfx.whoosh(.3, 1.2, .16, 400, 2000);
      setPosting({ postcard, source, confirmation });
    } else {
      setStatus(confirmation);
    }
  }

  const previews = wishes.slice(0, VISIBLE_POSTCARDS);

  return (
    <section className="wishes-block" aria-labelledby="wishes-title" ref={section}>
      <SectionTitle eyebrow={t('Wishing wall')} title={t('Blessings')} id="wishes-title" />
      <p className="wishes-intro" data-reveal>{t('Words of love from our family and friends for')} {invite.groom}&nbsp;&amp;&nbsp;{invite.bride}.</p>

      <div className="wish-wall" data-reveal>
        {[previews.slice(0, 2), previews.slice(2)].map((row, rowIndex) => row.length > 0 && (
          <ul className="wish-line" key={rowIndex}>
            {row.map((wish, itemIndex) => {
              const index = rowIndex * 2 + itemIndex;
              const inFlight = index === 0 && !!posting;
              return (
                <li className="wish-hanging" key={index} ref={index === 0 ? firstPostcard : undefined}>
                  <button type="button" className={`wish-preview${inFlight ? ' is-in-flight' : ''}`} disabled={inFlight} aria-label={`${t('From')} ${wish.from}`} aria-haspopup="dialog" onClick={() => openPostcard(index)}>
                    <span className="wish-clip" aria-hidden="true" />
                    <Postcard wish={wish} index={index} />
                  </button>
                </li>
              );
            })}
          </ul>
        ))}
      </div>

      {wishes.length > 0 && (
        <button type="button" className="wish-view-all" aria-haspopup="dialog" onClick={() => openPostcard(0)}>
          {t('View all postcards')} <Chevron />
        </button>
      )}

      <dialog
        ref={dialog}
        className="wish-dialog"
        aria-labelledby="wish-dialog-title"
        onKeyDown={handleKeys}
        onClick={(event) => {
          if (event.target === event.currentTarget) dialog.current.close();
        }}
        data-lenis-prevent
      >
        <div className="wish-dialog-inner">
          <header className="wish-dialog-heading">
            <h3 id="wish-dialog-title">{t('Blessing postcards')}</h3>
            <button autoFocus type="button" className="wish-close" aria-label={t('Close postcards')} onClick={() => dialog.current.close()}>
              <span aria-hidden="true">×</span>
            </button>
          </header>
          {wish && (
            <div className="wish-reader" {...swipe} aria-live="polite" aria-atomic="true">
              <Postcard key={current} wish={wish} index={current} />
            </div>
          )}
          {count > 1 && (
            <div className="wish-dialog-nav">
              <button type="button" aria-label={t('Previous postcard')} onClick={() => step(-1)}><Chevron left /></button>
              <p aria-live="polite">{current + 1} / {count}</p>
              <button type="button" aria-label={t('Next postcard')} onClick={() => step(1)}><Chevron /></button>
            </div>
          )}
        </div>
      </dialog>

      <form className="wish-write wish-paper" aria-labelledby="wish-write-title" onSubmit={add} onInput={() => setStatus('')} data-reveal>
        <header className="wish-write-heading">
          <h3 id="wish-write-title">{t('Leave a blessing')}</h3>
          <Postmark />
        </header>
        <label className="wish-field">
          <span>Your message</span>
          <textarea name="text" rows="3" maxLength={160} required placeholder="Write your wishes for the couple…" />
        </label>
        <p className="wish-signature" ref={draftSignature}>{t('From')} {guest}</p>
        <button type="submit" className="wish-send" disabled={!!posting}>{t('Add my postcard')}</button>
        <p className="wish-card-status" role="status">{status}</p>
      </form>
      {posting && (
        <div className="wish-preview wish-flying" ref={flyingCard} aria-hidden="true">
          <Postcard wish={posting.postcard} index={0} />
          <span className="wish-cut-line" />
        </div>
      )}
    </section>
  );
}
