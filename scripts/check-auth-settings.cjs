const fs = require('fs');
const path = require('path');
const https = require('https');

const envText = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const env = {};
envText.split(/\r?\n/).forEach((line) => {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
});

const key = env.VITE_SUPABASE_ANON_KEY;
const host = new URL(env.VITE_SUPABASE_URL).host;

const req = https.request(
  {
    hostname: host,
    path: '/auth/v1/settings',
    method: 'GET',
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  },
  (res) => {
    let d = '';
    res.on('data', (c) => (d += c));
    res.on('end', () => {
      const j = JSON.parse(d);
      console.log('--- auth settings ---');
      console.log('mailer_autoconfirm :', j.mailer_autoconfirm);
      console.log('disable_signup     :', j.disable_signup);
      console.log('external.email     :', j.external && j.external.email);
      console.log('mailer             :', JSON.stringify(j.mailer));
      console.log('sms_autoconfirm    :', j.sms_autoconfirm);
      console.log('rate_limits        :', JSON.stringify(j.rate_limits));
      console.log('security           :', JSON.stringify(j.security));
    });
  }
);
req.on('error', (e) => console.log('ERR', e.message));
req.end();
