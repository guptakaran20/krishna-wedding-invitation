// Loads the paintings in the order the guest sees them, and keeps a phone from animating what is off screen.
//
// 1. The opening first. layout.js sets html.art-hold before the first paint and preloads the opening's paintings;
//    while it is on, globals.css switches off every CSS background on the paper sheet below, and every <img> outside
//    the opening is loading="lazy", so the room, curtains, couple and swing have the connection to themselves.
//    The hold lifts once those are in (or after HOLD_MAX, so a stuck download never holds the page back).
// 2. Then the rest, in page order. Once the hold lifts, every lazy picture is fetched in document order, two at a time,
//    plus anything within AHEAD screens of the view straight away: a scene that plays as you scroll (the storybook,
//    the events, the cube) already has its art when the guest reaches it, instead of drawing over an empty box.
// 3. Idle loops rest off screen. Every endless CSS loop on the page (petals, swaying garlands, twinkles, the bob on
//    a button) is found with document.getAnimations() and switched right off while off screen, not just paused: a
//    paused transform loop still holds a GPU layer and forces one onto everything painted above it, which is what runs
//    low-end phones out of graphics memory. Only loops that are an element's sole animation, so switching one off can
//    never undo a finished entrance. In lite mode they stay off (globals.css).
// 4. Sections more than a screen away drop their will-change hints (.is-far), so their layers are freed too.

const OPENING_ART = [
  '/art/room-bg.webp', '/art/curtain-left.webp', '/art/curtain-right.webp', '/art/couple-back.webp',
  '/art/swing.webp', '/art/card-bg.webp', '/art/card-garland.webp', '/art/lotus-divider.webp',
];
const HOLD_MAX = 8000;
const AHEAD = 3;

const loadImage = (src) => new Promise((resolve) => {
  const img = new Image();
  img.onload = img.onerror = resolve;
  img.src = src;
});

export function startArtLoader(scroller) {
  const html = document.documentElement;
  const timers = [];
  let stopped = false;

  // 1. the opening's paintings, then lift the hold
  let held = html.classList.contains('art-hold');
  const release = () => {
    if (!held) return;
    held = false;
    html.classList.remove('art-hold');
    timers.push(setTimeout(() => { filling = true; }, 600));
  };
  if (held) {
    Promise.race([Promise.all(OPENING_ART.map(loadImage)), new Promise((r) => { timers.push(setTimeout(r, HOLD_MAX)); })])
      .then(() => { if (!stopped) release(); });
  }

  // 2. the rest in page order
  let filling = !held;
  const queued = new Set();
  const fill = () => {
    let busy = 0;
    queued.forEach((img) => { if (img.complete || !img.isConnected) queued.delete(img); else busy++; });
    if (busy >= 2) return;
    for (const img of document.querySelectorAll('img[loading="lazy"]')) {
      img.loading = 'eager';
      if (img.complete) continue;
      queued.add(img);
      if (++busy >= 2) break;
    }
  };
  const ahead = () => {
    const h = scroller.clientHeight;
    const top = scroller.getBoundingClientRect().top;
    for (const img of document.querySelectorAll('img[loading="lazy"]')) {
      const r = img.getBoundingClientRect();
      if ((r.width || r.height) && r.top - top < h * AHEAD && r.bottom - top > -h) img.loading = 'eager';
    }
  };

  // 3. idle loops off while off screen (root: the viewport, which also clips by the phone's own scroller)
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-offscreen', !e.isIntersecting));
    }, { rootMargin: '25% 0px' })
    : null;
  const looped = new WeakSet();
  const findLoops = () => {
    if (!io || !document.getAnimations || typeof CSSAnimation === 'undefined') return;
    const byTarget = new Map();
    for (const a of document.getAnimations()) {
      if (!(a instanceof CSSAnimation)) continue;
      const fx = a.effect;
      const el = fx?.target;
      if (!el || looped.has(el)) continue;
      const slot = byTarget.get(el) || { own: [], before: [], after: [] };
      const list = fx.pseudoElement === '::before' ? slot.before : fx.pseudoElement === '::after' ? slot.after : fx.pseudoElement ? null : slot.own;
      if (!list) continue;
      list.push(fx.getTiming().iterations === Infinity);
      byTarget.set(el, slot);
    }
    byTarget.forEach(({ own, before, after }, el) => {
      const add = [];
      if (own.length && own.every(Boolean)) add.push('idle-loop');
      if (before.length && before.every(Boolean)) add.push('idle-before');
      if (after.length && after.every(Boolean)) add.push('idle-after');
      if (!add.length) return;
      looped.add(el);
      el.classList.add(...add);
      io.observe(el);
    });
  };

  // 4. far sections let go of their layers
  const far = 'IntersectionObserver' in window
    ? new IntersectionObserver((entries) => {
      entries.forEach((e) => e.target.classList.toggle('is-far', !e.isIntersecting));
    }, { rootMargin: '120% 0px' })
    : null;
  scroller.querySelectorAll('.sheet > section').forEach((section) => far?.observe(section));

  let ticks = 3;
  const check = () => {
    if (!held) ahead();
    if (filling) fill();
    // new loops start as scenes open; a scan once a second is plenty
    if (++ticks % 4 === 0) findLoops();
  };
  check();
  const id = setInterval(check, 250);

  return () => {
    stopped = true;
    clearInterval(id);
    timers.forEach(clearTimeout);
    io?.disconnect();
    far?.disconnect();
  };
}
