import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SectionHead from './SectionHead.jsx';
import { lockScroll, scrollToTarget } from '../lib/motion.js';
import { FESTIVALS, REGIONS, BRAND, wm, langOf, LANGUAGES } from '../data/content.js';
import { brief, useBrief } from '../lib/brief.js';
import { fetchWikiFullArticle } from '../lib/wiki.js';
import './Atlas.css';

const FILTERS = ['All', ...REGIONS.map((r) => r.key)];
const ACCENT = Object.fromEntries(REGIONS.map((r) => [r.key, r.accent]));
const COUNT = Object.fromEntries(FILTERS.map((k) => [k, k === 'All' ? FESTIVALS.length : FESTIVALS.filter((f) => f.region === k).length]));
const pad = (n) => String(n).padStart(2, '0');

const matches = (q, f) => {
  if (!q) return true;
  const s = q.trim().toLowerCase();
  return [f.state, f.festival, f.region, ...f.also].some((v) => v.toLowerCase().includes(s));
};

/** One market as a directory row: thumbnail, state and moment, language and dates. */
function Row({ f, i, onOpen }) {
  const lang = langOf(f.state);
  return (
    <button
      className="row"
      style={{ '--i': Math.min(i, 14), '--accent': ACCENT[f.region] }}
      onClick={(e) => onOpen(f.id, e.currentTarget)}
      data-cursor="Open"
      aria-label={`${f.festival}, ${f.state}. ${f.when}. Open details`}
    >
      <span className="row__img"><img src={wm(f.file, 240)} alt="" loading="lazy" decoding="async" /></span>
      <span className="row__main">
        <span className="row__state">
          <span className="mono">{pad(f.id)}</span>
          {f.state}
          {f.kind === 'UT' && <em>UT</em>}
        </span>
        <strong>{f.festival}</strong>
        <span className="row__when mono">{f.when}</span>
      </span>
      {lang && <span className="row__lang">{lang}</span>}
      <span className="row__go" aria-hidden="true">→</span>
    </button>
  );
}

