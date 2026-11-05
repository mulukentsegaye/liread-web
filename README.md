<div align="center">

  <img src="public/liread_logo.png" alt="LiRead Logo" width="80" height="80" />

  # LiRead

  **A mindful sanctuary for readers to build daily reading habits, explore timeless literature, and share thoughtful passages.**

  [![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.2-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=flat-square&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Supabase](https://img.shields.io/badge/Supabase-Database_%26_Auth-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)
  [![License](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](LICENSE)

  <br />

  [Features](#-features) • [Tech Stack](#%EF%B8%8F-tech-stack) • [Getting Started](#-getting-started) • [Architecture](#-repository-structure) • [Environment Variables](#-environment-variables) • [License](#-license)

</div>

---

## 📖 About LiRead

**LiRead** is a modern reading web application created to bring intentionality, focus, and connection back into reading. Designed with an editorial, paper-inspired aesthetic, LiRead combines distraction-free reading sessions with community sharing, habit tracking, and instant access to thousands of public domain literary masterpieces.

Whether tracking active reading minutes with ambient soundscapes, keeping a curated personal bookshelf, or highlighting passages to inspire fellow readers, LiRead offers a distraction-free home for your literary life.

---

## ✨ Features

### ⏱️ Focus Reading Timer & Habit Building
- **Ambient Soundscapes**: Built-in audio environments (Forest Birds, Gentle Rain, Library Atmosphere) to enhance deep concentration.
- **Background-Safe Precision**: State calculations use timestamp deltas, ensuring timers remain 100% accurate even if tabs are backgrounded or screens are locked.
- **Streak & Goal Analytics**: Daily reading targets with interactive streak calendars and lifetime progress statistics.

### 📚 In-Browser Reader & Instant Catalog
- **ReadEra Viewer Engine**: Read EPUB and PDF books directly in the browser with customizable typography, dark/light paper themes, and page resumption.
- **Instant Public Domain Downloads**: Verified instant downloads (PDF & EPUB) for timeless classics powered by Open Library and Project Gutenberg CDNs.
- **Intelligent Book Search**: Query millions of book titles and authors through Open Library API integration.

### 🕊️ Personal Sanctuary & Bookshelf
- **Organized Shelves**: Manage books by reading status (*Currently Reading*, *Finished*, *Want to Read*).
- **Saved Passages Vault**: Bookmark quotes and community posts into a personal digital commonplace book.
- **Reading Velocity & Insights**: Visualize reading habits and completed titles over time.

### 💬 Community Feed & Leaderboards
- **Passage Quotes & Recommendations**: Share meaningful quotes and editorial thoughts with customizable formatting.
- **Interactive Community**: Upvote resonant passages, participate in book discussions, and discover books through readers with shared tastes.
- **Mindful Leaderboards**: Daily, weekly, and lifetime rankings celebrating consistent reading routines rather than vanity metrics.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Core** | React 19, TypeScript, Vite |
| **Styling & Design** | Tailwind CSS, Syne & Newsreader Typography Tokens, Lucide Icons |
| **State Management** | Zustand (with persistent local storage and hydration) |
| **Reading Engines** | EPUB.js, PDF.js (`pdfjs-dist`) |
| **Data & Charts** | Recharts, Canvas Confetti |
| **Backend & Auth** | Supabase (PostgreSQL 15+, Row-Level Security, Realtime Subscriptions) |
| **Serverless APIs** | Vercel Serverless Functions (Node.js runtime with chunked response streaming) |
| **External APIs** | Open Library REST API, Project Gutenberg CDN |

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** / **yarn**
- A **Supabase** account (optional for local guest exploration, required for cloud sync)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/mulukentsegaye/liread-web.git
   cd liread-web
   ```

2. **Install project dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   VITE_TELEGRAM_BOT_USERNAME=lireadbooksbot
   ```

4. **Initialize Supabase Database** *(if using a personal Supabase project)*:
   - Navigate to your Supabase project's **SQL Editor**.
   - Execute the schema file located in `supabase/schema.sql`.

5. **Start the local development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 📁 Repository Structure

```
readers-hub-web/
├── api/                     # Vercel serverless API handlers (streaming downloads, webhooks)
│   ├── book-file.ts         # High-speed public domain catalog & download proxy
│   └── telegram.ts          # Telegram bot fulfillment webhook
├── public/                  # Static assets, branding logos, and PDF worker scripts
├── src/
│   ├── components/          # Modular React UI components
│   │   ├── auth/            # Authentication modals & sign-in views
│   │   ├── book/            # Book details, synopses, and download action bars
│   │   ├── bookshelf/       # User library management shelves
│   │   ├── feed/            # Passage quotes stream, post cards, and composer
│   │   ├── reader/          # Integrated EPUB & PDF viewer interfaces
│   │   ├── sanctuary/       # Saved quotes, personal notes, and analytics
│   │   └── timer/           # Distraction-free reading timer with ambient soundscapes
│   ├── data/                # Verified public domain registry & curated classics
│   ├── services/            # Supabase API services & Open Library search integrations
│   ├── stores/              # Zustand global application stores (Auth, Feed, Timer, Notice)
│   ├── types/               # TypeScript data models and interface definitions
│   ├── utils/               # Time formatting, typography helpers, and color utilities
│   ├── App.tsx              # Root application component with view routing
│   ├── main.tsx             # Application entry point
│   └── index.css            # Tailwind design tokens, paper themes, and keyframe animations
├── supabase/                # PostgreSQL schema definitions, functions, and RLS policies
└── package.json             # Build configuration and dependency declarations
```

---

## 🔐 Environment Variables

The following environment variables can be configured:

| Variable | Description | Required | Default |
| :--- | :--- | :---: | :--- |
| `VITE_SUPABASE_URL` | The HTTPS endpoint for your Supabase project instance | Yes | — |
| `VITE_SUPABASE_ANON_KEY` | Public anonymous API key for client-side Supabase requests | Yes | — |
| `VITE_TELEGRAM_BOT_USERNAME` | Username of the optional companion Telegram bot | No | `lireadbooksbot` |
| `TELEGRAM_BOT_TOKEN` | Bot API token for serverless webhook fulfillment (`api/telegram.ts`) | No | — |

---

## 📦 Build & Deployment

To generate an optimized production bundle:

```bash
npm run build
```

The output will be created in the `dist/` directory, ready to deploy to modern hosting platforms (such as [Vercel](https://vercel.com), Netlify, or Cloudflare Pages).

---

Full Name:            Muluken Tsegaye
ID Number:            CTC-1002-26
Classroom Number:     005


Presentation PDF link:
Presentation Video link: