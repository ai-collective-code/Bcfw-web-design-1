import SectionHead from './SectionHead.jsx';
import { FAQS, BRAND } from '../data/content.js';
import { Arrow } from './ui.jsx';
import './Faq.css';

/** Objection handling. Native <details>, so it works without JavaScript and with the keyboard. */
export default function Faq() {
  return (
    <section className="faq" id="faq" aria-labelledby="faq-title">
      <div className="shell faq__grid">
        <div className="faq__side">
          <SectionHead id="faq-title" n="12" label="Questions" title="Before you *brief us.*" />
          <p>Still deciding? Send us the market and the moment — we’ll tell you what we would make.</p>
          <a href={BRAND.inquiry} className="btn btn--ink" target="_blank" rel="noreferrer">Ask us anything <Arrow /></a>
        </div>
        <div className="faq__list">
          {FAQS.map((f, i) => (
            <details className="faq__item" key={f.q} open={i === 0}>
              <summary>
                <span>{f.q}</span>
                <i aria-hidden="true" />
              </summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
