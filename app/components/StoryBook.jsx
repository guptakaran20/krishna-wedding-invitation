'use client';

import { useRef, useState } from 'react';
import { easeBetween, useRunProgress } from '../lib/sheet';
import SectionTitle from './SectionTitle';
import { invite } from '../invite';
import { sfx } from '../lib/sound';
import { useLang } from '../lib/lang';
import './StoryBook.css';

// An open storybook standing upright (bound across the middle, like an album) held on screen while you scroll. Each
// chapter is a spread: its picture on the top page and its words on the bottom. Scrolling flips the bottom leaf up over
// the spine; the back of that leaf is the next chapter's picture, and the next chapter's words lie on the page beneath.
function Picture({ chapter }) {
  return (
    <div className="spread-picture">
      <div className="spread-photo"><img src={chapter.art} alt="" /></div>
    </div>
  );
}

function Words({ chapter, index }) {
  const { t, chapter: numeral } = useLang();
  return (
    <div className="spread-words">
      <p className="spread-num">{t('Chapter')} {numeral(index)}</p>
      <p className="spread-year">{chapter.year}</p>
      <h3 className="script">{chapter.title}</h3>
      <img className="spread-rule" src="/art/lotus-divider.webp" alt="" />
      <p className="spread-text">{chapter.text}</p>
    </div>
  );
}

export default function StoryBook() {
  const { t, invite, chapter: numeral } = useLang();
  const root = useRef(null);
  const chapters = invite.story;
  const [step, setStep] = useState(0);
  // which leaves lie turned over, to sound a page turn as each one goes over (either way)
  const turned = useRef([]);

  useRunProgress(root, (progress) => {
    const turns = easeBetween(progress, .06, .9) * (chapters.length - 1);
    root.current.querySelectorAll(".book-leaf").forEach((leaf, index) => {
      const t = easeBetween(turns - index, .1, .9);
      leaf.style.setProperty('--t', t.toFixed(4));
      // a leaf lies on the right-hand pile until it passes upright, then on the left-hand pile
      leaf.style.zIndex = t < .5 ? 20 - index : 40 + index;
      const over = t > .3;
      if (turned.current[index] !== undefined && turned.current[index] !== over) sfx.pageTurn();
      turned.current[index] = over;
    });
    setStep(Math.min(chapters.length - 1, Math.round(turns)));
  });

  return (
    <section className="story-run" data-run="story" aria-labelledby="story-title">
      <div className="story-stage" ref={root}>
        <SectionTitle eyebrow={t('How it all began')} title={t('Our Story')} id="story-title" />
        <div className="storybook" data-reveal>
          <img className="storybook-art" src="/art/open-book-tall.webp" alt="" aria-hidden="true" />
          <div className="page-area page-top" aria-hidden="true"><Picture chapter={chapters[0]} /></div>
          <div className="page-area page-bottom" aria-hidden="true"><Words chapter={chapters[chapters.length - 1]} index={chapters.length - 1} /></div>
          {chapters.slice(0, -1).map((chapter, index) => (
            <div key={chapter.year} className="book-leaf" aria-hidden="true">
              <div className="bl-face bl-front"><Words chapter={chapter} index={index} /><span className="bl-shade" /></div>
              <div className="bl-face bl-back"><Picture chapter={chapters[index + 1]} /><span className="bl-shade" /></div>
            </div>
          ))}
          <span className="spine-shadow" aria-hidden="true" />
        </div>
        <p className="sr-only" aria-live="polite">{t('Chapter')} {numeral(step)}, {chapters[step].year}: {chapters[step].title}. {chapters[step].text}</p>
        <div className="year-rail" aria-hidden="true">
          {chapters.map((chapter, index) => (
            <span key={chapter.year} className={index <= step ? 'is-lit' : ''}>{chapter.year}</span>
          ))}
        </div>
        <p className="turn-hint" aria-hidden="true">{t('keep scrolling to turn the page')}</p>
      </div>
    </section>
  );
}
