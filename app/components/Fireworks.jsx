'use client';

import './Fireworks.css';

export default function Fireworks() {
  const bursts = [
    { x: 22, y: 13, hue: '#b88228', delay: 0 },
    { x: 76, y: 9, hue: '#cc6c89', delay: .9 },
    { x: 50, y: 14, hue: '#d5a542', delay: 1.7 },
    { x: 34, y: 7, hue: '#c88b3f', delay: 2.6 },
    { x: 82, y: 16, hue: '#ab6b9a', delay: 3.3 },
  ];
  return (
    <div className="fireworks" aria-hidden="true">
      {bursts.map((burst, index) => (
        <span key={index} className="burst" style={{ left: `${burst.x}%`, top: `${burst.y}%`, '--hue': burst.hue, animationDelay: `${burst.delay}s` }}>
          {Array.from({ length: 12 }, (_, ray) => <i key={ray} style={{ '--a': `${ray * 30}deg`, animationDelay: `${burst.delay}s` }} />)}
        </span>
      ))}
    </div>
  );
}
