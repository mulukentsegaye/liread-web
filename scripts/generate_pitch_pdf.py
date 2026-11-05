import os
import subprocess
import sys

def build_presentation_html():
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Liread — Product & Architecture Presentation Deck</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  @page {
    size: 11in 8.5in;
    margin: 0;
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #0f172a;
    background-color: #ffffff;
    line-height: 1.45;
    -webkit-font-smoothing: antialiased;
  }

  .slide {
    width: 11in;
    height: 8.5in;
    page-break-after: always;
    break-after: page;
    position: relative;
    overflow: hidden;
    padding: 0.65in 0.85in;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #ffffff;
    color: #0f172a;
  }

  /* Header */
  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1.5px solid #e2e8f0;
    padding-bottom: 0.16in;
    margin-bottom: 0.22in;
  }

  .pill-theme {
    display: inline-flex;
    align-items: center;
    padding: 5px 14px;
    border-radius: 9999px;
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: #f8fafc;
    color: #0f172a;
    border: 1px solid #e2e8f0;
  }

  .pill-theme.brand {
    background: #ecfdf5;
    color: #059669;
    border: 1px solid #a7f3d0;
  }

  .slide-number {
    font-family: 'JetBrains Mono', monospace;
    font-size: 9.5pt;
    color: #64748b;
    font-weight: 600;
  }

  /* Footer */
  .slide-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1.5px solid #e2e8f0;
    padding-top: 0.16in;
    font-size: 8.5pt;
    color: #64748b;
  }

  .slide-footer .brand {
    font-family: 'Cinzel', serif;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: #059669;
  }

  /* Content Container */
  .content-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    position: relative;
    z-index: 10;
  }

  /* Typography */
  .slide-title {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 26pt;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.2;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  .slide-subtitle {
    font-size: 12pt;
    color: #475569;
    line-height: 1.5;
    margin-bottom: 0.28in;
    max-width: 8.5in;
  }

  /* Single-focus Hero Card */
  .hero-card {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-left: 4px solid #059669;
    border-radius: 16px;
    padding: 0.38in 0.45in;
    box-shadow: 0 4px 16px -2px rgba(15, 23, 42, 0.03);
  }

  .hero-card.neutral {
    border-left: 1px solid #e2e8f0;
  }

  /* Huge Stat Display */
  .huge-stat {
    font-family: 'JetBrains Mono', monospace;
    font-size: 64pt;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
    margin-bottom: 12px;
    color: #0f172a;
  }

  .huge-stat.brand {
    color: #059669;
  }

  .huge-stat-label {
    font-size: 12.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    color: #0f172a;
    margin-bottom: 12px;
  }

  .huge-stat-desc {
    font-size: 11pt;
    color: #64748b;
    line-height: 1.6;
    max-width: 8in;
  }

  /* 2-Column Split */
  .split-2 {
    display: grid;
    grid-template-columns: 1.15fr 0.85fr;
    gap: 0.45in;
    align-items: center;
  }

  .split-2-equal {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35in;
  }

  /* Feature Checklist with Clean Minimalist Bullets */
  .feature-points {
    list-style: none;
    margin-top: 14px;
  }

  .feature-points li {
    position: relative;
    padding-left: 22px;
    margin-bottom: 12px;
    font-size: 11pt;
    color: #334155;
    line-height: 1.5;
  }

  .feature-points li::before {
    content: "";
    position: absolute;
    left: 4px;
    top: 8px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #059669;
  }

  /* Code / Schema box in clean minimalist mode */
  .code-box {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9pt;
    color: #0f172a;
    line-height: 1.6;
  }

  .code-box .keyword { color: #0f172a; font-weight: 700; }
  .code-box .field { color: #0f172a; font-weight: 600; }
  .code-box .type { color: #059669; font-weight: 600; }
  .code-box .comment { color: #64748b; font-style: italic; }

  /* Title Slide Specific */
  .title-logo-large {
    font-family: 'Cinzel', serif;
    font-size: 72pt;
    font-weight: 900;
    color: #0f172a;
    line-height: 1;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
  }

  .title-tagline-hero {
    font-family: 'Cinzel', serif;
    font-size: 24pt;
    font-weight: 700;
    color: #059669;
    line-height: 1.3;
    max-width: 9in;
    margin-bottom: 24px;
  }

  .tag-pill {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 6px;
    font-size: 9pt;
    font-weight: 600;
    margin-right: 8px;
    margin-bottom: 8px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    color: #334155;
  }

  .tag-pill.brand {
    background: #ecfdf5;
    border-color: #a7f3d0;
    color: #047857;
    font-weight: 700;
  }
</style>
</head>
<body>

  <!-- =====================================================================
       SLIDE 1: TITLE SLIDE
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header" style="justify-content: flex-end;">
      <span class="slide-number">01 / 26</span>
    </div>
    <div class="content-body">
      <h1 class="title-logo-large">Liread</h1>
      <p class="title-tagline-hero">
        Read a few pages every day. Build wisdom that lasts.
      </p>
      <p style="font-size: 13pt; color: #475569; max-width: 7.5in; line-height: 1.6; margin-bottom: 24px;">
        A quiet, distraction-free reading app across web and mobile. Features a gentle focus timer, relaxing background sounds, notification blocker, offline reading, and a friendly community.
      </p>
      <div style="display: flex; gap: 12px; margin-top: 10px;">
        <span class="tag-pill brand">Web • Android • iOS</span>
        <span class="tag-pill">React 18 + TypeScript</span>
        <span class="tag-pill">Supabase Cloud Database</span>
        <span class="tag-pill">Built-in Ambient Audio</span>
      </div>
    </div>
    <div class="slide-footer">
      <span>Creator: <strong>Muluken Tsegaye</strong> &nbsp;•&nbsp; Liread Platform</span>
      <span class="brand">LIREAD</span>
      <span>https://liread.vercel.app</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 2: THE MISSION
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">Why We Built Liread</span>
      <span class="slide-number">02 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Our Mission</h2>
      <p class="slide-subtitle">Helping people read deeply again in a world full of digital distractions</p>
      <div class="hero-card" style="background: #ffffff;">
        <div style="font-size: 20pt; font-family: 'Cinzel', serif; color: #0f172a; line-height: 1.45; margin-bottom: 18px;">
          "We want real wisdom, but we are drowning in phone notifications."
        </div>
        <p style="font-size: 12pt; color: #334155; line-height: 1.7;">
          Liread is built to help you regain your focus. Instead of competing for your attention with quick dopamine hits, Liread gives you a peaceful space to read without interruptions, block distractions, enjoy great books, and build a daily reading habit that lasts.
        </p>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Our Purpose</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 3: PROBLEM 1 - SCREEN TIME
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">The Problem: Too Many Distractions</span>
      <span class="slide-number">03 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Screens Are Stealing Our Reading Time</h2>
      <p class="slide-subtitle">Endless scrolling has quietly replaced our time with books</p>
      <div class="split-2-equal">
        <div class="hero-card neutral" style="text-align: center;">
          <div class="huge-stat">144m</div>
          <div class="huge-stat-label">Daily Screen & Social Media Time</div>
          <p class="huge-stat-desc">
            Most people spend over 2.4 hours every single day scrolling short videos and feeds, making it hard to sit still and focus on a book.
          </p>
        </div>
        <div class="hero-card neutral" style="text-align: center;">
          <div class="huge-stat" style="color: #64748b;">&lt; 14m</div>
          <div class="huge-stat-label">Daily Book Reading Time</div>
          <p class="huge-stat-desc">
            Actual reading time has dropped by over 40% in the last decade. We all want to read books, but constant phone alerts get in the way.
          </p>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>The Distraction Problem</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 4: PROBLEM 2 - BOOK ABANDONMENT
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">The Problem: Finishing Books</span>
      <span class="slide-number">04 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Why We Never Finish the Books We Start</h2>
      <p class="slide-subtitle">Starting a book is easy. Keeping the habit until the final page is hard.</p>
      <div class="hero-card neutral">
        <div class="huge-stat">74%</div>
        <div class="huge-stat-label">Of Books Started Are Left Unfinished</div>
        <p class="huge-stat-desc" style="font-size: 12pt; max-width: 8.5in; margin-top: 10px;">
          Without a simple timer and a quiet reading space, 3 out of 4 books get dropped around page 60. A single notification buzz ruins your concentration, and the book ends up sitting on the nightstand forever.
        </p>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>The Consistency Problem</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 5: PROBLEM 3 - SOLITARY ISOLATION
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">The Problem: Reading Alone</span>
      <span class="slide-number">05 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Reading Alone Makes It Hard to Stay Motivated</h2>
      <p class="slide-subtitle">Workouts have gym buddies. Runners have Strava. Reading is still completely lonely.</p>
      <div class="hero-card neutral">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 14px;">
          Good habits are easier to keep when you share them with others.
        </div>
        <p style="font-size: 11.5pt; color: #334155; line-height: 1.7; margin-bottom: 16px;">
          Research shows that having a supportive community increases your chance of sticking to a habit by <strong>65%</strong>. But today, readers are stuck between reading alone with zero encouragement, or visiting noisy commercial book sites with endless clutter.
        </p>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 18px; color: #0f172a; font-size: 10pt;">
          <strong style="color: #059669;">What's Missing:</strong> A friendly, quiet place where you can share daily progress and favorite lines with real readers.
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>The Community Problem</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 6: PROBLEM 4 - LOST MARGINALIA
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">The Problem: Lost Notes & Quotes</span>
      <span class="slide-number">06 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Great Quotes and Ideas Get Forgotten</h2>
      <p class="slide-subtitle">We read life-changing sentences in books, only to forget them days later</p>
      <div class="hero-card neutral">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
          Underlined Lines Disappear on the Shelf
        </div>
        <p style="font-size: 11.5pt; color: #334155; line-height: 1.7; margin-bottom: 18px;">
          When you find an inspiring quote or a powerful takeaway, you usually underline it in pencil and never see it again, or it gets trapped inside an e-reader app. There is no simple way to organize your favorite lines and share them with other readers.
        </p>
        <div style="display: flex; gap: 14px;">
          <div style="flex: 1; background: #f8fafc; padding: 14px; border-radius: 10px; border: 1px solid #e2e8f0;">
            <div style="color: #0f172a; font-weight: 700; font-size: 10pt; margin-bottom: 4px;">The Old Way</div>
            <div style="font-size: 9.5pt; color: #64748b; line-height: 1.5;">Underlined sentences forgotten on a dusty shelf or trapped in locked apps.</div>
          </div>
          <div style="flex: 1; background: #ecfdf5; padding: 14px; border-radius: 10px; border: 1px solid #a7f3d0;">
            <div style="color: #047857; font-weight: 700; font-size: 10pt; margin-bottom: 4px;">The Liread Way</div>
            <div style="font-size: 9.5pt; color: #065f46; line-height: 1.5;">Save any quote with a single click into your personal notebook and share it with the community.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Remembering What We Read</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 7: THE SOLUTION
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">The Solution</span>
      <span class="slide-number">07 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Introducing Liread</h2>
      <p class="slide-subtitle">A calm online reading room built for real focus and book lovers</p>
      <div class="split-2">
        <div class="hero-card">
          <div style="font-size: 18pt; font-family: 'Cinzel', serif; color: #0f172a; margin-bottom: 14px; font-weight: 700;">
            Focus in Private. Share in Public.
          </div>
          <p style="font-size: 11pt; color: #334155; line-height: 1.65;">
            Liread brings together everything you need to read consistently: a full-screen focus timer, an in-reader notification and app blocker, calming background sounds, a free offline book reader, and a friendly community to share quotes and thoughts.
          </p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 10px;">
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
            <div style="color: #059669; font-weight: 700; font-size: 10pt; margin-bottom: 2px;">Clean Reading Timer</div>
            <div style="font-size: 8.5pt; color: #64748b;">Full-screen timer with custom daily goals to keep your reading on track.</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
            <div style="color: #059669; font-weight: 700; font-size: 10pt; margin-bottom: 2px;">Notification & App Blocker</div>
            <div style="font-size: 8.5pt; color: #64748b;">Silences alerts and keeps you focused inside the book without distractions.</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
            <div style="color: #059669; font-weight: 700; font-size: 10pt; margin-bottom: 2px;">Free Library & Offline Reader</div>
            <div style="font-size: 8.5pt; color: #64748b;">Read thousands of classic books offline across web and mobile.</div>
          </div>
          <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px;">
            <div style="color: #059669; font-weight: 700; font-size: 10pt; margin-bottom: 2px;">Quote & Community Feed</div>
            <div style="font-size: 8.5pt; color: #64748b;">Save your favorite lines and see what fellow book lovers are reading.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>How Liread Works</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 8: HABIT COMPOUNDING
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">Habits That Last</span>
      <span class="slide-number">08 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Small Daily Reading Adds Up Fast</h2>
      <p class="slide-subtitle">Just 15 minutes a day turns into dozens of completed books</p>
      <div class="split-2-equal">
        <div class="hero-card" style="text-align: center;">
          <div class="huge-stat brand">18 Books</div>
          <div class="huge-stat-label">From Just 15 Minutes Daily</div>
          <p class="huge-stat-desc">
            Reading for just 15 minutes each day adds up to over <strong>1,200,000 words</strong>—enough to finish 18 full books every single year.
          </p>
        </div>
        <div class="hero-card neutral" style="text-align: center;">
          <div class="huge-stat">109 Hours</div>
          <div class="huge-stat-label">Of Focused Reading Time</div>
          <p class="huge-stat-desc">
            That is 4.5 full days of calm, uninterrupted reading won back from endless phone scrolling every single year.
          </p>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Building Daily Habits</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 9: FEATURE 1 - TIMER & HUD
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">Feature 01: Focus Timer</span>
      <span class="slide-number">09 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Distraction-Free Reading Timer</h2>
      <p class="slide-subtitle">A simple timer that keeps you focused without loud alarms or pressure</p>
      <div class="hero-card">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
          Full-Screen Focus Mode with Daily Goals
        </div>
        <p style="font-size: 11pt; color: #334155; line-height: 1.65; margin-bottom: 16px;">
          The timer gives you a gentle stopwatch that tracks your daily reading. It helps you stay in the zone without loud bells or countdown anxiety.
        </p>
        <ul class="feature-points">
          <li><strong>Easy Daily Goals:</strong> Pick quick goals (15m, 30m, 45m, 60m) to grow your daily streak.</li>
          <li><strong>Floating Mini-Timer:</strong> Keep the timer running at the bottom of your screen while browsing your library.</li>
          <li><strong>Automatic Progress Saving:</strong> Every finished session is automatically saved to your profile and streaks.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Tracking Reading Time</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 10: FEATURE 2 - AMBIENT AUDIO ENGINE
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">Feature 02: Calming Sounds</span>
      <span class="slide-number">10 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Built-In Background Sounds for Focus</h2>
      <p class="slide-subtitle">Calming background audio created directly in your browser with zero loading time</p>
      <div class="hero-card">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
          Instant Ambient Audio Without Heavy Streaming
        </div>
        <p style="font-size: 11pt; color: #334155; line-height: 1.65; margin-bottom: 16px;">
          Instead of loading heavy audio files that eat up your mobile data, Liread generates natural ambient sounds right inside your device. They play smoothly, loop forever, and work completely offline.
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-top: 14px;">
          <div style="background: #f8fafc; padding: 14px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="font-size: 20pt; margin-bottom: 4px;">🌧️</div>
            <div style="font-size: 10pt; font-weight: 700; color: #0f172a;">Calm Rain</div>
            <div style="font-size: 8.5pt; color: #64748b;">Gentle rain sounds</div>
          </div>
          <div style="background: #f8fafc; padding: 14px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="font-size: 20pt; margin-bottom: 4px;">🔥</div>
            <div style="font-size: 10pt; font-weight: 700; color: #0f172a;">Fireplace</div>
            <div style="font-size: 8.5pt; color: #64748b;">Cozy warm crackles</div>
          </div>
          <div style="background: #f8fafc; padding: 14px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="font-size: 20pt; margin-bottom: 4px;">🌌</div>
            <div style="font-size: 10pt; font-weight: 700; color: #0f172a;">Deep Space</div>
            <div style="font-size: 8.5pt; color: #64748b;">Deep calming tone</div>
          </div>
          <div style="background: #f8fafc; padding: 14px; border-radius: 10px; text-align: center; border: 1px solid #e2e8f0;">
            <div style="font-size: 20pt; margin-bottom: 4px;">🕊️</div>
            <div style="font-size: 10pt; font-weight: 700; color: #0f172a;">Morning Birds</div>
            <div style="font-size: 8.5pt; color: #64748b;">Peaceful chirps</div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Relaxing Background Audio</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 11: FEATURE 3 - OFFLINE READER
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">Feature 03: Offline Reader</span>
      <span class="slide-number">11 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">In-App Offline E-Reader</h2>
      <p class="slide-subtitle">Open and read EPUB and PDF books right in your browser or phone without external apps</p>
      <div class="hero-card">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
          Read Any Book Offline with Zero Extra Software
        </div>
        <p style="font-size: 11pt; color: #334155; line-height: 1.65; margin-bottom: 16px;">
          Liread turns your device into a clean, comfortable e-reader. You can read uploaded files or free classics anywhere, even without an internet connection.
        </p>
        <ul class="feature-points">
          <li><strong>Saved on Your Device:</strong> Your books and exact page positions are saved securely in local storage.</li>
          <li><strong>Works 100% Offline:</strong> Read on airplanes, buses, or off-grid without needing Wi-Fi or mobile data.</li>
          <li><strong>Custom Reading Comfort:</strong> Easily adjust font size, line spacing, and switch between light and dark reading themes.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Reading Books Offline</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 12: FEATURE 4 - APP & NOTIFICATION BLOCKER
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">Feature 04: Focus Shield</span>
      <span class="slide-number">12 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Focus Shield: Block Notifications & App Switching</h2>
      <p class="slide-subtitle">Keeps you focused inside your book by muting alerts and stopping accidental app-switching</p>
      <div class="hero-card">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
          A True Distraction Shield While You Read
        </div>
        <p style="font-size: 11pt; color: #334155; line-height: 1.65; margin-bottom: 16px;">
          The biggest reason people stop reading is a sudden phone alert or the urge to check other apps. Liread's Focus Shield locks out distractions so your device becomes a dedicated reading terminal.
        </p>
        <ul class="feature-points">
          <li><strong>Automatic Notification Silencing:</strong> Mutes annoying sounds, popups, and tab badges while you are reading.</li>
          <li><strong>15-Second App-Switching Timer:</strong> When you attempt to switch to another app, a 15-second countdown prompts you that you are in the middle of reading, giving you time to stay in the book.</li>
          <li><strong>Keeps Screen Awake:</strong> Automatically prevents your phone or laptop screen from turning off while you read a long page.</li>
          <li><strong>Accidental Exit Protection:</strong> Asks for a quick confirmation before closing, protecting your reading streak and page spot.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Distraction Protection</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 13: FEATURE 5 - BOOK DISCOVERY
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">Feature 05: Book Discovery</span>
      <span class="slide-number">13 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Free Book Discovery & Exploration</h2>
      <p class="slide-subtitle">Browse and find millions of free classic books across 14 popular categories</p>
      <div class="hero-card">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
          Millions of Classic Books at Your Fingertips
        </div>
        <p style="font-size: 11pt; color: #334155; line-height: 1.65; margin-bottom: 16px;">
          Liread connects directly to open digital libraries like Open Library and Project Gutenberg, giving you instant access to world-famous books without paying or signing up for subscriptions.
        </p>
        <ul class="feature-points">
          <li><strong>14 Curated Genres:</strong> Browse Philosophy, Psychology, Science, Habits, Fiction, History, and more.</li>
          <li><strong>Book of the Week:</strong> Discover a hand-picked classic each week with a summary and a one-click reading timer.</li>
          <li><strong>Beautiful Custom Covers:</strong> Automatically displays clean, elegant book covers for a bookstore-like browsing experience.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Finding Great Books</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 14: FEATURE 6 - COMMONPLACE FEED
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">Feature 06: Community Quotes</span>
      <span class="slide-number">14 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Share Favorite Quotes & Thoughts</h2>
      <p class="slide-subtitle">Post memorable book quotes, reflections, and insights with fellow readers</p>
      <div class="hero-card">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
          Share Insights and Discover Great Books
        </div>
        <p style="font-size: 11pt; color: #334155; line-height: 1.65; margin-bottom: 16px;">
          Liread gives book lovers a dedicated place to share favorite passages and chapter reflections with people who love the same books.
        </p>
        <ul class="feature-points">
          <li><strong>One-Click Quote Saving:</strong> Save any sentence you read straight into your personal notebook with a single click.</li>
          <li><strong>Chapter Notes & Takeaways:</strong> Share your favorite lines and chapter summaries with the reader community.</li>
          <li><strong>Thoughtful Discussions:</strong> Connect with fellow readers by commenting on chapter takeaways, sharing recommendations, and exploring new genres.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Sharing Thoughts & Quotes</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 15: FEATURE 7 - LIVE SANCTUARY
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">Feature 07: Live Reading Room</span>
      <span class="slide-number">15 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Live Quiet Reading Room</h2>
      <p class="slide-subtitle">See other people reading around the world at the exact same moment</p>
      <div class="hero-card">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
          Quiet Company Without Video Calls or Noisy Chats
        </div>
        <p style="font-size: 11pt; color: #334155; line-height: 1.65; margin-bottom: 16px;">
          Reading together feels motivating, but group video calls are exhausting. Liread lets you see a gentle count of readers reading with you right now, giving you quiet companionship without distractions.
        </p>
        <ul class="feature-points">
          <li><strong>Live Presence Counter:</strong> When you start your timer, you quietly join the global reading room.</li>
          <li><strong>Shared Books:</strong> See that other readers are enjoying books like <em>Meditations</em> or <em>Atomic Habits</em> right now.</li>
          <li><strong>Friendly Motivation:</strong> Know you're not reading alone, keeping you inspired to finish your daily pages.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Reading Together Live</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 16: FEATURE 8 - BOOKSHELF & STREAKS
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">Feature 08: Bookshelf & Streaks</span>
      <span class="slide-number">16 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Your Personal Bookshelf & Reading Streaks</h2>
      <p class="slide-subtitle">Organize your reading list and watch your daily streak grow day by day</p>
      <div class="hero-card">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
          Track Your Books and Earn Reader Ranks
        </div>
        <p style="font-size: 11pt; color: #334155; line-height: 1.65; margin-bottom: 16px;">
          Organize your books into "Want to Read", "Currently Reading", and "Completed". As you read daily, Liread tracks your total minutes and rewards your consistency.
        </p>
        <ul class="feature-points">
          <li><strong>Automatic Streak Tracker:</strong> Read every day to build and protect your reading streak.</li>
          <li><strong>Reader Levels:</strong> Progress from Novice Reader to Bookworm, Avid Reader, and Master of Tomes.</li>
          <li><strong>Private Notes:</strong> Keep personal notes on each book, completely private to you.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Tracking Your Progress</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 17: FEATURE 9 - AI READING ASSISTANT
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">Feature 09: AI Assistant</span>
      <span class="slide-number">17 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Smart In-Book AI Assistant</h2>
      <p class="slide-subtitle">Instant explanations for difficult sentences and unfamiliar words without leaving your page</p>
      <div class="hero-card">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
          Instant Explanations & Idea-Based Quote Search
        </div>
        <p style="font-size: 11pt; color: #334155; line-height: 1.65; margin-bottom: 16px;">
          Classic literature and philosophy can sometimes feel challenging. Liread includes a helpful, quiet AI companion built right into the reader:
        </p>
        <ul class="feature-points">
          <li><strong>Clear 2-Sentence Explanations:</strong> Tap any complex paragraph to see a simple, spoiler-free explanation in everyday language.</li>
          <li><strong>Search by Concept:</strong> Find saved quotes by idea (like <em>"quotes on handling worry"</em>) even if you don't remember the exact words.</li>
          <li><strong>Instant Word Definitions:</strong> Understand old-fashioned or rare words instantly with a single tap.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>In-Book AI Companion</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 18: FEATURE 10 - BOOK CLUBS
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">Feature 10: Book Clubs</span>
      <span class="slide-number">18 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Read Together with Friends at Your Own Pace</h2>
      <p class="slide-subtitle">Flexible group reading with spoiler-protected chapter discussions and voice notes</p>
      <div class="hero-card">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
          Social Reading Without Pressure or Scheduling Conflicts
        </div>
        <p style="font-size: 11pt; color: #334155; line-height: 1.65; margin-bottom: 16px;">
          Traditional book clubs are difficult to schedule. Liread lets friends and reading groups read together comfortably:
        </p>
        <ul class="feature-points">
          <li><strong>Spoiler-Safe Chapter Unlocks:</strong> Your friends' notes on Chapter 3 remain hidden until you finish reading Chapter 3 yourself.</li>
          <li><strong>Short Voice Reflections:</strong> Leave quick 30-second audio thoughts on your favorite paragraphs for your group to hear.</li>
          <li><strong>Private Reading Circles:</strong> Create private groups for your close friends, family, or book clubs with shared bookshelves.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Private Reading Circles</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 19: FEATURE 11 - MULTI-DEVICE SYNC
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme brand">Feature 11: Multi-Device Sync</span>
      <span class="slide-number">19 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Seamless Sync Across Phones, Tablets & E-Readers</h2>
      <p class="slide-subtitle">Read wherever you want—your progress, streaks, and notes sync instantly</p>
      <div class="hero-card">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
          One Unified Reading Experience on Every Screen
        </div>
        <p style="font-size: 11pt; color: #334155; line-height: 1.65; margin-bottom: 16px;">
          Whether you prefer reading on your Android phone, iPad, laptop, or dedicated Kindle e-reader:
        </p>
        <ul class="feature-points">
          <li><strong>Universal Progress Sync:</strong> Put your phone down and pick up your laptop—your reading minutes and exact page are always ready.</li>
          <li><strong>High-Contrast E-Ink Mode:</strong> Clean monochrome layout optimized for battery efficiency on e-ink devices like Boox and Kindle.</li>
          <li><strong>Home Screen Streak Widgets:</strong> Quick glanceable widgets on your phone home screen showing today's reading goal.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Multi-Device Experience</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 20: TECH ARCHITECTURE OVERVIEW
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">How It's Built</span>
      <span class="slide-number">20 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">How Liread Works Under the Hood</h2>
      <p class="slide-subtitle">A fast, reliable app designed to load instantly and work smoothly anywhere</p>
      <div class="hero-card neutral">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; margin-top: 6px;">
          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="color: #059669; font-weight: 700; font-size: 11pt; margin-bottom: 6px;">1. Client App (Web & Mobile)</div>
            <p style="font-size: 9pt; color: #475569; line-height: 1.5;">
              React 18, TypeScript, and Vite. Super fast load times (&lt;125kB download), smooth animations, background sound generator, and offline book storage.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="color: #0f172a; font-weight: 700; font-size: 11pt; margin-bottom: 6px;">2. Fast Cloud Edge</div>
            <p style="font-size: 9pt; color: #475569; line-height: 1.5;">
              Serverless edge functions for streaming free classic books, handling book searches, and delivering fast catalog requests.
            </p>
          </div>
          <div style="background: #f8fafc; padding: 16px; border-radius: 12px; border: 1px solid #e2e8f0;">
            <div style="color: #0f172a; font-weight: 700; font-size: 11pt; margin-bottom: 6px;">3. Cloud Database</div>
            <p style="font-size: 9pt; color: #475569; line-height: 1.5;">
              Supabase PostgreSQL database keeping user accounts, reading timers, streaks, and quotes safe, private, and synced across devices.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Technology Overview</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 21: FRONTEND ENGINEERING
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Front-End Technology</span>
      <span class="slide-number">21 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Fast, Smooth User Experience</h2>
      <p class="slide-subtitle">Built with modern web tools for instant screen changes and zero delays</p>
      <div class="split-2">
        <div class="hero-card neutral">
          <div style="font-size: 15pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
            Instant Updates with Clean State Management
          </div>
          <p style="font-size: 10.5pt; color: #334155; line-height: 1.6; margin-bottom: 14px;">
            Using lightweight state stores (auth, timer, reader, and feed), the app updates instantly when you click a button or turn a page without freezing or unnecessary delays.
          </p>
          <ul class="feature-points">
            <li>Reliable code with strict TypeScript checks ensuring zero runtime crashes.</li>
            <li>Smart code splitting so the device only downloads what you need when you need it.</li>
          </ul>
        </div>
        <div class="code-box">
<span class="comment">// Clean, fast state store with automatic saving</span>
<span class="keyword">export const</span> <span class="field">useFeedStore</span> = create&lt;FeedStore&gt;()(
  persist((set, get) => ({
    posts: [],
    sortBy: <span class="type">'latest'</span>,
    toggleUpvote: <span class="keyword">async</span> (postId, userId) => {
      <span class="comment">// Instant visual update</span>
      set((state) => ({ ... }));
      <span class="keyword">await</span> postsService.toggleUpvote(postId, userId);
    }
  }), {
    name: <span class="type">'liread_feed_state_v2'</span>
  })
);
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Front-End Design</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 22: EDGE & SERVERLESS
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Fast Book Delivery</span>
      <span class="slide-number">22 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Instant Book Downloads Without Blockers</h2>
      <p class="slide-subtitle">Quickly streams free classic books from public libraries directly to your reader</p>
      <div class="hero-card neutral">
        <div style="font-size: 16pt; font-weight: 700; color: #0f172a; margin-bottom: 12px;">
          Fast & Reliable Book Delivery (<code style="font-family: 'JetBrains Mono'; color: #059669; font-weight: 700;">/api/book-file.ts</code>)
        </div>
        <p style="font-size: 11pt; color: #334155; line-height: 1.65; margin-bottom: 16px;">
          When readers open a classic book from Project Gutenberg or Internet Archive, security rules often block direct downloads. Liread uses fast edge servers to deliver the book smoothly in seconds.
        </p>
        <ul class="feature-points">
          <li><strong>Automatic Backup Formats:</strong> If an EPUB version has an issue, it instantly tries a PDF copy.</li>
          <li><strong>Instant Library:</strong> A built-in catalog lets you open top classic books in 0 seconds.</li>
          <li><strong>Reliable Caching:</strong> Frequently accessed books are cached to ensure immediate opening for readers worldwide.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Delivering Books Fast</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 23: DATABASE ENTITIES
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Database Design</span>
      <span class="slide-number">23 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Clean & Organized Data Structure</h2>
      <p class="slide-subtitle">Simple, well-structured database tables that keep your reading data organized</p>
      <div class="hero-card neutral">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px;">
          <div class="code-box">
<span class="keyword">TABLE</span> <span class="field">profiles</span> (
  id <span class="type">UUID PK</span>,
  username <span class="type">TEXT UNIQUE</span>,
  total_minutes <span class="type">INT</span>,
  current_streak <span class="type">INT</span>,
  rank_tier <span class="type">TEXT</span>,
  daily_goal_minutes <span class="type">INT</span>
);
          </div>
          <div class="code-box">
<span class="keyword">TABLE</span> <span class="field">posts</span> (
  id <span class="type">UUID PK</span>,
  user_id <span class="type">UUID FK</span>,
  book_title <span class="type">TEXT</span>,
  quote_text <span class="type">TEXT</span>,
  upvotes_count <span class="type">INT</span>,
  comments_count <span class="type">INT</span>
);
          </div>
          <div class="code-box">
<span class="keyword">TABLE</span> <span class="field">reading_sessions</span> (
  id <span class="type">UUID PK</span>,
  user_id <span class="type">UUID FK</span>,
  book_title <span class="type">TEXT</span>,
  duration_minutes <span class="type">INT</span>,
  session_date <span class="type">DATE</span>
);
          </div>
        </div>
        <p style="font-size: 9.5pt; color: #475569; margin-top: 14px; line-height: 1.5;">
          Every table connects cleanly with foreign keys. Fast database indexes ensure searches and profile loads take only milliseconds.
        </p>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Database Tables</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 24: AUTOMATIONS & RLS
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Privacy & Security</span>
      <span class="slide-number">24 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Automated Streaks & Strong Security</h2>
      <p class="slide-subtitle">Automatic habit updates on the server and strict privacy for your private notes</p>
      <div class="hero-card neutral">
        <div class="split-2-equal">
          <div>
            <div style="color: #059669; font-weight: 700; font-size: 12pt; margin-bottom: 8px;">Automatic Streak Updates</div>
            <p style="font-size: 9.5pt; color: #334155; line-height: 1.6; margin-bottom: 10px;">
              When you finish a reading session, the database immediately checks your calendar, updates your daily streak, and awards your new reader level automatically.
            </p>
            <div style="font-size: 8.5pt; color: #64748b; font-family: 'JetBrains Mono';">
              EXECUTE FUNCTION handle_reading_session_inserted();
            </div>
          </div>
          <div>
            <div style="color: #0f172a; font-weight: 700; font-size: 12pt; margin-bottom: 8px;">Strict Privacy Rules</div>
            <p style="font-size: 9.5pt; color: #334155; line-height: 1.6; margin-bottom: 10px;">
              Every user's private bookshelf and notes can only be viewed or edited by them. Your personal data is completely safe and isolated.
            </p>
            <div style="font-size: 8.5pt; color: #64748b; font-family: 'JetBrains Mono';">
              WITH CHECK (auth.uid() = user_id);
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Security & Automation</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 25: CLOSING THESIS / BELIEF
       ===================================================================== -->
  <div class="slide" style="text-align: center; align-items: center; justify-content: center;">
    <div style="max-width: 9in;">
      <span class="pill-theme brand" style="margin-bottom: 24px;">Our Core Belief</span>
      <div style="font-family: 'Cinzel', Georgia, serif; font-size: 32pt; font-weight: 700; color: #0f172a; line-height: 1.35; margin-bottom: 28px;">
        "Reading is easy when nothing is pulling you away."
      </div>
      <p style="font-size: 13pt; color: #334155; line-height: 1.7; max-width: 7.8in; margin: 0 auto 30px auto;">
        Anyone can build a lifelong daily reading habit. When you remove notifications, stop phone distractions, and have a quiet place to read, finishing books becomes natural, peaceful, and enjoyable.
      </p>
    </div>
    <div class="slide-footer" style="width: 100%;">
      <span></span>
      <span class="brand">LIREAD</span>
      <span>Closing Summary</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 26: CALL TO ACTION & DEMO
       ===================================================================== -->
  <div class="slide" style="text-align: center; align-items: center; justify-content: center;">
    <div style="max-width: 8.5in;">
      <h2 style="font-family: 'Cinzel', serif; font-size: 38pt; font-weight: 900; color: #0f172a; margin-bottom: 14px;">
        Let's Make the World Read Again.
      </h2>
      <p style="font-size: 13pt; color: #475569; margin-bottom: 32px;">
        Try Liread today across web, Android, and iOS.
      </p>

      <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 36px;">
        <div style="background: #ecfdf5; border: 2px solid #059669; padding: 16px 28px; border-radius: 14px; text-align: left;">
          <div style="font-size: 9pt; color: #047857; font-weight: 700; text-transform: uppercase;">Live Application</div>
          <div style="font-size: 14pt; color: #0f172a; font-weight: 700; font-family: 'JetBrains Mono'; margin-top: 4px;">liread.vercel.app</div>
        </div>
        <div style="background: #f8fafc; border: 1.5px solid #e2e8f0; padding: 16px 28px; border-radius: 14px; text-align: left;">
          <div style="font-size: 9pt; color: #64748b; font-weight: 700; text-transform: uppercase;">Open Source Code</div>
          <div style="font-size: 14pt; color: #0f172a; font-weight: 700; font-family: 'JetBrains Mono'; margin-top: 4px;">mulukentsegaye/liread-web</div>
        </div>
      </div>

      <div style="font-family: 'Cinzel', serif; font-size: 13pt; color: #059669; letter-spacing: 0.05em; font-weight: 700;">
        Thank you! Open for Questions & Live Demo
      </div>
    </div>
    <div class="slide-footer" style="width: 100%;">
      <span>Creator: <strong>Muluken Tsegaye</strong></span>
      <span class="brand">LIREAD</span>
      <span>Thank You</span>
    </div>
  </div>

</body>
</html>
"""

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    
    html_path = os.path.join(project_root, "scratch", "presentation_deck_light.html")
    pdf_path = os.path.join(project_root, "Liread_Presentation.pdf")
    
    os.makedirs(os.path.dirname(html_path), exist_ok=True)
    
    print("[1/3] Generating 26-slide presentation markup (Clean Minimalist Theme)...")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(build_presentation_html())
    print(f"      HTML written to: {html_path}")
    
    print("[2/3] Programmatically rendering PDF with Chromium engine...")
    edge_exe = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"
    
    if not os.path.exists(edge_exe):
        print(f"Error: Edge executable not found at {edge_exe}")
        sys.exit(1)
        
    cmd = [
        edge_exe,
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        f"--print-to-pdf={pdf_path}",
        html_path
    ]
    
    res = subprocess.run(cmd, capture_output=True, text=True)
    
    if os.path.exists(pdf_path) and os.path.getsize(pdf_path) > 0:
        file_size = os.path.getsize(pdf_path)
        print(f"[3/3] Success! Generated presentation PDF:")
        print(f"      Path: {pdf_path}")
        print(f"      Size: {file_size / 1024:.1f} KB")
    else:
        print("Failed to generate PDF. Subprocess output:")
        print("stdout:", res.stdout)
        print("stderr:", res.stderr)
        sys.exit(1)

if __name__ == "__main__":
    main()
