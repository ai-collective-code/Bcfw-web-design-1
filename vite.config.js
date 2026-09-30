import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

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

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  for (const key of ['GMAIL_USER', 'GMAIL_APP_PASSWORD', 'INQUIRY_TO']) {
    if (env[key]) process.env[key] = env[key];
  }
  return {
    plugins: [react(), inquiryApi()],
    server: { port: 5190 },
  };
});
