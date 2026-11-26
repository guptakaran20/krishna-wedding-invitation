import './SectionTitle.css';

// eyebrow, script heading, and a painted gold lotus divider that opens out from the middle
export default function SectionTitle({ eyebrow, title, id }) {
  return (
    <header className="section-title" data-reveal>
      <p className="eyebrow">{eyebrow}</p>
      <h2 className="script" id={id}>{title}</h2>
      <img className="title-divider" src="/art/lotus-divider.webp" alt="" aria-hidden="true" />
    </header>
  );
}
