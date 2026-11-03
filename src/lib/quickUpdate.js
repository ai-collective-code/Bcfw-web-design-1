import { useEffect, useMemo, useState, useSyncExternalStore } from 'react';

/*
 * Quick-update events: up to four { format, language, moment, image } entries
 * that replace the hero's floating tags and the problem cards' photos.
 * Saved in this browser's localStorage only — other visitors keep the defaults
 * until a real backend stores them.
 */
export const QUICK_CODE = 'AIC_2026';
export const QUICK_EMAIL = 'debojit.aic@gmail.com';
export const MAX_EVENTS = 4;
const KEY = 'bcf:quick-update';

const read = () => {
  try {
    const v = JSON.parse(localStorage.getItem(KEY));
    return Array.isArray(v) ? v : [];
  } catch { return []; }
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

/*
 * Quick-update rewards & awards: list of { id, name, image }
 * Saved in browser localStorage, falls back to default 10 award platforms.
 */
export const DEFAULT_REWARDS = [
  { id: 'rew-1', name: 'Digixx Award', image: '' },
  { id: 'rew-2', name: 'Brand Disruption Award', image: '' },
  { id: 'rew-3', name: 'DMA Asia ECHO Create Awards', image: '' },
  { id: 'rew-4', name: 'Kaleido', image: '' },
  { id: 'rew-5', name: 'ET Ascent Stars of Industry', image: '' },
  { id: 'rew-6', name: 'The Abbys', image: '' },
  { id: 'rew-7', name: 'The Maddies', image: '' },
  { id: 'rew-8', name: 'afaqs Marketing Excellence Award', image: '' },
  { id: 'rew-9', name: 'Drivers of Digital', image: '' },
  { id: 'rew-10', name: 'EMA', image: '' },
];

const REWARDS_KEY = 'bcf:rewards';

const readRewards = () => {
  try {
    const raw = localStorage.getItem(REWARDS_KEY);
    const v = raw ? JSON.parse(raw) : null;
    return Array.isArray(v) ? v : DEFAULT_REWARDS;
  } catch {
    return DEFAULT_REWARDS;
  }
};

let rewards = readRewards();
const rewardSubs = new Set();

export function saveRewards(next) {
  rewards = next;
  try { localStorage.setItem(REWARDS_KEY, JSON.stringify(next)); } catch { /* quota or blocked storage */ }
  rewardSubs.forEach((fn) => fn());
}

export function resetRewards() {
  saveRewards(DEFAULT_REWARDS);
}

const subscribeRewards = (fn) => {
  rewardSubs.add(fn);
  return () => rewardSubs.delete(fn);
};

export const useRewards = () => useSyncExternalStore(subscribeRewards, () => rewards);

/*
 * Quick-update problem headline: { line1, line2 }
 * Defaults to "Made in Mumbai." and "Dies in Madurai."
 */
export const DEFAULT_PROBLEM_HEADLINE = {
  line1: 'Made in Mumbai.',
  line2: 'Dies in Madurai.',
};

const HEADLINE_KEY = 'bcf:problem-headline';

const readHeadline = () => {
  try {
    const raw = localStorage.getItem(HEADLINE_KEY);
    return raw ? { ...DEFAULT_PROBLEM_HEADLINE, ...JSON.parse(raw) } : DEFAULT_PROBLEM_HEADLINE;
  } catch {
    return DEFAULT_PROBLEM_HEADLINE;
  }
};

let headline = readHeadline();
const headlineSubs = new Set();

export function saveProblemHeadline(next) {
  headline = {
    line1: next?.line1 !== undefined ? next.line1 : DEFAULT_PROBLEM_HEADLINE.line1,
    line2: next?.line2 !== undefined ? next.line2 : DEFAULT_PROBLEM_HEADLINE.line2,
  };
  try {
    localStorage.setItem(HEADLINE_KEY, JSON.stringify(headline));
  } catch {
    /* quota or blocked */
  }
  headlineSubs.forEach((fn) => fn());
}

export function resetProblemHeadline() {
  saveProblemHeadline(DEFAULT_PROBLEM_HEADLINE);
}

const subscribeHeadline = (fn) => {
  headlineSubs.add(fn);
  return () => headlineSubs.delete(fn);
};

export const useDefaultProblemHeadline = () => useSyncExternalStore(subscribeHeadline, () => headline);

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

/**
 * Returns the effective problem section headline:
 * If an active live event has custom headlineFirst or headlineSecond, that takes priority.
 * Otherwise, the saved default problem headline is returned.
 */
export function useProblemHeadline() {
  const liveEvents = useLiveEvents();
  const defaultHeadline = useDefaultProblemHeadline();

  const activeWithCustomHeadline = liveEvents.find(
    (e) => (e.headlineFirst && e.headlineFirst.trim()) || (e.headlineSecond && e.headlineSecond.trim())
  );

  if (activeWithCustomHeadline) {
    return {
      line1: activeWithCustomHeadline.headlineFirst?.trim() || defaultHeadline.line1,
      line2: activeWithCustomHeadline.headlineSecond?.trim() || defaultHeadline.line2,
      isLiveOverride: true,
    };
  }

  return defaultHeadline;
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
