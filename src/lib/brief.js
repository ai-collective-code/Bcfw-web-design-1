import { useSyncExternalStore } from 'react';

/*
 * The campaign brief the visitor assembles while reading: markets (regions),
 * a festival month and formats. Several sections write to it ("Plan for the
 * South", "Add to brief"), the brief builder and the sticky bar read it.
 * A tiny external store rather than context, so any component can subscribe.
 */
let snap = { regions: [], month: -1, formats: [] };
const subs = new Set();
const emit = (next) => { snap = next; subs.forEach((fn) => fn()); };
const toggle = (list, v) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export const brief = {
  toggleRegion: (r) => emit({ ...snap, regions: toggle(snap.regions, r) }),
  addRegion: (r) => { if (!snap.regions.includes(r)) emit({ ...snap, regions: [...snap.regions, r] }); },
  setRegions: (regions) => emit({ ...snap, regions }),
  setMonth: (m) => emit({ ...snap, month: m }),
  toggleFormat: (f) => emit({ ...snap, formats: toggle(snap.formats, f) }),
  reset: () => emit({ regions: [], month: -1, formats: [] }),
};

const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };
export const useBrief = () => useSyncExternalStore(subscribe, () => snap);
