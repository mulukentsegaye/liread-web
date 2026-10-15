# Readers Hub

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
   - (Optional) Run [`supabase/seed.sql`](supabase/seed.sql) to populate mock data.
   - Copy your Project URL and Anon Key to `.env`:
     ```env
     VITE_SUPABASE_URL=https://your-project.supabase.co
     VITE_SUPABASE_ANON_KEY=your-anon-key
     ```

3. **Start local development**:
   ```bash
   npm run dev
   ```
   *(Note: The app runs in Demo Mode with mock data if Supabase credentials are not provided.)*
