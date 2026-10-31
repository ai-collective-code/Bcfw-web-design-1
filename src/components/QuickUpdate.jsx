import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { lockScroll } from '../lib/motion.js';
import {
  QUICK_CODE, MAX_EVENTS, useEvents, saveEvents, shrinkImage, eventStatus,
  useRewards, saveRewards, DEFAULT_REWARDS, resetRewards,
} from '../lib/quickUpdate.js';
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

const blankReward = () => ({ id: `rew-${Date.now()}`, name: '', image: '' });

/**
 * Admin Panel:
 * Tab 1: Events manager (replace hero tags and problem card photos during set dates)
 * Tab 2: Rewards manager (add/edit reward names and reward images shown in Folio awards section)
 */
export default function QuickUpdate() {
  const saved = useEvents();
  const savedRewards = useRewards();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState('code');
  const [tab, setTab] = useState('events'); // 'events' | 'rewards'
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  // Events state
  const [rows, setRows] = useState([]);
  const [editing, setEditing] = useState(null); // index of the expanded event
  const [draft, setDraft] = useState(null); // its working copy
  const [isNew, setIsNew] = useState(false);
  const [confirmDel, setConfirmDel] = useState(null);

  // Rewards state
  const [rewardRows, setRewardRows] = useState([]);
  const [rewardEditing, setRewardEditing] = useState(null);
  const [rewardDraft, setRewardDraft] = useState(null);
  const [isNewReward, setIsNewReward] = useState(false);
  const [confirmDelReward, setConfirmDelReward] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    lockScroll(true);
    const esc = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => { lockScroll(false); window.removeEventListener('keydown', esc); };
  }, [open]);

  useEffect(() => {
    if (editing === null) {
      setRows(saved.map((r) => ({ start: '', end: '', ...r })));
    }
  }, [saved, editing]);

  useEffect(() => {
    if (rewardEditing === null) {
      setRewardRows(savedRewards);
    }
  }, [savedRewards, rewardEditing]);

  const show = () => {
    setStep('code');
    setCode('');
    setError('');
    setTab('events');
    setOpen(true);
  };

  const startEdit = (list, i, fresh) => {
    setEditing(i);
    setDraft({ ...list[i] });
    setIsNew(fresh);
    setConfirmDel(null);
    setError('');
  };

  const unlock = (e) => {
    e.preventDefault();
    if (code.trim() !== QUICK_CODE) { setError('Wrong code. Try again.'); return; }
    const list = saved.map((r) => ({ start: '', end: '', ...r }));
    if (list.length) { setRows(list); setEditing(null); setDraft(null); } else { const b = [blank()]; setRows(b); startEdit(b, 0, true); }
    setRewardRows(savedRewards);
    setRewardEditing(null);
    setRewardDraft(null);
    setError('');
    setStep('edit');
  };

  // Event handlers
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

  const reset = () => { saveEvents([]); setOpen(false); };

  // Reward handlers
  const startEditReward = (list, i, fresh) => {
    setRewardEditing(i);
    setRewardDraft({ ...list[i] });
    setIsNewReward(fresh);
    setConfirmDelReward(null);
    setError('');
  };

  const setRewardField = (key, value) => setRewardDraft((d) => ({ ...d, [key]: value }));

  const pickRewardImage = async (file) => {
    if (!file) return;
    try {
      setRewardField('image', await shrinkImage(file, 600));
    } catch {
      setError('That file could not be read as an image.');
    }
  };

  const saveRewardDraft = () => {
    if (!rewardDraft || !rewardDraft.name.trim()) return;
    const next = rewardRows.map((r, j) => (j === rewardEditing ? rewardDraft : r));
    setRewardRows(next);
    saveRewards(next);
    setRewardEditing(null);
    setRewardDraft(null);
    setIsNewReward(false);
  };

  const cancelRewardDraft = () => {
    if (isNewReward) {
      setRewardRows((rs) => rs.filter((_, j) => j !== rewardEditing));
    }
    setRewardEditing(null);
    setRewardDraft(null);
    setIsNewReward(false);
  };

  const removeReward = (i) => {
    const next = rewardRows.filter((_, j) => j !== i);
    setRewardRows(next);
    saveRewards(next);
    setConfirmDelReward(null);
    if (rewardEditing === i) {
      setRewardEditing(null);
      setRewardDraft(null);
      setIsNewReward(false);
    } else if (rewardEditing !== null && rewardEditing > i) {
      setRewardEditing(rewardEditing - 1);
    }
  };

  const addReward = () => {
    const next = [...rewardRows, blankReward()];
    setRewardRows(next);
    startEditReward(next, next.length - 1, true);
  };

  const restoreRewards = () => {
    resetRewards();
    setRewardRows(DEFAULT_REWARDS);
    setRewardEditing(null);
    setRewardDraft(null);
    setIsNewReward(false);
  };

  const finish = (e) => {
    e.preventDefault();
    if (editing !== null || rewardEditing !== null) return;
    saveEvents(rows);
    saveRewards(rewardRows);
    setOpen(false);
  };

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
                <p>Enter the access code to edit site events and rewards.</p>
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
                <div className="qu__nav-header">
                  <span className="qu__badge">Step 2 of 2</span>
                  <div className="qu__tabs-nav" role="tablist">
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tab === 'events'}
                      className={`qu__tab-btn ${tab === 'events' ? 'is-active' : ''}`}
                      disabled={editing !== null || rewardEditing !== null}
                      title={editing !== null || rewardEditing !== null ? 'Save or discard the current item first' : undefined}
                      onClick={() => { setTab('events'); setError(''); }}
                    >
                      <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Events ({rows.length})
                    </button>
                    <button
                      type="button"
                      role="tab"
                      aria-selected={tab === 'rewards'}
                      className={`qu__tab-btn ${tab === 'rewards' ? 'is-active' : ''}`}
                      disabled={editing !== null || rewardEditing !== null}
                      title={editing !== null || rewardEditing !== null ? 'Save or discard the current item first' : undefined}
                      onClick={() => { setTab('rewards'); setError(''); }}
                    >
                      <svg viewBox="0 0 20 20" width="14" height="14" fill="currentColor" aria-hidden="true">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      Rewards ({rewardRows.length})
                    </button>
                  </div>
                </div>

                {tab === 'events' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <h2 id="qu-title">Rewards &amp; Awards</h2>
                    <p>
                      Add and manage company rewards, trophies, and recognitions with images and names. They reflect live in the Awards section on the site.
                    </p>

                    {rewardRows.map((r, i) => (rewardEditing === i ? (
                      <fieldset key={r.id || i} className="qu__row is-editing qu__row--reward">
                        <legend>Reward {i + 1}{isNewReward ? ' · new' : ' · editing'}</legend>
                        <div className="qu__fields">
                          <input
                            value={rewardDraft.name}
                            placeholder="Reward name (e.g. Digixx Award, The Maddies)"
                            autoFocus
                            onChange={(e) => setRewardField('name', e.target.value)}
                          />
                          <span className="qu__reward-hint">Upload award image or medal photo:</span>
                        </div>
                        <label className="qu__img qu__reward-upload" title="Click to upload reward image">
                          {rewardDraft.image ? (
                            <img src={rewardDraft.image} alt={rewardDraft.name || 'Reward preview'} />
                          ) : (
                            <span><b>＋</b>Add image</span>
                          )}
                          <input type="file" accept="image/*" onChange={(e) => pickRewardImage(e.target.files[0])} />
                        </label>

                        {!rewardDraft.name.trim() && <span className="qu__hint">Still needed: reward name.</span>}
                        {error && <span className="qu__err">{error}</span>}
                        <div className="qu__row-actions">
                          <button type="button" className="qu__add" onClick={cancelRewardDraft}>
                            {isNewReward ? 'Discard' : 'Cancel'}
                          </button>
                          <button
                            type="button"
                            className="btn btn--ink qu__save"
                            disabled={!rewardDraft.name.trim()}
                            onClick={saveRewardDraft}
                          >
                            Save reward
                          </button>
                        </div>
                      </fieldset>
                    ) : (
                      <div key={r.id || i} className="qu__item qu__reward-card">
                        {r.image ? (
                          <img src={r.image} alt={r.name} className="qu__reward-thumb" />
                        ) : (
                          <div className="qu__reward-placeholder" aria-hidden="true">
                            <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
                              <path d="M12 2l2.4 5 5.6.8-4 4 1 5.6-5-2.6-5 2.6 1-5.6-4-4 5.6-.8z" />
                            </svg>
                          </div>
                        )}
                        <div className="qu__item-body">
                          <span className="qu__status is-live">Reward {String(i + 1).padStart(2, '0')}</span>
                          <strong>{r.name}</strong>
                          <small>{r.image ? 'Custom image badge' : 'Default laurel wreath'}</small>
                        </div>
                        <div className="qu__item-actions">
                          {confirmDelReward === i ? (
                            <>
                              <button type="button" className="qu__chip is-danger" onClick={() => removeReward(i)}>Delete</button>
                              <button type="button" className="qu__chip" onClick={() => setConfirmDelReward(null)}>Keep</button>
                            </>
                          ) : (
                            <>
                              <button type="button" className="qu__chip" disabled={rewardEditing !== null} onClick={() => startEditReward(rewardRows, i, false)}>Edit</button>
                              <button type="button" className="qu__chip" disabled={rewardEditing !== null} onClick={() => setConfirmDelReward(i)}>Delete</button>
                            </>
                          )}
                        </div>
                      </div>
                    )))}

                    {!rewardRows.length && (
                      <p className="qu__empty">No rewards yet. Add your first reward or restore default awards.</p>
                    )}

                    <div className="qu__actions">
                      <button
                        type="button"
                        className="qu__add"
                        disabled={rewardEditing !== null}
                        onClick={addReward}
                      >
                        + Add reward {rewardRows.length + 1}
                      </button>
                      {rewardEditing === null && (
                        <button type="button" className="qu__add" onClick={restoreRewards}>
                          Restore defaults
                        </button>
                      )}
                      <button type="submit" className="btn btn--ink qu__go" disabled={rewardEditing !== null}>
                        Done
                      </button>
                    </div>
                    {rewardEditing !== null && (
                      <span className="qu__hint">Save Reward {rewardEditing + 1} before adding another or finishing.</span>
                    )}
                  </>
                )}
              </form>
            )}
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}
