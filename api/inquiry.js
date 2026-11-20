/*
 * Vercel route for POST /api/inquiry. The email logic lives in netlify/functions/inquiry.mjs and
 * is shared, so the form behaves the same on Vercel, on Netlify and in `npm run dev`.
 *
 * Env (Vercel → Project → Settings → Environment Variables): GMAIL_USER, GMAIL_APP_PASSWORD,
 * and optionally INQUIRY_TO.
 */
import send from '../netlify/functions/inquiry.mjs';

export const POST = (request) => send(request);
export const GET = (request) => send(request);
