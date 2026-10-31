import { useEffect, useRef, useState } from 'react';
import { ScrollTrigger, onAnchor, lockScroll } from '../lib/motion.js';
import { BRAND } from '../data/content.js';
import { Arrow } from './ui.jsx';
import QuickUpdate from './QuickUpdate.jsx';
import './Nav.css';

const LINKS = [
  ['Why regional', '#problem'],
  ['Work', '#work'],
  ['Markets', '#regions'],
  ['Calendar', '#calendar'],
  ['FAQ', '#faq'],
];

export default function Nav() {
  const bar = useRef(null);
  const [open, setOpen] = useState(false);

  // Always visible; scrolling only restyles the bar and nudges the hanging logo.
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        bar.current?.classList.toggle('is-scrolled', y > 40);
        // Scrolling nudges the hanging logo: a damped swing, once per nudge, then back to idle sway.
        const mark = bar.current?.querySelector('.nav__brand-mark');
        if (mark && !mark.classList.contains('is-kick')) {
          mark.classList.add('is-kick');
          mark.addEventListener('animationend', () => mark.classList.remove('is-kick'), { once: true });
        }
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
        <div className="nav__inner">
          <a href="#top" className="nav__pill nav__pill--brand" onClick={onAnchor} aria-label="Bharat Content Fireworks — back to top">
            <span className="nav__brand-mark" aria-hidden="true">
              <span className="l-bharat">Bharat</span>
              <span className="l-block">
                <span className="l-content">content</span>
                <span className="l-fire">fire<b>WORKS</b></span>
              </span>
              <span className="l-bar">
                <span className="l-spark" />
              </span>
            </span>
          </a>

          <div className="nav__pill nav__pill--menu">
            <nav className="nav__links" aria-label="Sections">
              {LINKS.map(([label, href]) => (
                <a key={href} href={href} onClick={onAnchor}>{label}</a>
              ))}
            </nav>

            <span className="nav__divider" aria-hidden="true" />

            <QuickUpdate />

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
