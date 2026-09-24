import { useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion.js';
import { LENS, BRAND } from '../data/content.js';
import { Words, Arrow } from './ui.jsx';
import './Lens.css';

/** The market argument: BCF's published figures, counting up as they arrive. */
export default function Lens() {
  const root = useRef(null);

  useGSAP(() => {
    const nums = root.current.querySelectorAll('[data-count]');
    if (prefersReducedMotion()) return;
    nums.forEach((el) => {
      const end = Number(el.dataset.count);
      const obj = { v: 0 };
      el.textContent = '0';
      gsap.to(obj, {
        v: end, duration: 2, ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
        onUpdate: () => { el.textContent = String(Math.round(obj.v)); },
      });
    });
    gsap.from(root.current.querySelectorAll('.lens__head .word > span'), {
      yPercent: 110, duration: 1.1, ease: 'expo.out', stagger: 0.04,
      scrollTrigger: { trigger: root.current, start: 'top 75%', once: true },
    });
  }, { scope: root });

  return (
    <section className="lens" id="opportunity" ref={root} aria-labelledby="lens-title">
      <div className="lens__frame on-night">
        <div className="shell">
          <div className="lens__top">
            <span className="tag"><b>The opportunity</b> The Bharat lens</span>
            <h2 id="lens-title" className="display lens__head">
              <Words text="Regional India isn’t a segment. *It’s the market.*" />
            </h2>
          </div>

          <dl className="lens__grid">
            {LENS.map((s) => (
              <div className="lens__stat" key={s.label}>
                <dt>{s.label}</dt>
                <dd><span data-count={s.value}>{s.value}</span><sup>{s.suffix}</sup></dd>
              </div>
            ))}
          </dl>

          <div className="lens__foot">
            <p>
              The next billion consumers don’t live in Bandra or Banjara Hills. They live in Bhagalpur, Bellary
              and Bokaro — and they can tell, instantly, when a brand is talking at them instead of to them.
            </p>
            <a href={BRAND.inquiry} className="btn btn--lime" target="_blank" rel="noreferrer">
              Reach them in their language <Arrow />
            </a>
          </div>
          <p className="lens__src mono">Figures as published by BCF on bcfworks.com.</p>
        </div>
      </div>
    </section>
  );
}
