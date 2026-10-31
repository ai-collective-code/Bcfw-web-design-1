import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

/*
 * Quick-update events: up to four { format, language, moment, image } entries
 * that replace the hero's floating tags and the problem cards' photos.
 * Saved in this browser's localStorage only — other visitors keep the defaults
 * until a real backend stores them.
 */
export const QUICK_CODE = 'AIC_2026';
export const MAX_EVENTS = 4;
const KEY = 'bcf:quick-update';

const read = () => {
  try { return JSON.parse(localStorage.getItem(KEY)) ?? []; } catch { return []; }
};

let events = read();
const subs = new Set();

export function saveEvents(next) {
  events = next;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* quota or blocked storage: keep in memory */ }
  subs.forEach((fn) => fn());
}

const subscribe = (fn) => { subs.add(fn); return () => subs.delete(fn); };
export const useEvents = () => useSyncExternalStore(subscribe, () => events);

// `start`/`end` are datetime-local strings ("2026-11-01T18:00"), read as local time.
export const eventStatus = (e, now = Date.now()) => {
  if (e.start && now < new Date(e.start).getTime()) return 'scheduled';
  if (e.end && now >= new Date(e.end).getTime()) return 'ended';
  return 'live';
};

/** Only the events whose timeline covers the current moment; re-checked every 30 s. */
export function useLiveEvents() {
  const all = useEvents();
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 30000);
    return () => clearInterval(id);
  }, []);
  // Read the clock at filter time, not at mount: an event saved "from now" must count as live immediately.
  return useMemo(() => all.filter((e) => eventStatus(e) === 'live'), [all, tick]);
}

/** Downscale an uploaded photo to a JPEG data URL small enough for localStorage. */
export function shrinkImage(file, max = 900) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.82));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Could not read image')); };
    img.src = url;
  });
}
