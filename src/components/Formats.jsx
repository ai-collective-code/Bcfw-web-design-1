import SectionHead from './SectionHead.jsx';
import { FORMATS, wm } from '../data/content.js';
import { brief, useBrief } from '../lib/brief.js';
import './Formats.css';

/** The content arsenal: nine formats, each one tap away from the visitor's brief. */
export default function Formats() {
  const { formats } = useBrief();

  return (
    <section className="fmt" id="formats" aria-labelledby="fmt-title">
      <div className="shell">
        <SectionHead id="fmt-title" n="03" label="The content arsenal" title="Nine formats. *One native voice.*">
          Pick what your campaign needs — every format is written, cast and cut in the language of the market it is for.
        </SectionHead>

        <div className="fmt__grid">
          {FORMATS.map((f, i) => {
            const on = formats.includes(f.head);
            return (
              <article className={`fmt__card ${on ? 'is-on' : ''}`} key={f.head} data-reveal>
                <img src={wm(f.img, 500)} alt="" loading="lazy" decoding="async" />
                <div className="fmt__body">
                  <div className="fmt__top">
                    <span className="mono">{String(i + 1).padStart(2, '0')} · {f.kind}</span>
                  </div>
                  <h3>{f.head}</h3>
                  <p>{f.line}</p>
                  <button
                    className="fmt__add"
                    onClick={() => brief.toggleFormat(f.head)}
                    aria-pressed={on}
                  >
                    {on ? 'Added to brief ✓' : 'Add to brief +'}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
