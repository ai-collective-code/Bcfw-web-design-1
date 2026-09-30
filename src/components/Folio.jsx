import { useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion, onAnchor } from '../lib/motion.js';
import { BRAND } from '../data/content.js';
import {
  FOLIO_COVER, FOUNDER, DIVIDERS, CLIENTS, AWARDS, CITATION, PRESS, WORK, ytThumb, ytEmbed,
} from '../data/folio.js';
import { Arrow } from './ui.jsx';
import './Folio.css';

const SHOWN = 8;

/** The deck's pink brush corner. */
const Mark = ({ at = 'top' }) => <i className={`fmark fmark--${at}`} aria-hidden="true" />;

function Divider({ k }) {
  const d = DIVIDERS[k];
  return (
    <div
      className={`fdiv fdiv--${k} fdiv--${d.style}`}
      style={{ '--d-bg': d.bg, '--d-fg': d.fg, '--d-sc': d.sc, '--d-size': d.size }}
      data-reveal
    >
      <Mark />
      <h3 className="fdiv__title">
        <span className="fdiv__word">{d.word}</span>
        <span className="fdiv__script">{d.script}</span>
      </h3>
    </div>
  );
}

/** YouTube thumbnail until clicked, so ninety films cost ninety small JPEGs rather than ninety players. */
function Film({ v }) {
  const [playing, setPlaying] = useState(false);
  const label = `${v.brand} — ${v.title}`;
  return (
    <figure className="film">
      <div className="film__frame">
        {playing ? (
          <iframe
            src={ytEmbed(v.id)}
            title={label}
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        ) : (
          <button className="film__play" onClick={() => setPlaying(true)} aria-label={`Play: ${label}`}>
            <img src={ytThumb(v.id)} alt="" loading="lazy" decoding="async" />
            <span className="film__btn" aria-hidden="true" />
          </button>
        )}
      </div>
      <figcaption>
        <span className="mono">{v.brand}</span>
        <b>{v.title}</b>
      </figcaption>
    </figure>
  );
}

function Reel({ group }) {
  const [all, setAll] = useState(false);
  const { videos, feature, reels } = group;
  const list = all ? videos : videos.slice(0, SHOWN);

  return (
    <div className="fslide fwork">
      {feature && (
        <div className="fwork__feature">
          <Film v={feature} />
          <div className="fwork__story">
            <p className="fwork__lead">{feature.lead}</p>
            <p>{feature.body}</p>
          </div>
        </div>
      )}
      {reels && (
        <ul className="fwork__reels">
          {reels.map((r) => (
            <li key={r.url}>
              <a href={r.url} target="_blank" rel="noreferrer">
                <span className="mono">{r.brand} · Instagram reel</span>
                <b>{r.title}</b>
                <span className="fwork__go" aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <div className="fwork__grid">
        {list.map((v) => <Film v={v} key={v.id} />)}
      </div>
      {videos.length > SHOWN && (
        <button className="fwork__more" onClick={() => setAll((x) => !x)} aria-expanded={all}>
          {all ? 'Show fewer' : `Show all ${videos.length} films`}
          <span aria-hidden="true">{all ? '−' : '+'}</span>
        </button>
      )}
      <Mark at="bottom" />
    </div>
  );
}

/** "BC[f]W Folio 2026" — BCF's portfolio deck, slide for slide. */
export default function Folio() {
  const root = useRef(null);

  // The big divider words drift sideways as they pass, like a slow pan across the slide.
  useGSAP(() => {
    if (prefersReducedMotion()) return;
    gsap.utils.toArray('.fdiv__word', root.current).forEach((el) => {
      const slide = el.closest('.fdiv');
      const base = slide.classList.contains('fdiv--ai') ? 0 : -50;
      // x: 0 discards the px offset GSAP would otherwise parse out of the CSS translateX(-50%).
      gsap.fromTo(el, { x: 0, xPercent: base + 3 }, {
        xPercent: base - 3, ease: 'none',
        scrollTrigger: { trigger: slide, start: 'top bottom', end: 'bottom top', scrub: true },
      });
    });
  }, { scope: root });

  return (
    <section className="folio" id="work" aria-labelledby="folio-title" ref={root}>
      <div className="shell folio__stack">
        <p className="tag"><b>The work</b> BC[f]W Folio 2026</p>

        <div className="fslide fcover" data-reveal>
          <h2 id="folio-title" className="fcover__title">
            {FOLIO_COVER.lines.map((line, i) => (
              <span className="fcover__line" key={i}>
                {line.map(([t, tone]) => <span className={`is-${tone}`} key={t}>{t}</span>)}
              </span>
            ))}
          </h2>
          <p className="fcover__reg">{FOLIO_COVER.registered.map((l) => <span key={l}>{l}</span>)}</p>
        </div>

        <div className="fslide ffounder" data-reveal>
          <div className="ffounder__photo" aria-hidden="true"><span>D</span></div>
          <div className="ffounder__text">
            <h3>{FOUNDER.role}. {FOUNDER.name}</h3>
            {FOUNDER.paras.map((p) => <p key={p}>{p}</p>)}
          </div>
        </div>

        <Divider k="portfolio" />
        <div className="fslide flogos" data-reveal>
          <ul className="flogos__wall" aria-label="Clients">
            {CLIENTS.map((c) => <li key={c}>{c}</li>)}
          </ul>
        </div>

        <Divider k="awards" />
        <div className="fslide fawards" data-reveal>
          <ul className="fawards__list">
            {AWARDS.map((a) => <li key={a}>{a}</li>)}
          </ul>
          <aside className="fawards__cite">
            <span className="fawards__medal">{CITATION.medal}</span>
            <p className="mono">{CITATION.award}</p>
            <h4>{CITATION.campaign}</h4>
            <p>{CITATION.brand} · {CITATION.category}</p>
            <p className="mono fawards__agency">Agency: {CITATION.agency}</p>
          </aside>
          <Mark at="bottom" />
        </div>

        <div className="fslide fpress" data-reveal>
          <p className="mono fpress__label">In the press</p>
          <ul>
            {PRESS.map((p) => (
              <li key={p.url}>
                <a href={p.url} target="_blank" rel="noreferrer">
                  <span className="mono">{p.outlet}</span>
                  <b>{p.head}</b>
                  <span className="fwork__go" aria-hidden="true">↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        {WORK.map((g) => (
          <div className="folio__group" key={g.key}>
            <Divider k={g.key} />
            <Reel group={g} />
          </div>
        ))}

        <div className="fslide fcoffee" data-reveal>
          <p className="fcoffee__art"><i aria-hidden="true" /><span>Coffee?</span></p>
          <a href={BRAND.contact} className="btn btn--ink" onClick={onAnchor}>Let’s talk <Arrow /></a>
          <p className="fcoffee__note">**Bharat Content Fireworks is a part of AI Collective Private Limited.</p>
        </div>
      </div>
    </section>
  );
}
