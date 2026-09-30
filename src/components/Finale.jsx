import { useEffect, useRef } from 'react';
import { gsap, useGSAP, isTouch, onAnchor, prefersReducedMotion } from '../lib/motion.js';
import { BRAND, FESTIVALS, ARTS, LANGUAGES, HERO_WALL, wm } from '../data/content.js';
import { Words, Arrow } from './ui.jsx';
import './Finale.css';

// Every photograph on the page, once. CC BY-SA requires the attribution; the
// Commons file page carries author and licence for each.
const CULTURE_USED = [...ARTS.map((a) => a.img), ...LANGUAGES.map((l) => l.img)]
  .filter(Boolean)
  .filter((img, i, all) => all.findIndex((o) => o.file === img.file) === i)
  .filter((img) => !FESTIVALS.some((f) => f.file === img.file));
const TOTAL = FESTIVALS.length + CULTURE_USED.length;
const pretty = (file) => decodeURIComponent(file).replace(/_/g, ' ').replace(/\.(jpe?g|png)$/i, '');
const FACES = HERO_WALL.map((col) => col[0]).slice(0, 5);

export default function Finale() {
  const magnet = useRef(null);
  const cta = useRef(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.from(cta.current.querySelectorAll('.word > span'), {
      yPercent: 110, duration: 1.2, ease: 'expo.out', stagger: 0.08,
      scrollTrigger: { trigger: cta.current, start: 'top 70%', once: true },
    });
  }, { scope: cta });

  // The main button leans toward the pointer.
  useEffect(() => {
    if (isTouch() || prefersReducedMotion()) return undefined;
    const el = magnet.current;
    const xTo = gsap.quickTo(el, 'x', { duration: 0.8, ease: 'elastic.out(1, 0.5)' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.8, ease: 'elastic.out(1, 0.5)' });
    const move = (e) => {
      const r = el.getBoundingClientRect();
      const dx = e.clientX - (r.left + r.width / 2);
      const dy = e.clientY - (r.top + r.height / 2);
      const near = Math.hypot(dx, dy) < 160;
      xTo(near ? dx * 0.25 : 0);
      yTo(near ? dy * 0.35 : 0);
    };
    window.addEventListener('pointermove', move, { passive: true });
    return () => window.removeEventListener('pointermove', move);
  }, []);

  return (
    <footer className="fin" id="contact">
      <div className="fin__cta on-night" ref={cta}>
        <div className="fin__faces" aria-hidden="true">
          {FACES.map((f) => <img key={f.id} src={wm(f.file, 500)} alt="" loading="lazy" decoding="async" />)}
          <span>36 markets waiting</span>
        </div>
        <h2 className="display"><Words text="Your brand. *Bharat’s story.*" /></h2>
        <p>We don’t take briefs. We take stories that are waiting to be told. Tell us yours.</p>
        <div className="fin__actions">
          <a ref={magnet} href={BRAND.contact} className="btn btn--lime" onClick={onAnchor}>
            Start your campaign <Arrow />
          </a>
          <a href={BRAND.work} className="btn btn--ghost" target="_blank" rel="noreferrer">
            See the work <Arrow />
          </a>
        </div>
      </div>

      <div className="shell fin__foot">
        <div className="fin__brand">
          <span className="fin__logo">BCF<i /></span>
          <span>{BRAND.full}</span>
          <em>{BRAND.tagline}</em>
        </div>
        <nav className="fin__nav" aria-label="Footer">
          <span className="mono">Explore</span>
          <a href="#problem" onClick={onAnchor}>Why regional</a>
          <a href="#services" onClick={onAnchor}>What we do</a>
          <a href="#formats" onClick={onAnchor}>Formats</a>
          <a href="#regions" onClick={onAnchor}>Market playbooks</a>
          <a href="#calendar" onClick={onAnchor}>Campaign calendar</a>
          <a href="#brief" onClick={onAnchor}>Brief builder</a>
          <a href="#faq" onClick={onAnchor}>FAQ</a>
        </nav>
        <details className="fin__credits">
          <summary><span className="mono">Photo credits</span> <sup>{TOTAL}</sup></summary>
          <p>
            All photographs are hot-linked from Wikimedia Commons and used under their free licences
            (CC BY-SA, CC BY, CC0, GFDL or public domain). Each link opens the file page with its author and licence.
          </p>
          <ul>
            {FESTIVALS.map((f) => (
              <li key={f.id}>
                <a href={f.credit} target="_blank" rel="noreferrer">{f.state} — {pretty(f.file)}</a>
              </li>
            ))}
            {CULTURE_USED.map((c) => (
              <li key={c.file}>
                <a href={c.credit} target="_blank" rel="noreferrer">{c.subject}</a>
                <span> — {c.author}, {c.licence}</span>
              </li>
            ))}
          </ul>
        </details>
      </div>

      <div className="fin__giant" aria-hidden="true">win india<span>.</span></div>

      <div className="shell fin__legal mono">
        <span>© 2026 {BRAND.name} — {BRAND.full}</span>
        <span>Festival dates are indicative; lunar calendars move them every year.</span>
        <a href="#top" onClick={onAnchor}>Back to top ↑</a>
      </div>
    </footer>
  );
}
