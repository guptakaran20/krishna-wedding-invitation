'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useScrollControl } from '../lib/sheet';
import { invite } from '../invite';
import { sfx } from '../lib/sound';
import { useLang } from '../lib/lang';
import Petals from './Petals';
import './ScrollCard.css';

// The invitation arrives as a painted scroll, after a Pinterest e-invite: two hennaed hands hold it rolled shut, then
// pull the rollers apart to unroll the card, and the words write themselves onto the paper. It plays once, on its own,
// when the scroll comes into view (or at once on a tap): the card glides to the middle of the screen and the page is
// held still until the last line has written in.

// the rollers part over 2.2s, then ten lines write in .28s apart, the last one taking 1.2s (see ScrollCard.css)
const UNROLL_MS = 2200 + 9 * 280 + 1300;

export default function ScrollCard() {
  const { t, invite } = useLang();
  const root = useRef(null);
  const visible = useInView(root, .35);
  const control = useScrollControl();
  const started = useRef(false);
  const timer = useRef(0);
  const [open, setOpen] = useState(false);

  async function play() {
    if (started.current) return;
    started.current = true;
    // passing by on the way back to the top: just show it open
    if (control.travelling) { setOpen(true); return; }
    const card = root.current;
    const view = control.root.clientHeight;
    const top = control.offsetOf(card) - Math.max(0, (view - card.offsetHeight) / 2);
    await control.glide(top, .9);
    control.lock();
    setOpen(true);
    if (!control.reduced) {
      sfx.bell(0, 784, -.3, .08);
      sfx.unroll(.05, 2.1);
    }
    timer.current = setTimeout(() => control.unlock(), control.reduced ? 0 : UNROLL_MS);
  }

  useEffect(() => { if (visible) play(); }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => () => clearTimeout(timer.current), []);

  return (
    <section className={`scroll-card${open ? ' is-open' : ''}`} ref={root} aria-labelledby="scroll-names">
      <span className="scroll-glow" aria-hidden="true" />
      {/* a marigold toran with temple bells hangs above the scroll; diyas and a lotus urli sit below it */}
      <img loading="lazy" className="scroll-toran" src="/art/scroll-header.webp" alt="" aria-hidden="true" />
      <img loading="lazy" className="scroll-diyas" src="/art/scroll-footer.webp" alt="" aria-hidden="true" />
      {open && <Petals count={14} className="scroll-petals" />}
      <div className="scroll" onClick={play}>
        <img loading="lazy" className="scroll-layer scroll-paper" src="/art/scroll-paper.webp" alt="" aria-hidden="true" />
        <div className="scroll-words">
          <h2 className="sr-only" id="scroll-names">{invite.groom} and {invite.bride}</h2>
          <p className="sw sw-shloka" style={{ '--w': 0 }} aria-hidden="true">॥ श्री राधा कृष्णाय नमः ॥</p>
          <p className="sw sw-name script" style={{ '--w': 1 }} aria-hidden="true">{invite.groom}</p>
          <p className="sw sw-amp script" style={{ '--w': 3 }} aria-hidden="true">&amp;</p>
          <p className="sw sw-name script" style={{ '--w': 4 }} aria-hidden="true">{invite.bride}</p>
          <p className="sw sw-rule" style={{ '--w': 6 }} aria-hidden="true"><img loading="lazy" src="/art/lotus-divider.webp" alt="" /></p>
          <p className="sw sw-line" style={{ '--w': 9 }}>{invite.city}</p>
        </div>
        <img loading="lazy" className="scroll-layer scroll-top" src="/art/scroll-top.webp" alt="" aria-hidden="true" />
        <img loading="lazy" className="scroll-layer scroll-bottom" src="/art/scroll-bottom.webp" alt="" aria-hidden="true" />
      </div>
      <p className="scroll-hint">{open ? '' : t('Tap the scroll to open')}</p>
    </section>
  );
}
