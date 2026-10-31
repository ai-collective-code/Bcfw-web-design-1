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

const lumCache = new WeakMap();

function checkIsDarkUnderLogo(logoEl) {
  if (!logoEl) return false;
  const bharatEl = logoEl.querySelector('.l-bharat') || logoEl;
  const rect = bharatEl.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;

  if (x < 0 || x > window.innerWidth || y < 0 || y > window.innerHeight) {
    return false;
  }

  const stack = document.elementsFromPoint(x, y);
  for (const el of stack) {
    if (el.closest('.nav')) continue;

    if (el.closest('.on-night, [data-dark="true"], .jr__sticky, .lang__frame, .finale, .drw__pitch, #nav-drawer.is-open')) {
      return true;
    }

    const img = el.tagName === 'IMG' ? el : el.querySelector?.('img');
    if (img && img.complete && img.naturalWidth > 0) {
      if (lumCache.has(img)) {
        return lumCache.get(img);
      }
      try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        ctx.drawImage(img, 0, 0, 1, 1);
        const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        const isDark = lum < 130;
        lumCache.set(img, isDark);
        return isDark;
      } catch {
        // Continue
      }
    }

    const bg = window.getComputedStyle(el).backgroundColor;
    if (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)') {
      const match = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        const r = parseInt(match[1], 10);
        const g = parseInt(match[2], 10);
        const b = parseInt(match[3], 10);
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        return lum < 130;
      }
    }
  }
  return false;
}

export default function Nav() {
  const bar = useRef(null);
  const [open, setOpen] = useState(false);

  // Always visible; scrolling and background detection dynamically adjust themes.
  useEffect(() => {
    const mark = bar.current?.querySelector('.nav__brand-mark');

    const updateTheme = () => {
      if (!mark) return;
      const isDark = open || checkIsDarkUnderLogo(mark);
      mark.classList.toggle('is-dark-bg', isDark);
    };

    updateTheme();

    const st = ScrollTrigger.create({
      start: 0,
      end: 'max',
      onUpdate: (self) => {
        const y = self.scroll();
        bar.current?.classList.toggle('is-scrolled', y > 40);
        updateTheme();

        // Scrolling nudges the hanging logo: a damped swing, once per nudge, then back to idle sway.
        if (mark && !mark.classList.contains('is-kick')) {
          mark.classList.add('is-kick');
          mark.addEventListener('animationend', () => mark.classList.remove('is-kick'), { once: true });
        }
      },
    });

    // Check periodically in the hero while cards drift
    const timer = setInterval(() => {
      if (window.scrollY < window.innerHeight * 1.2) {
        updateTheme();
      }
    }, 250);

    return () => {
      st.kill();
      clearInterval(timer);
    };
  }, [open]);

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
