'use client';

import { useEffect, useRef, useState } from 'react';
import { useRunProgress, useScrollControl } from '../lib/sheet';
import SectionTitle from './SectionTitle';
import MomentsDeck from './MomentsDeck';
import { invite } from '../invite';
import { sfx } from '../lib/sound';
import { useLang } from '../lib/lang';
import './MomentsCube.css';

// Moments Together, after a glass gallery cube. When the section reaches the top of the screen the page holds still
// and the guest's scrolling (wheel, trackpad or swipe) drives the scene instead:
//   cube   sixteen gold-rimmed tiles make the four sides of a cube (2 × 2 a side, an "S & S" lid), turning slowly;
//   band   the tiles fly apart and wrap into a curved band that turns like a carousel;
//   pile   the band gathers into a stack of postcards in the middle…
//   deck   …which becomes the postcard pile, to swipe through and tap open.
// Scrolling on past the end lets the page go; scrolling back up into the section holds it again and plays it in
// reverse. Twelve tiles are the couple's moments; four are ornaments (monogram, date, marigold, lotus).
const SLOTS = 16;
const DECO = { 2: 'mono', 7: 'date', 8: 'marigold', 13: 'lotus' };
// how much scrolling plays the whole scene, in screen heights
const SCREENS = 1.8;
const smooth = (t) => t * t * (3 - 2 * t);
const clamp = (t) => Math.min(1, Math.max(0, t));
const mix = (a, b, t) => a + (b - a) * t;
// angles wrapped to -180…180, so a tile turns the short way round
const wrap = (deg) => ((((deg + 180) % 360) + 360) % 360) - 180;
// a little scatter for each tile in the pile, fixed per tile
const scatter = (s, k) => {
  const v = Math.sin(s * 12.9898 + k * 78.233) * 43758.5453;
  return v - Math.floor(v);
};

function tiles() {
  const photos = invite.moments;
  let next = 0;
  return Array.from({ length: SLOTS }, (_, slot) => (DECO[slot] ? { slot, deco: DECO[slot] } : { slot, photo: next++ % photos.length }));
}

function Deco({ kind }) {
  const { t, invite } = useLang();
  const { day, month, year } = invite.dateParts;
  if (kind === 'mono') return <span className="cube-deco"><b className="script">{invite.groom[0]}<i>&amp;</i>{invite.bride[0]}</b></span>;
  if (kind === 'date' && !invite.dateRevealed) return <span className="cube-deco cube-date"><i className="script">{t('Save the date')}</i><small>{t('to follow')}</small></span>;
  if (kind === 'date') return <span className="cube-deco cube-date"><b>{day}</b><i className="script">{month}</i><small>{year}</small></span>;
  if (kind === 'marigold') return <span className="cube-deco"><img loading="lazy" src="/art/events-marigold.webp" alt="" draggable="false" /></span>;
  return <span className="cube-deco cube-lotus"><img loading="lazy" src="/art/lotus-divider.webp" alt="" draggable="false" /><i className="script">{t('with love')}</i></span>;
}

