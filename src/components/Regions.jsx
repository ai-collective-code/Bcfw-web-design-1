import { useRef } from 'react';
import { gsap, useGSAP, useNear, prefersReducedMotion, scrollToTarget } from '../lib/motion.js';
import SectionHead from './SectionHead.jsx';
import { REGIONS, wm } from '../data/content.js';
import { brief, useBrief } from '../lib/brief.js';
import './Regions.css';

const pad = (n) => String(n).padStart(2, '0');
const NAME = { North: 'North India', West: 'West India', Central: 'Central India', East: 'East India', Northeast: 'the Northeast', South: 'South India', Islands: 'the Islands' };

/**
 * Seven market playbooks as cards that stick and stack: each new card slides
 * over the one before, which eases back as it is covered. Stacking is
 * desktop-only (and only on screens tall enough for a whole card).
 */
export default function Regions() {
  const root = useRef(null);
  const near = useNear(root, '100%');
  const { regions } = useBrief();

  useGSAP(() => {
    if (prefersReducedMotion()) return;
    const mm = gsap.matchMedia();
    mm.add('(min-width: 900px) and (min-height: 760px)', () => {
      const cards = gsap.utils.toArray('.mood', root.current);
      cards.forEach((card, i) => {
        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card.querySelector('.mood__inner'), {
          scale: 0.92,
          opacity: 0.45,
          ease: 'none',
          scrollTrigger: { trigger: next, start: 'top bottom', end: 'top 20%', scrub: true },
        });
      });
    });
    return () => mm.revert();
  }, { scope: root });

  const plan = (key) => { brief.addRegion(key); scrollToTarget('#brief'); };

  return (
    <section className="moods" id="regions" ref={root} aria-labelledby="moods-title">
      <div className="shell">
        <SectionHead id="moods-title" n="05" label="Market playbooks" title="Seven regions. *Seven playbooks.*">
          Each region has its own languages, its own peak moments and its own idea of a good ad. Here is what wins
          in each — and the languages we make it in.
        </SectionHead>

        <div className="moods__stack">
          {REGIONS.map((r, i) => {
            const added = regions.includes(r.key);
            return (
              <article className="mood" key={r.key} style={{ '--accent': r.accent, '--i': i }} aria-label={`${r.key} India playbook`}>
                <div className="mood__inner">
                  <figure className="mood__hero">
                    {near && <img src={wm(r.photos[0].file, 1600)} alt={`${r.photos[0].festival}, ${r.photos[0].state}`} loading="lazy" decoding="async" />}
                  </figure>
                  <div className="mood__copy">
                    <div className="mood__top">
                      <span className="mono">Playbook {pad(i + 1)} / {pad(REGIONS.length)}</span>
                      <span className="mood__count mono">{r.entries.length} markets</span>
                    </div>
                    <h3 className="display">{r.key}</h3>
                    <p className="mood__mood">{r.mood}</p>
                    <p className="mood__line">{r.line}</p>
                    <div className="mood__block">
                      <span className="mono">Languages we make in</span>
                      <ul className="mood__langs">{r.langs.map((l) => <li key={l}>{l}</li>)}</ul>
                    </div>
                    <div className="mood__block">
                      <span className="mono">Peak moments</span>
                      <ul className="mood__chips">
                        {r.entries.slice(0, 5).map((f) => (
                          <li key={f.id}><b>{f.festival}</b><span>{f.state}</span></li>
                        ))}
                        {r.entries.length > 5 && <li className="mood__more">+{r.entries.length - 5} more</li>}
                      </ul>
                    </div>
                    <button className={`btn ${added ? 'btn--ink' : 'btn--lime'} mood__cta`} onClick={() => plan(r.key)}>
                      {added ? `${r.key} is in your brief` : `Plan for ${NAME[r.key]}`}
                      <span className="btn__arrow" aria-hidden="true"><i>{added ? '✓' : '→'}</i><i>{added ? '✓' : '→'}</i></span>
                    </button>
                  </div>
                  <div className="mood__prints">
                    {r.photos.slice(1).map((f) => (
                      <figure key={f.id} className="mood__print">
                        {near && <img src={wm(f.file, 640)} alt={`${f.festival}, ${f.state}`} loading="lazy" decoding="async" />}
                        <figcaption><b>{f.festival}</b><span>{f.state}</span></figcaption>
                      </figure>
                    ))}
                    <p className="mood__caption"><b>{r.photos[0].festival}</b><span>{r.photos[0].state}</span></p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
