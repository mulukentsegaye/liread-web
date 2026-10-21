# Supabase Backend Setup for Liread

This directory contains the database schema, security policies, and triggers for the Liread application powered by Supabase. There is no demo seed data — all content belongs to real users.

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account.
2. Click **New Project** and select your organization.
3. Name your project (e.g. `liread-db`), choose a database password, and select your preferred region.

---

### Step 2: Run the Schema Migration
1. In the Supabase Dashboard, navigate to the **SQL Editor** (icon on the left navigation bar).
2. Click **New Query**.
3. Copy the entire contents of [`supabase/schema.sql`](./schema.sql) and paste it into the editor.
4. Click **Run** (or press `Cmd/Ctrl + Enter`).
5. Verify that all tables, indexes, triggers, and RPC functions were created without errors.

#### What `schema.sql` sets up:
* **`profiles`**: Public profiles extending `auth.users`, including `total_minutes_read`, `current_streak`, `last_read_date`, and `rank_tier`.
* **`posts`**: Community reading feed with passage quotes, book recommendations, tags, ratings, and upvote counters.
* **`post_upvotes`**: Enforces one upvote per user per post with automated count sync.
* **`reading_sessions`**: High-fidelity reading logs that trigger automatic profile streak and total minute updates.
* **`saved_posts`**: Bookmarked passages and reading recommendations.
* **`bookshelf`**: Personal shelves tracking reading status (`currently_reading`, `finished`, `want_to_read`) and progress percentage.
* **`post_comments`**: Discussions on book moments with automated count triggers.
* **Row Level Security (RLS)**: Strict security policies ensuring users can only edit their own records while keeping public feeds accessible.
* **Automated Triggers**:
  - `on_auth_user_created`: Automatically creates a `profiles` row upon Supabase sign-up.
  - `on_reading_session_created`: Automatically calculates consecutive reading streaks, updates total minutes, and upgrades reader rank tier (`Novice Reader` ➔ `Bookworm` ➔ `Avid Reader` ➔ `Literary Scholar` ➔ `Master of Tomes`).
  - `on_post_upvote_added`/`removed`: Atomically syncs `upvotes_count`.
* **RPC Functions**:
  - `get_daily_leaderboard`
  - `get_weekly_leaderboard`
  - `get_lifetime_leaderboard`
* **Storage Buckets & Realtime**:
  - Public buckets for `book-covers` and `avatars`.
  - Realtime publication on `posts`, `post_upvotes`, and `post_comments`.

---

### Step 3: (No seed data required)
Liread ships **no demo accounts**. Every profile, post, bookshelf entry, and
leaderboard position must belong to a real user who signs up through the app.

- `seed.sql` is intentionally empty — do not add fake users to it.
- If your database still contains rows from an older setup, run
  [`supabase/cleanup_demo_data.sql`](./cleanup_demo_data.sql) once to remove them.
- To create a test account, use **Create Account** in the app so it is registered in
  `auth.users` and receives a proper `profiles` row from the `on_auth_user_created` trigger.

---

### Step 4: Configure Frontend Environment Variables
1. In the Supabase Dashboard, navigate to **Project Settings** (gear icon) ➔ **API**.
2. Copy your:
   - **Project URL**
   - **anon / public Key**
3. Create or update the `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
   ```
4. Alternatively, click the **Account** status pill in the top header within the running app to paste your credentials directly in the browser!

---

### Step 5: Configure Email Delivery
Go to **Authentication → Providers → Email** in the Supabase dashboard.

- **Confirm email** is enabled by default. New accounts must click the confirmation
  link before they can sign in. The app handles the confirmation callback
  automatically and signs the user in when they return.
- For production, add a **custom SMTP provider** so confirmation emails are actually delivered.
- For local development, you can disable **Confirm email** to skip the step entirely.

> **Important:** the Supabase **built-in** email service only allows **2 emails per
> hour for the whole project** and only delivers to your organization's team members.
> With it enabled, "Create Account" fails for real users with
> `email rate limit exceeded`. Either configure custom SMTP or turn off
> "Confirm email" (which makes sign-up instant and sends no email at all).
>
> Also add your app origins to **Authentication → URL Configuration → Redirect URLs**
> so confirmation links return to the app.

Note that the built-in Supabase email service is rate limited. If sign-ups fail with
"email rate limit exceeded", wait for the limit to reset or configure custom SMTP.

---

## 🛠️ Testing Your Backend Connection
In the Liread web interface:
1. Click the status pill in the top-right header (`Live`, `Guest`, or `Offline`).
2. Switch to the **Account** tab.
3. Click **Ping Database** or enter your credentials and click **Save & Connect**.
4. You will see an instant success confirmation!
