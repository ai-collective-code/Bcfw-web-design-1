import { useEffect, useMemo, useState } from 'react';
import SectionHead from './SectionHead.jsx';
import { FESTIVALS, REGIONS, FORMATS, MONTHS, BRAND } from '../data/content.js';
import { brief, useBrief } from '../lib/brief.js';
import { scrollToTarget } from '../lib/motion.js';
import { Arrow } from './ui.jsx';
import './Brief.css';

const ACCENT = Object.fromEntries(REGIONS.map((r) => [r.key, r.accent]));
const MAX_MOMENTS = 8;
const EMAIL_RE = /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]{2,}$/;
const EMPTY = { name: '', email: '', company: '', phone: '', message: '', website: '' };

function Field({ id, label, error, textarea, ...input }) {
  const Tag = textarea ? 'textarea' : 'input';
  return (
    <label className={`field ${textarea ? 'field--wide' : ''} ${error ? 'has-error' : ''}`} htmlFor={id}>
      <span>{label}</span>
      <Tag id={id} name={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-err` : undefined} {...input} />
      {error && <em id={`${id}-err`}>{error}</em>}
    </label>
  );
}

/**
 * Brief builder and the page's query form. Everything in the summary is computed from the
 * page's own data — markets from the atlas, languages from BCF's list, moments from the
 * calendar — and the whole brief is emailed to the team through /api/inquiry.
 */
export default function Brief() {
  const { regions, month, formats } = useBrief();
  const [form, setForm] = useState(EMPTY);
  const [status, setStatus] = useState('idle');
  const [errors, setErrors] = useState({});
  const [preview, setPreview] = useState(false);
  const [toast, setToast] = useState(false);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(false), 5000);
    return () => clearTimeout(t);
  }, [toast]);

  const summary = useMemo(() => {
    const markets = FESTIVALS.filter((f) => regions.includes(f.region));
    const langs = [...new Set(REGIONS.filter((r) => regions.includes(r.key)).flatMap((r) => r.langs))];
    const moments = markets.filter((f) => (month >= 0 ? f.months.includes(month) : true));
    return { markets, langs, moments };
  }, [regions, month]);

  const empty = regions.length === 0;
  const when = month >= 0 ? MONTHS[month] : 'Always-on';
  const sending = status === 'sending';
  const sent = status === 'sent';

  const set = (key) => (e) => {
    setForm((f) => ({ ...f, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  const showErrors = (errs) => {
    setErrors(errs);
    scrollToTarget('#inquiry');
    document.getElementById(Object.keys(errs)[0])?.focus({ preventScroll: true });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    const local = {};
    if (!form.name.trim()) local.name = 'Please tell us your name.';
    if (!EMAIL_RE.test(form.email.trim())) local.email = 'Please enter a valid email address.';
    if (Object.keys(local).length) { showErrors(local); return; }
    setStatus('sending');
    setErrors({});
    try {
      const res = await fetch('/api/inquiry', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...form,
          brief: {
            markets: regions,
            languages: summary.langs,
            moment: when,
            moments: summary.moments.slice(0, 20).map((f) => `${f.festival} (${f.state})`),
            formats,
          },
          page: window.location.href,
        }),
      });
      const out = await res.json().catch(() => ({}));
      if (res.ok && out.ok) {
        setPreview(Boolean(out.preview));
        setStatus('sent');
        setToast(true);
      } else if (res.status === 422 && out.errors) {
        setStatus('idle');
        showErrors(out.errors);
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const again = () => { setForm((f) => ({ ...f, message: '' })); setStatus('idle'); };
  const allIndia = () => brief.setRegions(regions.length === REGIONS.length ? [] : REGIONS.map((r) => r.key));

  return (
    <section className="brief" id="brief" aria-labelledby="brief-title">
      <div className="shell">
        <SectionHead id="brief-title" n="07" label="Brief builder" title="Plan your India campaign *in 30 seconds.*">
          Pick your markets, your moment and your formats, add where we should reply — and it goes straight to our team.
        </SectionHead>

        <div className="brief__grid">
          <form className="brief__steps" id="brief-form" onSubmit={submit} noValidate>
            <fieldset className="brief__step">
              <legend><span className="brief__num">1</span> Where do you want to win?</legend>
              <div className="brief__chips">
                <button type="button" className={`chip chip--all ${regions.length === REGIONS.length ? 'is-on' : ''}`} onClick={allIndia} aria-pressed={regions.length === REGIONS.length}>
                  All India
                </button>
                {REGIONS.map((r) => (
                  <button
                    type="button"
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
                <button type="button" className={`chip ${month < 0 ? 'is-on' : ''}`} onClick={() => brief.setMonth(-1)} aria-pressed={month < 0}>Always-on</button>
                {MONTHS.map((m, i) => (
                  <button type="button" key={m} className={`chip ${month === i ? 'is-on' : ''}`} onClick={() => brief.setMonth(i)} aria-pressed={month === i}>
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
                    type="button"
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

            <fieldset className="brief__step" id="inquiry">
              <legend><span className="brief__num">4</span> Where should we reply?</legend>
              {sent ? (
                <div className="brief__done" role="status">
                  <b>Thanks, {form.name.split(' ')[0]} — your brief is with our team.</b>
                  <p>We’ll reply to <span>{form.email}</span>.</p>
                  {preview && <p className="brief__preview mono">Local preview: Gmail isn’t connected on this machine, so the email was printed in the dev-server terminal instead of sent.</p>}
                  <button type="button" className="brief__again" onClick={again}>Send another query</button>
                </div>
              ) : (
                <>
                  <div className="brief__fields">
                    <Field id="name" label="Your name *" value={form.name} onChange={set('name')} error={errors.name} autoComplete="name" required maxLength={120} />
                    <Field id="email" label="Work email *" type="email" value={form.email} onChange={set('email')} error={errors.email} autoComplete="email" required maxLength={200} />
                    <Field id="company" label="Company / brand" value={form.company} onChange={set('company')} autoComplete="organization" maxLength={160} />
                    <Field id="phone" label="Phone" type="tel" value={form.phone} onChange={set('phone')} autoComplete="tel" maxLength={40} />
                    <Field id="message" label="Tell us about the campaign" textarea rows={4} value={form.message} onChange={set('message')} maxLength={5000}
                      placeholder="Launch, budget range, timelines — anything that helps." />
                    {/* Honeypot: invisible to people, irresistible to form bots. */}
                    <label className="brief__trap" aria-hidden="true">
                      Website <input name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set('website')} />
                    </label>
                  </div>
                  <button type="submit" className="btn btn--ink brief__submit" disabled={sending}>
                    {sending ? 'Sending…' : 'Send my brief'} <Arrow />
                  </button>
                  {status === 'error' && (
                    <p className="brief__error" role="alert">
                      Couldn’t send just now — please try again in a minute, or use the{' '}
                      <a href={BRAND.inquiry} target="_blank" rel="noreferrer">form on bcfworks.com</a>.
                    </p>
                  )}
                </>
              )}
            </fieldset>
          </form>

          <aside className="brief__card on-night" aria-live="polite">
            <div className="brief__card-top">
              <span className="tag"><b>Your brief</b> {when}</span>
              {!empty && !sent && <button type="button" className="brief__reset" onClick={() => brief.reset()}>Reset</button>}
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

            {sent ? (
              <p className="brief__sent">Brief sent ✓</p>
            ) : (
              <button type="submit" form="brief-form" className="btn btn--lime brief__send" disabled={sending}>
                {sending ? 'Sending…' : 'Send this brief'} <Arrow />
              </button>
            )}
            <p className="brief__hint mono">Goes straight to our team’s inbox. Add your details in step 4.</p>
          </aside>
        </div>
      </div>

      {toast && (
        <div className="brief__toast" role="status" aria-live="polite">
          <span className="brief__toast-icon" aria-hidden="true">✓</span>
          <span>Message sent — we’ll reply to {form.email}.</span>
          <button type="button" className="brief__toast-close" onClick={() => setToast(false)} aria-label="Dismiss">×</button>
        </div>
      )}
    </section>
  );
}
