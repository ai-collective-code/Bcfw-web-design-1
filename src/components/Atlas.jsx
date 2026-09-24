import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SectionHead from './SectionHead.jsx';
import { lockScroll } from '../lib/motion.js';
import { FESTIVALS, REGIONS, BRAND, wm, langOf } from '../data/content.js';
import { brief, useBrief } from '../lib/brief.js';
import './Atlas.css';

const FILTERS = ['All', ...REGIONS.map((r) => r.key)];
const ACCENT = Object.fromEntries(REGIONS.map((r) => [r.key, r.accent]));
const COUNT = Object.fromEntries(FILTERS.map((k) => [k, k === 'All' ? FESTIVALS.length : FESTIVALS.filter((f) => f.region === k).length]));
const pad = (n) => String(n).padStart(2, '0');

const matches = (q, f) => {
  if (!q) return true;
  const s = q.trim().toLowerCase();
  return [f.state, f.festival, f.region, ...f.also].some((v) => v.toLowerCase().includes(s));
};

/** Card with a gentle 3D tilt that follows the pointer; the photo sits deeper than the text. */
function TiltCard({ f, i, onOpen }) {
  const el = useRef(null);
  const move = (e) => {
    if (e.pointerType !== 'mouse') return;
    const r = el.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    const s = el.current.style;
    s.setProperty('--rx', `${(-y * 10).toFixed(2)}deg`);
    s.setProperty('--ry', `${(x * 12).toFixed(2)}deg`);
    s.setProperty('--gx', `${((x + 0.5) * 100).toFixed(1)}%`);
    s.setProperty('--gy', `${((y + 0.5) * 100).toFixed(1)}%`);
  };
  const leave = () => {
    const s = el.current.style;
    s.setProperty('--rx', '0deg');
    s.setProperty('--ry', '0deg');
  };

  return (
    <button
      ref={el}
      className="card"
      style={{ '--i': Math.min(i, 14), '--accent': ACCENT[f.region] }}
      onPointerMove={move}
      onPointerLeave={leave}
      onClick={(e) => onOpen(f.id, e.currentTarget)}
      data-cursor="Open"
      aria-label={`${f.festival}, ${f.state}. ${f.when}. Open details`}
    >
      <span className="card__in">
        <span className="card__img">
          <img src={wm(f.file, 500)} alt="" loading="lazy" decoding="async" />
          <span className="card__glare" />
          <span className="card__num">{pad(f.id)}</span>
        </span>
        <span className="card__txt">
          <span className="card__row">
            <small>{f.state}</small>
            <em>{f.kind === 'UT' ? 'UT' : 'State'}</em>
          </span>
          <strong>{f.festival}</strong>
          <span className="card__when mono">{f.when}{langOf(f.state) && <> · <b>{langOf(f.state)}</b></>}</span>
        </span>
      </span>
    </button>
  );
}

