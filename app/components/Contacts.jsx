'use client';

import { useEffect, useRef, useState } from 'react';
import SectionTitle from './SectionTitle';
import { invite as base } from '../invite';
import { useLang } from '../lib/lang';
import { playFor, useInView, useScrollControl } from '../lib/sheet';
import { sfx } from '../lib/sound';
import './Contacts.css';

// Reach out: the Save the Date car comes back. It drives down the road, and the people to call are uncovered behind
// it a group at a time: the car pulls up just past each group, pauses while it settles, and drives on. At the last one
// it does not stop but carries on down and out of the bottom of the scene, on towards the Thank You, where it swings round and parks.
// The page follows the car like a camera, as in Save the Date, and holds still until it has gone.
const HOLD_SECONDS = .85;
// how fast the car drives, in screen widths per second
const SPEED = .62;

const initials = (name) => name.replace(/^(mr|mrs|ms|dr|shri|smt|श्रीमती|श्री)\.?\s+/i, '').split(/\s+/).map((word) => word[0]).slice(0, 2).join('').toUpperCase();
// a number still waiting to be filled in ("+91 98XXX XXXXX") is not printed
const isReal = (phone) => phone && !/x/i.test(phone);
const easeInOut = (t) => (t < .5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const easeIn = (t) => t * t * t;

function PhoneIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>;
}
function ChatIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 20l1.3-3.9A8 8 0 1 1 8 19.1Z" /><path d="M9.5 9.5c0 2.5 2.5 5 5 5l1-1.2-1.8-.9-.8.7a4 4 0 0 1-2-2l.7-.8-.9-1.8Z" fill="currentColor" stroke="none" /></svg>;
}

// one person, set as in the Utsavy contacts: the gold-and-peony seal with their initials, the name, who they are to
// the wedding, and a button to call them
function Person({ person }) {
  const { t } = useLang();
  const tel = person.phone?.replace(/[^\d+]/g, '');
  return (
    <li className="contact">
      <span className="contact-seal" aria-hidden="true"><span>{initials(person.name)}</span></span>
      <span className="contact-name">{person.name}</span>
      <span className="contact-label">{person.label}</span>
      {isReal(person.phone) && <span className="contact-num">{person.phone}</span>}
      <div className="contact-actions">
        {tel && <a className="contact-btn" href={`tel:${tel}`} aria-label={`${t('Call')}: ${person.name}`}><PhoneIcon /> {t('Call')}</a>}
        {person.whatsapp && (
          <a className="contact-btn contact-btn-wa" href={`https://wa.me/${person.whatsapp}`} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${person.name}`}><ChatIcon /></a>
        )}
      </div>
    </li>
  );
}

export default function Contacts() {
  const road = useRef(null);
  const behind = useRef(null);
  const drive = useRef(null);
  const rows = useRef([]);
  const control = useScrollControl();
  const arrived = useInView(road, .12);
  const [phase, setPhase] = useState('ready');
  const stop = useRef(null);
  const { t, invite } = useLang();
  const people = invite.contacts ?? [];
  // grouped by the English label, so the groups stay the same in Hindi
  const isFamily = (person) => /family/i.test(base.contacts[people.indexOf(person)]?.label ?? '');
  // the families first, then everyone else; the car uncovers one group (a row of two) at a time
  const groups = [
    { title: t('The Families'), people: people.filter(isFamily) },
    { title: t('For anything you need'), people: people.filter((person) => !isFamily(person)) },
  ].filter((group) => group.people.length);

  useEffect(() => () => stop.current?.(), []);

  useEffect(() => {
    if (!arrived || phase !== 'ready') return;
    const finish = () => {
      rows.current.forEach((row) => row?.classList.add('is-shown'));
      setPhase('finished');
    };
    if (control.reduced || control.travelling || !people.length) { finish(); return; }
    setPhase('playing');

    const el = road.current;
    const car = drive.current;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    const carLength = car.offsetHeight;
    const view = control.root.clientHeight;
    // the car's rear bumper (its top: it drives face down) is where the reveal behind it reaches
    const place = (rear) => {
      car.style.transform = `translateY(${rear}px)`;
      behind.current.style.clipPath = `inset(0 0 ${Math.max(0, height - rear)}px 0)`;
      rows.current.forEach((row) => {
        if (row && !row.classList.contains('is-shown') && rear >= row.offsetTop + row.offsetHeight * .55) row.classList.add('is-shown');
      });
    };

    // the drive: from just above the road, a stop just past each group but the last, which it uncovers on the way
    // out, driving on without stopping off the bottom of the road towards the Thank You
    const segments = [];
    let at = -carLength;
    const driveTo = (to, ease = easeInOut) => {
      segments.push({ from: at, to, seconds: Math.max(.9, (to - at) / (width * SPEED)), ease });
      at = to;
    };
    rows.current.slice(0, -1).forEach((row) => {
      driveTo(row.offsetTop + row.offsetHeight + width * .05);
      segments.push({ from: at, to: at, seconds: HOLD_SECONDS, hold: true });
    });
    driveTo(height + width * .04, easeIn);
    const total = segments.reduce((sum, segment) => sum + segment.seconds, 0);

    // the camera keeps the car's rear a little below the middle of the screen, so the group just uncovered sits
    // above it in full; it never goes above where the scene began, nor so far past the foot of the road that the Thank You beneath takes over
    const top = control.offsetOf(el);
    const first = control.offsetOf(el.closest('section'));
    const last = top + height - view * .72;
    const cameraFor = (rear) => Math.min(last, Math.max(first, top + rear - view * .6));

    (async () => {
      place(-carLength);
      await control.glide(cameraFor(-carLength), .9);
      control.lock();
      const engine = sfx.engine();
      let stopped = false;
      stop.current = playFor(total, (elapsed) => {
        let left = elapsed;
        let segment = segments[0];
        for (segment of segments) {
          if (left <= segment.seconds) break;
          left -= segment.seconds;
        }
        const k = Math.min(1, left / segment.seconds);
        const rear = segment.from + (segment.to - segment.from) * segment.ease?.(k);
        car.dataset.stopped = segment.hold ? 'true' : 'false';
        // the engine idles at each stop (with a little toot) and picks up between them
        if (segment.hold && !stopped) sfx.horn(.05);
        stopped = Boolean(segment.hold);
        engine.speed(segment.hold ? 0 : Math.min(1, .3 + Math.sin(Math.PI * k) * .7));
        place(segment.hold ? segment.from : rear);
        control.jump(cameraFor(segment.hold ? segment.from : rear));
      }, () => {
        finish();
        engine.stop(1);
        control.unlock();
        stop.current = null;
      });
    })();
  }, [arrived]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!people.length) return null;

  return (
    <section className="contacts" id="contacts" aria-labelledby="contacts-title">
      <SectionTitle eyebrow={t('Here to help')} title={t('Reach Out')} id="contacts-title" />

      <div className="contacts-road" ref={road} data-phase={phase}>
        <div className="contacts-behind" ref={behind}>
          {groups.map((group, index) => (
            <div className="contacts-group" key={index} ref={(node) => { rows.current[index] = node; }}>
              <h3 className="contacts-group-title"><span>{group.title}</span></h3>
              <ul className={`contacts-list${group.people.length === 1 ? ' is-single' : ''}`}>
                {group.people.map((person) => <Person key={person.phone + person.label} person={person} />)}
              </ul>
            </div>
          ))}
        </div>
        <div className="contacts-drive" ref={drive} aria-hidden="true">
          <img src="/art/save-date-car.webp" alt="" loading="lazy" />
        </div>
      </div>
    </section>
  );
}
