import { useRef, useState } from 'react';
import { gsap, useGSAP, prefersReducedMotion, onAnchor } from '../lib/motion.js';
import { BRAND } from '../data/content.js';
import {
  FOLIO_COVER, FOUNDER, DIVIDERS, CLIENTS, AWARDS, CITATION, PRESS, WORK, ytThumb, ytEmbed,
} from '../data/folio.js';
import { Arrow } from './ui.jsx';
import './Folio.css';
import founderPhoto from '../assets/debojit.png';

// Client logos, cut from the deck's logo slide; keyed by file name.
const LOGOS = Object.fromEntries(
  Object.entries(import.meta.glob('../assets/clients/*.png', { eager: true, import: 'default' }))
    .map(([path, url]) => [path.split('/').pop().replace('.png', ''), url]),
);

const SHOWN = 8;

// A small laurel wreath: a branch arc on each side with an outer and inner row of leaves.
const at = (r, deg) => [24 + r * Math.cos((deg * Math.PI) / 180), 24 + r * Math.sin((deg * Math.PI) / 180)];
const LEAVES = [0, 1, 2, 3, 4, 5].flatMap((i) => {
  const deg = 112 + i * 19;
  const outer = { c: at(19.5, deg), rx: 1.9, ry: 4.2, rot: deg - 30 };
  const inner = { c: at(14.5, deg + 6.9), rx: 1.7, ry: 3.6, rot: deg + 30 };
  return i < 5 ? [outer, inner] : [outer];
});
const [B0, B1] = [at(17, 98), at(17, 222)];
function Laurel() {
  return (
    <svg className="laurel" viewBox="0 0 48 48" aria-hidden="true">
      {[false, true].map((flip) => (
        <g key={flip} transform={flip ? 'translate(48 0) scale(-1 1)' : undefined}>
          <path d={`M${B0[0]} ${B0[1]} A17 17 0 0 1 ${B1[0]} ${B1[1]}`} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          {LEAVES.map(({ c: [x, y], rx, ry, rot }) => (
            <ellipse key={`${x}${y}`} cx={x} cy={y} rx={rx} ry={ry} fill="currentColor" transform={`rotate(${rot} ${x} ${y})`} />
          ))}
        </g>
      ))}
    </svg>
  );
}

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
          <div className="fcover__bar">
            <span>BC[f]W Folio</span>
            <span>{FOLIO_COVER.cities.join(' · ')}</span>
          </div>
          <h2 id="folio-title" className="fcover__title">
            {FOLIO_COVER.lines.map((line, i) => (
              <span className="fcover__line" key={i}>
                {line.map(([t, tone]) => <span className={`is-${tone}`} key={t}>{t}</span>)}
              </span>
            ))}
          </h2>
          <div className="fcover__foot">
            <p className="fcover__reg">Registered under <b>{FOLIO_COVER.company}</b></p>
          </div>
          <div className="fcover__sun" aria-hidden="true"><span>{FOLIO_COVER.year}</span></div>
        </div>

        <div className="fslide ffounder" data-reveal>
          <div className="ffounder__photo"><img src={founderPhoto} alt={`${FOUNDER.name}, ${FOUNDER.role} of BC[f]W`} width="230" height="230" loading="lazy" /></div>
          <div className="ffounder__text">
            <h3>{FOUNDER.role}. {FOUNDER.name}</h3>
            {FOUNDER.paras.map((p) => <p key={p}>{p}</p>)}
          </div>
        </div>

        <Divider k="portfolio" />
        <div className="fslide flogos" data-reveal>
          <ul className="flogos__wall" aria-label="Clients">
            {CLIENTS.map(([name, logo]) => (
              <li key={name} title={name}>
                {LOGOS[logo] ? <img src={LOGOS[logo]} alt={name} loading="lazy" /> : <span>{name}</span>}
              </li>
            ))}
          </ul>
        </div>

        <Divider k="awards" />
        <div className="fslide fawards" data-reveal>
          <div className="fawards__top">
            <div className="fawards__head">
              <p className="mono">Recognition</p>
              <h3><b>{AWARDS.length}</b> award platforms have honoured our team’s work</h3>
            </div>
            <aside className="fawards__cite">
              <span className="fawards__medal"><Laurel />{CITATION.medal}</span>
              <div>
                <p className="mono">{CITATION.award}</p>
                <h4>{CITATION.campaign}</h4>
                <p>{CITATION.brand} · {CITATION.category}</p>
                <p className="mono fawards__agency">Agency: {CITATION.agency}</p>
              </div>
            </aside>
          </div>
          <ol className="fawards__list">
            {AWARDS.map((a, i) => (
              <li key={a}>
                <Laurel />
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <b>{a}</b>
              </li>
            ))}
          </ol>
          <Mark at="bottom" />
        </div>

        <div className="fslide fpress" data-reveal>
          <div className="fpress__head">
            <div>
              <p className="mono">In the press</p>
              <h3>The work, as the trade press covered it</h3>
            </div>
            <p className="fpress__outlets">{[...new Set(PRESS.map((p) => p.outlet))].join(' · ')}</p>
          </div>
          <ul className="fpress__grid">
            {PRESS.map((p) => (
              <li key={p.url}>
                <a href={p.url} target="_blank" rel="noreferrer">
                  <span className="mono">{p.outlet}</span>
                  <b>{p.head}</b>
                  <span className="fpress__read">Read article <i aria-hidden="true">↗</i></span>
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
          <div className="fcoffee__copy">
            <p className="fcoffee__script">Coffee?</p>
            <h3>Let’s brew your next campaign together.</h3>
            <p className="fcoffee__lede">Tell us about your brand and the audience you want to reach. We’ll come back with ideas, in their language.</p>
            <a href={BRAND.contact} className="btn btn--lime" onClick={onAnchor}>Let’s talk <Arrow /></a>
          </div>
          <svg className="fcoffee__cup" viewBox="0 0 220 220" aria-hidden="true">
            <g className="fcoffee__steam" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round">
              <path d="M78 76 c-12 -14 12 -22 0 -38" />
              <path d="M106 70 c-12 -14 12 -22 0 -40" />
              <path d="M134 76 c-12 -14 12 -22 0 -38" />
            </g>
            <ellipse cx="106" cy="196" rx="86" ry="12" fill="#000" opacity="0.25" />
            <ellipse cx="106" cy="188" rx="78" ry="12" fill="#f6e7cf" />
            <path d="M164 112 h10 a24 24 0 0 1 0 48 h-14" fill="none" stroke="#ff47b1" strokeWidth="11" />
            <path d="M40 96 h132 l-10 72 a20 20 0 0 1 -20 18 h-72 a20 20 0 0 1 -20 -18 z" fill="#ff47b1" />
            <path d="M40 96 h132 l-2 14 h-128 z" fill="#e3197b" />
            <ellipse cx="106" cy="96" rx="66" ry="10" fill="#6b3a1f" />
            <text x="106" y="152" textAnchor="middle" className="fcoffee__mark">BC[f]W</text>
          </svg>
          <p className="fcoffee__note">**Bharat Content Fireworks is a part of AI Collective Private Limited.</p>
        </div>
      </div>
    </section>
  );
}
