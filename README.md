# Liread

A modern, responsive community and utility web application for book lovers to share book recommendations, post favorite quotes, track active reading time with a persistent distraction-free timer, and climb daily, weekly, and lifetime community leaderboards.

## Tech Stack
- **Frontend**: React 19 / TypeScript / Vite / Tailwind CSS / Lucide React / Recharts
- **State & Offline Persistence**: Zustand + localStorage (with background-tab safe timestamp delta calculation)
- **Backend & Database**: Supabase (PostgreSQL 15+, Supabase Auth, Storage & Realtime subscriptions)

## Supabase Backend Architecture
- `profiles`: User accounts, bio, total minutes read, streak, rank tier, daily goal.
- `posts`: Recommendations and passage quotes, cover images, page numbers, ratings, upvotes.
- `post_upvotes`: Upvote enforcement (one per user per post with atomic trigger sync).
- `reading_sessions`: High-fidelity logged reading sessions with automated profile streak and total minutes computation.
- `saved_posts`: Bookmarked passages and reading recommendations.
- `bookshelf`: User personal library shelves tracking progress and status (`currently_reading`, `finished`, `want_to_read`).
- `post_comments`: Community comments on shared passages with live count synchronization.
- **RPC Functions**: High-performance leaderboard aggregations (`get_daily_leaderboard`, `get_weekly_leaderboard`, `get_lifetime_leaderboard`).

See the complete database schema in [`supabase/schema.sql`](supabase/schema.sql) and the step-by-step setup guide in [`supabase/README.md`](supabase/README.md).

## Quickstart

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup Supabase Backend**:
   - Create a project on [supabase.com](https://supabase.com).
   - Run [`supabase/schema.sql`](supabase/schema.sql) in the SQL Editor.
   - Copy your Project URL and Anon Key to `.env`:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **Start local development**:
   ```bash
   npm run dev
   ```

## Accounts & Guest Mode

Liread has **no demo accounts**. Every profile, post, bookshelf entry, and
leaderboard position belongs to a real user created through the app.

- **Create Account / Sign In** — the only way to get a full account. A profile row
  is created automatically by the `on_auth_user_created` database trigger.
- **Continue as Guest** — opens the app in read-only exploration mode. Guests can
  browse the feed, open the timer, and look around, but cannot post, upvote, save
  passages, or appear on the leaderboard. Guest data is local to the browser and is
  never written to the database.

### Email confirmation

If your Supabase project has **Confirm email** enabled (the default), a new account
must confirm its address before it can sign in:

1. The app shows a "Check your inbox" panel after sign-up.
2. The confirmation link returns to the app, which exchanges the token for a session
   automatically and signs the user straight in.

For local development you can turn off **Confirm email** in
**Authentication → Providers → Email** in the Supabase dashboard to skip that step.
If you keep it on, configure a custom SMTP provider so real emails are delivered.

### ⚠️ Required Supabase configuration for account creation

Supabase's **built-in** email service is not usable for a public sign-up form.
It allows only **2 emails per hour for the entire project** and only delivers to
your organization's team members. Until you change this, every "Create Account"
attempt fails with `email rate limit exceeded`.

Pick one:

| Goal | Setting | Where |
| --- | --- | --- |
| **Local development** — instant signup, no email | Turn **off** "Confirm email" | Authentication → Providers → Email |
| **Production** — real confirmation emails | Enable **custom SMTP**, then raise "Rate limit for sending emails" | Authentication → Emails → SMTP Settings, and Authentication → Rate Limits |

With "Confirm email" off, `supabase.auth.signUp` returns a session immediately and
the app signs the new reader straight in — no email is sent and no rate limit applies.

Also add your local and production origins to **Authentication → URL Configuration →
Redirect URLs**, otherwise confirmation links bounce to the wrong place:

```
http://localhost:3000
http://localhost:5173
https://your-production-domain.com
```

### Verifying the backend

`scripts/verify-auth.cjs` exercises the live endpoints against your `.env`:

```bash
node scripts/verify-auth.cjs
```

It prints the result of a sign-in attempt, a public read, a password recovery, and a
full sign-up, including whether the `profiles` row was created by the database trigger.

### Legacy demo data

`supabase/seed.sql` is intentionally empty. If your database still holds rows from
an older setup, run [`supabase/cleanup_demo_data.sql`](supabase/cleanup_demo_data.sql)
once to remove them.
