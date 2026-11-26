'use client';

import { useEffect, useRef, useState } from 'react';
import { useInView, useScrollControl } from '../lib/sheet';
import { invite } from '../invite';
import { sfx } from '../lib/sound';
import { useLang } from '../lib/lang';
import './Finale.css';

// The end of the invitation: "Thank you for blessing our journey" is handwritten in, line by line, with the couple's
// names and the date beneath. Then the flower-decked wedding car drives in, swings round and parks on a slant beside
// the S & S monogram, the couple waving; "Return to top" comes last, under the car.
const ARRIVE_MS = 3400;

export default function Finale() {
  const { t, invite } = useLang();
  const LINE = t('Thank you for|blessing our journey').split('|');
  const words = useRef(null);
  const lot = useRef(null);
  const control = useScrollControl();
  const writing = useInView(words, .5);
  const arriving = useInView(lot, .45);
  const [parked, setParked] = useState(false);
  const { day, month, year } = invite.dateParts;

  useEffect(() => {
    if (!arriving) return undefined;
    // the car drives in, slows as it swings round, and toots once parked
    const engine = sfx.engine();
    engine.speed(.9);
    const slow = setTimeout(() => engine.speed(.25), ARRIVE_MS * .6);
    const id = setTimeout(() => {
      setParked(true);
      engine.stop(.7);
      sfx.horn(.1);
      sfx.bloom(.6);
    }, ARRIVE_MS);
    return () => { clearTimeout(slow); clearTimeout(id); engine.stop(.2); };
  }, [arriving]);

  // back to the very top; the sections on the way stay as they are
  async function top() {
    sfx.whoosh(0, 2.2, .18, 1800, 300);
    control.travelling = true;
    await control.glide(0, 2.6);
    control.travelling = false;
  }

  return (
    <section className="finale" aria-labelledby="thanks-title">
      <div className={`finale-words${writing ? ' is-writing' : ''}`} ref={words}>
        <div className="finale-flowers" aria-hidden="true">
          <img loading="lazy" className="finale-fl finale-fl-left" src="/art/corner-bouquet.webp" alt="" />
          <img loading="lazy" className="finale-fl finale-fl-centre" src="/art/events-marigold.webp" alt="" />
          <img loading="lazy" className="finale-fl finale-fl-right" src="/art/corner-bouquet.webp" alt="" />
        </div>
        <h2 className="finale-line script" id="thanks-title">
          {LINE.map((line, index) => <span key={line} className="hw" style={{ '--i': index }}>{line}</span>)}
        </h2>
        <img loading="lazy" className="finale-rule" src="/art/lotus-divider.webp" alt="" aria-hidden="true" />
        <p className="finale-names script">{invite.groom} <i>&amp;</i> {invite.bride}</p>
        <p className="finale-date">{invite.dateRevealed ? `${day} ${month} ${year}` : t('Date to be announced')}</p>
        <p className="finale-families">{invite.families}</p>
        {invite.hashtag && <p className="finale-hashtag">{invite.hashtag}</p>}
        {invite.family?.signoff && <p className="finale-signoff">{invite.family.signoff}</p>}
      </div>

      {/* the car drives in and parks on a slant beside the monogram */}
      <div className={`parking${arriving ? ' is-arriving' : ''}${parked ? ' is-parked' : ''}`} ref={lot} aria-hidden="true">
        <div className="parking-mark">
          <img loading="lazy" className="parking-spray" src="/art/corner-bouquet.webp" alt="" />
          <span className="parking-mono script">{invite.groom[0]}<i>&amp;</i>{invite.bride[0]}</span>
          <span className="parking-caption">{t('Just married')}</span>
        </div>
        <div className="parking-car">
          <img loading="lazy" src="/art/wedding-car.webp" alt="" />
          <span className="glint glint-1" /><span className="glint glint-2" /><span className="glint glint-3" />
        </div>
      </div>

      <div className="finale-end">
        <button type="button" className="finale-top" onClick={top}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
          {t('Return to top')}
        </button>
      </div>
    </section>
  );
}
