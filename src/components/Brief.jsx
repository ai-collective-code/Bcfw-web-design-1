import { useMemo, useState } from 'react';
import SectionHead from './SectionHead.jsx';
import { FESTIVALS, REGIONS, FORMATS, MONTHS, BRAND } from '../data/content.js';
import { brief, useBrief } from '../lib/brief.js';
import { Arrow } from './ui.jsx';
import './Brief.css';

const ACCENT = Object.fromEntries(REGIONS.map((r) => [r.key, r.accent]));
const MAX_MOMENTS = 8;

/**
 * Brief builder. Everything in the summary is computed from the page's own data —
 * markets from the atlas, languages from BCF's list, moments from the calendar —
 * so the numbers a visitor sees are real, not a sales estimate.
 */
export default function Brief() {
  const { regions, month, formats } = useBrief();
  const [copied, setCopied] = useState(false);

  const summary = useMemo(() => {
    const markets = FESTIVALS.filter((f) => regions.includes(f.region));
    const langs = [...new Set(REGIONS.filter((r) => regions.includes(r.key)).flatMap((r) => r.langs))];
    const moments = markets.filter((f) => (month >= 0 ? f.months.includes(month) : true));
    return { markets, langs, moments };
  }, [regions, month]);

  const empty = regions.length === 0;
  const when = month >= 0 ? MONTHS[month] : 'Always-on';

  const text = [
    'Campaign brief — built on the BCF regional page',
    `Markets: ${regions.join(', ') || '—'} (${summary.markets.length} states & UTs)`,
    `Languages: ${summary.langs.join(', ') || '—'}`,
    `Moment: ${when}${summary.moments.length ? ` — ${summary.moments.map((f) => `${f.festival} (${f.state})`).join(', ')}` : ''}`,
    `Formats: ${formats.join(', ') || 'Open to recommendations'}`,
  ].join('\n');

  const send = () => {
    // Open synchronously inside the click so pop-up blockers allow it.
    window.open(BRAND.inquiry, '_blank', 'noopener');
    navigator.clipboard?.writeText(text).then(() => setCopied(true), () => setCopied(false));
  };

  const allIndia = () => brief.setRegions(regions.length === REGIONS.length ? [] : REGIONS.map((r) => r.key));

  return (
    <section className="brief" id="brief" aria-labelledby="brief-title">
      <div className="shell">
        <SectionHead id="brief-title" n="07" label="Brief builder" title="Plan your India campaign *in 30 seconds.*">
          Pick your markets, your moment and your formats. We turn it into a brief you can send straight to our team.
        </SectionHead>

        <div className="brief__grid">
          <div className="brief__steps">
            <fieldset className="brief__step">
              <legend><span className="brief__num">1</span> Where do you want to win?</legend>
              <div className="brief__chips">
                <button className={`chip chip--all ${regions.length === REGIONS.length ? 'is-on' : ''}`} onClick={allIndia} aria-pressed={regions.length === REGIONS.length}>
                  All India
                </button>
                {REGIONS.map((r) => (
                  <button
                    key={r.key}
                    className={`chip ${regions.includes(r.key) ? 'is-on' : ''}`}
                    style={{ '--accent': r.accent }}
                    onClick={() => brief.toggleRegion(r.key)}
                    aria-pressed={regions.includes(r.key)}
                  >
                    <i aria-hidden="true" />{r.key} <sup>{r.entries.length}</sup>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="brief__step">
              <legend><span className="brief__num">2</span> When is the moment?</legend>
              <div className="brief__chips">
                <button className={`chip ${month < 0 ? 'is-on' : ''}`} onClick={() => brief.setMonth(-1)} aria-pressed={month < 0}>Always-on</button>
                {MONTHS.map((m, i) => (
                  <button key={m} className={`chip ${month === i ? 'is-on' : ''}`} onClick={() => brief.setMonth(i)} aria-pressed={month === i}>
                    {m.slice(0, 3)}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="brief__step">
              <legend><span className="brief__num">3</span> What do you need?</legend>
              <div className="brief__chips">
                {FORMATS.map((f) => (
                  <button
                    key={f.head}
                    className={`chip ${formats.includes(f.head) ? 'is-on' : ''}`}
                    onClick={() => brief.toggleFormat(f.head)}
                    aria-pressed={formats.includes(f.head)}
                  >
                    {f.head}
                  </button>
                ))}
              </div>
            </fieldset>
          </div>

          <aside className="brief__card on-night" aria-live="polite">
            <div className="brief__card-top">
              <span className="tag"><b>Your brief</b> {when}</span>
              {!empty && <button className="brief__reset" onClick={() => { brief.reset(); setCopied(false); }}>Reset</button>}
            </div>

            <dl className="brief__stats">
              <div><dt>States &amp; UTs</dt><dd>{summary.markets.length}</dd></div>
              <div><dt>Languages</dt><dd>{summary.langs.length}</dd></div>
              <div><dt>{month >= 0 ? 'Moments' : 'Key moments'}</dt><dd>{summary.moments.length}</dd></div>
            </dl>

            {empty ? (
              <p className="brief__empty">Start by picking a market — or tap <b>All India</b>.</p>
            ) : (
              <div className="brief__lists">
                <div>
                  <span className="mono">Markets</span>
                  <ul className="brief__tags">
                    {regions.map((r) => <li key={r} style={{ '--accent': ACCENT[r] }}><i />{r}</li>)}
                  </ul>
                </div>
                <div>
                  <span className="mono">Originate in</span>
                  <ul className="brief__tags brief__tags--lime">{summary.langs.map((l) => <li key={l}>{l}</li>)}</ul>
                </div>
                <div>
                  <span className="mono">{month >= 0 ? `Moments in ${MONTHS[month]}` : 'Peak moments to plan around'}</span>
                  {summary.moments.length ? (
                    <ul className="brief__moments">
                      {summary.moments.slice(0, MAX_MOMENTS).map((f) => <li key={f.id}><b>{f.festival}</b> {f.state}</li>)}
                      {summary.moments.length > MAX_MOMENTS && <li className="brief__more">+{summary.moments.length - MAX_MOMENTS} more</li>}
                    </ul>
                  ) : (
                    <p className="brief__none">No big festival in these markets this month — a good window for always-on reels and moment marketing.</p>
                  )}
                </div>
                <div>
                  <span className="mono">Formats</span>
                  <p className="brief__formats">{formats.length ? formats.join(' · ') : 'Open to recommendations'}</p>
                </div>
              </div>
            )}

            <button className="btn btn--lime brief__send" onClick={send} disabled={empty}>
              {copied ? 'Brief copied — form opened' : 'Copy brief & open the form'} <Arrow />
            </button>
            <p className="brief__hint mono">
              The inquiry form lives on bcfworks.com. Paste your brief into “Tell us more”.
            </p>
          </aside>
        </div>
      </div>
    </section>
  );
}
