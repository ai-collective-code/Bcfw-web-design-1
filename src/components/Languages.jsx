import { useEffect, useRef, useState } from 'react';
import SectionHead from './SectionHead.jsx';
import { prefersReducedMotion } from '../lib/motion.js';
import { LANGUAGES, COMPARE, wm } from '../data/content.js';
import './Languages.css';

const N = LANGUAGES.length;
// Even points on a sphere (Fibonacci lattice) — no clumping at the poles.
const POINTS = LANGUAGES.map((_, i) => {
  const y = 1 - (i / (N - 1)) * 2;
  const r = Math.sqrt(1 - y * y);
  const t = Math.PI * (3 - Math.sqrt(5)) * i;
  return [Math.cos(t) * r, y, Math.sin(t) * r];
});

/**
 * 22 scripts orbiting on a sphere. Words are billboards — positions rotate, the
 * text never does — so every script stays readable. Drag to spin; hover or focus
 * a language to bring its culture photograph into the centre.
 */
export default function Languages() {
  const stage = useRef(null);
  const words = useRef([]);
  const hold = useRef(null);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const reduced = prefersReducedMotion();
    let ax = -0.35, ay = 0, vx = 0, vy = reduced ? 0 : 0.0032;
    let R = 230, drag = null, raf = 0, on = true, front = -1;
    const P = 700;

    const size = () => { R = Math.min(250, stage.current.clientWidth * 0.4); };
    const frame = () => {
      if (!drag) { ay += vy; ax += vx; vx *= 0.95; vy += ((reduced ? 0 : 0.0032) - vy) * 0.02; }
      const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
      let best = -1, bestZ = -Infinity;
      for (let i = 0; i < N; i += 1) {
        const [x0, y0, z0] = POINTS[i];
        const x1 = x0 * cy + z0 * sy;
        const z1 = -x0 * sy + z0 * cy;
        const y2 = y0 * cx - z1 * sx;
        const z2 = y0 * sx + z1 * cx;
        const s = P / (P - z2 * R);
        const el = words.current[i];
        if (!el) continue;
        const depth = (z2 + 1) / 2; // 0 back … 1 front
        el.style.transform = `translate(-50%, -50%) translate3d(${(x1 * R * s).toFixed(1)}px, ${(y2 * R * s).toFixed(1)}px, 0) scale(${(0.55 + depth * 0.65).toFixed(3)})`;
        el.style.opacity = (0.18 + depth * 0.82).toFixed(3);
        el.style.zIndex = String(Math.round(depth * 100));
        if (z2 > bestZ) { bestZ = z2; best = i; }
      }
      if (hold.current === null && best !== front) { front = best; setActive(best); }
      if (on) raf = requestAnimationFrame(frame);
    };

    const down = (e) => { drag = { x: e.clientX, y: e.clientY }; stage.current.setPointerCapture?.(e.pointerId); };
    const move = (e) => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      drag = { x: e.clientX, y: e.clientY };
      vy = dx * 0.0045; vx = -dy * 0.0045; ay += vy; ax += vx;
    };
    const up = () => { drag = null; };

    const io = new IntersectionObserver(([e]) => {
      on = e.isIntersecting; cancelAnimationFrame(raf);
      if (on) raf = requestAnimationFrame(frame);
    });
    const el = stage.current;
    size();
    io.observe(el);
    el.addEventListener('pointerdown', down);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('resize', size);
    return () => {
      on = false; cancelAnimationFrame(raf); io.disconnect();
      el.removeEventListener('pointerdown', down);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('resize', size);
    };
  }, []);

  const pick = (i) => { hold.current = i; setActive(i); };
  const release = () => { hold.current = null; };
  const lang = LANGUAGES[active];

  return (
    <section className="lang" id="languages" aria-labelledby="lang-title">
      <div className="lang__frame on-night">
      <div className="shell lang__grid">
        <div className="lang__copy">
          <SectionHead id="lang-title" n="09" label="Language" title="22+ languages. *Zero dubbing.*">
            Scripts are not fonts. We write, shoot and cut in the language first — then the brand finds its
            place inside it. Hover the sphere to meet each one.
          </SectionHead>
          <div className="lang__now">
            <span className="lang__native">{lang.native}</span>
            <span className="lang__name mono">{lang.name}</span>
            {lang.img && (
              <a className="lang__credit" href={lang.img.credit} target="_blank" rel="noreferrer">
                Photo: {lang.img.subject} — {lang.img.author}, {lang.img.licence} ↗
              </a>
            )}
          </div>
        </div>

        <div className="lang__stage" ref={stage} data-cursor="Drag">
          <div className="lang__photo" aria-hidden="true">
            {lang.img && <img key={lang.name} src={wm(lang.img.file, 500)} alt="" decoding="async" />}
          </div>
          <div className="lang__halo" aria-hidden="true" />
          {LANGUAGES.map((l, i) => (
            <button
              key={l.name}
              ref={(n) => { words.current[i] = n; }}
              className={`lang__word ${active === i ? 'is-on' : ''}`}
              onPointerEnter={() => pick(i)}
              onPointerLeave={release}
              onFocus={() => pick(i)}
              onBlur={release}
              aria-label={l.name}
            >
              {l.native}
            </button>
          ))}
        </div>
      </div>

      <div className="shell">
        <div className="cmp" role="table" aria-label="A dubbed campaign compared with a BCF original">
          <div className="cmp__row cmp__row--head" role="row">
            <span role="columnheader" />
            <span role="columnheader">A dubbed campaign</span>
            <span role="columnheader">A BCF original</span>
          </div>
          {COMPARE.map(([k, a, b]) => (
            <div className="cmp__row" role="row" key={k}>
              <span role="rowheader" className="mono">{k}</span>
              <span role="cell" className="cmp__bad">{a}</span>
              <span role="cell" className="cmp__good">{b}</span>
            </div>
          ))}
        </div>
      </div>
      </div>
    </section>
  );
}
