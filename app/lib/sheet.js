'use client';

import { createContext, useContext, useEffect, useRef, useState } from 'react';

// The scrolling element of the invitation (the paper sheet inside the phone). Observers and scroll listeners use it,
// because the page itself never scrolls.
export const SheetContext = createContext({ current: null });

export const clamp = (value) => Math.min(1, Math.max(0, value));
export function easeBetween(value, start, end) {
  const progress = clamp((value - start) / (end - start));
  return progress * progress * (3 - 2 * progress);
}

// true once the element has scrolled `amount` of the way into the invitation
export function useInView(ref, amount = .35) {
  const root = useContext(SheetContext);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    if (!ref.current) return undefined;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setSeen(true); observer.disconnect(); }
    }, { root: root.current, threshold: amount });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, root, amount]);
  return seen;
}

// how far a section has travelled through the screen: 0 as its top meets `from` (a share of the screen height
// from the top), 1 as its bottom meets `to`
export function useTravel(ref, onTravel, from = .85, to = .45) {
  const root = useContext(SheetContext);
  const callback = useRef(onTravel);
  callback.current = onTravel;
  useEffect(() => {
    const scroller = root.current;
    if (!scroller || !ref.current) return undefined;
    let frame = 0;
    const update = () => {
      frame = 0;
      const view = scroller.clientHeight;
      const box = ref.current.getBoundingClientRect();
      const top = box.top - scroller.getBoundingClientRect().top;
      const start = view * from;
      const end = view * to - box.height;
      callback.current(clamp((start - top) / Math.max(1, start - end)));
    };
    const schedule = () => { if (!frame) frame = requestAnimationFrame(update); };
    update();
    scroller.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      scroller.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      cancelAnimationFrame(frame);
    };
  }, [ref, root, from, to]);
}

// progress of a sticky run (page.js measures it)
export function useRunProgress(ref, onProgress) {
  const callback = useRef(onProgress);
  callback.current = onProgress;
  useEffect(() => {
    const run = ref.current?.closest('[data-run]');
    if (!run) return undefined;
    const listen = (event) => callback.current(event.detail);
    run.addEventListener('runprogress', listen);
    return () => run.removeEventListener('runprogress', listen);
  }, [ref]);
}

// Scroll control for scenes that play on their own: lock() holds the invitation still (wheel, touch and keys) until
// unlock(), jump() moves it instantly, glide() eases it to a spot. page.js fills in the scroller and its Lenis.
export const ScrollControlContext = createContext(null);
export const useScrollControl = () => useContext(ScrollControlContext);

export function createScrollControl() {
  const control = {
    root: null,
    lenis: null,
    reduced: false,
    // true while the page glides back to the top, so scenes on the way don't start
    travelling: false,
    locks: 0,
    lock() {
      if (control.locks++ > 0) return;
      control.lenis?.stop();
      control.root?.classList.add('is-locked');
    },
    unlock() {
      if (control.locks === 0 || --control.locks > 0) return;
      control.root?.classList.remove('is-locked');
      control.lenis?.start();
    },
    // where an element sits in the scroller's content
    offsetOf(element) {
      const root = control.root;
      return element.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop;
    },
    jump(top) {
      if (control.lenis) control.lenis.scrollTo(top, { immediate: true, force: true });
      else control.root.scrollTop = top;
    },
    glide(top, duration = .9) {
      return new Promise((resolve) => {
        if (control.lenis) {
          control.lenis.scrollTo(top, { duration, force: true, lock: true, onComplete: () => resolve() });
          return;
        }
        control.root.scrollTo({ top, behavior: control.reduced ? 'auto' : 'smooth' });
        setTimeout(resolve, control.reduced ? 0 : duration * 1000);
      });
    },
  };
  return control;
}

// plays `step(elapsedSeconds)` every frame for `seconds`, then calls `done`; returns a cancel function
export function playFor(seconds, step, done) {
  let frame = 0;
  const start = performance.now();
  const tick = (now) => {
    const elapsed = Math.min(seconds, (now - start) / 1000);
    step(elapsed);
    if (elapsed < seconds) frame = requestAnimationFrame(tick);
    else { frame = 0; done?.(); }
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}
