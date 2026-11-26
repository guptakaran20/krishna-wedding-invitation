'use client';

import { useEffect, useRef } from 'react';
import { clamp, easeBetween, playFor, useRunProgress, useScrollControl } from '../lib/sheet';
import { calendarLink } from '../lib/calendar';
import { invite } from '../invite';
import { FairyLights } from './Ornaments';
import Petals from './Petals';
import { sfx } from '../lib/sound';
import { useLang } from '../lib/lang';
import './EventVine.css';

// Each scene uses these cues to choreograph its artwork and text.
const cues = [
  { wipe: 'feathers', cut: 1.4, end: 2.7, title: 2.75, details: 3.5 },
  { wipe: 'toast', cut: 1.2, end: 2.1, title: 2.7, details: 3.45 },
  { wipe: 'marigolds', cut: .85, end: 1.8, title: 1.85, details: 2.6 },
  { wipe: 'roses', cut: 1.3, end: 2.6, title: 2.45, details: 3.2 },
];

const scenes = invite.events.map((event, index) => {
  const cue = cues.find(({ wipe }) => wipe === event.transition) ?? cues[index % cues.length];
  return { ...cue, event };
});
const detailsDuration = 2;
// Extra timeline space keeps the resting position within the current event.
const holdDuration = 1.8;
const advanceDelay = 3000;
const longPressDelay = 300;
// how fast each event's entrance plays (1 = the cue times above, in seconds); it always plays through in full
const pace = 1;
// The first event plays its opening as soon as the section arrives.
const introEnd = scenes.length
  ? (scenes[0].details + detailsDuration) / (scenes[0].details + detailsDuration + holdDuration)
  : 0;
// how far (in events) the reader scrolls on before the next event starts
const nudge = .05;
// how far (in events) the reader scrolls back up before the previous event returns, and how long that takes
const backNudge = .08;
const rewindSeconds = 1.3;
// an event seen before plays its entrance this much faster the next time
const revisitPace = 1.8;
// where an event's entrance ends: its words fully shown
const restOf = (index) => index + (scenes[index].details + detailsDuration) / (scenes[index].details + detailsDuration + holdDuration);
const flowers = [[6, 1], [52, 0], [94, 12], [24, 38], [78, 49], [0, 75], [50, 84], [99, 88]];
const rosePetals = [
  [4, 8, 37], [45, 3, 53], [91, 15, 39], [19, 27, 41], [67, 31, 44],
  [0, 46, 49], [43, 51, 46], [89, 48, 52], [16, 66, 46], [63, 70, 52],
  [98, 83, 42], [14, 96, 48], [50, 89, 40], [77, 99, 47],
];
const eventDay = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'long', timeZone: 'UTC' });

function EventWipes() {
  return (
    <div className="events-wipes" aria-hidden="true">
      <div className="events-wipe events-feathers">
        <img className="events-feather events-feather-top" src="/art/events-feathers.webp" alt="" loading="lazy" />
        <img className="events-feather events-feather-bottom" src="/art/events-feathers.webp" alt="" loading="lazy" />
        <img className="events-hand events-hand-left" src="/art/hand-henna.webp" alt="" loading="lazy" />
        <img className="events-hand events-hand-right" src="/art/hand-henna.webp" alt="" loading="lazy" />
      </div>
      <div className="events-wipe events-toast">
        <img className="events-cup events-cup-left" src="/art/events-toast.webp" alt="" loading="lazy" />
        <img className="events-cup events-cup-right" src="/art/events-toast.webp" alt="" loading="lazy" />
      </div>
      <div className="events-wipe events-marigolds">
        {flowers.map(([x, y], index) => (
          <img key={index} src="/art/events-marigold.webp" alt="" loading="lazy" style={{ left: `${x}%`, top: `${y}%`, '--turn': `${index * 31}deg` }} />
        ))}
      </div>
      <div className="events-wipe events-roses">
        {rosePetals.map(([x, y, size], index) => (
          <img key={index} src="/art/events-petal.webp" alt="" loading="lazy" style={{ left: `${x}%`, top: `${y}%`, width: `${size}cqw`, '--turn': `${(index * 77) % 360}deg` }} />
        ))}
      </div>
    </div>
  );
}

