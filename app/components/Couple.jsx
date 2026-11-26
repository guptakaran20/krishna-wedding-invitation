'use client';

import Profiles from './Profiles';
import SectionTitle from './SectionTitle';
import { useLang } from '../lib/lang';
import './Couple.css';

// The couple: a profile each for the groom and the bride (photo, role, name, family and a few words), from invite.people.
export default function Couple() {
  const { t } = useLang();
  return (
    <section className="couple-block" aria-labelledby="couple-title">
      <SectionTitle eyebrow={t('Meet the couple')} title={t('Two Hearts')} id="couple-title" />
      <Profiles />
    </section>
  );
}