export default function MomentsCube() {
  const { t } = useLang();
  const photos = invite.moments;
  const run = useRef(null);
  const sticky = useRef(null);
  const stage = useRef(null);
  const control = useScrollControl();
  // target: where the guest's scrolling has taken the scene (0 cube … 1 postcards); shown: where it is drawn, eased
  const scene = useRef({ target: 0, shown: 0, mode: 'above' });
  const [deck, setDeck] = useState(false);
  const [ready, setReady] = useState(false);
  const list = useRef(tiles());

  function alignRun(end) {
    const box = run.current;
    const top = control.offsetOf(box);
    const distance = box.offsetHeight - sticky.current.offsetHeight;
    // Land outside the run so scroll rounding cannot trigger another hold on release.
    control.jump(end ? Math.ceil(top + distance) : Math.floor(top));
  }

  // hold the page and hand the guest's scrolling to the scene
  function hold(from) {
    const state = scene.current;
    state.mode = 'playing';
    state.target = from;
    control.lock();
    alignRun(from);
  }
  function release(end) {
    const state = scene.current;
    state.mode = end ? 'below' : 'above';
    alignRun(end);
    control.unlock();
  }

  // tapping the cube plays the scene on its own: the tiles shuffle apart, gather and become the postcards
  function shuffle() {
    const state = scene.current;
    if (state.mode === 'above' && !control.reduced) hold(0);
    if (state.mode === 'playing' && state.target < 1) state.target = 1;
  }

  useRunProgress(stage, (p) => {
    const state = scene.current;
    if (control.reduced) return;
    // passing by on the way back to the top: no holding
    if (control.travelling) {
      state.mode = p >= 1 ? 'below' : 'above';
      state.target = p >= 1 ? 1 : 0;
      return;
    }
    if (state.mode === 'above' && p > .001) hold(0);
    else if (state.mode === 'below' && p < .97) hold(1);
  });

  // the guest's wheel, trackpad and finger move the scene while the page is held
  useEffect(() => {
    // the page registers its scroller after this section mounts; the second run (after `ready`) finds it
    const scroller = control.root;
    if (!scroller) return undefined;
    const page = scroller.closest('.stage') || window;
    let touchY = null;
    const move = (delta) => {
      const state = scene.current;
      if (state.mode !== 'playing') return;
      state.target = Math.min(1.08, Math.max(-.08, state.target + delta / (scroller.clientHeight * SCREENS)));
    };
    const wheel = (event) => {
      const unit = event.deltaMode === 1 ? 40 : event.deltaMode === 2 ? scroller.clientHeight : 1;
      move(event.deltaY * unit);
    };
    const start = (event) => { touchY = event.touches[0].clientY; };
    const touch = (event) => {
      if (touchY === null) return;
      const y = event.touches[0].clientY;
      move((touchY - y) * 1.6);
      touchY = y;
    };
    const end = () => { touchY = null; };
    // the page's idle auto-scroll (lib/idleNudge.js) moves the scene along a step while it holds the page
    const nudge = (event) => {
      const state = scene.current;
      if (state.mode !== 'playing') return;
      event.preventDefault();
      state.target = Math.min(1.08, Math.max(0, state.target) + event.detail * 1.5 / SCREENS);
    };
    scroller.addEventListener('idlenudge', nudge);
    page.addEventListener('wheel', wheel, { passive: true });
    scroller.addEventListener('touchstart', start, { passive: true });
    scroller.addEventListener('touchmove', touch, { passive: true });
    scroller.addEventListener('touchend', end, { passive: true });
    return () => {
      scroller.removeEventListener('idlenudge', nudge);
      page.removeEventListener('wheel', wheel);
      scroller.removeEventListener('touchstart', start);
      scroller.removeEventListener('touchmove', touch);
      scroller.removeEventListener('touchend', end);
    };
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { setReady(true); }, []);

  // draw the tiles every frame while the stage is on screen
  useEffect(() => {
    const root = stage.current;
    const els = Array.from(root.querySelectorAll('.cube-tile'));
    // what each tile was last given, so a frame only touches what changed (an unchanged write still costs a style pass)
    const shades = els.map((el) => el.querySelector('.cube-shade'));
    const wrote = els.map(() => ({ opacity: '', shade: '' }));
    let pileHeight = '';
    let lidOpacity = '';
    let measured = false;
    const lid = root.querySelector('.cube-lid');
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let frame = 0;
    let visible = false;
    let idle = 0;
    let last = performance.now();
    let deckShown = false;
    // which stage the scene was in last frame (cube, band, pile, deck), to sound each change as it happens
    let stageWas = 0;
    const pileAt = { x: 0, y: 0, scale: 1, heightRatio: 1 };

    function draw(now) {
      frame = 0;
      const dt = Math.min(64, now - last);
      last = now;
      const state = scene.current;
      if (reduced) state.target = 1;
      // ease towards where the guest has scrolled
      state.shown += (clamp(state.target) - state.shown) * Math.min(1, dt * .007);
      if (Math.abs(clamp(state.target) - state.shown) < .0005) state.shown = clamp(state.target);
      // played through either way: let the page go
      if (state.mode === 'playing') {
        if (state.target >= 1.06 && state.shown > .995) release(true);
        else if (state.target <= -.06 && state.shown < .005) release(false);
      }
      const p = state.shown;
      const burst = smooth(clamp((p - .22) / .3));
      const gather = smooth(clamp((p - .55) / .27));
      const fade = smooth(clamp((p - .84) / .12));
      idle += dt * .012 * (1 - gather);
      const u = root.clientWidth / 100;
      const edge = 46 * u;
      const tile = edge / 2;
      const cubeSpin = idle + p * 300;
      const bandSpin = idle * 1.3 + p * 360;
      const radius = 58 * u;
      // Match the position and shape of the top postcard before the deck fades in. Measured once, as the tiles start
      // to gather (and again after a resize): reading the layout every frame forced a full layout pass each time.
      if (gather <= 0) measured = false;
      if (!deckShown && gather > 0 && !measured) {
        measured = true;
        const card = root.querySelector('.deck-card.is-top');
        if (card) {
          const a = card.getBoundingClientRect();
          const b = root.getBoundingClientRect();
          pileAt.x = a.left + a.width / 2 - (b.left + b.width / 2);
          pileAt.y = a.top + a.height / 2 - (b.top + b.height / 2);
          pileAt.scale = card.offsetWidth / tile;
          pileAt.heightRatio = card.offsetHeight / card.offsetWidth;
        }
      }
      // the tiles' height only changes while they gather into postcards; setting it every frame re-laid them all out
      const height = `${(tile * mix(1, pileAt.heightRatio, gather)).toFixed(1)}px`;
      if (height !== pileHeight) { pileHeight = height; root.style.setProperty('--pile-tile-height', height); }

      els.forEach((el, s) => {
        const k = Math.floor(s / 4);
        const r = Math.floor((s % 4) / 2);
        const c = s % 2;
        const cube = { rx: -14, ry: k * 90 + cubeSpin, rz: 0, x: (c - .5) * tile, y: (r - .5) * tile, z: edge / 2, s: 1 };
        const band = { rx: -6, ry: s * (360 / SLOTS) + bandSpin, rz: 0, x: 0, y: 0, z: radius, s: .88 };
        // stacked like postcards: slightly scattered and turned, the later ones on top
        // The first tile lies flat on top.
        const top = s === 0;
        const pile = { rx: 0, ry: 0, rz: top ? 0 : (scatter(s, 1) - .5) * 14, x: pileAt.x + (top ? 0 : (scatter(s, 2) - .5) * 5 * u), y: pileAt.y + (top ? 0 : (scatter(s, 3) - .5) * 4 * u), z: (SLOTS - s) * .6 * u, s: pileAt.scale };

        let rx; let ry; let rz; let x; let y; let z; let sc;
        if (gather > 0) {
          const t = gather;
          ry = wrap(band.ry) * (1 - t);
          rx = mix(band.rx, pile.rx, t); rz = mix(0, pile.rz, t);
          x = mix(band.x, pile.x, t); y = mix(band.y, pile.y, t); z = mix(band.z, pile.z, t); sc = mix(band.s, pile.s, t);
        } else {
          const t = burst;
          ry = cube.ry + wrap(band.ry - cube.ry) * t;
          rx = mix(cube.rx, band.rx, t); rz = 0;
          x = mix(cube.x, band.x, t); y = mix(cube.y, band.y, t); z = mix(cube.z, band.z, t); sc = mix(cube.s, band.s, t);
        }
        el.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg) translate3d(${x}px, ${y}px, ${z}px) rotateZ(${rz}deg) scale(${sc})`;
        const opacity = (1 - fade).toFixed(2);
        if (opacity !== wrote[s].opacity) { wrote[s].opacity = opacity; el.style.opacity = opacity; }
        // the side turning away darkens: a shade layer of its own, so this is a compositor-only change, not a repaint
        // of the tile (its photo, rim and shadow) on every frame
        const facing = Math.cos((wrap(ry) * Math.PI) / 180);
        const shade = (gather > .98 ? 0 : (1 - Math.max(0, facing)) * .55).toFixed(2);
        if (shade !== wrote[s].shade && shades[s]) { wrote[s].shade = shade; shades[s].style.opacity = shade; }
      });
      lid.style.transform = `rotateX(-14deg) rotateY(${cubeSpin}deg) rotateX(90deg) translateZ(${edge / 2}px)`;
      const lidNow = (1 - clamp(burst * 2.5)).toFixed(2);
      if (lidNow !== lidOpacity) { lidOpacity = lidNow; lid.style.opacity = lidNow; }
      const stageNow = p > .84 ? 3 : p > .55 ? 2 : p > .22 ? 1 : 0;
      if (stageNow !== stageWas) {
        if (stageNow === 1 && stageWas === 0) sfx.whoosh(0, 1, .2, 250, 2200);
        else if (stageNow === 0) sfx.whoosh(0, .9, .16, 2200, 300);
        else if (stageNow === 2 && stageWas === 1) { sfx.whoosh(0, .7, .14, 1800, 500); for (let i = 0; i < 6; i += 1) sfx.flick(.25 + i * .07); }
        else if (stageNow === 3) sfx.sparkle(0);
        stageWas = stageNow;
      }
      const showDeck = p > .84;
      if (showDeck !== deckShown) { deckShown = showDeck; setDeck(showDeck); }
      if (visible) frame = requestAnimationFrame(draw);
    }

    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible && !frame) { last = performance.now(); frame = requestAnimationFrame(draw); }
    });
    io.observe(root);
    const resized = () => { measured = false; };
    window.addEventListener('resize', resized);
    draw(performance.now());
    return () => { io.disconnect(); window.removeEventListener('resize', resized); cancelAnimationFrame(frame); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className={`cube-run${deck ? ' is-deck' : ''}`} ref={run} data-run="moments" aria-labelledby="moments-title">
      <div className="cube-sticky" ref={sticky} data-run-viewport>
        <SectionTitle eyebrow={t('Our journey')} title={t('Moments Together')} id="moments-title" />
        <div className="cube-stage" ref={stage}>
          <ul className="cube" aria-hidden="true" onClick={shuffle}>
            {list.current.map((item) => (
              <li key={item.slot} className={`cube-tile${item.deco ? ' is-deco' : ''}`}>
                {item.deco ? <Deco kind={item.deco} /> : <span className="cube-photo"><img src={photos[item.photo].art} alt="" draggable="false" loading="lazy" decoding="async" /></span>}
                <i className="cube-shade" />
              </li>
            ))}
            <li className="cube-lid"><Deco kind="mono" /></li>
          </ul>
          <div className="cube-deck">
            <MomentsDeck active={deck} />
          </div>
        </div>
        <p className="cube-hint" aria-hidden={deck}>{t('Scroll to open our gallery')}</p>
      </div>
    </section>
  );
}
