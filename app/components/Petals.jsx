'use client';

import { useEffect, useState } from 'react';
import './Petals.css';

export default function Petals({ count = 12, className = '' }) {
  const [petals, setPetals] = useState([]);
  useEffect(() => {
    setPetals(Array.from({ length: count }, (_, index) => ({
      left: Math.random() * 100,
      delay: Math.random() * -14,
      duration: 10 + Math.random() * 6,
      size: .7 + Math.random() * .6,
      drift: (Math.random() - .5) * 40,
      hue: index % 3,
    })));
  }, [count]);
  return (
    <div className={`petals ${className}`} aria-hidden="true">
      {petals.map((petal, index) => (
        <i
          key={index}
          className={`petal petal-${petal.hue}`}
          style={{ left: `${petal.left}%`, animationDelay: `${petal.delay}s, ${petal.delay}s`, animationDuration: `${petal.duration}s, 3s`, '--size': petal.size, '--drift': `${petal.drift}cqw` }}
        />
      ))}
    </div>
  );
}
