import { useRef } from 'react';
import SectionHead from './SectionHead.jsx';
import { PAINS, wm } from '../data/content.js';
import { useLiveEvents } from '../lib/quickUpdate.js';
import './Problem.css';

/** The pitch opens on the pain: three ways brands lose regional India, then the fix. */
export default function Problem() {
  const root = useRef(null);
  // Quick-update photos replace the card images in order.
  const photos = useLiveEvents().map((e) => e.image).filter(Boolean);

  return (
    <section className="prob" id="problem" ref={root} aria-labelledby="prob-title">
      <div className="shell">
        <SectionHead id="prob-title" title="Made in Mumbai. *Dies in Madurai.*">
          Every year, brands spend crores on content their own regional audiences don’t recognise as their own.
          Here is where it goes wrong.
        </SectionHead>

        <div className="prob__grid">
          {PAINS.map((p, i) => (
            <article className="pain" key={p.n} data-reveal>
              <div className="pain__img">
                <img src={photos[i] ?? wm(p.img, 500)} alt="" loading="lazy" decoding="async" />
                <span className="pain__x" aria-hidden="true">✕</span>
              </div>
              <span className="mono">Problem {p.n}</span>
              <h3>{p.head}</h3>
              <p>{p.body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
