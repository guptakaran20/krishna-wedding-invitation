'use client';

import { useEffect, useRef, useState } from 'react';
import { invite } from '../invite';
import { playFor, useInView, useScrollControl } from '../lib/sheet';
import { sfx } from '../lib/sound';
import { useLang } from '../lib/lang';
import './SaveTheDate.css';

// Save the Date: the decorated car drives down the garden path, revealing "Save the Date" ahead of it and the date
// and names behind it. The page follows the car like a camera: as the scene arrives, the page glides until the car is
// in the middle of the screen, then holds still and moves with the car, keeping it in view, until it has parked at
// the foot of the path, with the date and names it has revealed above it.
const DRIVE_SECONDS = 6.5;
// where the car is on the path (0 top … 1 bottom) over the drive: a gentle start, a steady run, a gentle stop
function along(t) {
  if (t < .1) return .075 * (t / .1) ** 2;
  if (t < .86) return .075 + .85 * ((t - .1) / .76);
  const k = (t - .86) / .14;
  return .925 + .075 * (1 - (1 - k) ** 2);
}

export default function SaveTheDate() {
  const { t, invite } = useLang();
  const [occasionTop, occasionBottom] = t('For the wedding|celebration of').split('|');
  const scene = useRef(null);
  const control = useScrollControl();
  const arrived = useInView(scene, .12);
  const [phase, setPhase] = useState('ready');
  const stop = useRef(null);
  const { day, month, year, weekday } = invite.dateParts;

  useEffect(() => () => stop.current?.(), []);

  useEffect(() => {
    if (!arrived || phase !== 'ready') return;
    const el = scene.current;
    const show = (p) => el.style.setProperty('--save-date-progress', p.toFixed(4));
    // reduced motion, or passing by on the way back to the top: show it finished
    if (control.reduced || control.travelling) { show(1); setPhase('finished'); return; }
    setPhase('playing');

    // where the page must be for the car (at progress p) to sit on screen: a little above the middle as it sets off,
    // drifting to nearly three-quarters down by the end, so the date and names revealed behind it stay in view
    const cameraFor = (p) => {
      const top = control.offsetOf(el);
      const height = el.offsetHeight;
      const carCentre = (-.11 + .885 * p + .2025) * height;
      return top + carCentre - control.root.clientHeight * (.42 + .31 * p);
    };
    (async () => {
      show(0);
      await control.glide(cameraFor(0), .9);
      control.lock();
      const car = sfx.engine();
      let last = { p: 0, elapsed: 0 };
      // the car's cruising speed along the path, in path lengths a second
      const cruise = .85 / (.76 * DRIVE_SECONDS);
      stop.current = playFor(DRIVE_SECONDS, (elapsed) => {
        const p = along(elapsed / DRIVE_SECONDS);
        // the engine pitch follows how fast the car is going
        if (elapsed > last.elapsed) car.speed(Math.min(1, (p - last.p) / (elapsed - last.elapsed) / cruise));
        last = { p, elapsed };
        show(p);
        control.jump(cameraFor(p));
      }, () => {
        show(1);
        car.stop(.8);
        sfx.horn(.15);
        sfx.sparkle(.7);
        setPhase('finished');
        control.unlock();
        stop.current = null;
      });
    })();
  }, [arrived]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="save-date" id="save-the-date" aria-labelledby="date-title">
      <h2 className="sr-only" id="date-title">{t('Save the Date')}</h2>
      <p className="sr-only">
        <time dateTime={invite.date}>{weekday}, {day} {month} {year}</time>
        {' · '}{invite.groom} &amp; {invite.bride}
      </p>

      <div className="date-scene-wrap" aria-hidden="true">
        <div className="date-scene" ref={scene} data-phase={phase}>
          <div className="date-scene__garden" />
          <div className="date-scene__ahead">
            <p className="date-scene__title script">{t('Save the Date')}</p>
          </div>
          <div className="date-scene__behind">
            <div className="date-scene__details">
              <p className="date-scene__date"><span>{day}</span><span>{month.slice(0, 3)}</span><span>{year}</span></p>
              <p className="date-scene__occasion">{occasionTop}<br />{occasionBottom}</p>
              <p className="date-scene__names"><span>{invite.groom}</span><span>&amp;</span><span>{invite.bride}</span></p>
            </div>
          </div>
          <div className="date-scene__drive">
            <img className="date-scene__car" src="/art/save-date-car.webp" alt="" loading="lazy" />
          </div>
        </div>
      </div>
    </section>
  );
}
