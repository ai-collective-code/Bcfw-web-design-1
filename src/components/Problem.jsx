import { Fragment, useRef } from 'react';
import { gsap, useGSAP, prefersReducedMotion } from '../lib/motion.js';
import SectionHead from './SectionHead.jsx';
import { MANIFESTO, PAINS, wm } from '../data/content.js';
import './Problem.css';

// Split the fix statement into word spans; *starred* runs (which may span
// several words) become serif italics.
function tokens() {
  const out = [];
  let em = false;
  MANIFESTO.forEach((t, ti) => {
    if (typeof t !== 'string') {
      out.push({ key: `p${ti}`, pill: t.pill, alt: t.alt });
      return;
    }
    t.split(' ').forEach((raw, wi) => {
      let w = raw;
      if (w.startsWith('*')) { em = true; w = w.slice(1); }
      const isEm = em;
      const close = w.indexOf('*');
      if (close !== -1) { em = false; w = w.slice(0, close) + w.slice(close + 1); }
      out.push({ key: `w${ti}-${wi}`, word: w, em: isEm });
    });
  });
  return out;
}
const TOKENS = tokens();

/** The pitch opens on the pain: three ways brands lose regional India, then the fix. */
export default function Problem() {
  const root = useRef(null);

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const els = root.current.querySelectorAll('.fix__w, .fix__pill');
    const tl = gsap.timeline({
      scrollTrigger: { trigger: root.current.querySelector('.fix__text'), start: 'top 80%', end: 'bottom 50%', scrub: 0.6 },
    });
    els.forEach((el, i) => {
      if (el.classList.contains('fix__pill')) {
        tl.fromTo(el, { width: 0, opacity: 0 }, { width: '1.9em', opacity: 1, duration: 0.6, ease: 'power2.out' }, i * 0.1);
      } else {
        tl.fromTo(el, { opacity: 0.16 }, { opacity: 1, duration: 0.3, ease: 'none' }, i * 0.1);
      }
    });
  }, { scope: root });

  return (
    <section className="prob" id="problem" ref={root} aria-labelledby="prob-title">
      <div className="shell">
        <SectionHead id="prob-title" n="01" label="The problem" title="Made in Mumbai. *Dies in Madurai.*">
          Every year, brands spend crores on content their own regional audiences don’t recognise as their own.
          Here is where it goes wrong.
        </SectionHead>

        <div className="prob__grid">
          {PAINS.map((p) => (
            <article className="pain" key={p.n} data-reveal>
              <div className="pain__img">
                <img src={wm(p.img, 500)} alt="" loading="lazy" decoding="async" />
                <span className="pain__x" aria-hidden="true">✕</span>
              </div>
              <span className="mono">Problem {p.n}</span>
              <h3>{p.head}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>

        <div className="fix">
          <span className="tag"><b>The fix</b> We don’t translate. We originate.</span>
          <p className="fix__text">
            {TOKENS.map((t) => (
              <Fragment key={t.key}>
                {t.pill ? (
                  <span className="fix__pill" role="img" aria-label={t.alt}>
                    <img src={wm(t.pill, 500)} alt="" loading="lazy" decoding="async" />
                  </span>
                ) : (
                  <span className={`fix__w ${t.em ? 'fix__w--em' : ''}`}>{t.word}</span>
                )}{' '}
              </Fragment>
            ))}
          </p>
        </div>
      </div>
    </section>
  );
}