/** Side drawer with the full story; arrows step through the current list. */
function Drawer({ f, onClose, onStep, position }) {
  const panel = useRef(null);
  const { regions } = useBrief();
  const inBrief = regions.includes(f.region);
  const lang = langOf(f.state);

  useEffect(() => {
    lockScroll(true);
    panel.current.querySelector('.drw__close').focus();
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
      if (e.key === 'Tab') {
        const items = panel.current.querySelectorAll('a[href], button');
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', key);
    return () => { lockScroll(false); window.removeEventListener('keydown', key); };
  }, [onClose, onStep]);

  return createPortal(
    <div className="drw" role="dialog" aria-modal="true" aria-labelledby="drw-title" data-lenis-prevent
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="drw__panel" ref={panel} style={{ '--accent': ACCENT[f.region] }}>
        <div className="drw__bar">
          <span className="mono">{position}</span>
          <div className="drw__nav">
            <button onClick={() => onStep(-1)} aria-label="Previous festival">←</button>
            <button onClick={() => onStep(1)} aria-label="Next festival">→</button>
            <button className="drw__close" onClick={onClose} aria-label="Close details">✕</button>
          </div>
        </div>
        <div className="drw__img" key={`img-${f.id}`}>
          <img src={wm(f.file, 960)} alt={`${f.festival}, ${f.state}`} decoding="async" />
          <span className="drw__region">{f.region} · {f.kind === 'UT' ? 'Union territory' : 'State'}</span>
        </div>
        <div className="drw__text" key={`txt-${f.id}`}>
          <h3 id="drw-title" className="display">{f.festival}</h3>
          <p className="drw__state">{f.state} <span className="mono">{f.when}</span></p>
          <p className="drw__blurb">{f.blurb}</p>
          <div className="drw__also">
            <span className="mono">Also celebrated here</span>
            <ul>{f.also.map((a) => <li key={a}>{a}</li>)}</ul>
          </div>
          <div className="drw__pitch">
            <span className="mono">The opportunity</span>
            <p>
              {f.festival} is {f.state}’s peak moment{lang ? <> — originate it in <b>{lang}</b>, not a dub</> : ''}.
              {' '}Plan it before the season starts and be first to the feed.
            </p>
            <div className="drw__ctas">
              <a href={BRAND.inquiry} className="btn btn--lime" target="_blank" rel="noreferrer">
                Plan a campaign in {f.state}
                <span className="btn__arrow" aria-hidden="true"><i>↗</i><i>↗</i></span>
              </a>
              <button className={`drw__add ${inBrief ? 'is-on' : ''}`} onClick={() => brief.addRegion(f.region)} disabled={inBrief}>
                {inBrief ? `${f.region} is in your brief ✓` : `Add ${f.region} to my brief +`}
              </button>
            </div>
          </div>
          <div className="drw__links">
            <a href={f.wiki} target="_blank" rel="noreferrer">About {f.festival} ↗</a>
            <a href={f.credit} target="_blank" rel="noreferrer">Photo, author &amp; licence ↗</a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function Atlas() {
  const [region, setRegion] = useState('All');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [dealt, setDealt] = useState(false);
  const grid = useRef(null);
  const opener = useRef(null);

  const list = useMemo(() => FESTIVALS.filter((f) => (region === 'All' || f.region === region) && matches(query, f)), [region, query]);

  const open = (id, from) => { opener.current = from || document.activeElement; setOpenId(id); };
  const close = useRef(() => {});
  close.current = () => { setOpenId(null); requestAnimationFrame(() => opener.current?.focus?.({ preventScroll: true })); };

  // Other sections (the festival radar) open festivals here.
  useEffect(() => {
    const on = (e) => open(e.detail);
    window.addEventListener('atlas:open', on);
    return () => window.removeEventListener('atlas:open', on);
  }, []);

  // Cards deal in once the grid reaches the viewport; filtered grids deal in straight away.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setDealt(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -15% 0px' });
    io.observe(grid.current);
    return () => io.disconnect();
  }, []);

  // Step through whichever list the drawer was opened from (falls back to all 36).
  const ring = list.some((f) => f.id === openId) ? list : FESTIVALS;
  const idx = ring.findIndex((f) => f.id === openId);
  const stepRef = useRef(() => {});
  stepRef.current = (d) => setOpenId(ring[(idx + d + ring.length) % ring.length].id);
  const onStep = useMemo(() => (d) => stepRef.current(d), []);
  const onClose = useMemo(() => () => close.current(), []);
  const current = FESTIVALS.find((f) => f.id === openId);

  return (
    <section className="index" id="atlas" aria-labelledby="atlas-title">
      <div className="shell">
        <SectionHead id="atlas-title" n="10" label="Market index" title="36 markets. *Their biggest moments.*">
          Every state and union territory, its peak moment and the language we would make it in. Open any market
          to plan around it.
        </SectionHead>

        <div className="index__tools">
          <div className="index__filters" role="group" aria-label="Filter by region">
            {FILTERS.map((k) => (
              <button
                key={k}
                className={region === k ? 'is-on' : ''}
                aria-pressed={region === k}
                onClick={() => setRegion(k)}
                style={{ '--accent': ACCENT[k] || 'var(--ink)' }}
              >
                {k !== 'All' && <i aria-hidden="true" />}{k} <sup>{COUNT[k]}</sup>
              </button>
            ))}
          </div>
          <label className="index__search">
            <span className="sr-only">Search states and festivals</span>
            <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
            <input type="search" placeholder="Search a market or moment" value={query} onChange={(e) => setQuery(e.target.value)} />
          </label>
        </div>

        <p className="index__status mono" aria-live="polite">
          Showing {list.length} of {FESTIVALS.length}
        </p>

        <div className={`index__grid ${dealt ? 'is-in' : ''}`} ref={grid} key={region}>
          {list.map((f, i) => <TiltCard key={f.id} f={f} i={i} onOpen={open} />)}
          {list.length === 0 && (
            <p className="index__empty">Nothing matches “{query}”. Try a state, a festival, or a region.</p>
          )}
        </div>
      </div>

      {current && (
        <Drawer f={current} onClose={onClose} onStep={onStep} position={`${pad(idx + 1)} / ${pad(ring.length)}`} />
      )}
    </section>
  );
}
