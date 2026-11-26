'use client';

import { useEffect, useState } from 'react';
import './Welcome.css';

function BlurWords({ text, delay = 0 }) {
  return text.split(' ').map((word, index) => (
    <span key={`${word}-${index}`} className="blur-word" style={{ '--d': `${delay + index * 70}ms` }}>{word}&nbsp;</span>
  ));
}

// "Dear …": the guest's own name when the link carries it (?guest=Sharma+Family), otherwise family & friends
export default function Welcome() {
  const [guest, setGuest] = useState('Family & Friends');
  useEffect(() => {
    const name = new URLSearchParams(window.location.search).get('guest');
    if (name) setGuest(name.trim().slice(0, 40));
  }, []);

  return (
    <section className="welcome" aria-label="Welcome" data-reveal>
      <img className="welcome-frame" src="/art/corner-bouquet.webp" alt="" aria-hidden="true" />
      <img className="welcome-frame mirror" src="/art/corner-bouquet.webp" alt="" aria-hidden="true" />
      <p className="welcome-om" aria-hidden="true">ॐ</p>
      <p className="welcome-dear script">Dear {guest},</p>
      <p className="welcome-text"><BlurWords text="with the blessings of Lord Ganesha and the love of our families, a new chapter is about to begin." delay={300} /></p>
      <p className="welcome-hint"><BlurWords text="Open the envelope below" delay={1300} /></p>
    </section>
  );
}