function EventScene({ scene, first }) {
  // the event's details stay as the family wrote them (English); only the buttons follow the language
  const { t } = useLang();
  const { event, wipe } = scene;
  const date = eventDay.format(new Date(event.start.slice(0, 10)));
  return (
    <article className="event-scene" data-active={first}>
      <img className="event-scene-art" src={event.art || '/art/paper-cream.webp'} alt="" loading="lazy" />
      {wipe === 'toast' && (
        <div className="event-stage-trim" aria-hidden="true">
          <img className="event-curtain event-curtain-left" src="/art/curtain-left.webp" alt="" loading="lazy" />
          <img className="event-curtain event-curtain-right" src="/art/curtain-right.webp" alt="" loading="lazy" />
          <FairyLights className="event-string event-string-upper" count={17} sag={11} />
          <FairyLights className="event-string event-string-lower" count={15} sag={6} />
        </div>
      )}
      {wipe === 'marigolds' && <Petals className="event-falling-marigolds" count={10} />}
      <div className="event-copy" data-long-title={event.name.length > 23}>
        <h3>{event.name}</h3>
        <ul className="event-info">
          <li>{invite.dateRevealed ? <time dateTime={event.start}>{date} · {event.time}</time> : <>{t('Date to be announced')} · {event.time}</>}</li>
          <li>{event.place}</li>
          {event.attire && <li className="event-attire">{event.attire}</li>}
        </ul>
        <div className="event-actions">
          <a className="event-link" href={event.mapUrl || invite.mapUrl} target="_blank" rel="noreferrer" aria-label={`${t('Location')}: ${event.name}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" /><circle cx="12" cy="10" r="2.4" /></svg>
            {t('Location')}
          </a>
          {invite.dateRevealed && <a className="event-link event-link-main" href={calendarLink(event)} download={`${event.name}.ics`} aria-label={`${t('Save the date')}: ${event.name}`}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="4" y="5.5" width="16" height="14.5" rx="2.2" /><path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" /></svg>
            {t('Save the date')}
          </a>}
        </div>
      </div>
    </article>
  );
}

// the sound of each event's entrance; `rate` is real seconds per second of the cue times (they play faster on a revisit)
function cueSounds(scene, rate) {
  const at = (time) => time * rate;
  if (scene.wipe === 'feathers') {
    sfx.whoosh(0, at(1.3), .2, 250, 1800);
    sfx.whoosh(at(1.4), at(1.2), .14, 1800, 400);
  } else if (scene.wipe === 'toast') {
    sfx.whoosh(0, at(1.1), .16, 300, 1500);
    sfx.clink(at(scene.cut));
    sfx.curtain(at(scene.cut));
  } else if (scene.wipe === 'marigolds') {
    sfx.patter(0, at(1.1), 18);
    sfx.bell(at(scene.cut), 784, .3, .07);
  } else {
    sfx.patter(0, at(1.5), 14);
    sfx.whoosh(0, at(1.5), .12, 400, 1600);
  }
}

export default function EventVine() {
  const { t } = useLang();
  const view = useRef(null);
  const control = useScrollControl();
  const playback = useRef({ position: 0, active: 0, done: -1, seen: -1, anchor: 0, high: 0, playing: false, progress: null, stop: null });
  const autoplay = useRef({ id: null, remaining: advanceDelay, deadline: 0, press: null, longPress: false, keyboardFocus: false });

  function canAdvance() {
    const state = playback.current;
    const timer = autoplay.current;
    return !control.reduced && !control.travelling && !document.hidden
      && !state.playing && state.done >= 0 && state.done < scenes.length - 1
      && state.progress > 0 && state.progress < 1 && !timer.press && !timer.keyboardFocus;
  }

  function pauseTimer() {
    const timer = autoplay.current;
    if (timer.id === null) return;
    clearTimeout(timer.id);
    timer.id = null;
    timer.remaining = Math.max(0, timer.deadline - performance.now());
  }

  function resetTimer() {
    pauseTimer();
    autoplay.current.remaining = advanceDelay;
  }

  function updateTimer() {
    const timer = autoplay.current;
    if (!canAdvance()) {
      pauseTimer();
      return;
    }
    if (timer.id !== null) return;
    timer.deadline = performance.now() + timer.remaining;
    timer.id = setTimeout(() => {
      timer.id = null;
      timer.remaining = 0;
      if (canAdvance()) play(playback.current.done + 1);
    }, timer.remaining);
  }

  function startPress(event) {
    const timer = autoplay.current;
    if (control.reduced || event.button !== 0 || timer.press) return;
    timer.press = { pointerId: event.pointerId, startedAt: performance.now() };
    timer.longPress = false;
    pauseTimer();
  }

  function resetOnClick(event) {
    // A held mouse button can still produce a click on release.
    if (event.detail > 0 && autoplay.current.longPress) {
      event.preventDefault();
      return;
    }
    resetTimer();
    updateTimer();
  }

  function paint(position) {
    const stage = view.current;
    const state = playback.current;
    const index = Math.min(Math.floor(position), scenes.length - 1);
    const scene = scenes[index];
    const elapsed = (position - index) * (scene.details + detailsDuration + holdDuration);
    const incoming = elapsed >= scene.cut;
    const shown = incoming ? index : Math.max(0, index - 1);
    const opening = index === 0 || incoming;
    const motion = clamp(elapsed / scene.end);
    const cover = easeBetween(elapsed, 0, scene.cut) * (1 - easeBetween(elapsed, scene.cut, scene.end));
    const details = opening ? easeBetween(elapsed, scene.details, scene.details + detailsDuration) : 1;
    const set = (name, value) => stage.style.setProperty(name, value.toFixed(4));

    if (state.active !== shown) {
      stage.children[state.active].dataset.active = 'false';
      stage.children[shown].dataset.active = 'true';
      state.active = shown;
    }

    const wiping = elapsed > 0 && elapsed < scene.end;
    stage.dataset.wipe = wiping ? scene.wipe : '';
    stage.dataset.links = details === 1 && !wiping;
    set('--wipe-time', motion);
    set('--wipe-cover', cover);
    set('--event-foreground', easeBetween(motion, .14, .57) * (1 - easeBetween(motion, .66, .97)));
    set('--event-title', opening ? easeBetween(elapsed, scene.title, scene.title + 1.05) : 1);
    set('--event-details', details);
    set('--event-curtains', opening ? easeBetween(elapsed, scene.cut, scene.end + .25) : 1);
    set('--event-lights', opening ? easeBetween(elapsed, scene.end, scene.title + .25) : 1);
  }

  // Line the page up with this event's stretch so a short scroll moves to the next or previous event.
  function align(index) {
    const state = playback.current;
    const run = view.current.closest('[data-run]');
    const at = Math.max(introEnd, index) + .02;
    state.anchor = at;
    state.high = at;
    const progress = (at - introEnd) / Math.max(.001, scenes.length - introEnd);
    control.jump(control.offsetOf(run) + progress * (run.offsetHeight - control.root.clientHeight));
  }

  function play(index) {
    const state = playback.current;
    resetTimer();
    state.playing = true;
    control.lock();
    align(index);
    const from = index;
    const to = restOf(index);
    const total = scenes[index].details + detailsDuration + holdDuration;
    const seconds = control.reduced ? 0 : (to - from) * total / (pace * (index <= state.seen ? revisitPace : 1));
    state.seen = Math.max(state.seen, index);
    if (seconds) cueSounds(scenes[index], seconds / (scenes[index].details + detailsDuration));
    state.stop = playFor(seconds, (elapsed) => {
      state.position = seconds ? from + (to - from) * (elapsed / seconds) : to;
      paint(state.position);
    }, () => {
      state.playing = false;
      state.stop = null;
      state.done = index;
      control.unlock();
      settle();
      updateTimer();
    });
  }

  // compare where the scroll is with the last event played: a short scroll down (about 40px)
  // starts the next event; scrolling back above an event's stretch shows the one before it
  function settle() {
    const state = playback.current;
    if (control.reduced || state.playing || state.progress == null) return;
    // passing through on the way back to the top: leave the events as they are
    if (control.travelling) return;
    if (state.progress >= 1 && state.done < scenes.length - 1) {
      // already past the events (a reload further down): show the last one, without pulling the reader back
      state.done = scenes.length - 1;
      state.position = restOf(state.done);
      paint(state.position);
      return;
    }
    if (state.done < 0) {
      if (state.progress > 0) play(0);
      return;
    }
    if (state.progress <= 0) {
      // scrolled back above the events: the first one waits there, ready to carry on when the reader comes back down
      if (state.done > 0) {
        state.done = 0;
        state.position = restOf(0);
        paint(state.position);
      }
      state.anchor = state.high = introEnd + .02;
      return;
    }
    const target = introEnd + state.progress * (scenes.length - introEnd);
    state.anchor = Math.min(state.anchor, target);
    state.high = Math.max(state.high, target);
    if (target > state.anchor + nudge && state.done < scenes.length - 1) play(state.done + 1);
    else if (target < state.high - backNudge && state.done > 0) rewind(state.done - 1);
  }

  // scrolling back: the current event's entrance runs backwards (quickly, without holding the page) to the one before
  function rewind(index) {
    const state = playback.current;
    resetTimer();
    state.playing = true;
    state.done = index;
    align(index);
    const from = state.position;
    const to = restOf(index);
    const seconds = control.reduced ? 0 : rewindSeconds;
    state.stop = playFor(seconds, (elapsed) => {
      const t = seconds ? easeBetween(elapsed, 0, seconds) : 1;
      state.position = from + (to - from) * t;
      paint(state.position);
    }, () => {
      state.playing = false;
      state.stop = null;
      settle();
      updateTimer();
    });
  }

  useRunProgress(view, (progress) => {
    playback.current.progress = progress;
    if (progress <= 0 || progress >= 1) resetTimer();
    settle();
    updateTimer();
  });

  useEffect(() => {
    const state = playback.current;
    const timer = autoplay.current;

    function releasePress(event) {
      const press = timer.press;
      if (!press || ('pointerId' in event && event.pointerId !== press.pointerId)) return;
      timer.longPress = event.type === 'pointerup' && performance.now() - press.startedAt >= longPressDelay;
      timer.press = null;
      updateTimer();
    }

    window.addEventListener('pointerup', releasePress);
    window.addEventListener('pointercancel', releasePress);
    window.addEventListener('blur', releasePress);
    document.addEventListener('visibilitychange', updateTimer);
    return () => {
      window.removeEventListener('pointerup', releasePress);
      window.removeEventListener('pointercancel', releasePress);
      window.removeEventListener('blur', releasePress);
      document.removeEventListener('visibilitychange', updateTimer);
      resetTimer();
      state.stop?.();
    };
  }, [control]);

  if (!scenes.length) return null;

  return (
    <section className="events" aria-labelledby="events-title" aria-describedby="events-instructions" data-gap=".1">
      <h2 className="sr-only" id="events-title">{t('Events')}</h2>
      <p className="sr-only" id="events-instructions">Events advance automatically when motion is enabled. Hold to pause, or scroll or use Page Up and Page Down to move between events.</p>
      <div className="events-run" data-run="events" style={{ '--event-count': scenes.length }}>
        <div
          className="events-sticky paper-surface"
          onPointerDown={startPress}
          onClick={resetOnClick}
          onFocus={(event) => {
            autoplay.current.keyboardFocus = event.target.matches(':focus-visible');
            updateTimer();
          }}
          onBlur={(event) => {
            if (event.currentTarget.contains(event.relatedTarget)) return;
            autoplay.current.keyboardFocus = false;
            updateTimer();
          }}
        >
          {/* garlands, a bell and a lantern hang in the top corners beside the arch; a rangoli runs along its foot */}
          <img loading="lazy" className="events-corner events-corner-left" src="/art/events-corner.webp" alt="" aria-hidden="true" />
          <img loading="lazy" className="events-corner events-corner-right" src="/art/events-corner.webp" alt="" aria-hidden="true" />
          <img loading="lazy" className="events-rangoli" src="/art/events-footer.webp" alt="" aria-hidden="true" />
          <div className="events-view" ref={view}>
            {scenes.map((scene, index) => (
              <EventScene key={`${scene.event.start}-${scene.event.name}`} scene={scene} first={index === 0} />
            ))}
            <img className="events-frame" src="/art/arch-frame.webp" alt="" aria-hidden="true" loading="lazy" />
            <EventWipes />
          </div>
        </div>
      </div>
    </section>
  );
}
