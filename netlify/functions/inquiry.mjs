import nodemailer from 'nodemailer';

/*
 * POST /api/inquiry — a visitor's query from the brief builder, emailed to the team's Gmail.
 * Sends through Gmail's own SMTP with an app password, so the mail lands in the inbox rather
 * than spam, and Reply goes straight to the visitor.
 *
 * Env: GMAIL_USER, GMAIL_APP_PASSWORD, and optionally INQUIRY_TO to deliver somewhere other than TEAM_INBOX.
 */

export const TEAM_INBOX = 'debojit.aic@gmail.com';
const MAX_BODY = 20_000;
const EMAIL_RE = /^[^\s@<>()]+@[^\s@<>()]+\.[^\s@<>()]{2,}$/;

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

// Strips line breaks from single-line fields so nothing can spill into mail headers.
const line = (v, max) => (typeof v === 'string' ? v.replace(/[\r\n\t]+/g, ' ').trim().slice(0, max) : '');
const text = (v, max) => (typeof v === 'string' ? v.replace(/\r\n?/g, '\n').trim().slice(0, max) : '');
const list = (v) => (Array.isArray(v) ? v.map((x) => line(x, 80)).filter(Boolean).slice(0, 40) : []);
const esc = (s) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

export function parseInquiry(body) {
  const b = body && typeof body === 'object' ? body : {};
  const brief = b.brief && typeof b.brief === 'object' ? b.brief : {};
  const data = {
    name: line(b.name, 120),
    email: line(b.email, 200),
    company: line(b.company, 160),
    phone: line(b.phone, 40),
    message: text(b.message, 5000),
    markets: list(brief.markets),
    languages: list(brief.languages),
    moment: line(brief.moment, 60),
    moments: list(brief.moments),
    formats: list(brief.formats),
    page: line(b.page, 300),
  };
  const errors = {};
  if (!data.name) errors.name = 'Please tell us your name.';
  if (!EMAIL_RE.test(data.email)) errors.email = 'Please enter a valid email address.';
  return { data, errors, bot: Boolean(line(b.website, 200)) };
}

export function buildMail(d, { from, to }) {
  const rows = [
    ['Name', d.name],
    ['Email', d.email],
    ['Company', d.company],
    ['Phone', d.phone],
    ['Markets', d.markets.join(', ')],
    ['Languages', d.languages.join(', ')],
    ['Moment', d.moment],
    ['Festivals', d.moments.join(', ')],
    ['Formats', d.formats.join(', ')],
    ['Message', d.message],
    ['Sent from', d.page],
  ].filter(([, v]) => v);

  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#0b0b1f">
<h2 style="margin:0 0 14px">New query from the BCF website</h2>
<table cellpadding="8" style="border-collapse:collapse">${rows.map(([k, v]) => `
<tr><td style="vertical-align:top;color:#6b6c86;white-space:nowrap">${k}</td><td style="white-space:pre-wrap">${esc(v)}</td></tr>`).join('')}
</table>
<p style="color:#6b6c86;font-size:13px">Hit Reply to answer ${esc(d.name)} directly.</p>
</div>`;

  return {
    from: { name: 'BCF website', address: from },
    to,
    replyTo: { name: d.name, address: d.email },
    subject: `New query: ${d.name}${d.company ? ` (${d.company})` : ''}`,
    text: rows.map(([k, v]) => `${k}: ${v}`).join('\n'),
    html,
  };
}

/** The request → email pipeline, with the mail transport passed in. */
export async function handleInquiry(req, { transport, from, to, preview = false }) {
  if (req.method !== 'POST') return json(405, { ok: false, error: 'method' });

  const raw = await req.text();
  if (raw.length > MAX_BODY) return json(413, { ok: false, error: 'too-large' });
  let body;
  try { body = JSON.parse(raw); } catch { return json(400, { ok: false, error: 'bad-json' }); }

  const { data, errors, bot } = parseInquiry(body);
  // Bots fill the hidden field; tell them it worked and send nothing.
  if (bot) return json(200, { ok: true });
  if (Object.keys(errors).length) return json(422, { ok: false, errors });

  try {
    await transport.sendMail(buildMail(data, { from, to }));
  } catch (err) {
    console.error('[inquiry] send failed:', err?.message || err);
    return json(502, { ok: false, error: 'send-failed' });
  }
  return json(200, preview ? { ok: true, preview: true } : { ok: true });
}

export default async (req) => {
  const user = process.env.GMAIL_USER;
  // Google shows app passwords in groups of four; the spaces are not part of it.
  const pass = process.env.GMAIL_APP_PASSWORD?.replace(/\s+/g, '');
  if (!user || !pass) {
    console.error('[inquiry] GMAIL_USER / GMAIL_APP_PASSWORD are not set');
    return json(500, { ok: false, error: 'not-configured' });
  }
  const transport = nodemailer.createTransport({ service: 'gmail', auth: { user, pass } });
  return handleInquiry(req, { transport, from: user, to: process.env.INQUIRY_TO || TEAM_INBOX });
};

export const config = { path: '/api/inquiry' };
