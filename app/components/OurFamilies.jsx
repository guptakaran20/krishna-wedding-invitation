'use client';

import { Fragment, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useScrollControl } from '../lib/sheet';
import SectionTitle from './SectionTitle';
import { useLang } from '../lib/lang';
import { sfx } from '../lib/sound';
import './OurFamilies.css';

// Our Families: a painted portrait card for each side with a
// "View family tree" button. The tree opens as a sheet over the invitation: grandparents → parents → the couple and
// siblings, each a gold-rimmed monogram medallion, the generations joined by gold vines that draw themselves in as
// each row rises into place. Names left empty in invite.js show as "To be shared".
const initials = (name) => name.replace(/^(Mr|Mrs|Ms|Dr|Shri|Smt|श्रीमती|श्री)\.?\s+/i, '').trim().charAt(0);

function Person({ name, role, focus }) {
  const { t } = useLang();
  const known = !!name?.trim();
  return (
    <li className={`tree-person${known ? '' : ' is-unknown'}${focus ? ' is-focus' : ''}`}>
      <span className="tree-medal" aria-hidden="true">{known ? initials(name) : '·'}</span>
      <span className="tree-name">{known ? name : t('To be shared')}</span>
      <span className="tree-role">{role}</span>
    </li>
  );
}

function Vine() {
  return (
    <svg className="tree-vine" viewBox="0 0 40 60" aria-hidden="true">
      <path d="M20 0 C 8 14, 32 26, 20 40 S 20 54, 20 60" />
      <path className="tree-leaf" d="M20 22 c 6 -6 12 -4 12 -4 c -2 6 -8 8 -12 4 z" />
      <path className="tree-leaf" d="M20 38 c -6 -6 -12 -4 -12 -4 c 2 6 8 8 12 4 z" />
    </svg>
  );
}

function Tree({ family, onClose }) {
  const { t } = useLang();
  const close = useRef(null);
  useEffect(() => {
    close.current?.focus();
    const key = (event) => { if (event.key === 'Escape') onClose(); };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [onClose]);

  return (
    <div className="tree-sheet" role="dialog" aria-modal="true" aria-label={`${family.heading} · ${t('Family Tree')}`} onClick={onClose}>
      <div className="tree-paper" onClick={(event) => event.stopPropagation()}>
        <button ref={close} type="button" className="tree-close" onClick={onClose} aria-label={t('Close the family tree')}>
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
        </button>
        <p className="tree-eyebrow">{family.heading}</p>
        <h3 className="script">{t('Family Tree')}</h3>
        <img className="tree-rule" src="/art/lotus-divider.webp" alt="" aria-hidden="true" />

        {(family.tree || []).map((group, index) => (
          <Fragment key={index}>
            {index > 0 && <Vine />}
            <section className="tree-gen" style={{ '--g': index }}>
              <h4>{group.title}</h4>
              <ul className="tree-row">
                {group.people.map((p, i) => <Person key={i} name={p.name} role={p.role} focus={p.focus} />)}
              </ul>
            </section>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function FamilyCard({ family, onTree }) {
  const { lang, t } = useLang();
  return (
    <article className="family-card" data-reveal>
      <header className="family-heading">
        <p className="family-eyebrow">{family.heading}</p>
        <h3 className="family-person script">{family.person}</h3>
      </header>
      <div className="family-portrait"><img src={family.art} alt={`${family.heading}: ${family.person}, ${family.father} & ${family.mother}`} loading="lazy" /></div>
      <div className="family-body">
        <p className="family-line">
          <span className="family-rel">{lang === 'hi' ? family.relation : `${family.relation} of`}</span>
          <span className="family-parents">
            <span>{family.father}</span>
            <span><i>&amp;</i> {family.mother}</span>
          </span>
        </p>
        <button type="button" className="family-tree-button" onClick={onTree} aria-haspopup="dialog">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="5" r="2.4" /><circle cx="6" cy="18" r="2.4" /><circle cx="18" cy="18" r="2.4" /><path d="M12 7.4v4.6M12 12H6v3.6M12 12h6v3.6" /></svg>
          {t('View family tree')}
        </button>
      </div>
    </article>
  );
}

export default function OurFamilies() {
  const { t, invite } = useLang();
  const families = invite.ourFamilies;
  const section = useRef(null);
  const control = useScrollControl();
  const [open, setOpen] = useState(null);
  const [screen, setScreen] = useState(null);
  useEffect(() => { setScreen(section.current.closest('.screen')); }, []);
  useEffect(() => {
    if (!open) return undefined;
    control.lock();
    return () => control.unlock();
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <section className="families-block" ref={section} aria-labelledby="families-title">
      <SectionTitle eyebrow={t('Parents & family')} title={t('Our Families')} id="families-title" />
      <p className="families-intro" data-reveal>{t('With grateful hearts we honour the families who raised us with love.')}</p>
      <div className="families-grid">
        <FamilyCard family={families.groom} onTree={() => { sfx.unroll(0, .7); setOpen('groom'); }} />
        <FamilyCard family={families.bride} onTree={() => { sfx.unroll(0, .7); setOpen('bride'); }} />
      </div>
      {open && screen && createPortal(<Tree family={families[open]} onClose={() => setOpen(null)} />, screen)}
    </section>
  );
}
