import SectionHead from './SectionHead.jsx';
import { PILLARS, BRAND, wm } from '../data/content.js';
import { Arrow } from './ui.jsx';
import './Services.css';

/** What BCF does: three pillars, each with the operating number BCF commits to. */
export default function Services() {
  return (
    <section className="svc" id="services" aria-labelledby="svc-title">
      <div className="shell">
        <SectionHead id="svc-title" n="02" label="What we do" title="Three ways we make your brand *local.*">
          Not by translating. By originating — with the speed of a newsroom and the scale of a machine.
        </SectionHead>

        <div className="svc__grid">
          {PILLARS.map((p) => (
            <article className="pillar" key={p.n} data-reveal>
              <div className="pillar__img">
                <img src={wm(p.img, 960)} alt="" loading="lazy" decoding="async" />
                <span className="pillar__n mono">{p.n}</span>
              </div>
              <div className="pillar__metric">
                <strong>{p.metric}</strong>
                <span>{p.unit}</span>
              </div>
              <h3>{p.head}</h3>
              <p>{p.body}</p>
              <a className="pillar__link" href={BRAND.inquiry} target="_blank" rel="noreferrer">
                Talk to us about {p.head.toLowerCase()} <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>

        <div className="svc__band" data-reveal>
          <p><b>Regional at scale.</b> A Tamil film, a Marathi reel, a Punjabi festival campaign and a Bengali brand story — produced simultaneously.</p>
          <a href={BRAND.inquiry} className="btn btn--ink" target="_blank" rel="noreferrer">Start your campaign <Arrow /></a>
        </div>
      </div>
    </section>
  );
}
