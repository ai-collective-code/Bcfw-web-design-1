import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap, useGSAP, prefersReducedMotion, onAnchor, lockScroll } from '../lib/motion.js';
import { BRAND } from '../data/content.js';
import {
  FOUNDER, DIVIDERS, CLIENTS, WORK, ytThumb, ytEmbed, instaEmbed,
} from '../data/folio.js';
import { useRewards } from '../lib/quickUpdate.js';
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
  const chars = Array.from(d.word);
  return (
    <div
      className={`fdiv fdiv--${k} fdiv--${d.style}`}
      style={{ '--d-bg': d.bg, '--d-fg': d.fg, '--d-sc': d.sc, '--d-size': d.size }}
      data-reveal
    >
      <Mark />
      <h3 className="fdiv__title">
        <span className="fdiv__word" aria-label={d.word}>
          {chars.map((ch, i) => (
            <span key={i} className="fdiv__char" aria-hidden="true">
              {ch === ' ' ? '\u00A0' : ch}
            </span>
          ))}
        </span>
        <span className="fdiv__script">{d.script}</span>
      </h3>
    </div>
  );
}

/** YouTube thumbnail card that opens the full video in a lightbox modal popup. */
function Film({ v, onPlay }) {
  const label = `${v.brand} — ${v.title}`;
  return (
    <figure
      className="film"
      onClick={() => onPlay?.(v)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onPlay?.(v);
        }
      }}
      aria-label={`Play: ${label}`}
    >
      <div className="film__frame">
        <button
          type="button"
          className="film__play"
          onClick={(e) => {
            e.stopPropagation();
            onPlay?.(v);
          }}
          aria-label={`Play: ${label}`}
        >
          <img src={ytThumb(v.id)} alt="" loading="lazy" decoding="async" />
          <span className="film__btn" aria-hidden="true" />
        </button>
      </div>
      <figcaption>
        {v.brand !== 'ICE Media Lab' && <span className="mono">{v.brand}</span>}
        <b>{v.title}</b>
      </figcaption>
    </figure>
  );
}

