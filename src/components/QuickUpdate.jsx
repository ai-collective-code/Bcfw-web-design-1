import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { lockScroll } from '../lib/motion.js';
import { QUICK_CODE, MAX_EVENTS, useEvents, saveEvents, shrinkImage, eventStatus } from '../lib/quickUpdate.js';
import { INDIA_LANGUAGES } from '../data/content.js';
import './QuickUpdate.css';

/** Searchable dropdown of India's languages; typing filters by English or native name. */
function LanguagePicker({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const box = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => !box.current?.contains(e.target) && setOpen(false);
    document.addEventListener('pointerdown', away);
    return () => document.removeEventListener('pointerdown', away);
  }, [open]);

  const needle = q.trim().toLowerCase();
  const groups = INDIA_LANGUAGES
    .map((g) => ({ ...g, items: g.items.filter((l) => !needle || l.name.toLowerCase().includes(needle) || l.native?.includes(q.trim())) }))
    .filter((g) => g.items.length);

  const choose = (name) => { onChange(name); setOpen(false); setQ(''); };

  return (
    <div className={`qu__lang ${open ? 'is-open' : ''}`} ref={box}>
      <button type="button" className="qu__lang-btn" aria-haspopup="listbox" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
        <span className={value ? '' : 'is-empty'}>{value || 'Language'}</span>
        <i aria-hidden="true">⌄</i>
      </button>
      {open && (
        <div className="qu__lang-menu">
          <input
            autoFocus value={q} placeholder="Search languages…"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') { e.preventDefault(); if (groups[0]) choose(groups[0].items[0].name); }
              if (e.key === 'Escape') { e.stopPropagation(); e.nativeEvent.stopImmediatePropagation(); setOpen(false); }
            }}
          />
          <div className="qu__lang-list" role="listbox" data-lenis-prevent>
            {groups.map((g) => (
              <div key={g.group}>
                <span className="qu__lang-group">{g.group}</span>
                {g.items.map((l) => (
                  <button
                    type="button" role="option" key={l.name} aria-selected={l.name === value}
                    className="qu__lang-opt" onClick={() => choose(l.name)}
                  >
                    {l.name}{l.native && <em>{l.native}</em>}
                  </button>
                ))}
              </div>
            ))}
            {!groups.length && <span className="qu__lang-none">No match</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// datetime-local wants "YYYY-MM-DDTHH:mm" in local time.
const localNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset(), 0, 0);
  return d.toISOString().slice(0, 16);
};
const blank = () => ({ format: '', language: '', moment: '', image: '', start: localNow(), end: '' });

const missing = (r) => {
  const out = [];
  if (!r.format.trim()) out.push('format');
  if (!r.language) out.push('language');
  if (!r.moment.trim()) out.push('event name');
  if (!r.image) out.push('image');
  if (!r.start) out.push('start time');
  if (!r.end) out.push('end time');
  else if (r.start && new Date(r.end) <= new Date(r.start)) out.push('an end time after the start');
  return out;
};

