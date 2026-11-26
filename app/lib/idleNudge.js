// Wherever the guest stops, once everything on screen has finished animating and they have not scrolled for IDLE ms,
// the invitation drifts down a little on its own (like a photo sliding up), then waits again. Ported from the
// Utsavy site's IdleNudge.
// Any wheel, touch, key or tap hands control straight back. Nothing happens while the opening waits for its tap, while
// a scene plays by itself, a photo is open, the menu is open, a form field has focus, or at the end of the page.
// The Moments cube holds the page and is moved by scrolling, so there the nudge is handed to the cube instead
// (an 'idlenudge' event on the scroller, MomentsCube.jsx), which plays it on a step and then lets the page go.
// Add ?noauto to the URL to switch it off, e.g. for testing.
const IDLE = 3000;
const STEP = .35; // how far each nudge scrolls, as a share of the screen height
const DURATION = 2.4;
const ease = (t) => -(Math.cos(Math.PI * t) - 1) / 2; // ease-in-out sine: a slow start, a soft stop

// a CSS entrance or transition still playing out (endless loops never finish, so they don't count)
const animating = () => {
  if (!document.getAnimations) return false;
  return document.getAnimations().some((a) => {
    if (a.playState !== 'running') return false;
    const timing = a.effect?.getComputedTiming?.();
    return timing && timing.iterations !== Infinity && timing.activeDuration > 0;
  });
};

export function startIdleNudge(control) {
  const root = control.root;
  const q = new URLSearchParams(location.search);
  if (!root || control.reduced || q.has('noauto') || q.has('notour')) return () => {};

  let last = performance.now();
  let nudging = 0; // when the current nudge started (0: none)

  const stopNudge = () => {
    if (!nudging) return;
    nudging = 0;
    // stop() clears Lenis's running scrollTo; only restart it if no scene has locked the page meanwhile
    control.lenis?.stop();
    if (!control.locks) control.lenis?.start();
  };
  const onInput = () => { last = performance.now(); stopNudge(); };
  const onScroll = () => { if (!nudging) last = performance.now(); };
  const inputs = ['wheel', 'touchstart', 'touchmove', 'keydown', 'pointerdown'];
  inputs.forEach((name) => window.addEventListener(name, onInput, { passive: true }));
  root.addEventListener('scroll', onScroll, { passive: true });

  const check = () => {
    const now = performance.now();
    if (nudging) {
      // a scene took the page mid-glide (its lock stops Lenis, so the glide never completes): start the wait again
      if (control.locks || now - nudging > DURATION * 1000 + 800) { nudging = 0; last = now; }
      return;
    }
    const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName || '');
    const menu = document.querySelector('.sidebar-scrim.is-open');
    // anything that keeps the page busy restarts the wait, so the 3 s count from when it all settles
    if (typing || menu || document.hidden || control.travelling || animating()) { last = now; return; }
    if (now - last < IDLE) return;

    if (control.locks) {
      // held by a scene: only the Moments cube takes a nudge (it is driven by scrolling); others play by themselves
      const event = new CustomEvent('idlenudge', { detail: STEP, cancelable: true });
      root.dispatchEvent(event);
      last = now;
      return;
    }

    const max = root.scrollHeight - root.clientHeight;
    const from = control.lenis ? control.lenis.scroll : root.scrollTop;
    if (from >= max - 4) return; // at the end: nothing left to show
    const to = Math.min(max, from + root.clientHeight * STEP);
    nudging = now;
    const done = () => { nudging = 0; last = performance.now(); };
    if (control.lenis) {
      control.lenis.scrollTo(to, { duration: DURATION, easing: ease, onComplete: done });
    } else {
      root.scrollTo({ top: to, behavior: 'smooth' });
      setTimeout(done, DURATION * 1000);
    }
  };
  const id = setInterval(check, 250);

  return () => {
    clearInterval(id);
    stopNudge();
    inputs.forEach((name) => window.removeEventListener(name, onInput));
    root.removeEventListener('scroll', onScroll);
  };
}
