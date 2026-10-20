const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const envText = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf8');
const env = {};
envText.split(/\r?\n/).forEach((line) => {
  const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
  if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, '');
});

const s = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
const stamp = Date.now();

const show = (label, r) =>
  console.log(
    label,
    '->',
    r.error
      ? `ERR code=${r.error.code} status=${r.error.status} msg="${r.error.message}"`
      : 'ok'
  );

(async () => {
  // 1. signIn with bogus creds: no email sent, tests request-level limits
  const r1 = await s.auth.signInWithPassword({
    email: `nobody${stamp}@gmail.com`,
    password: 'WrongPass123',
  });
  show('signIn(bogus, no email)', r1);

  // 2. session refresh: no email
  const r2 = await s.auth.refreshSession();
  show('refreshSession(no email)', r2);

  // 3. public table read: no email
  const r3 = await s.from('posts').select('id').limit(1);
  show('read posts(no email)', r3);

  // 4. password recovery: SENDS an email
  const r4 = await s.auth.resetPasswordForEmail(`nobody${stamp}@gmail.com`);
  show('resetPassword(SENDS email)', r4);

  // 5. signup: SENDS an email
  const r5 = await s.auth.signUp({
    email: `rhcheck${stamp}@gmail.com`,
    password: 'Verify!Pass123',
    options: {
      data: { username: `rhcheck${stamp}`, full_name: 'RH Check' },
      emailRedirectTo: 'http://localhost:3000/',
    },
  });
  console.log(
    'signup(SENDS email) ->',
    r5.error
      ? `ERR code=${r5.error.code} status=${r5.error.status} msg="${r5.error.message}"`
      : `USER ${r5.data.user.id} session=${!!r5.data.session} confirmed=${!!r5.data.user.email_confirmed_at}`
  );

  if (!r5.error && r5.data.user) {
    await new Promise((r) => setTimeout(r, 2000));
    const p = await s
      .from('profiles')
      .select('id,username,full_name,rank_tier,daily_goal_minutes,total_minutes_read')
      .eq('id', r5.data.user.id)
      .maybeSingle();
    console.log('auto-created profile ->', JSON.stringify(p.data || p.error?.message));
    fs.writeFileSync(
      'C:/Users/HP/AppData/Local/Temp/kilo/rh_check.txt',
      `${r5.data.user.id}|${`rhcheck${stamp}@gmail.com`}`
    );
  }
})();
