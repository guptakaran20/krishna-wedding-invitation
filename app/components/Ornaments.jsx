'use client';

import { useEffect, useState } from 'react';
import './Ornaments.css';

// Small animated pieces drawn in CSS/SVG and reused across the invitation.

// a brass diya whose flame flickers and glows
export function Diya({ className = '', delay = 0 }) {
  return (
    <span className={`diya ${className}`} style={{ '--delay': `${delay}s` }} aria-hidden="true">
      <i className="diya-glow" />
      <i className="diya-flame" />
      <i className="diya-bowl" />
    </span>
  );
}

// a string of fairy lights draped in a curve, each bulb twinkling on its own beat
export function FairyLights({ className = '', count = 15, sag = 26 }) {
  const bulbs = Array.from({ length: count }, (_, index) => {
    const t = index / (count - 1);
    return { x: +(t * 100).toFixed(2), y: +(4 + Math.sin(t * Math.PI) * sag).toFixed(2), d: ((index * 37) % 17) / 10 };
  });
  return (
    <svg className={`fairy-lights ${className}`} viewBox={`0 0 100 ${sag + 10}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`M0 4 Q 50 ${4 + sag * 2} 100 4`} />
      {bulbs.map((bulb, index) => (
        <circle key={index} cx={bulb.x} cy={bulb.y} r="1.1" style={{ animationDelay: `${bulb.d}s` }} />
      ))}
    </svg>
  );
}

// a brass lantern on a chain that swings gently
export function HangingLantern({ className = '', length = 18, delay = 0 }) {
  return (
    <span className={`hanging-lantern ${className}`} style={{ '--chain': `${length}cqw`, animationDelay: `${delay}s` }} aria-hidden="true">
      <i className="lantern-chain" />
      <i className="lantern-cap" />
      <i className="lantern-body" />
      <i className="lantern-tassel" />
    </span>
  );
}

// tiny gold stars that twinkle around something
export function Sparkles({ count = 10, className = '' }) {
  const [stars, setStars] = useState([]);
  useEffect(() => {
    setStars(Array.from({ length: count }, () => ({
      x: 8 + Math.random() * 84, y: 8 + Math.random() * 84, s: .6 + Math.random() * .9, d: Math.random() * 3,
    })));
  }, [count]);
  return (
    <span className={`sparkles ${className}`} aria-hidden="true">
      {stars.map((star, index) => (
        <i key={index} style={{ left: `${star.x}%`, top: `${star.y}%`, '--s': star.s, animationDelay: `${star.d}s` }}>✦</i>
      ))}
    </span>
  );
}

// a little flock of birds flapping across the sky
export function Birds({ className = '', count = 5 }) {
  return (
    <span className={`birds ${className}`} aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <i key={index} style={{ '--i': index, '--y': `${[0, 6, 3, 10, 7][index % 5]}cqw` }}>
          <svg viewBox="0 0 20 8"><path d="M0 4 Q5 0 10 4 Q15 0 20 4" /></svg>
        </i>
      ))}
    </span>
  );
}

// butterflies that drift across the paper, wings flapping
export function Butterflies({ count = 3 }) {
  const colours = ['#e98ca0', '#f2c46b', '#c99ae0', '#f7a6b8'];
  return (
    <span className="butterflies" aria-hidden="true">
      {Array.from({ length: count }, (_, index) => (
        <i key={index} className="butterfly" style={{ '--i': index, '--c': colours[index % colours.length] }}>
          <b className="wing wing-l" /><b className="wing wing-r" />
        </i>
      ))}
    </span>
  );
}
