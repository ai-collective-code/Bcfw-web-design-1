import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { promises as fs } from 'node:fs';

/*
 * Runs netlify/functions/inquiry.mjs behind /api/inquiry on the dev server, so the form works
 * locally exactly as it does on Netlify. Without Gmail keys in .env the email is printed to
 * this terminal instead of sent.
 */
function inquiryApi() {
  const printTransport = {
    sendMail: async (mail) => {
      console.log(`\n[inquiry] Gmail keys not set in .env; printing instead of sending\nTo: ${mail.to}\nSubject: ${mail.subject}\nReply-To: ${mail.replyTo.name} <${mail.replyTo.address}>\n${mail.text}\n`);
    },
  };

  return {
    name: 'inquiry-api',
    configureServer(server) {
      server.middlewares.use('/api/inquiry', async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const request = new Request('http://localhost/api/inquiry', {
          method: req.method,
          headers: { 'content-type': req.headers['content-type'] || '' },
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        });
        const fn = await server.ssrLoadModule('/netlify/functions/inquiry.mjs');
        const configured = process.env.GMAIL_USER && process.env.GMAIL_APP_PASSWORD;
        const response = configured
          ? await fn.default(request)
          : await fn.handleInquiry(request, { transport: printTransport, from: 'preview@localhost', to: process.env.INQUIRY_TO || fn.TEAM_INBOX, preview: true });
        res.statusCode = response.status;
        res.setHeader('content-type', 'application/json');
        res.end(await response.text());
      });
    },
  };
}

/* Same idea for /api/content: the Admin Panel's content is kept in .local-content.json in dev. */
function contentApi() {
  const file = new URL('./.local-content.json', import.meta.url);
  const store = {
    get: async () => { try { return JSON.parse(await fs.readFile(file, 'utf8')); } catch { return null; } },
    set: (rec) => fs.writeFile(file, JSON.stringify(rec)),
  };
  return {
    name: 'content-api',
    configureServer(server) {
      server.middlewares.use('/api/content', async (req, res) => {
        const chunks = [];
        for await (const c of req) chunks.push(c);
        const request = new Request('http://localhost/api/content', {
          method: req.method,
          headers: { 'content-type': req.headers['content-type'] || '' },
          body: req.method === 'POST' ? Buffer.concat(chunks) : undefined,
        });
        const fn = await server.ssrLoadModule('/netlify/functions/content.mjs');
        const response = await fn.handleContent(request, {
          store,
          adminEmail: process.env.ADMIN_EMAIL || fn.DEFAULT_ADMIN_EMAIL,
          adminCode: process.env.ADMIN_CODE || fn.DEFAULT_ADMIN_CODE,
        });
        res.statusCode = response.status;
        res.setHeader('content-type', 'application/json');
        res.end(await response.text());
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['GMAIL_USER', 'GMAIL_APP_PASSWORD', 'INQUIRY_TO', 'ADMIN_EMAIL', 'ADMIN_CODE']) {
    if (env[key]) process.env[key] = env[key];
  }
  return {
    plugins: [react(), inquiryApi(), contentApi()],
    server: { port: 5190 },
  };
});
