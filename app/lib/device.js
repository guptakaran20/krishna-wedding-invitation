// "Lite" mode for low-end phones and slow or metered connections. page.js calls applyLite() as the page starts, which
// sets html.lite, and globals.css scales the heavier effects down when it is on: endless idle loops (petals, swaying
// garlands, twinkles), butterflies, glass blur, blur fades and pulsing filters. Every scene still plays.
//   - the guest asked for less data (Data Saver / Lite mode in the browser)
//   - the connection reports itself as 2G / 3G, or as under ~1.5 Mbps (a weak "4G" bar)
//   - a touch screen reports 4 GB of memory or less
// iPhones report neither memory nor network type, so they are judged by how they actually run (watchFrames).
// Add ?lite to the URL to force it on (or ?full-fx to force it off) when testing.
export function applyLite() {
  const params = new URLSearchParams(location.search);
  if (params.has('full-fx')) return;
  const conn = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const mem = navigator.deviceMemory;
  const touch = matchMedia('(pointer: coarse)').matches;
  const lite = params.has('lite') || conn?.saveData || /(^|-)(2g|3g)$/.test(conn?.effectiveType || '')
    || (conn?.downlink && conn.downlink < 1.5) || (mem && mem <= 4 && touch) || (mem && mem <= 2);
  if (lite) document.documentElement.classList.add('lite');
}

export const isLite = () => typeof document !== 'undefined' && document.documentElement.classList.contains('lite');

// Phones that report nothing (every iPhone, many Androids) are judged by how they run. Frame gaps are sampled in
// 2-second windows for the whole visit (the strain shows later, in the storybook, the events, the cube, not while the
// opening waits for a tap). Two struggling windows (median frame slower than ~35 fps) out of the last four turn lite on
// from then on. A window with a long pause in it (tab switched, phone locked) or the page hidden is thrown away.
export function watchFrames() {
  if (isLite() || typeof requestAnimationFrame === 'undefined') return () => {};
  if (new URLSearchParams(location.search).has('full-fx')) return () => {};
  const recent = [];
  let gaps = [];
  let last = 0;
  let windowEnd = 0;
  let frame = 0;
  let stopped = false;
  const tick = (now) => {
    if (stopped || isLite()) return;
    if (document.hidden) { last = 0; gaps = []; frame = requestAnimationFrame(tick); return; }
    if (last) {
      const gap = now - last;
      if (gap > 1000) gaps = []; // a pause, not a slow frame: start the window again
      else gaps.push(gap);
    }
    last = now;
    if (!windowEnd) windowEnd = now + 2000;
    if (now >= windowEnd) {
      windowEnd = now + 2000;
      if (gaps.length >= 10) {
        gaps.sort((a, b) => a - b);
        recent.push(gaps[gaps.length >> 1] > 28);
        if (recent.length > 4) recent.shift();
        if (recent.filter(Boolean).length >= 2) {
          document.documentElement.classList.add('lite');
          return;
        }
      }
      gaps = [];
    }
    frame = requestAnimationFrame(tick);
  };
  const timer = setTimeout(() => { frame = requestAnimationFrame(tick); }, 1500);
  return () => { stopped = true; clearTimeout(timer); cancelAnimationFrame(frame); };
}
