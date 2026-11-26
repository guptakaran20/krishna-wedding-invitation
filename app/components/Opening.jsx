'use client';

import { useEffect, useRef, useState } from 'react';
import { easeBetween, playFor, useRunProgress, useScrollControl } from '../lib/sheet';
import { invite } from '../invite';
import { sfx } from '../lib/sound';
import { guestName, hasGuestName } from '../lib/guest';
import { useLang } from '../lib/lang';
import Petals from './Petals';
import './Opening.css';

// The opening, after a Pinterest e-invite the family liked. It holds still while you scroll:
// 1. the couple sits (seen from behind) before a curtained frame hung with bells and garlands;
// 2. the curtains draw open on a painting of Radha and Krishna on a swing;
// 3. the camera pushes into the painting while the couple slips out of view below;
// 4. the painting becomes the invitation card: carved pillars and marigold garlands drop in, the swing settles at the top;
// 5. the words then write themselves in, one line at a time.
// The page waits, held still, for a tap on "Tap to open" (browsers only allow sound after a tap, so this is what lets
// the bells and curtains be heard); from there the whole scene plays by itself, and scrolling comes back once the
// last line has written in.
const linesFor = (invite) => [
  { className: 'op-shloka', text: '॥ श्री राधा कृष्णाय नमः ॥' },
  { className: 'op-hindi', text: 'श्री राधा कृष्ण की असीम कृपा से' },
  { className: 'op-hindi', text: 'आप सादर आमंत्रित हैं' },
  // the names large in English (as the family entered them), and in Hindi beneath, in both languages
  { className: 'op-names op-names-latin', text: `${invite.groom} & ${invite.bride}` },
  { className: 'op-names-hindi', text: invite.namesHindi },
  { className: 'op-divider', text: '' },
  { className: 'op-hindi op-occasion', text: invite.occasionHindi },
  { className: 'op-english op-tagline', text: invite.occasionEnglish },
  // no date here: the opening card keeps the day back; it is revealed further down
];

// seconds the scene takes from the curtains parting to Radha and Krishna settling, and for the words to write in
const SCENE_SECONDS = 6.8;
const WRITE_SECONDS = 4.8;
const SETTLED = .92;

