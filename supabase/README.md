# Supabase Backend Setup for Readers Hub

This directory contains the database schema, security policies, triggers, and seed data for the Readers Hub application powered by Supabase.

---

## 🚀 Quick Setup (5 Minutes)

### Step 1: Create a Free Supabase Project
1. Go to [supabase.com](https://supabase.com) and create an account.
2. Click **New Project** and select your organization.
3. Name your project (e.g. `readers-hub-db`), choose a database password, and select your preferred region.

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

### Step 3: (Optional) Run the Seed Data
To populate your development database with initial profiles, community recommendations, and reading sessions:
1. In the Supabase **SQL Editor**, click **New Query**.
2. Copy and paste the contents of [`supabase/seed.sql`](./seed.sql).
3. Click **Run**.

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
4. Alternatively, click the **Supabase / Demo Mode** pill in the top header within the running app to paste your credentials directly in the browser!

---

## 🛠️ Testing Your Backend Connection
In the Readers Hub web interface:
1. Click the status pill in the top-right header (`⚡ Demo Mode` or `🟢 Supabase`).
2. Switch to the **Backend Config** tab.
3. Click **Ping Database** or enter your credentials and click **Save & Connect**.
4. You will see an instant success confirmation!