const when = (s) => (s ? new Date(s).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');
const STATUS = { live: 'Live now', scheduled: 'Scheduled', ended: 'Ended' };

/**
 * Nav button → code prompt → event manager. Events are built one at a time:
 * the open event must be complete before another can be added, and each saved
 * event can be edited or deleted. Each event shows on the site only between its
 * start and end times.
 */
export default function QuickUpdate() {
  const saved = useEvents();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('code');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null); // index of the expanded event
  const [draft, setDraft] = useState(null); // its working copy
  const [isNew, setIsNew] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    lockScroll(true);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => { lockScroll(false); window.removeEventListener('keydown', esc); };
  }, [open]);

  const show = () => { setStep('code'); setCode(''); setError(''); setOpen(true); };

  const startEdit = (list, i, fresh) => { setEditing(i); setDraft({ ...list[i] }); setIsNew(fresh); setConfirmDel(null); setError(''); };

  const unlock = (e) => {
    e.preventDefault();
    if (code.trim() !== QUICK_CODE) { setError('Wrong code. Try again.'); return; }
    const list = saved.map((r) => ({ start: '', end: '', ...r }));
    if (list.length) { setRows(list); setEditing(null); setDraft(null); } else { const b = [blank()]; setRows(b); startEdit(b, 0, true); }
    setError('');
    setStep('edit');
  };

  const set = (key, value) => setDraft((d) => ({ ...d, [key]: value }));

  const pick = async (file) => {
    if (!file) return;
    try { set('image', await shrinkImage(file)); } catch { setError('That file could not be read as an image.'); }
  };

  const draftMissing = draft ? missing(draft) : [];

  const saveDraft = () => {
    if (draftMissing.length) return;
    const next = rows.map((r, j) => (j === editing ? draft : r));
    setRows(next);
    saveEvents(next);
    setEditing(null); setDraft(null); setIsNew(false);
  };

  const cancelDraft = () => {
    // A brand-new event that is abandoned is dropped rather than left half-filled.
    if (isNew) setRows((rs) => rs.filter((_, j) => j !== editing));
    setEditing(null); setDraft(null); setIsNew(false);
  };

  const remove = (i) => {
    const next = rows.filter((_, j) => j !== i);
    setRows(next);
    saveEvents(next.filter((r) => !missing(r).length));
    setConfirmDel(null);
    if (editing === i) { setEditing(null); setDraft(null); setIsNew(false); }
    else if (editing !== null && editing > i) setEditing(editing - 1);
  };

  const add = () => {
    const next = [...rows, blank()];
    setRows(next);
    startEdit(next, next.length - 1, true);
  };

  const finish = (e) => {
    e.preventDefault();
    if (editing !== null) return;
    saveEvents(rows);
    setOpen(false);
  };

  const reset = () => { saveEvents([]); setOpen(false); };

  return (
    <>
      <button type="button" className="btn btn--ghost qu__open" onClick={show} aria-label="Admin Panel" title="Admin Panel">
        <svg viewBox="0 0 28 28" width="30" height="30" aria-hidden="true">
          <defs>
            <linearGradient id="qu-ico" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#ff8cbc" />
              <stop offset="1" stopColor="#e0307f" />
            </linearGradient>
          </defs>
          <g fill="url(#qu-ico)">
            <circle cx="11" cy="8.5" r="5" />
            <path d="M2 24.5c0-5 4-8.5 9-8.5 1.3 0 2.5.2 3.6.7l-1.2 7.8H2Z" />
          </g>
          <g fill="url(#qu-ico)" stroke="#fff" strokeWidth="1.6" paintOrder="stroke">
            <circle cx="20.5" cy="20.5" r="4.6" />
            <rect x="19.5" y="14.2" width="2" height="2.6" rx="0.7" transform="rotate(0 20.5 20.5)" /><rect x="19.5" y="14.2" width="2" height="2.6" rx="0.7" transform="rotate(45 20.5 20.5)" /><rect x="19.5" y="14.2" width="2" height="2.6" rx="0.7" transform="rotate(90 20.5 20.5)" /><rect x="19.5" y="14.2" width="2" height="2.6" rx="0.7" transform="rotate(135 20.5 20.5)" /><rect x="19.5" y="14.2" width="2" height="2.6" rx="0.7" transform="rotate(180 20.5 20.5)" /><rect x="19.5" y="14.2" width="2" height="2.6" rx="0.7" transform="rotate(225 20.5 20.5)" /><rect x="19.5" y="14.2" width="2" height="2.6" rx="0.7" transform="rotate(270 20.5 20.5)" /><rect x="19.5" y="14.2" width="2" height="2.6" rx="0.7" transform="rotate(315 20.5 20.5)" />
          </g>
          <circle cx="20.5" cy="20.5" r="1.9" fill="#fff" />
        </svg>
      </button>

      {/* Portalled to <body>: the nav's backdrop-filter would otherwise trap position:fixed inside the pill. */}
      {open && createPortal(
        <div className="qu" role="dialog" aria-modal="true" aria-labelledby="qu-title" onClick={() => setOpen(false)}>
          <div className="qu__card" data-lenis-prevent onClick={(e) => e.stopPropagation()}>
            <button type="button" className="qu__close" aria-label="Close" onClick={() => setOpen(false)}>✕</button>

            {step === 'code' ? (
              <form onSubmit={unlock} className="qu__form">
                <span className="qu__badge">Step 1 of 2</span>
                <h2 id="qu-title">Admin Panel</h2>
                <p>Enter the access code to edit this week’s events.</p>
                <p className="qu__official"><b>🔒</b> For the official BCF team only.</p>
                <input
                  autoFocus type="password" value={code} placeholder="Access code"
                  onChange={(e) => { setCode(e.target.value); setError(''); }}
                />
                {error && <span className="qu__err">{error}</span>}
                <button type="submit" className="btn btn--ink qu__go">Unlock</button>
              </form>
            ) : (
              <form onSubmit={finish} className="qu__form">
                <span className="qu__badge">Step 2 of 2</span>
                <h2 id="qu-title">Events</h2>
                <p>
                  Up to {MAX_EVENTS} events, added one at a time. Each shows on the site only during its timeline —
                  text on the hero tags, photo on the problem cards in order.
                </p>

                {rows.map((r, i) => (editing === i ? (
                  <fieldset key={i} className="qu__row is-editing">
                    <legend>Event {i + 1}{isNew ? ' · new' : ' · editing'}</legend>
                    <div className="qu__fields">
                      <input value={draft.format} placeholder="Format (e.g. Reel series)" onChange={(e) => set('format', e.target.value)} />
                      <LanguagePicker value={draft.language} onChange={(v) => set('language', v)} />
                      <input value={draft.moment} placeholder="Event (e.g. Pongal)" onChange={(e) => set('moment', e.target.value)} />
                    </div>
                    <label className="qu__img">
                      {draft.image ? <img src={draft.image} alt="" /> : <span><b>＋</b>Add image</span>}
                      <input type="file" accept="image/*" onChange={(e) => pick(e.target.files[0])} />
                    </label>

                    <div className="qu__time">
                      <span className="qu__time-label">Timeline: how long this event stays on the site</span>
                      <label>
                        <span>Show from</span>
                        <input type="datetime-local" value={draft.start} onChange={(e) => set('start', e.target.value)} />
                      </label>
                      <label>
                        <span>Show until</span>
                        <input type="datetime-local" value={draft.end} min={draft.start} onChange={(e) => set('end', e.target.value)} />
                      </label>
                    </div>

                    {draftMissing.length > 0 && <span className="qu__hint">Still needed: {draftMissing.join(', ')}.</span>}
                    {error && <span className="qu__err">{error}</span>}
                    <div className="qu__row-actions">
                      <button type="button" className="qu__add" onClick={cancelDraft}>{isNew ? 'Discard' : 'Cancel'}</button>
                      <button type="button" className="btn btn--ink qu__save" disabled={draftMissing.length > 0} onClick={saveDraft}>
                        Save event
                      </button>
                    </div>
                  </fieldset>
                ) : (
                  <div key={i} className="qu__item">
                    <img src={r.image} alt="" />
                    <div className="qu__item-body">
                      <span className={`qu__status is-${eventStatus(r)}`}>{STATUS[eventStatus(r)]}</span>
                      <strong>{r.format} · {r.language}</strong>
                      <span>{r.moment}</span>
                      <small>{when(r.start)} → {when(r.end)}</small>
                    </div>
                    <div className="qu__item-actions">
                      {confirmDel === i ? (
                        <>
                          <button type="button" className="qu__chip is-danger" onClick={() => remove(i)}>Delete</button>
                          <button type="button" className="qu__chip" onClick={() => setConfirmDel(null)}>Keep</button>
                        </>
                      ) : (
                        <>
                          <button type="button" className="qu__chip" disabled={editing !== null} onClick={() => startEdit(rows, i, false)}>Edit</button>
                          <button type="button" className="qu__chip" disabled={editing !== null} onClick={() => setConfirmDel(i)}>Delete</button>
                        </>
                      )}
                    </div>
                  </div>
                )))}

                {!rows.length && <p className="qu__empty">No events yet. The site is showing its default tags and photos.</p>}

                <div className="qu__actions">
                  {rows.length < MAX_EVENTS && (
                    <button
                      type="button" className="qu__add" disabled={editing !== null} onClick={add}
                      title={editing !== null ? 'Save the current event first' : undefined}
                    >
                      + Add event {rows.length + 1}
                    </button>
                  )}
                  {saved.length > 0 && editing === null && <button type="button" className="qu__add" onClick={reset}>Restore defaults</button>}
                  <button type="submit" className="btn btn--ink qu__go" disabled={editing !== null}>Done</button>
                </div>
                {editing !== null && <span className="qu__hint">Save Event {editing + 1} before adding another or finishing.</span>}
              </form>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
