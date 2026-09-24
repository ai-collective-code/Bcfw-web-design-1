import { useMemo, useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion, openInAtlas, scrollToTarget } from '../lib/motion.js';
import { brief } from '../lib/brief.js';
import SectionHead from './SectionHead.jsx';
import { FESTIVALS, MONTHS, REGIONS, wm, langOf } from '../data/content.js';
import './Calendar.css';

const COUNTS = MONTHS.map((_, i) => FESTIVALS.filter((f) => f.months.includes(i)).length);
const ACCENT = Object.fromEntries(REGIONS.map((r) => [r.key, r.accent]));

export default function Calendar() {
  const [month, setMonth] = useState(() => new Date().getMonth());
  const cards = useRef(null);
  const tabs = useRef([]);
  const list = useMemo(() => FESTIVALS.filter((f) => f.months.includes(month)), [month]);
  const regions = new Set(list.map((f) => f.region)).size;

  // Cards flip up into place: first on scroll-in, then on every month change.
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const els = cards.current.children;
    const from = { rotateX: -70, y: 60, opacity: 0, transformOrigin: '50% 0%' };
    const to = { rotateX: 0, y: 0, opacity: 1, duration: 1.1, ease: 'expo.out', stagger: 0.05 };
    // Below the fold: wait for it. Already on screen (a month was picked): play now.
    if (cards.current.getBoundingClientRect().top > window.innerHeight) {
      gsap.fromTo(els, from, { ...to, scrollTrigger: { trigger: cards.current, start: 'top 85%', once: true } });
    } else {
      gsap.fromTo(els, from, to);
    }
  }, { dependencies: [month], scope: cards });

  const onKey = (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = (month + step + 12) % 12;
    setMonth(next);
    tabs.current[next]?.focus();
  };

  return (
    <section className="radar" id="calendar" aria-labelledby="cal-title">
      <div className="shell">
        <SectionHead id="cal-title" n="06" label="Campaign calendar" title="Never miss *a moment.*">
          Every month, somewhere in India, a market is celebrating. Pick a month, see the moments, and be ready
          before your rivals wake up.
        </SectionHead>

        <div className="radar__panel">
          <div className="radar__tabs" role="tablist" aria-label="Months" onKeyDown={onKey}>
            {MONTHS.map((name, i) => (
              <button
                key={name}
                ref={(el) => { tabs.current[i] = el; }}
                role="tab"
                id={`cal-tab-${i}`}
                aria-selected={month === i}
                aria-controls="cal-panel"
                tabIndex={month === i ? 0 : -1}
                className={`radar__tab ${month === i ? 'is-on' : ''}`}
                onClick={() => setMonth(i)}
              >
                {name.slice(0, 3)}
                <sup>{COUNTS[i]}</sup>
                <span className="sr-only"> — {COUNTS[i]} festivals</span>
              </button>
            ))}
          </div>

          <div id="cal-panel" role="tabpanel" aria-labelledby={`cal-tab-${month}`}>
            <div className="radar__head">
              <h3 className="display">{MONTHS[month]}</h3>
              <span className="mono">{list.length} campaign moments · {regions} regions</span>
              <button
                className="btn btn--ink radar__plan"
                onClick={() => { brief.setMonth(month); scrollToTarget('#brief'); }}
              >
                Plan {MONTHS[month]} campaigns
                <span className="btn__arrow" aria-hidden="true"><i>→</i><i>→</i></span>
              </button>
            </div>
            <div className="radar__cards" ref={cards}>
              {list.map((f) => (
                <button
                  key={`${month}-${f.id}`}
                  className="radar__card"
                  onClick={() => openInAtlas(f.id)}
                  data-cursor="View"
                  style={{ '--accent': ACCENT[f.region] }}
                >
                  <span className="radar__img">
                    <img src={wm(f.file, 500)} alt="" loading="lazy" decoding="async" />
                    <span className="radar__region">{f.region}</span>
                  </span>
                  <strong>{f.festival}</strong>
                  <span className="radar__meta">{f.state} · <span className="mono">{f.when}</span></span>
                  {langOf(f.state) && <span className="radar__lang">Make it in {langOf(f.state)}</span>}
                </button>
              ))}
            </div>
            <p className="radar__note mono">
              Dates are indicative — most Indian festivals follow lunar or luni-solar calendars and move by weeks
              each year. Lakshadweep’s Lava dance has no fixed month.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
