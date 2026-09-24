import { useMemo, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, useNear, onAnchor, prefersReducedMotion } from '../lib/motion.js';
import { JOURNEY, BRAND, wm } from '../data/content.js';
import { Rich, Arrow } from './ui.jsx';
import './Journey.css';

const N = JOURNEY.length;
const GAP = 1500;           // depth between stops
const FIRST = 1500;         // depth of the first stop at progress 0
// The closing title sits far enough past the last stop that every photograph
// has flown by (rel > 650) before the camera comes to rest 750px from it.
const END_Z = -(FIRST + (N - 1) * GAP + 2600);
const TRAVEL = -END_Z - 750;
const FAR = 8000;           // fully transparent beyond this
const CLEAR = 4600;         // fully opaque nearer than this
const pad = (n) => String(n).padStart(2, '0');

// Deterministic scatter so server/client and re-renders agree.
const rand = (i) => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };

export default function Journey() {
  const reduced = prefersReducedMotion();
  const root = useRef(null);
  const world = useRef(null);
  const floor = useRef(null);
  const hudName = useRef(null);
  const hudNum = useRef(null);
  const rail = useRef(null);
  const near = useNear(root, '120%');

  const stops = useMemo(() => JOURNEY.map((f, i) => {
    const side = i % 2 === 0 ? -1 : 1;
    return {
      f,
      z: -(FIRST + i * GAP),
      x: side * (19 + rand(i) * 7),
      y: (rand(i + 40) - 0.5) * 16,
      side,
    };
  }), []);

  // Starlight: tiny points scattered through the whole depth of the flight.
  const sparks = useMemo(() => Array.from({ length: 56 }, (_, i) => ({
    x: (rand(i + 90) - 0.5) * 140,
    y: (rand(i + 190) - 0.5) * 90,
    z: -rand(i + 290) * (TRAVEL + 3000),
    s: 1.5 + rand(i + 390) * 3,
  })), []);

  useGSAP(() => {
    if (reduced) return;
    const els = gsap.utils.toArray('[data-z]', root.current);
    const zs = els.map((el) => parseFloat(el.dataset.z));
    const shown = els.map(() => true);
    const ticks = rail.current.querySelectorAll('i');
    let active = -1;

    const update = (p) => {
      const cam = p * TRAVEL;
      world.current.style.transform = `translate3d(0, 0, ${cam.toFixed(1)}px)`;
      floor.current.style.backgroundPositionY = `${(cam * 0.9).toFixed(1)}px`;

      let best = -1;
      let bestD = Infinity;
      // Stops stay hidden until the opening title has flown past the camera,
      // otherwise they crowd the headline.
      const intro = Math.min(1, Math.max(0, (cam - 250) / 650));
      for (let i = 0; i < els.length; i += 1) {
        const rel = zs[i] + cam; // < 0 means still ahead of the camera
        const el = els[i];
        let o = 1;
        if (rel > 650) o = 0;
        else if (rel > 80) o = 1 - (rel - 80) / 570;
        else if (rel < -FAR) o = 0;
        else if (rel < -CLEAR) o = (rel + FAR) / (FAR - CLEAR);
        if (el.dataset.stop) o *= intro;
        el.style.opacity = o.toFixed(3);
        // display:none, not visibility:hidden. A hidden element still counts toward
        // the 3D layer's bounds, and one that has drifted behind the camera plane
        // projects to infinity — Chrome then paints the entire scene black.
        const show = o >= 0.01;
        if (shown[i] !== show) { shown[i] = show; el.style.display = show ? '' : 'none'; }
        if (el.dataset.stop) {
          const d = Math.abs(rel + 1100);
          if (d < bestD && rel < 400) { bestD = d; best = Number(el.dataset.stop); }
        }
      }
      // Nothing near the focus point: before the first stop or past the last.
      if (best < 0) best = cam > FIRST ? N - 1 : 0;
      if (best !== active) {
        active = best;
        const f = JOURNEY[best];
        hudNum.current.textContent = `${pad(best + 1)} / ${pad(N)}`;
        hudName.current.textContent = `${f.state} · ${f.lang} ${f.format.toLowerCase()}`;
        ticks.forEach((t, i) => t.classList.toggle('is-on', i <= best));
      }
    };

    ScrollTrigger.create({
      trigger: root.current,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => update(self.progress),
    });
    update(0);
  }, { scope: root });

  if (reduced) {
    return (
      <section className="jr-static shell" id="journey" aria-labelledby="jr-title">
        <span className="tag"><b>(04)</b> One brief, thirteen markets</span>
        <h2 id="jr-title" className="display"><Rich text="One brief. *Thirteen originals.*" /></h2>
        <ol>
          {JOURNEY.map((f) => (
            <li key={f.id}>
              <img src={wm(f.file, 500)} alt={`${f.festival}, ${f.state}`} loading="lazy" />
              <b>{f.state}</b><span>{f.lang} · {f.format} · {f.festival}</span>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section className="jr" id="journey" ref={root} style={{ height: `${(N + 3) * 56}vh` }} aria-labelledby="jr-title">
      <div className="jr__sticky on-night">
        <div className="jr__sky" aria-hidden="true" />
        <div className="jr__floor" ref={floor} aria-hidden="true" />

        <div className="jr__world" ref={world}>
          <div className="jr__title" data-z={-260} style={{ transform: 'translate(-50%, -50%) translate3d(0, -4vh, -260px)' }}>
            <span className="tag"><b>(04)</b> One brief, thirteen markets</span>
            <h2 id="jr-title" className="display jr__lines"><span>One brief.</span><span><em>Thirteen originals.</em></span></h2>
            <p>Watch one campaign travel from Kashmir to Kanyakumari — re-originated in each market’s own language, never dubbed. Keep scrolling.</p>
          </div>

          {stops.map(({ f, z, x, y, side }, i) => (
            <figure
              key={f.id}
              className={`jr__stop ${side > 0 ? 'is-right' : ''}`}
              data-z={z}
              data-stop={i}
              style={{ transform: `translate(-50%, -50%) translate3d(${x}vw, ${y}vh, ${z}px)` }}
            >
              <div className="jr__img">
                {near && <img src={wm(f.file, 960)} alt={`${f.festival}, ${f.state}`} decoding="async" />}
                <span className="jr__num">{pad(i + 1)}</span>
              </div>
              <figcaption>
                <span className="mono">Market {pad(i + 1)} · {f.state}</span>
                <b>{f.festival}</b>
                <span className="jr__chips"><i>{f.lang}</i><i>{f.format}</i></span>
              </figcaption>
            </figure>
          ))}

          <div className="jr__title jr__title--end" data-z={END_Z} style={{ transform: `translate(-50%, -50%) translate3d(0, -2vh, ${END_Z}px)` }}>
            <span className="tag"><b>13 markets</b> 13 languages · 1 brief</span>
            <p className="display"><Rich text="Your brief, *next?*" /></p>
            <p>Tell us the markets and the moment. We originate every version in parallel — so a thirteen-market rollout still lands on the day.</p>
            <div className="jr__ctas">
              <a href={BRAND.inquiry} className="btn btn--lime" target="_blank" rel="noreferrer">Start a multi-market campaign <Arrow /></a>
              <a href="#brief" className="btn btn--ghost btn--down" onClick={onAnchor}>Build your brief <Arrow ch="↓" /></a>
            </div>
          </div>

          {sparks.map((s, i) => (
            <i
              key={i}
              className="jr__spark"
              data-z={s.z}
              style={{ width: s.s, height: s.s, transform: `translate3d(${s.x}vw, ${s.y}vh, ${s.z}px)` }}
            />
          ))}
        </div>

        <div className="jr__hud" aria-hidden="true">
          <b ref={hudNum}>01 / {pad(N)}</b>
          <div className="jr__rail" ref={rail}>
            {JOURNEY.map((f) => <i key={f.id} />)}
          </div>
          <span ref={hudName}>{JOURNEY[0].state} · {JOURNEY[0].lang} {JOURNEY[0].format.toLowerCase()}</span>
        </div>
      </div>
    </section>
  );
}
