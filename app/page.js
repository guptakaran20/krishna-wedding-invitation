'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import { ScrollControlContext, SheetContext, createScrollControl } from './lib/sheet';
import Opening from './components/Opening';
import ScrollCard from './components/ScrollCard';
import Couple from './components/Couple';
import StoryBook from './components/StoryBook';
import SaveTheDate from './components/SaveTheDate';
import EventVine from './components/EventVine';
import Venue from './components/Venue';
import MomentsCube from './components/MomentsCube';
import GoodToKnow from './components/GoodToKnow';
import OurFamilies from './components/OurFamilies';
import Rsvp from './components/Rsvp';
import BlessingBranch from './components/BlessingBranch';
import Contacts from './components/Contacts';
import Finale from './components/Finale';
import Petals from './components/Petals';
import { Butterflies } from './components/Ornaments';
import SoundToggle from './components/SoundToggle';
import { LangProvider } from './lib/lang';

// The invitation scrolls inside the phone. The opening, storybook, and Events hold their scenes in place while you scroll.
export default function Invitation() {
  const scroller = useRef(null);
  const control = useRef(null);
  if (!control.current) control.current = createScrollControl();

  useEffect(() => {
    const root = scroller.current;
    const runs = Array.from(root.querySelectorAll('[data-run]'), (element) => ({
      element, viewport: element.querySelector('[data-run-viewport]'), progress: null,
    }));
    let frame = 0;
    let height = 0;

    // report how far through each sticky run the reader is
    function update() {
      frame = 0;
      const view = root.clientHeight;
      // the sticky runs are sized in screens, so they need the screen's height (it is not the window's on a computer)
      if (height !== view) {
        height = view;
        root.style.setProperty('--sh', `${height}px`);
      }
      const rootTop = root.getBoundingClientRect().top;
      const progress = runs.map(({ element, viewport }) => {
        const start = element.getBoundingClientRect().top - rootTop;
        const distance = element.offsetHeight - (viewport?.offsetHeight ?? view);
        return Math.min(1, Math.max(0, -start / Math.max(1, distance)));
      });
      runs.forEach((run, index) => {
        if (run.progress === progress[index]) return;
        run.progress = progress[index];
        run.element.dispatchEvent(new CustomEvent('runprogress', { detail: run.progress }));
      });
    }
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };

    // [data-reveal] pieces fade up once as they come into view
    const reveal = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-in');
        reveal.unobserve(entry.target);
      }
    }, { root, threshold: .22, rootMargin: '0px 0px -8% 0px' });
    root.querySelectorAll('[data-reveal]').forEach((element) => reveal.observe(element));

    // Lenis smooths wheel and trackpad scrolling (touch stays native, as in the main site). Its events target is the
    // whole stage, so on a computer the wheel scrolls the phone from anywhere on the screen.
    const stage = root.closest('.stage');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const lenis = reduced ? null : new Lenis({
      wrapper: root,
      content: root.firstElementChild,
      eventsTarget: stage,
      lerp: .09,
      autoRaf: true,
    });
    Object.assign(control.current, { root, lenis, reduced });

    update();
    root.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      reveal.disconnect();
      lenis?.destroy();
      control.current.lenis = null;
      root.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <LangProvider>
    <main className="stage">
      <h1 className="sr-only">Sheshank and Sakshi’s wedding invitation</h1>
      <div className="backdrop" aria-hidden="true" />
      <div className="phone">
        <div className="phone-buttons" aria-hidden="true"><i /><i /><i /><i /></div>
        <div className="screen">
          <SheetContext.Provider value={scroller}>
          <ScrollControlContext.Provider value={control.current}>
            <div className="scroller" ref={scroller} tabIndex={0}>
              <div className="scroll-content">
              <Opening />
              <div className="sheet paper-surface">
                <ScrollCard />
                <Couple />
                <StoryBook />
                <SaveTheDate />
                <EventVine />
                <Venue />
                <GoodToKnow />
                <MomentsCube />
                <OurFamilies />
                <Rsvp />
                <BlessingBranch />
                <Contacts />
                <Finale />
              </div>
              </div>
            </div>
          </ScrollControlContext.Provider>
          </SheetContext.Provider>
          <Petals count={8} className="ambient-petals" />
          <Butterflies count={3} />
          <SoundToggle />
        </div>
        <div className="phone-camera" aria-hidden="true" />
        <div className="home-indicator" aria-hidden="true" />
      </div>
    </main>
    </LangProvider>
  );
}
