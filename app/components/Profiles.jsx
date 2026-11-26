'use client';

import { useEffect, useRef } from 'react';
import { useInView } from '../lib/sheet';
import { invite } from '../invite';
import { sfx } from '../lib/sound';
import { useLang } from '../lib/lang';
import './Profiles.css';

// One profile per person (invite.people): their photo in a painted arch, the role, name, full name, parents and a
// few words about them. Each plays once as it scrolls into view: the arch opens on the photo, the name is written in
// and the words rise out of a blur. The groom's card leans in from the left, the bride's from the right.
function Profile({ person, index }) {
  const ref = useRef(null);
  const visible = useInView(ref, .35);
  const side = index % 2 ? 'right' : 'left';
  // the portrait painted in (the arch opens on it over 1.3s from .35s, see Profiles.css): the card swishing in, brush
  // strokes across the canvas, and a soft bell as it settles; the words writing in stay silent
  useEffect(() => {
    if (!visible) return;
    const pan = side === 'left' ? -.3 : .3;
    sfx.whoosh(0, .8, .1, 300, 1200);
    for (let stroke = 0; stroke < 6; stroke += 1) sfx.brush(.35 + stroke * .2);
    sfx.bell(1.7, side === 'left' ? 784 : 988, pan, .06);
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <article className={`profile profile-${side}${visible ? ' is-in' : ''}`} ref={ref} aria-labelledby={`profile-${index}`}>
      <div className="profile-photo">
        <div className="profile-window">
          <img loading="lazy" src={person.photo} alt={`${person.fullName}`} />
        </div>
        <img loading="lazy" className="profile-frame" src="/art/arch-frame.webp" alt="" aria-hidden="true" />
        <span className="profile-garland" aria-hidden="true" />
      </div>
      <p className="profile-role">
        {person.role}
        {person.roleHindi && <span lang="hi"> · {person.roleHindi}</span>}
      </p>
      <h3 className="profile-name script" id={`profile-${index}`}>{person.name}</h3>
      <p className="profile-full">{person.fullName}</p>
      <img loading="lazy" className="profile-divider" src="/art/lotus-divider.webp" alt="" aria-hidden="true" />
      <p className="profile-about">
        {person.about.split(' ').map((word, i) => (
          <span key={`${word}-${i}`} style={{ '--d': `${900 + i * 45}ms` }}>{word} </span>
        ))}
      </p>
    </article>
  );
}

// Between the two profiles: a hennaed hand and a hand holding a pink lotus sweep in from either side and meet over a
// glowing "&", then keep gently reaching for each other. Plays once as it comes into view.
function HandsMeet() {
  const ref = useRef(null);
  const visible = useInView(ref, .5);
  // the two hands sweeping in from either side, and a soft chime as the "&" glows between them
  useEffect(() => {
    if (!visible) return;
    sfx.whoosh(0, 1.2, .1, 300, 1400);
    sfx.whoosh(.35, 1.2, .08, 350, 1500);
    sfx.bloom(1.6);
  }, [visible]);
  return (
    <div className={`hands-meet${visible ? ' is-in' : ''}`} ref={ref} aria-hidden="true">
      <span className="hm-glow" />
      <img loading="lazy" className="hm-hand hm-left" src="/art/hand-henna.webp" alt="" />
      <img loading="lazy" className="hm-hand hm-right" src="/art/hand-lotus.webp" alt="" />
      <b className="hm-amp script">&amp;</b>
      <span className="hm-petals"><i /><i /><i /><i /><i /></span>
    </div>
  );
}

export default function Profiles() {
  const { invite } = useLang();
  const people = invite.people || [];
  return (
    <div className="profiles">
      {people.map((person, index) => (
        <div key={person.photo}>
          {index > 0 && <HandsMeet />}
          <Profile person={person} index={index} />
        </div>
      ))}
    </div>
  );
}
