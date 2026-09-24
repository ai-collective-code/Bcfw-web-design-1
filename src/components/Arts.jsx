import { useRef, useState } from 'react';
import SectionHead from './SectionHead.jsx';
import { ARTS, wm } from '../data/content.js';
import './Arts.css';

const N = ARTS.length;
const pad = (n) => String(n).padStart(2, '0');
// Shortest signed distance from the active card, wrapping around the loop.
const offsetOf = (i, active) => {
  let o = i - active;
  if (o > N / 2) o -= N;
  if (o < -N / 2) o += N;
  return o;
};

/**
 * Living arts as a 3D coverflow. Drag, click a side card, use the buttons, or
 * focus the stage and press the arrow keys.
 */
export default function Arts() {
  const [active, setActive] = useState(0);
  const drag = useRef(null);
  const dragged = useRef(false); // swallow the click that ends a drag
  const go = (d) => setActive((a) => (a + d + N) % N);
  const art = ARTS[active];

  const down = (e) => { drag.current = { x: e.clientX }; dragged.current = false; };
  const up = (e) => {
    if (!drag.current) return;
    const dx = e.clientX - drag.current.x;
    drag.current = null;
    if (Math.abs(dx) > 40) { dragged.current = true; go(dx < 0 ? 1 : -1); }
  };
  const key = (e) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
  };

  return (
    <section className="arts" id="arts" aria-labelledby="arts-title">
      <div className="shell">
        <SectionHead id="arts-title" n="11" label="Cultural codes" title="Borrow the codes, *not the clichés.*">
          Before a brand says anything, it has to look like it belongs. These are the forms and gestures an audience
          reads in a heartbeat — used with insider care, they make a campaign feel native in seconds.
        </SectionHead>
      </div>

      <div
        className="cf"
        tabIndex={0}
        role="group"
        aria-roledescription="carousel"
        aria-label="Living arts — use the arrow keys to browse"
        onKeyDown={key}
        onPointerDown={down}
        onPointerUp={up}
        onPointerLeave={() => { drag.current = null; }}
        data-cursor="Drag"
      >
        {ARTS.map((a, i) => {
          const o = offsetOf(i, active);
          const abs = Math.abs(o);
          const sign = Math.sign(o);
          const x = o === 0 ? 0 : sign * (56 + (abs - 1) * 30);
          const style = {
            transform: `translate(-50%, -50%) translateX(${x}%) translateZ(${-abs * 170}px) rotateY(${-sign * Math.min(abs, 1) * 40}deg)`,
            opacity: abs > 3 ? 0 : 1 - abs * 0.14,
            zIndex: 100 - abs,
            pointerEvents: abs > 3 ? 'none' : 'auto',
          };
          return (
            <button
              key={a.name}
              className={`cf__card ${o === 0 ? 'is-active' : ''}`}
              style={style}
              onClick={() => { if (!dragged.current) setActive(i); }}
              tabIndex={-1}
              aria-label={`${a.name}, ${a.state}`}
              aria-current={o === 0}
            >
              <img src={wm(a.img.file, 960)} alt="" decoding="async" draggable="false" />
              <span className="cf__label">{a.name}</span>
            </button>
          );
        })}
      </div>

      <div className="shell cf__info" aria-live="polite">
        <div className="cf__meta">
          <span className="tag"><b>{pad(active + 1)} / {pad(N)}</b> {art.state}</span>
          <h3 className="display">{art.name}</h3>
          <p>{art.line}</p>
          <a className="cf__credit" href={art.img.credit} target="_blank" rel="noreferrer">
            Photo: {art.img.author} · {art.img.licence} ↗
          </a>
        </div>
        <div className="cf__nav">
          <button onClick={() => go(-1)} aria-label="Previous art form">←</button>
          <button onClick={() => go(1)} aria-label="Next art form">→</button>
        </div>
      </div>
    </section>
  );
}
