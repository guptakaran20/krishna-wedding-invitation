// One-off phone pass over public/**/*.webp (run: node scripts/optimize-images.mjs). Needs cwebp and macOS sips.
// Each picture is cut down to the most it is ever drawn at on a 440px-wide phone, times 2.6 for sharp screens,
// and re-encoded (lossy alpha for the painted cut-outs). Files only change when the result is clearly smaller.
// The originals are in git history (commit 2b87218 and later), so re-run from those if the layout grows.
import { execFileSync } from 'node:child_process';
import { readdirSync, statSync, renameSync, mkdtempSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const PUBLIC = fileURLToPath(new URL('../public/', import.meta.url));
const DPR = 2.6;

// widest CSS px each picture is drawn at (measured on a 440 x 956 phone, cover/background sizes and any scale-up
// in its own animation included). Pictures that zoom (the opening's room, swing and curtains), open full screen in
// the photo viewer (moments, story, bride and groom) or are already near their drawn size are not listed: they
// keep their size and are only re-encoded.
const SHOWN = {
  'art/card-garland.webp': 150,
  'art/events-corner.webp': 120,
  'art/contact-seal.webp': 106,
  'art/corner-bouquet.webp': 120,
  'art/floral-border.webp': 70,
  'art/hand-henna.webp': 240,
  'art/hand-lotus.webp': 220,
  'art/lotus-divider.webp': 202,
  'art/venue-couple-walk.webp': 202,
  'art/wedding-car.webp': 165,
  'art/blessing-rose-stamp.webp': 60,
  'art/rsvp-lotus-bloom.webp': 189,
  'art/rsvp-lotus-bud.webp': 189,
  // only seen on a computer, behind a 43px blur
  'art/palace-backdrop.webp': 120,
};

const tmp = mkdtempSync(join(tmpdir(), 'webp-'));
const width = (f) => +execFileSync('sips', ['-g', 'pixelWidth', f]).toString().match(/pixelWidth: (\d+)/)[1];
const encode = (src, out, w, photo) => execFileSync('cwebp', [
  '-quiet', '-m', '6', '-sharp_yuv', '-q', photo ? '80' : '78', '-alpha_q', '70', '-alpha_filter', 'best',
  ...(w ? ['-resize', String(w), '0'] : []), src, '-o', out]);

const files = [];
const walk = (d) => readdirSync(d).forEach((n) => {
  const p = join(d, n);
  if (statSync(p).isDirectory()) walk(p); else if (n.endsWith('.webp')) files.push(relative(PUBLIC, p));
});
walk(PUBLIC);

let before = 0, after = 0;
for (const f of files) {
  const src = join(PUBLIC, f), old = statSync(src).size, nat = width(src);
  const want = SHOWN[f] ? Math.ceil((SHOWN[f] * (f.includes('backdrop') ? 1 : DPR)) / 10) * 10 : 0;
  const w = want && want < nat * 0.9 ? want : 0;
  const out = join(tmp, f.replaceAll('/', '_'));
  encode(src, out, w, f.startsWith('photos/') || /\/(moment|story)-/.test(f));
  const neu = statSync(out).size;
  before += old;
  if (neu < old * 0.92) { renameSync(out, src); after += neu; console.log(`${f}  ${nat}→${w || nat}px  ${(old / 1024) | 0}→${(neu / 1024) | 0} KB`); }
  else after += old;
}

console.log(`\nart total ${(before / 1024) | 0} KB → ${(after / 1024) | 0} KB`);
