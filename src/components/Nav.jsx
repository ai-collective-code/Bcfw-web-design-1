import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger, onAnchor, lockScroll } from '../lib/motion.js';
import { BRAND } from '../data/content.js';
import { Arrow } from './ui.jsx';
import './Nav.css';

const LINKS = [
  ['Why regional', '#problem'],
  ['Services', '#services'],
  ['Formats', '#formats'],
  ['Work', '#work'],
  ['Markets', '#regions'],
  ['Calendar', '#calendar'],
  ['FAQ', '#faq'],
];

export default function Nav() {
  const bar = useRef(null);
  const [open, setOpen] = useState(false);

  // Tucks away on the way down, returns on the way up.
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        bar.current?.classList.toggle('is-hidden', self.direction === 1 && y > 300);
        bar.current?.classList.toggle('is-scrolled', y > 40);
      },
    });
    return () => st.kill();
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    lockScroll(true);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => { lockScroll(false); window.removeEventListener('keydown', esc); };
  }, [open]);

  const go = (e) => { setOpen(false); lockScroll(false); onAnchor(e); };

  return (
    <>
      <header className="nav" ref={bar}>
        <div className="nav__pill">
          <a href="#top" className="nav__brand" onClick={onAnchor} aria-label="BCF — back to top">
            BCF<i />
          </a>

          <nav className="nav__links" aria-label="Sections">
            {LINKS.map(([label, href]) => (
              <a key={href} href={href} onClick={onAnchor}>{label}</a>
            ))}
          </nav>

          <a href={BRAND.contact} className="btn btn--ink nav__cta" onClick={onAnchor}>
            Start a campaign <Arrow />
          </a>

          <button
            className={`nav__burger ${open ? 'is-open' : ''}`}
            aria-expanded={open}
            aria-controls="nav-drawer"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((v) => !v)}
          >
            <i /><i />
          </button>
        </div>
      </header>

      <div id="nav-drawer" className={`drawer on-night ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <nav aria-label="Sections">
          {LINKS.map(([label, href], i) => (
            <a key={href} href={href} onClick={go} tabIndex={open ? 0 : -1} style={{ '--i': i }}>
              <span className="mono">0{i + 1}</span>{label}
            </a>
          ))}
        </nav>
        <a href={BRAND.contact} className="btn btn--lime drawer__cta" onClick={go} tabIndex={open ? 0 : -1}>
          Start a campaign <Arrow />
        </a>
      </div>
    </>
  );
}