export default function Opening() {
  const { t, invite } = useLang();
  const LINES = linesFor(invite);
  const stage = useRef(null);
  const control = useScrollControl();
  const played = useRef(false);
  const stop = useRef(null);
  // the hold on the page until the guest taps to open
  const gate = useRef(false);
  const [opened, setOpened] = useState(false);
  const [writing, setWriting] = useState(false);
  // the guest named in the link (?guest=…), else the one set in invite.js, else "Family & Friends"
  const [named, setNamed] = useState('');
  useEffect(() => { if (hasGuestName()) setNamed(guestName().slice(0, 40)); }, []);
  const guest = named || t('Family & Friends');

  function paint(p) {
    const style = stage.current.style;
    const set = (name, value) => style.setProperty(name, value.toFixed(4));
    set('--prompt', 1 - easeBetween(p, .01, .08));
    set('--open', easeBetween(p, .06, .32));
    set('--zoom', easeBetween(p, .34, .7));
    set('--couple-out', easeBetween(p, .34, .58));
    set('--card', easeBetween(p, .64, .72));
    set('--drop', easeBetween(p, .7, .86));
    set('--settle', easeBetween(p, .72, .92));
  }

  function play(from) {
    played.current = true;
    setOpened(true);
    control.lock();
    if (gate.current) { gate.current = false; control.unlock(); }
    const run = stage.current.closest('[data-run]');
    const seconds = control.reduced ? 0 : SCENE_SECONDS * (SETTLED - from) / SETTLED;
    // the sounds, timed to the scene: seconds from now until the scene reaches progress q
    const when = (q) => Math.max(0, (q - from) / (SETTLED - from) * seconds);
    if (seconds) {
      sfx.bells(0);
      if (from < .2) sfx.curtain(when(.07));
      sfx.whoosh(when(.36), 1.6, .16, 200, 1400);
      sfx.thud(when(.7), .18);
      sfx.bell(when(.74), 988, -.4, .08);
      sfx.bell(when(.8), 1175, .4, .07);
    }
    stop.current = playFor(seconds, (elapsed) => paint(from + (SETTLED - from) * (seconds ? elapsed / seconds : 1)), () => {
      setWriting(true);
      stop.current = playFor(control.reduced ? 0 : WRITE_SECONDS, () => {}, () => {
        // leave the page at the end of the opening, so the next scroll carries straight on to the scroll card
        control.jump(control.offsetOf(run) + run.offsetHeight - control.root.clientHeight);
        control.unlock();
        stop.current = null;
      });
    });
  }

  useRunProgress(stage, (p) => {
    if (played.current) return;
    if (p >= 1) {
      // already past the opening (a reload further down the page): show it finished, without holding the page
      played.current = true;
      paint(1);
      setOpened(true);
      setWriting(true);
    } else paint(Math.min(p, .02));
  });

  useEffect(() => {
    // page.js hands over the scroller after this mounts, so hold the page on the next frame (unless the reader is
    // already past the opening, a reload further down)
    const frame = requestAnimationFrame(() => {
      if (played.current) return;
      gate.current = true;
      control.lock();
    });
    return () => {
      cancelAnimationFrame(frame);
      if (gate.current) { gate.current = false; control.unlock(); }
      stop.current?.();
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const open = () => { if (!played.current) play(0); };

  return (
    <section className="opening-run" data-run="opening" aria-labelledby="opening-names">
      <div className={`opening-stage${writing ? ' is-writing' : ''}`} ref={stage} onClick={open}>
        {/* the pooja corner: frame, bells, garlands, urns, and the painting behind the curtains */}
        <div className="op-room" aria-hidden="true">
          <div className="art op-room-bg" />
          <div className="op-backdrop">
            <img className="op-room-swing" src="/art/swing.webp" alt="" />
          </div>
          <div className="op-curtains">
            <span className="op-curtain op-curtain-left" />
            <span className="op-curtain op-curtain-right" />
          </div>
          <span className="op-bell-glint" />
        </div>
        <img className="op-couple" src="/art/couple-back.webp" alt="" aria-hidden="true" />

        {/* the invitation card the painting becomes */}
        <div className="op-card">
          <div className="art op-card-bg" aria-hidden="true" />
          <img className="op-garland op-garland-left" src="/art/card-garland.webp" alt="" aria-hidden="true" />
          <img className="op-garland op-garland-right" src="/art/card-garland.webp" alt="" aria-hidden="true" />
          <img className="op-card-swing" src="/art/swing.webp" alt="Radha and Krishna on a swing garlanded with marigolds" />
          <div className="op-text">
            <h2 className="sr-only" id="opening-names">{invite.groom} and {invite.bride} invite you to their wedding</h2>
            <p className="op-line op-guest" style={{ '--i': 0 }} aria-hidden="true">{guest}</p>
            {LINES.map((line, index) => (
              <p key={index} className={`op-line ${line.className}`} style={{ '--i': index + 1 }} aria-hidden="true">
                {line.className === 'op-divider' ? <img src="/art/lotus-divider.webp" alt="" /> : line.text}
              </p>
            ))}
          </div>
          <span className="op-fade" aria-hidden="true" />
        </div>

        <Petals count={10} className="op-petals" />
        {opened && <Petals count={8} className="op-leaves" />}
        <button type="button" className="op-prompt" onClick={open} disabled={opened}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4z" /><path d="M15.5 9a4 4 0 0 1 0 6M18 6.5a7.5 7.5 0 0 1 0 11" /></svg>
          {t('Tap to open')}
        </button>
      </div>
    </section>
  );
}