function Reel({ group, onPlayVideo }) {
  const [all, setAll] = useState(false);
  const { videos, feature, reels } = group;
  const list = all ? videos : videos.slice(0, SHOWN);

  return (
    <div className="fslide fwork">
      {feature && (
        <div className="fwork__feature">
          <Film v={feature} onPlay={onPlayVideo} />
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
              <button
                type="button"
                className="fwork__reel-btn"
                onClick={() => onPlayVideo?.({
                  type: 'reel',
                  brand: r.brand,
                  title: r.title,
                  url: r.url,
                })}
                aria-label={`Play reel: ${r.brand} — ${r.title}`}
              >
                <span className="mono">{r.brand} · Instagram reel</span>
                <b>{r.title}</b>
                <span className="fwork__go" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="fwork__grid">
        {list.map((v) => <Film v={v} key={v.id} onPlay={onPlayVideo} />)}
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
  const rewards = useRewards();
  const [activeVideo, setActiveVideo] = useState(null);
  const aiGroup = WORK.find((g) => g.key === 'ai');
  const otherWork = WORK.filter((g) => g.key !== 'ai');

  // Handle scroll lock & keyboard Escape when video popup is open
  useEffect(() => {
    if (!activeVideo) return undefined;
    lockScroll(true);
    const onKeyDown = (e) => {
      if (e.key === 'Escape') setActiveVideo(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [activeVideo]);

  useGSAP(() => {
    if (prefersReducedMotion()) return;

    // Staggered drop bounce effect for letters as each divider enters view on scroll
    gsap.utils.toArray('.fdiv', root.current).forEach((slide) => {
      const chars = slide.querySelectorAll('.fdiv__char');
      const script = slide.querySelector('.fdiv__script');
      if (!chars.length) return;

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: slide,
          start: 'top 85%',
          toggleActions: 'play none none reverse',
        },
      });

      // 1. Letters drop in sequentially with bounce: A -> W -> A -> R -> D -> S
      tl.fromTo(chars, {
        y: '-135%',
        opacity: 0,
        scaleY: 1.25,
      }, {
        y: '0%',
        opacity: 1,
        scaleY: 1,
        duration: 0.72,
        ease: 'back.out(2)',
        stagger: 0.08,
      });

      // 2. Script overlay floats in across the letters
      if (script) {
        tl.fromTo(script, {
          y: -24,
          opacity: 0,
          scale: 0.85,
        }, {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.55,
          ease: 'power2.out',
        }, '-=0.35');
      }
    });

    // 2. On-Scroll dynamic scrub parallax (works smoothly as the user scrolls through!)
    gsap.utils.toArray('.fdiv', root.current).forEach((slide) => {
      const word = slide.querySelector('.fdiv__word');
      const script = slide.querySelector('.fdiv__script');
      const isPortfolio = slide.classList.contains('fdiv--portfolio');
      const isAi = slide.classList.contains('fdiv--ai');
      const base = isAi ? 0 : -50;

      // Word drifts horizontally and vertically with depth on scroll
      if (word) {
        const xStart = isPortfolio ? base - 2.5 : base + 3.5;
        const xEnd = isPortfolio ? base + 2.5 : base - 3.5;

        gsap.fromTo(word, {
          x: 0,
          xPercent: xStart,
          y: 18,
        }, {
          xPercent: xEnd,
          y: -18,
          ease: 'none',
          scrollTrigger: {
            trigger: slide,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1,
          },
        });
      }

      // Script overlay glides with floating counter-parallax across the bold caps
      if (script) {
        gsap.fromTo(script, {
          x: isPortfolio ? -32 : -22,
          y: 16,
          rotation: isPortfolio ? -2 : -1.2,
        }, {
          x: isPortfolio ? 32 : 22,
          y: -16,
          rotation: isPortfolio ? 2 : 1.2,
          ease: 'none',
          scrollTrigger: {
            trigger: slide,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1.1,
          },
        });
      }
    });
  }, { scope: root });

  return (
    <section className="folio" id="work" aria-labelledby="folio-title" ref={root}>
      <div className="shell folio__stack">
        <h2 className="tag" id="folio-title"><b>The work</b> BC[f]W Folio 2026</h2>

        <div className="fslide ffounder" data-reveal>
          <div className="ffounder__media">
            <div className="ffounder__frame">
              <div className="ffounder__photo">
                <img
                  src={founderPhoto}
                  alt={`${FOUNDER.name}, ${FOUNDER.role} of BC[f]W`}
                  width="320"
                  height="380"
                  loading="lazy"
                />
              </div>
              <div className="ffounder__stamp">
                <span className="ffounder__stamp-val">20+</span>
                <span className="ffounder__stamp-lbl">Yrs Content</span>
              </div>
            </div>
          </div>

          <div className="ffounder__body">
            <div className="ffounder__top">
              <span className="ffounder__badge">
                <i className="ffounder__pulse" aria-hidden="true" /> Leadership · {FOUNDER.role}
              </span>
              <h3 className="ffounder__name">
                {FOUNDER.name}
                <span className="ffounder__role-tag">Creative &amp; Content Architect</span>
              </h3>
              <p className="ffounder__lede">
                Pioneering regional branded storytelling, deep vernacular insights, and AI-powered content innovation at scale.
              </p>
            </div>

            <div className="ffounder__chips">
              <span className="ffounder__chip">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" /></svg>
                Calcutta Xaverian &amp; IIMB
              </span>
              <span className="ffounder__chip">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd" /></svg>
                Ex-Radio One Regional Lead
              </span>
              <span className="ffounder__chip">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                Co-Founder, ICE Media Lab
              </span>
              <span className="ffounder__chip">
                <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14" aria-hidden="true"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                AI &amp; Scaled Innovation
              </span>
            </div>

            <div className="ffounder__story">
              {FOUNDER.paras.map((p, idx) => (
                <div key={idx} className="ffounder__para-row">
                  <span className="ffounder__step-num">0{idx + 1}</span>
                  <p>{p}</p>
                </div>
              ))}
            </div>
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

        {aiGroup && (
          <div className="folio__group" key={aiGroup.key}>
            <Divider k={aiGroup.key} />
            <Reel group={aiGroup} onPlayVideo={setActiveVideo} />
          </div>
        )}

        <Divider k="awards" />
        <div className="fslide fawards" data-reveal>
          <div className="fawards__top">
            <div className="fawards__head">
              <p className="mono">Recognition</p>
              <h3><b>{rewards.length}</b> award platforms have honoured our team’s work</h3>
            </div>
          </div>
          <ol className="fawards__list">
            {rewards.map((a, i) => (
              <li key={a.id || a.name || i} className={a.image ? 'fawards__item--has-img' : ''}>
                {a.image ? (
                  <div className="fawards__thumb-wrap">
                    <img src={a.image} alt={a.name} className="fawards__thumb" />
                  </div>
                ) : (
                  <Laurel />
                )}
                <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                <b>{a.name}</b>
              </li>
            ))}
          </ol>
          <Mark at="bottom" />
        </div>

        {otherWork.map((g) => (
          <div className="folio__group" key={g.key}>
            <Divider k={g.key} />
            <Reel group={g} onPlayVideo={setActiveVideo} />
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

      {/* Video Lightbox Modal Popup */}
      {activeVideo && typeof document !== 'undefined' && createPortal(
        <div
          className={`video-modal ${activeVideo.type === 'reel' ? 'video-modal--reel' : ''}`}
          role="dialog"
          aria-modal="true"
          aria-labelledby="video-modal-title"
          onClick={() => setActiveVideo(null)}
        >
          <div className="video-modal__backdrop" aria-hidden="true" />
          <div
            className={`video-modal__content ${activeVideo.type === 'reel' ? 'video-modal__content--reel' : ''}`}
            data-lenis-prevent
            onClick={(e) => e.stopPropagation()}
          >
            <div className="video-modal__bar">
              <div className="video-modal__titles">
                {(activeVideo.brand !== 'ICE Media Lab' || activeVideo.type === 'reel') && (
                  <span className="mono video-modal__brand">
                    {activeVideo.brand !== 'ICE Media Lab' && activeVideo.brand}
                    {activeVideo.type === 'reel' && ' · Instagram Reel'}
                  </span>
                )}
                <h3 id="video-modal-title" className="video-modal__heading">{activeVideo.title}</h3>
              </div>
              <div className="video-modal__actions">
                {activeVideo.type === 'reel' && activeVideo.url && (
                  <a
                    href={activeVideo.url}
                    target="_blank"
                    rel="noreferrer"
                    className="video-modal__link"
                    title="Open on Instagram"
                    aria-label="Open on Instagram (opens in new tab)"
                  >
                    <span>Instagram</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                )}
                <button
                  type="button"
                  className="video-modal__close"
                  onClick={() => setActiveVideo(null)}
                  aria-label="Close video"
                >
                  <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            </div>

            <div className={`video-modal__player ${activeVideo.type === 'reel' ? 'video-modal__player--reel' : ''}`}>
              {activeVideo.type === 'reel' ? (
                <iframe
                  src={instaEmbed(activeVideo.url)}
                  title={`${activeVideo.brand} — ${activeVideo.title}`}
                  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
                  allowFullScreen
                  scrolling="no"
                />
              ) : (
                <iframe
                  src={ytEmbed(activeVideo.id)}
                  title={`${activeVideo.brand} — ${activeVideo.title}`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              )}
            </div>
          </div>
        </div>,
        document.body,
      )}
    </section>
  );
}
