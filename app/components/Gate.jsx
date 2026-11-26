'use client';

import { useRef, useState } from 'react';
import { easeBetween, useRunProgress } from '../lib/sheet';
import Petals from './Petals';
import { Birds, Diya, FairyLights } from './Ornaments';
import './Gate.css';

// The palace gate holds still (CSS sticky) while you scroll: the doors swing open, warm light pours through, the
// camera walks in, and the Ganesh blessing appears in the garden, which then melts into the paper sheet below.
export default function Gate() {
  const stage = useRef(null);
  const [burst, setBurst] = useState(false);
  useRunProgress(stage, (progress) => {
    if (progress > .1 && !burst) setBurst(true);
    const run = stage.current.parentElement.style;
    run.setProperty('--door-open', easeBetween(progress, .01, .36));
    run.setProperty('--gate-approach', easeBetween(progress, .2, .78));
    run.setProperty('--gate-fade', easeBetween(progress, .6, .8));
    run.setProperty('--blessing-reveal', easeBetween(progress, .62, .9));
    run.setProperty('--prompt-fade', easeBetween(progress, .01, .12));
  });

  return (
    <section className="gate-run" data-run="gate" aria-labelledby="blessing-title">
      <div className="gate-stage" ref={stage}>
        <div className="art blessing-art" aria-hidden="true" />
        <Birds className="garden-birds" />
        <Petals count={10} className="blessing-petals" />
        <div className="blessing" lang="hi">
          <h2 id="blessing-title">श्री गणेशाय नमः</h2>
          <div className="ganesha-wrap">
            <span className="ganesha-halo" aria-hidden="true" />
            <img className="ganesha" src="/art/ganesha.webp" alt="Lord Ganesha in a saffron turban" lang="en" />
          </div>
          <p>वक्रतुण्ड महाकाय सूर्यकोटि समप्रभ।<br />निर्विघ्नं कुरु मे देव सर्वकार्येषु सर्वदा॥</p>
        </div>
        <div className="gate-rays" aria-hidden="true" />
        <div className="gate-glow" aria-hidden="true" />
        <div className="gate" aria-hidden="true">
          <div className="doorway">
            <div className="door door-left"><i className="door-shine" /></div>
            <div className="door door-right"><i className="door-shine" /></div>
          </div>
          <div className="art palace-art" />
          <FairyLights className="gate-lights" count={17} sag={18} />
          <img className="gate-toran" src="/art/toran.webp" alt="" />
          <Diya className="gate-diya gate-diya-left" />
          <Diya className="gate-diya gate-diya-right" delay={.4} />
          <span className="gate-elephant gate-elephant-left" />
          <span className="gate-elephant gate-elephant-right" />
        </div>
        {burst && <Petals count={26} className="door-petals" />}
        <p className="scroll-prompt">Scroll to open</p>
        <span className="garden-fade" aria-hidden="true" />
      </div>
    </section>
  );
}