/** Popup modal displaying Wikipedia festival summary or Wikimedia photo/author/licence details. */
function InfoPopup({ type, f, onClose }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'full'
  const [fullHtml, setFullHtml] = useState(null);
  const [loadingFull, setLoadingFull] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    setViewMode('summary');
    setFullHtml(null);
  }, [type, f?.id]);

  useEffect(() => {
    let cancel = false;
    setLoading(true);
    setData(null);

    if (type === 'wiki') {
      const slug = f.wiki?.split('/wiki/')[1] || encodeURIComponent(f.festival);
      fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${slug}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!cancel) {
            setData(json);
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancel) setLoading(false);
        });
    } else if (type === 'credit') {
      const fileTitle = `File:${f.file}`;
      fetch(`https://commons.wikimedia.org/w/api.php?action=query&titles=${encodeURIComponent(fileTitle)}&prop=imageinfo&iiprop=extmetadata|user|url&format=json&origin=*`)
        .then((res) => (res.ok ? res.json() : null))
        .then((json) => {
          if (!cancel && json) {
            const pages = json?.query?.pages;
            const firstPage = pages ? Object.values(pages)[0] : null;
            const info = firstPage?.imageinfo?.[0];
            const meta = info?.extmetadata || {};

            const stripHtml = (html) => {
              if (!html) return '';
              const doc = new DOMParser().parseFromString(html, 'text/html');
              return doc.body.textContent || '';
            };

            const artist = stripHtml(meta.Artist?.value) || info?.user || 'Government of India / Wikimedia Commons';
            const license = meta.LicenseShortName?.value || meta.UsageTerms?.value || 'Free Cultural License';
            const desc = stripHtml(meta.ImageDescription?.value) || f.blurb;
            const date = meta.DateTimeOriginal?.value || meta.DateTime?.value || '';

            setData({
              artist: artist.trim(),
              license: license.trim(),
              desc: desc.trim(),
              date: date.split(' ')[0] || '',
              creditUrl: info?.descriptionurl || f.credit,
            });
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancel) setLoading(false);
        });
    }

    return () => { cancel = true; };
  }, [type, f]);

  const loadFullArticle = () => {
    setViewMode('full');
    if (fullHtml) {
      cardRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setLoadingFull(true);
    const slug = f.wiki?.split('/wiki/')[1] || data?.title || f.festival;
    fetchWikiFullArticle(slug).then((res) => {
      setFullHtml(res?.html || null);
      setLoadingFull(false);
      cardRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  useEffect(() => {
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
    return () => window.removeEventListener('keydown', esc);
  }, [onClose, viewMode]);

  if (!type) return null;

  return (
    <div
      className="drw-pop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pop-title"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className={`drw-pop__card ${viewMode === 'full' ? 'drw-pop__card--wide' : ''}`}
        ref={cardRef}
        data-lenis-prevent
      >
        <button
          type="button"
          className="drw-pop__close"
          aria-label="Close popup"
          onClick={onClose}
        >
          ✕
        </button>

        {type === 'wiki' ? (
          viewMode === 'full' ? (
            <div className="drw-pop__body">
              <div className="drw-pop__full-bar">
                <button
                  type="button"
                  className="drw-pop__back-btn"
                  onClick={() => setViewMode('summary')}
                >
                  ← Back to Summary
                </button>
                <span className="drw-pop__tag mono">
                  <b>Wikipedia Encyclopedia</b> · Full Article Reader
                </span>
              </div>

              <div className="drw-pop__meta">
                <h2 id="pop-title" className="drw-pop__title display">
                  {data?.title || f.festival}
                </h2>
                <p className="drw-pop__desc mono">{f.state} · {f.region}</p>
              </div>

              {loadingFull ? (
                <div className="drw-pop__loading">
                  <span className="drw-pop__spinner" />
                  <span>Loading complete article from Wikipedia…</span>
                </div>
              ) : fullHtml ? (
                <div
                  className="wiki-full-content"
                  dangerouslySetInnerHTML={{ __html: fullHtml }}
                />
              ) : (
                <div className="drw-pop__extract">
                  <p>{data?.extract || f.blurb}</p>
                </div>
              )}

              <div className="drw-pop__footer">
                <button
                  type="button"
                  className="drw-pop__back-btn"
                  onClick={() => setViewMode('summary')}
                >
                  ← Back to Summary
                </button>
                <button
                  type="button"
                  className="drw-pop__ext-link"
                  onClick={onClose}
                >
                  Done Reading (Close)
                </button>
              </div>
            </div>
          ) : (
            <div className="drw-pop__body">
              <div className="drw-pop__meta">
                <span className="drw-pop__tag mono">
                  <b>Wikipedia Encyclopedia</b> · {f.state}
                </span>
                <h2 id="pop-title" className="drw-pop__title display">
                  {data?.title || f.festival}
                </h2>
                {data?.description ? (
                  <p className="drw-pop__desc mono">{data.description}</p>
                ) : (
                  <p className="drw-pop__desc mono">{f.state} · {f.region}</p>
                )}
              </div>

              {loading ? (
                <div className="drw-pop__loading">
                  <span className="drw-pop__spinner" />
                  <span>Loading festival history from Wikipedia…</span>
                </div>
              ) : (
                <div className="drw-pop__content">
                  <div className="drw-pop__img">
                    <img
                      src={data?.thumbnail?.source || wm(f.file, 640)}
                      alt={f.festival}
                    />
                  </div>
                  <div className="drw-pop__extract">
                    <p>{data?.extract || f.blurb}</p>
                  </div>
                  <button
                    type="button"
                    className="drw-pop__read-full-btn"
                    onClick={loadFullArticle}
                  >
                    <span>Open full Wikipedia article here</span>
                    <i aria-hidden="true">↓</i>
                  </button>
                </div>
              )}

              <div className="drw-pop__footer">
                <div className="drw-pop__facts">
                  <span className="mono">Region: <b>{f.region}</b></span>
                  <span className="mono">Season: <b>{f.when}</b></span>
                </div>
                <button
                  type="button"
                  className="drw-pop__ext-link"
                  onClick={loadFullArticle}
                >
                  Open Wikipedia article ↗
                </button>
              </div>
            </div>
          )
        ) : (
          <div className="drw-pop__body">
            <div className="drw-pop__meta">
              <span className="drw-pop__tag mono">
                <b>Wikimedia Commons</b> · Free Cultural Work
              </span>
              <h2 id="pop-title" className="drw-pop__title display">
                Photo, Author &amp; Licence
              </h2>
              <p className="drw-pop__desc mono">
                {f.festival} ({f.state})
              </p>
            </div>

            <div className="drw-pop__media">
              <img src={wm(f.file, 960)} alt={`${f.festival}, ${f.state}`} />
            </div>

            <div className="drw-pop__attrib">
              <div className="drw-pop__row">
                <span className="mono">Subject</span>
                <strong>{f.festival} — {f.state}</strong>
              </div>
              <div className="drw-pop__row">
                <span className="mono">Author / Source</span>
                <strong>
                  {loading
                    ? 'Loading details…'
                    : data?.artist || 'Wikimedia Commons Contributor'}
                </strong>
              </div>
              <div className="drw-pop__row">
                <span className="mono">Licence</span>
                <span className="drw-pop__badge">
                  {loading ? 'Creative Commons' : data?.license || 'CC BY-SA / Public Domain'}
                </span>
              </div>
              {data?.date && (
                <div className="drw-pop__row">
                  <span className="mono">Date</span>
                  <span>{data.date}</span>
                </div>
              )}
            </div>

            <div className="drw-pop__footer">
              <span className="drw-pop__hint mono">
                Used under free culture terms (safe for commercial &amp; regional brand campaigns).
              </span>
              <a
                href={f.credit}
                target="_blank"
                rel="noreferrer"
                className="drw-pop__ext-link"
              >
                View on Wikimedia Commons ↗
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** Side drawer with the full story; arrows step through the current list. */
/** Modern cinematic side drawer with bento layout, ambient hero glow, and fluid interactions. */
function Drawer({ f, onClose, onStep, position }) {
  const panel = useRef(null);
  const { regions } = useBrief();
  const inBrief = regions.includes(f.region);
  const lang = langOf(f.state);
  const langObj = LANGUAGES.find((l) => l.name === lang);
  const accent = ACCENT[f.region];
  const [popup, setPopup] = useState(null); // 'wiki' | 'credit' | null

  useEffect(() => {
    setPopup(null);
  }, [f.id]);

  useEffect(() => {
    lockScroll(true);
    panel.current?.querySelector('.drw__btn-close')?.focus();
    const key = (e) => {
      // While a popup is open it owns the keyboard (its own Escape handler closes it).
      if (popup) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') onStep(1);
      if (e.key === 'ArrowLeft') onStep(-1);
      if (e.key === 'Tab') {
        const items = panel.current.querySelectorAll('a[href], button');
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', key);
    return () => { lockScroll(false); window.removeEventListener('keydown', key); };
  }, [onClose, onStep, popup]);

  return createPortal(
    <div
      className="drw"
      role="dialog"
      aria-modal="true"
      aria-labelledby="drw-title"
      data-lenis-prevent
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="drw__panel" ref={panel} style={{ '--accent': accent }}>
        {/* Floating Top Navigation Bar */}
        <div className="drw__bar">
          <div className="drw__index-capsule">
            <span className="drw__index-label mono">
              FESTIVAL <b>{pad(f.id)}</b> OF {pad(FESTIVALS.length)}
            </span>
            <div className="drw__progress-track" aria-hidden="true">
              <div
                className="drw__progress-bar"
                style={{ width: `${(f.id / FESTIVALS.length) * 100}%`, background: accent }}
              />
            </div>
          </div>
          <div className="drw__nav-cluster">
            <div className="drw__step-btns">
              <button
                type="button"
                className="drw__btn-icon"
                onClick={() => onStep(-1)}
                aria-label="Previous festival"
                title="Previous festival (←)"
              >
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </button>
              <div className="drw__btn-divider" aria-hidden="true" />
              <button
                type="button"
                className="drw__btn-icon"
                onClick={() => onStep(1)}
                aria-label="Next festival"
                title="Next festival (→)"
              >
                <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
            <button
              type="button"
              className="drw__btn-close"
              onClick={onClose}
              aria-label="Close festival sheet"
              title="Close (Esc)"
            >
              <svg viewBox="0 0 20 20" width="16" height="16" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>

        {/* Cinematic Hero Visual */}
        <div className="drw__hero" key={`hero-${f.id}`}>
          <div className="drw__hero-glow" style={{ '--accent': accent }} aria-hidden="true" />
          <div className="drw__hero-frame">
            <img
              src={wm(f.file, 960)}
              alt={`${f.festival}, ${f.state}`}
              decoding="async"
            />
            <div className="drw__hero-scrim" aria-hidden="true" />
            <div className="drw__hero-badges-top">
              <span className="drw__badge-glass" style={{ '--accent': accent }}>
                <i className="drw__dot-pulse" style={{ background: accent }} />
                <b>{f.region}</b>
              </span>
              <span className="drw__badge-glass">
                {f.state}{f.kind === 'UT' ? ' · UT' : ''}
              </span>
            </div>
            <div className="drw__hero-badges-bottom">
              <span className="drw__badge-season mono">
                <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                {f.when}
              </span>
              <button
                type="button"
                className="drw__badge-credit"
                onClick={() => setPopup('credit')}
                title="Photo, author & licence info"
              >
                <svg viewBox="0 0 20 20" width="13" height="13" fill="currentColor">
                  <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                </svg>
                Photo info
              </button>
            </div>
          </div>
        </div>

        {/* Text and Editorial Content */}
        <div className="drw__body" key={`body-${f.id}`}>
          {/* Header Block */}
          <div className="drw__head-block">
            <div className="drw__eyebrow mono">
              <span>{f.state} {f.kind === 'UT' ? 'Union Territory' : 'State'}</span>
              {lang && (
                <>
                  <span className="drw__sep">/</span>
                  <span className="drw__lang-tag">
                    {lang}{langObj?.native ? ` · ${langObj.native}` : ''}
                  </span>
                </>
              )}
            </div>
            <h2 id="drw-title" className="drw__title display">
              {f.festival}
            </h2>
            <blockquote className="drw__editorial">
              <span className="drw__quote-glyph" aria-hidden="true">“</span>
              <p>{f.blurb}</p>
            </blockquote>
          </div>

          {/* Modern Bento Insights */}
          <div className="drw__bento">
            <div className="drw__bento-card">
              <div className="drw__bento-icon" style={{ color: accent, background: `${accent}18` }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18z" />
                  <path d="M3.6 9h16.8M3.6 15h16.8" />
                  <path d="M12 3a15.3 15.3 0 0 1 4 9 15.3 15.3 0 0 1-4 9 15.3 15.3 0 0 1-4-9 15.3 15.3 0 0 1 4-9z" />
                </svg>
              </div>
              <div className="drw__bento-main">
                <span className="drw__bento-kicker mono">Language First</span>
                <strong className="drw__bento-value">
                  {lang || 'Regional Dialect'} {langObj?.native && <em>({langObj.native})</em>}
                </strong>
                <p className="drw__bento-note">We originate in dialect — never dub from Hindi.</p>
              </div>
            </div>

            <div className="drw__bento-card">
              <div className="drw__bento-icon" style={{ color: accent, background: `${accent}18` }}>
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
              <div className="drw__bento-main">
                <span className="drw__bento-kicker mono">Peak Timeline</span>
                <strong className="drw__bento-value">{f.when}</strong>
                <p className="drw__bento-note">Brief 60–90 days ahead for high regional feed recall.</p>
              </div>
            </div>

            {f.also?.length > 0 && (
              <div className="drw__bento-card drw__bento-card--wide">
                <span className="drw__bento-kicker mono">Also Celebrated in {f.state}</span>
                <div className="drw__chips">
                  {f.also.map((a) => (
                    <span key={a} className="drw__chip">
                      <i style={{ background: accent }} />
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* The Opportunity Pitch Box */}
          <div className="drw__pitch" style={{ '--accent': accent }}>
            <div className="drw__pitch-top">
              <span className="drw__pitch-badge mono">
                <i style={{ background: 'var(--lime)' }} />
                The Bharat Opportunity
              </span>
              <span className="drw__pitch-speed mono">72hr Delivery</span>
            </div>
            <p className="drw__pitch-copy">
              <strong>{f.festival}</strong> is {f.state}’s peak cultural moment{lang ? <> — originate it natively in <b>{lang}</b>, not an afterthought dub</> : ''}.
              Plan before the season starts and be first to the feed.
            </p>
            <div className="drw__ctas">
              <a
                href={BRAND.contact}
                className="btn btn--lime drw__btn-primary"
                onClick={(e) => {
                  e.preventDefault();
                  brief.addRegion(f.region);
                  onClose();
                  setTimeout(() => scrollToTarget(BRAND.contact), 60);
                }}
              >
                Plan a campaign in {f.state}
                <span className="btn__arrow" aria-hidden="true"><i>↗</i><i>↗</i></span>
              </a>
              <button
                type="button"
                className={`drw__add-pill ${inBrief ? 'is-on' : ''}`}
                onClick={() => brief.toggleRegion(f.region)}
                aria-pressed={inBrief}
                title={inBrief ? `Click to remove ${f.region} from your brief` : `Add ${f.region} to your brief`}
              >
                {inBrief ? (
                  <>
                    <span className="drw__add-label"><b>✓</b> {f.region} in brief</span>
                    <span className="drw__add-hover"><b>✕</b> Remove from brief</span>
                  </>
                ) : (
                  <>
                    <b>＋</b> Add {f.region} to brief
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Popups Navigation */}
          <div className="drw__footer-links">
            <button
              type="button"
              className="drw__link-capsule"
              onClick={() => setPopup('wiki')}
            >
              <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
              </svg>
              <span>About {f.festival}</span>
              <em>↗</em>
            </button>
            <button
              type="button"
              className="drw__link-capsule"
              onClick={() => setPopup('credit')}
            >
              <svg viewBox="0 0 20 20" width="15" height="15" fill="currentColor">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
              <span>Photo, author &amp; licence</span>
              <em>↗</em>
            </button>
          </div>
        </div>
      </div>
      {popup && <InfoPopup type={popup} f={f} onClose={() => setPopup(null)} />}
    </div>,
    document.body,
  );
}

export default function Atlas() {
  const [region, setRegion] = useState('All');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(null);
  const [dealt, setDealt] = useState(false);
  const grid = useRef(null);
  const opener = useRef(null);

  const list = useMemo(() => FESTIVALS.filter((f) => (region === 'All' || f.region === region) && matches(query, f)), [region, query]);

  const open = (id, from) => { opener.current = from || document.activeElement; setOpenId(id); };
  const close = useRef(() => {});
  close.current = () => { setOpenId(null); requestAnimationFrame(() => opener.current?.focus?.({ preventScroll: true })); };

  // Other sections (the festival radar) open festivals here.
  useEffect(() => {
    const on = (e) => open(e.detail);
    window.addEventListener('atlas:open', on);
    return () => window.removeEventListener('atlas:open', on);
  }, []);

  // Cards deal in once the grid reaches the viewport; filtered grids deal in straight away.
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setDealt(true); io.disconnect(); }
    }, { rootMargin: '0px 0px -15% 0px' });
    io.observe(grid.current);
    return () => io.disconnect();
  }, []);

  // Step through whichever list the drawer was opened from (falls back to all 36).
  const ring = list.some((f) => f.id === openId) ? list : FESTIVALS;
  const idx = ring.findIndex((f) => f.id === openId);
  const stepRef = useRef(() => {});
  stepRef.current = (d) => setOpenId(ring[(idx + d + ring.length) % ring.length].id);
  const onStep = useMemo(() => (d) => stepRef.current(d), []);
  const onClose = useMemo(() => () => close.current(), []);
  const current = FESTIVALS.find((f) => f.id === openId);

  return (
    <section className="index" id="atlas" aria-labelledby="atlas-title">
      <div className="shell">
        <SectionHead id="atlas-title" n="09" label="Market index" title="36 markets. *Their biggest moments.*">
          Every state and union territory, its peak moment and the language we would make it in. Open any market
          to plan around it.
        </SectionHead>

        <div className="index__tools">
          <div className="index__filters" role="group" aria-label="Filter by region">
            {FILTERS.map((k) => (
              <button
                key={k}
                className={region === k ? 'is-on' : ''}
                aria-pressed={region === k}
                onClick={() => setRegion(k)}
                style={{ '--accent': ACCENT[k] || 'var(--ink)' }}
              >
                {k !== 'All' && <i aria-hidden="true" />}{k} <sup>{COUNT[k]}</sup>
              </button>
            ))}
          </div>
          <div className="index__find">
            <label className="index__search">
              <span className="sr-only">Search states and festivals</span>
              <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
              <input type="search" placeholder="Search a market or moment" value={query} onChange={(e) => setQuery(e.target.value)} />
            </label>
            <p className="index__status mono" aria-live="polite">{list.length} / {FESTIVALS.length}</p>
          </div>
        </div>

        <div className={`index__grid ${dealt ? 'is-in' : ''}`} ref={grid} key={region}>
          {list.map((f, i) => <Row key={f.id} f={f} i={i} onOpen={open} />)}
          {list.length === 0 && (
            <p className="index__empty">Nothing matches “{query}”. Try a state, a festival, or a region.</p>
          )}
        </div>
      </div>

      {current && (
        <Drawer f={current} onClose={onClose} onStep={onStep} position={`${pad(idx + 1)} / ${pad(ring.length)}`} />
      )}
    </section>
  );
}
