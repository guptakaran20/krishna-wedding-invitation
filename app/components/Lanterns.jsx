'use client';

import { useEffect, useState } from 'react';
import './Lanterns.css';

export default function Lanterns({ count = 9 }) {
  const [lanterns, setLanterns] = useState([]);
  useEffect(() => {
    setLanterns(Array.from({ length: count }, () => ({
      left: 5 + Math.random() * 90, delay: Math.random() * 1.6, duration: 5 + Math.random() * 3, size: .7 + Math.random() * .6, sway: (Math.random() - .5) * 18,
    })));
  }, [count]);
  return (
    <div className="lanterns" aria-hidden="true">
      {lanterns.map((lantern, index) => (
        <i key={index} className="sky-lantern" style={{ left: `${lantern.left}%`, animationDelay: `${lantern.delay}s`, animationDuration: `${lantern.duration}s`, '--size': lantern.size, '--sway': `${lantern.sway}cqw` }} />
      ))}
    </div>
  );
}
