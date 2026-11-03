import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { PRESS } from '../data/folio.js';
import { lockScroll } from '../lib/motion.js';
import { fetchWikiFullArticle } from '../lib/wiki.js';
import './Press.css';

const PRESS_DETAILS = [
  {
    match: 'Beware! Misleading ad-game',
    wikiSlug: 'Advertising_in_India',
    wikiTopic: 'Advertising in India',
    category: 'Advertising Ethics & Cultural Resonance',
    brand: 'Dabur / Industry Perspective',
    summary:
      'An investigative critique exploring consumer skepticism around deceptive advertising claims versus authentic emotional storytelling in Indian campaigns. It spotlights how genuine cultural empathy—exemplified by Dabur’s iconic "Umeedo Wali Dhoop" philosophy—wins lasting consumer faith across Bharat heartlands.',
    takeaway:
      'True consumer resonance in Bharat comes from regional truth and cultural empathy, not synthetic marketing promises.',
  },
  {
    match: 'MS Dhoni: A Baahubali brand',
    wikiSlug: 'MS_Dhoni',
    wikiTopic: 'MS Dhoni (Brand Equity & Icon)',
    category: 'Celebrity Endorsement & Regional Power',
    brand: 'MS Dhoni / Endorsement Equity',
    summary:
      'A deep-dive valuation analysis on MS Dhoni’s enduring appeal across tier-2 and tier-3 Indian markets, detailing how grassroots authenticity, quiet composure, and homegrown credibility drive sustained multi-decade brand recall.',
    takeaway:
      'Dhoni remains the defining Baahubali brand of heartland India because he personifies everyday aspiration without elitism.',
  },
  {
    match: 'Dabur Red Paste revolutionises',
    wikiSlug: 'Kumbh_Mela',
    wikiTopic: 'Kumbh Mela & Traditional Rituals',
    category: 'Cultural Experiential Activation',
    brand: 'Dabur Red Paste',
    summary:
      'Coverage of Dabur Red Paste’s landmark on-ground activation at Maha Kumbh 2025, where traditional morning riverbank bathing rituals were transformed into "Dant Snan" hygiene stations serving over 10 million pilgrims with native cultural respect.',
    takeaway:
      'Integrating brand utility seamlessly into sacred spiritual journeys without commodifying the devotee experience.',
  },
  {
    match: 'Nykaa TV presents Khoj',
    wikiSlug: 'Nykaa',
    wikiTopic: 'Nykaa (Digital Native Beauty)',
    category: 'Vertical Mobile Storytelling',
    brand: 'Nykaa TV',
    summary:
      'A feature on pioneering vertical-first smartphone filmmaking, shot entirely using 9:16 mobile UI cinematography to capture the intimate and relatable digital dynamics between modern mothers and daughters in contemporary urban India.',
    takeaway:
      'Designed exclusively for mobile screens, blending cinematic storytelling with native smartphone user interfaces.',
  },
  {
    match: 'ITC’s Aashirvaad Mishti Doi',
    wikiSlug: 'Durga_Puja',
    wikiTopic: 'Durga Puja & Bengal Culinary Heritage',
    category: 'Festive Heritage & Native Language',
    brand: 'ITC Aashirvaad Svasti',
    summary:
      'Spotlight on reviving Bengal’s nostalgic street-culture of clay-pot "Doi-walas" during Durga Puja with native dialect, live cultural street theater, and authentic festive family warmth.',
    takeaway:
      'Reviving Bengal’s lost sensory traditions natively, speaking in authentic regional cadence without artificial dubs.',
  },
  {
    match: 'Nykaa TV presents Rakshak',
    wikiSlug: 'Raksha_Bandhan',
    wikiTopic: 'Raksha Bandhan & Sibling Traditions',
    category: 'Emotional Narrative Film',
    brand: 'Nykaa TV',
    summary:
      'A sensitive celebration of unspoken sibling bonds for Raksha Bandhan, bypassing commercial gift tropes to focus on quiet everyday acts of protection, vulnerability, and mutual understanding.',
    takeaway:
      'Subtle storytelling that respects modern emotional complexity across young Indian households.',
  },
  {
    match: 'Campaign face-off: SpringFit',
    wikiSlug: 'Advertising_campaign',
    wikiTopic: 'Advertising Campaign Strategy',
    category: 'Creative Strategy & Teardown',
    brand: 'SpringFit Mattress',
    summary:
      'A comparative creative teardown analyzing sleep health messaging, humorous relatability, and digital community conversation across Indian social platforms between competing sleep brands.',
    takeaway:
      'Transforming sleep from a functional commodity into an emotional lifestyle priority through community conversation.',
  },
];

