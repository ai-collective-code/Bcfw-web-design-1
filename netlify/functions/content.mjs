/*
 * /api/content — the site content the Admin Panel edits (quick-update events, rewards and the
 * problem headline), stored on the server so every visitor, window and device sees the same thing.
 *
 *   POST { action: 'read', since }              public  → the saved content (or { unchanged })
 *   POST { action: 'verify', email, code }      checks the admin credentials
 *   POST { action: 'publish', email, code, data }  admin only → saves the content
 *
 * Storage is Netlify Blobs in production; the Vite dev server passes a JSON file instead (vite.config.js).
 * Env (optional): ADMIN_EMAIL, ADMIN_CODE. Without them the defaults below apply — set ADMIN_CODE in
 * Netlify (Site configuration → Environment variables) so the real code is not the one in the repo.
 */

export const DEFAULT_ADMIN_EMAIL = 'debojit.aic@gmail.com';
export const DEFAULT_ADMIN_CODE = 'AIC_2026';
const MAX_BODY = 5_000_000;
const MAX_EVENTS = 4;
const MAX_REWARDS = 30;
const MAX_IMAGE = 700_000; // characters of a data: URL

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json', 'cache-control': 'no-store' } });

const str = (v, max) => (typeof v === 'string' ? v.slice(0, max) : '');
const image = (v) => (typeof v === 'string' && v.startsWith('data:image/') && v.length <= MAX_IMAGE ? v : '');

export function cleanContent(data) {
  const d = data && typeof data === 'object' ? data : {};
  const events = (Array.isArray(d.events) ? d.events : []).slice(0, MAX_EVENTS).map((e) => ({
    format: str(e?.format, 80),
    language: str(e?.language, 60),
    moment: str(e?.moment, 120),
    catchyLine: str(e?.catchyLine, 200),
    description: str(e?.description, 800),
    headlineFirst: str(e?.headlineFirst, 120),
    headlineSecond: str(e?.headlineSecond, 120),
    image: image(e?.image),
    start: str(e?.start, 32),
    end: str(e?.end, 32),
  }));
  const rewards = Array.isArray(d.rewards)
    ? d.rewards.slice(0, MAX_REWARDS).map((r, i) => ({ id: str(r?.id, 60) || `rew-${i}`, name: str(r?.name, 160), image: image(r?.image) }))
    : null;
  const headline = d.headline && typeof d.headline === 'object'
    ? { line1: str(d.headline.line1, 160), line2: str(d.headline.line2, 160) }
    : null;
  return { events, rewards, headline };
}

/** The request → storage pipeline, with the store and credentials passed in. */
export async function handleContent(req, { store, adminEmail = DEFAULT_ADMIN_EMAIL, adminCode = DEFAULT_ADMIN_CODE }) {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'method' });
  if (Number(req.headers.get('content-length')) > MAX_BODY) return json(413, { ok: false, error: 'too-large' });
  const raw = await req.text();
  if (raw.length > MAX_BODY) return json(413, { ok: false, error: 'too-large' });
  let body;
  try { body = JSON.parse(raw); } catch { return json(400, { ok: false, error: 'bad-json' }); }

  const authorised = () =>
    str(body.email, 200).trim().toLowerCase() === adminEmail.toLowerCase() && str(body.code, 200).trim() === adminCode;

  try {
    if (body.action === 'read') {
      const rec = await store.get();
      if (!rec) return json(200, { ok: true, data: null, updatedAt: 0 });
      if (Number(body.since) === rec.updatedAt) return json(200, { ok: true, unchanged: true, updatedAt: rec.updatedAt });
      return json(200, { ok: true, data: rec.data, updatedAt: rec.updatedAt });
    }
    if (body.action === 'verify') {
      return authorised() ? json(200, { ok: true }) : json(401, { ok: false, error: 'denied' });
    }
    if (body.action === 'publish') {
      if (!authorised()) return json(401, { ok: false, error: 'denied' });
      const prev = await store.get();
      const updatedAt = Math.max(Date.now(), (prev?.updatedAt || 0) + 1);
      await store.set({ data: cleanContent(body.data), updatedAt, by: str(body.name, 120) || str(body.email, 200) });
      return json(200, { ok: true, updatedAt });
    }
  } catch (err) {
    console.error('[content] storage failed:', err?.message || err);
    return json(502, { ok: false, error: 'storage' });
  }
  return json(400, { ok: false, error: 'bad-action' });
}

export default async (req) => {
  const { getStore } = await import('@netlify/blobs');
  const blobs = getStore({ name: 'bcf-content', consistency: 'strong' });
  const store = {
    get: () => blobs.get('site', { type: 'json' }),
    set: (rec) => blobs.setJSON('site', rec),
  };
  return handleContent(req, {
    store,
    adminEmail: process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL,
    adminCode: process.env.ADMIN_CODE || DEFAULT_ADMIN_CODE,
  });
};

export const config = { path: '/api/content' };
