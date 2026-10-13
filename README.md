# Readers Hub

A modern, responsive community and utility web application for book lovers to share book recommendations, post favorite quotes, track active reading time with a persistent distraction-free timer, and climb daily, weekly, and lifetime community leaderboards.

## Tech Stack
- **Frontend**: React 19 / TypeScript / Tailwind CSS / Lucide React / Recharts
- **State & Offline Persistence**: Zustand + localStorage (with background-tab safe timestamp delta calculation)
- **Backend & Database**: Supabase (PostgreSQL, Supabase Auth, Storage & Realtime subscriptions)

## Database Architecture
- `profiles`: User accounts, bio, total minutes read, streak, rank tier.
- `posts`: Recommendations and passage quotes, cover images, page numbers, upvotes.
- `post_upvotes`: Upvote enforcement (one per user per post).
- `reading_sessions`: High-fidelity logged reading sessions with automated profile total minutes and streak calculation.
- `saved_posts`: Bookmarked passages and reading recommendations.

Detailed schema and triggers are located in [supabase/schema.sql](supabase/schema.sql).