function findDetail(head) {
  return (
    PRESS_DETAILS.find((d) => head.toLowerCase().includes(d.match.toLowerCase())) || {
      wikiSlug: 'Advertising_in_India',
      wikiTopic: 'Advertising in India',
      category: 'Trade Coverage',
      brand: 'Brand Campaign',
      summary: 'Coverage and industry reception of cultural brand work in India.',
      takeaway: 'Authentic regional creative strategy driving cultural recall.',
    }
  );
}

function PressModal({ article, onClose }) {
  const [tab, setTab] = useState('story');
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'full'
  const [wikiData, setWikiData] = useState(null);
  const [loadingWiki, setLoadingWiki] = useState(true);
  const [fullWiki, setFullWiki] = useState(null);
  const [loadingFull, setLoadingFull] = useState(false);

  const detail = findDetail(article.head);
  const cardRef = useRef(null);

  useEffect(() => {
    let cancel = false;
    setLoadingWiki(true);
    setWikiData(null);
    setFullWiki(null);
    setViewMode('summary');

    const slug = detail.wikiSlug || 'Advertising_in_India';
    fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (!cancel) {
          setWikiData(json);
          setLoadingWiki(false);
        }
      })
      .catch(() => {
        if (!cancel) setLoadingWiki(false);
      });

    return () => { cancel = true; };
  }, [detail.wikiSlug]);

  const openFullArticle = () => {
    setTab('wiki');
    setViewMode('full');

    if (fullWiki) {
      cardRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setLoadingFull(true);
    const targetTitle = wikiData?.title || detail.wikiSlug || 'Advertising_in_India';
    fetchWikiFullArticle(targetTitle).then((res) => {
      setFullWiki(res);
      setLoadingFull(false);
      cardRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  useEffect(() => {
    lockScroll(true);
    const esc = (e) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        if (viewMode === 'full') {
          setViewMode('summary');
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', esc);
    return () => {
      lockScroll(false);
      window.removeEventListener('keydown', esc);
    };
  }, [onClose, viewMode]);

  return createPortal(
    <div
      className="press-pop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="press-pop-title"
      data-lenis-prevent
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className={`press-pop__card ${viewMode === 'full' ? 'press-pop__card--wide' : ''}`}
        ref={cardRef}
      >
        <button
          type="button"
          className="press-pop__close"
          aria-label="Close article modal"
          onClick={onClose}
          title="Close (Esc)"
        >
          ✕
        </button>

        {viewMode === 'full' ? (
          <div className="press-pop__full-wiki">
            <div className="press-pop__full-bar">
              <button
                type="button"
                className="press-pop__back-btn"
                onClick={() => setViewMode('summary')}
              >
                ← Back to Summary
              </button>
              <span className="press-pop__full-tag mono">
                <b>Wikipedia Encyclopedia</b> · Full Article Reader
              </span>
            </div>

            <div className="press-pop__meta">
              <h2 id="press-pop-title" className="press-pop__title">
                {fullWiki?.title || wikiData?.title || detail.wikiTopic}
              </h2>
              {wikiData?.description && (
                <p className="press-pop__desc mono">{wikiData.description}</p>
              )}
            </div>

            {loadingFull ? (
              <div className="press-pop__loading">
                <span className="press-pop__spinner" />
                <span>Loading complete article from Wikipedia…</span>
              </div>
            ) : fullWiki?.html ? (
              <div
                className="wiki-full-content"
                dangerouslySetInnerHTML={{ __html: fullWiki.html }}
              />
            ) : (
              <div className="press-pop__wiki-fallback">
                <p>{wikiData?.extract}</p>
              </div>
            )}

            <div className="press-pop__footer">
              <button
                type="button"
                className="press-pop__back-btn"
                onClick={() => setViewMode('summary')}
              >
                ← Back to Summary
              </button>
              <button
                type="button"
                className="press-pop__ext"
                onClick={onClose}
              >
                Done Reading (Close)
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Tab switchers: Story vs Wikipedia */}
            <div className="press-pop__nav" role="tablist">
              <button
                type="button"
                className={`press-pop__tab ${tab === 'story' ? 'is-active' : ''}`}
                onClick={() => setTab('story')}
                role="tab"
                aria-selected={tab === 'story'}
              >
                <i aria-hidden="true" />
                <span>Story &amp; Analysis</span>
              </button>
              <button
                type="button"
                className={`press-pop__tab ${tab === 'wiki' ? 'is-active' : ''}`}
                onClick={() => setTab('wiki')}
                role="tab"
                aria-selected={tab === 'wiki'}
              >
                <i aria-hidden="true" />
                <span>Wikipedia Context</span>
              </button>
            </div>

            {/* Article Meta Header */}
            <div className="press-pop__meta">
              <span className="press-pop__tag mono">
                <b>{article.outlet}</b> · Verified Coverage
              </span>
              <h2 id="press-pop-title" className="press-pop__title">
                {article.head}
              </h2>
              <span className="press-pop__category mono">
                {detail.category}
              </span>
            </div>

            {/* Content Panel */}
            {tab === 'story' ? (
              <div className="press-pop__story">
                <div className="press-pop__summary">
                  <p>{detail.summary}</p>
                </div>

                <div className="press-pop__takeaway">
                  <span className="press-pop__takeaway-label mono">Key Cultural Takeaway</span>
                  <p>“{detail.takeaway}”</p>
                </div>
              </div>
            ) : (
              <div className="press-pop__wiki">
                {loadingWiki ? (
                  <div className="press-pop__loading">
                    <span className="press-pop__spinner" />
                    <span>Loading background encyclopedia from Wikipedia…</span>
                  </div>
                ) : (
                  <>
                    {wikiData?.thumbnail?.source && (
                      <div className="press-pop__wiki-img">
                        <img src={wikiData.thumbnail.source} alt={wikiData.title || detail.wikiTopic} />
                      </div>
                    )}
                    <div className="press-pop__wiki-extract">
                      <p>{wikiData?.extract || 'Encyclopedia details available directly on Wikipedia.'}</p>
                    </div>
                    <button
                      type="button"
                      className="press-pop__read-full-btn"
                      onClick={openFullArticle}
                    >
                      <span>Open full Wikipedia article here</span>
                      <i aria-hidden="true">↓</i>
                    </button>
                  </>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="press-pop__footer">
              <span className="press-pop__brand-tag mono">
                Topic: <b>{detail.brand}</b>
              </span>
              <button
                type="button"
                className="press-pop__ext"
                onClick={openFullArticle}
              >
                Open Wikipedia article ↗
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body,
  );
}

export default function Press() {
  const [activeArticle, setActiveArticle] = useState(null);
  const outlets = [...new Set(PRESS.map((p) => p.outlet))].join(' · ');

  return (
    <section className="press-sec" id="press" aria-labelledby="press-title">
      <div className="shell">
        <div className="press-card" data-reveal>
          <div className="press__head">
            <div>
              <p className="mono">In the press</p>
              <h2 id="press-title">The work, as the trade press covered it</h2>
            </div>
            <p className="press__outlets">{outlets}</p>
          </div>
          <ul className="press__grid">
            {PRESS.map((p) => (
              <li key={p.url}>
                <button
                  type="button"
                  className="press__card-btn"
                  onClick={() => setActiveArticle(p)}
                  aria-haspopup="dialog"
                >
                  <span className="mono">{p.outlet}</span>
                  <b>{p.head}</b>
                  <span className="press__read">
                    Read article <i aria-hidden="true">↗</i>
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {activeArticle && (
        <PressModal
          article={activeArticle}
          onClose={() => setActiveArticle(null)}
        />
      )}
    </section>
  );
}
