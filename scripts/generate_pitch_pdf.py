import os
import subprocess
import sys

def build_presentation_html():
    return """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Liread — Comprehensive Hackathon Pitch Deck</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');

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
    color: #f8fafc;
    background-color: #070d18;
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
    background: radial-gradient(circle at 15% 15%, #063c2f 0%, #061c17 40%, #070d18 85%);
  }

  /* Slide variations */
  .slide-accent {
    background: radial-gradient(circle at 75% 20%, #064e3b 0%, #04241d 45%, #060a14 90%);
  }
  .slide-sky {
    background: radial-gradient(circle at 20% 25%, #0c3547 0%, #081d26 45%, #070d18 90%);
  }
  .slide-amber {
    background: radial-gradient(circle at 80% 30%, #3d2406 0%, #211505 45%, #070d18 90%);
  }
  .slide-purple {
    background: radial-gradient(circle at 25% 20%, #2e1065 0%, #170733 45%, #070d18 90%);
  }

  /* Header */
  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    padding-bottom: 0.16in;
    margin-bottom: 0.22in;
  }

  .pill-theme {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 5px 14px;
    border-radius: 9999px;
    font-size: 8.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: rgba(16, 185, 129, 0.14);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.28);
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
    border-top: 1px solid rgba(255, 255, 255, 0.08);
    padding-top: 0.16in;
    font-size: 8.5pt;
    color: #64748b;
  }

  .slide-footer .brand {
    font-family: 'Cinzel', serif;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: #10b981;
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
    font-size: 27pt;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.2;
    margin-bottom: 8px;
    letter-spacing: -0.01em;
  }

  .slide-subtitle {
    font-size: 12pt;
    color: #94a3b8;
    line-height: 1.5;
    margin-bottom: 0.28in;
    max-width: 8.5in;
  }

  /* Single-focus Hero Card */
  .hero-card {
    background: rgba(15, 23, 42, 0.65);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 20px;
    padding: 0.38in 0.45in;
    backdrop-filter: blur(14px);
    box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.4);
  }

  /* Huge Stat Display */
  .huge-stat {
    font-family: 'JetBrains Mono', monospace;
    font-size: 64pt;
    font-weight: 800;
    line-height: 1;
    letter-spacing: -0.03em;
    margin-bottom: 12px;
  }

  .huge-stat-label {
    font-size: 13pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: #cbd5e1;
    margin-bottom: 14px;
  }

  .huge-stat-desc {
    font-size: 11pt;
    color: #94a3b8;
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

  /* Feature Checklist */
  .feature-points {
    list-style: none;
    margin-top: 14px;
  }

  .feature-points li {
    position: relative;
    padding-left: 26px;
    margin-bottom: 12px;
    font-size: 11pt;
    color: #cbd5e1;
    line-height: 1.5;
  }

  .feature-points li::before {
    content: "✦";
    position: absolute;
    left: 0;
    color: #34d399;
    font-size: 12pt;
    font-weight: bold;
  }

  /* Code / Schema box */
  .code-box {
    background: #040810;
    border: 1px solid rgba(255, 255, 255, 0.12);
    border-radius: 12px;
    padding: 16px 20px;
    font-family: 'JetBrains Mono', monospace;
    font-size: 9pt;
    color: #93c5fd;
    line-height: 1.6;
    box-shadow: inset 0 2px 6px rgba(0,0,0,0.5);
  }

  .code-box .keyword { color: #f43f5e; font-weight: 600; }
  .code-box .field { color: #f1f5f9; }
  .code-box .type { color: #34d399; }
  .code-box .comment { color: #64748b; font-style: italic; }

  /* Title Slide Specific */
  .title-logo-large {
    font-family: 'Cinzel', serif;
    font-size: 72pt;
    font-weight: 900;
    color: #ffffff;
    line-height: 1;
    letter-spacing: -0.02em;
    margin-bottom: 12px;
    text-shadow: 0 4px 30px rgba(16, 185, 129, 0.35);
  }

  .title-tagline-hero {
    font-family: 'Cinzel', serif;
    font-size: 24pt;
    font-weight: 600;
    color: #34d399;
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
    background: rgba(255, 255, 255, 0.06);
    border: 1px solid rgba(255, 255, 255, 0.12);
    color: #cbd5e1;
  }
</style>
</head>
<body>

  <!-- =====================================================================
       SLIDE 1: TITLE SLIDE
       ===================================================================== -->
  <div class="slide slide-accent">
    <div class="slide-header">
      <span class="pill-theme">✦ Hackathon Pitch Presentation</span>
      <span class="slide-number">01 / 26</span>
    </div>
    <div class="content-body">
      <h1 class="title-logo-large">Liread</h1>
      <p class="title-tagline-hero">
        Small daily pages. Massive compounding wisdom.
      </p>
      <p style="font-size: 13pt; color: #cbd5e1; max-width: 7.5in; line-height: 1.6; margin-bottom: 24px;">
        A serene, distraction-free reading sanctuary with deep-focus timers, procedural ambient soundscapes, offline reading, and mindful community accountability.
      </p>
      <div style="display: flex; gap: 12px; margin-top: 10px;">
        <span class="tag-pill" style="background: rgba(16, 185, 129, 0.2); border-color: #10b981; color: #6ee7b7;">Web & PWA</span>
        <span class="tag-pill">React 18 + TypeScript</span>
        <span class="tag-pill">Supabase PostgreSQL</span>
        <span class="tag-pill">Web Audio API</span>
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
      <span class="pill-theme">The Vision & Purpose</span>
      <span class="slide-number">02 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">The Liread Mission</h2>
      <p class="slide-subtitle">Restoring sustained human contemplation in an era of micro-stimuli</p>
      <div class="hero-card" style="border-left: 6px solid #10b981;">
        <div style="font-size: 20pt; font-family: 'Cinzel', serif; color: #ffffff; line-height: 1.45; margin-bottom: 18px;">
          "We are starving for wisdom while drowning in algorithmic noise."
        </div>
        <p style="font-size: 12pt; color: #cbd5e1; line-height: 1.7;">
          Liread is engineered to reverse attention fragmentation. Rather than competing with social feeds for fleeting dopamine, Liread provides a sacred digital space where readers cultivate uninterrupted focus, cherish classic literature, and build lifelong reading consistency.
        </p>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Core Philosophical Foundation</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 3: PROBLEM 1 - SCREEN TIME
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme" style="color: #f43f5e; border-color: rgba(244, 63, 94, 0.3); background: rgba(244, 63, 94, 0.12);">The Problem: Attention Deficit</span>
      <span class="slide-number">03 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">The Screen Time Displacement</h2>
      <p class="slide-subtitle">Algorithmic feeds have quietly displaced reflective reading</p>
      <div class="split-2-equal">
        <div class="hero-card" style="border-left: 6px solid #f43f5e; text-align: center;">
          <div class="huge-stat" style="color: #f43f5e;">144m</div>
          <div class="huge-stat-label">Daily Algorithmic Screen Time</div>
          <p class="huge-stat-desc">
            The average adult spends over 2.4 hours every day scrolling short-form video and social media feeds that break continuous attention into 15-second fragments.
          </p>
        </div>
        <div class="hero-card" style="border-left: 6px solid #94a3b8; text-align: center;">
          <div class="huge-stat" style="color: #94a3b8;">&lt; 14m</div>
          <div class="huge-stat-label">Daily Deep Book Reading</div>
          <p class="huge-stat-desc">
            Time allocated to literary reading has fallen over 40% in ten years. Readers desire to read books, but algorithmic friction continuously sabotages their intentions.
          </p>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Crisis Metric: Attention Economy</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 4: PROBLEM 2 - BOOK ABANDONMENT
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme" style="color: #f59e0b; border-color: rgba(245, 158, 11, 0.3); background: rgba(245, 158, 11, 0.12);">The Problem: Friction & Attrition</span>
      <span class="slide-number">04 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">The Abandonment Epidemic</h2>
      <p class="slide-subtitle">Starting books is easy; sustaining momentum to the last page is rare</p>
      <div class="hero-card" style="border-left: 6px solid #f59e0b;">
        <div class="huge-stat" style="color: #f59e0b;">74%</div>
        <div class="huge-stat-label">Of Started Books Are Never Finished</div>
        <p class="huge-stat-desc" style="font-size: 12pt; max-width: 8.5in; margin-top: 10px;">
          Without a structured daily focus timer, gentle milestone pacing, and a peaceful reading environment, 3 out of 4 books are abandoned around page 60. Notification interruptions break flow and destroy the cognitive bridge required to finish long-form masterworks.
        </p>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Crisis Metric: Reader Drop-off</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 5: PROBLEM 3 - SOLITARY ISOLATION
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme" style="color: #a855f7; border-color: rgba(168, 85, 247, 0.3); background: rgba(168, 85, 247, 0.12);">The Problem: Missing Accountability</span>
      <span class="slide-number">05 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">The Solitary Reader Dilemma</h2>
      <p class="slide-subtitle">Fitness has Strava, coding has GitHub. Reading remains completely isolated.</p>
      <div class="hero-card" style="border-left: 6px solid #a855f7;">
        <div style="font-size: 16pt; font-weight: 700; color: #ffffff; margin-bottom: 14px;">
          Why Are Healthy Habits Sustained in Public, but Reading Suffers in Private?
        </div>
        <p style="font-size: 11.5pt; color: #cbd5e1; line-height: 1.7; margin-bottom: 16px;">
          Habit formation research proves that peer accountability increases habit completion rates by over <strong>65%</strong>. Yet readers are forced between two extremes: solitary isolation with zero reinforcement, or noisy commercial book review sites dominated by ads and algorithmic rage-bait.
        </p>
        <div style="background: rgba(168, 85, 247, 0.15); border: 1px solid rgba(168, 85, 247, 0.3); border-radius: 10px; padding: 12px 18px; color: #e9d5ff; font-size: 10pt;">
          <strong>The Missing Element:</strong> A quiet, pressure-free sanctuary that celebrates daily consistency without vanity metrics or toxic competition.
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Behavioral Science of Reading</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 6: PROBLEM 4 - LOST MARGINALIA
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); background: rgba(56, 189, 248, 0.12);">The Problem: Forgotten Knowledge</span>
      <span class="slide-number">06 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">The Lost Marginalia Paradox</h2>
      <p class="slide-subtitle">Humanity reads brilliant insights, only to let them evaporate</p>
      <div class="hero-card" style="border-left: 6px solid #38bdf8;">
        <div style="font-size: 16pt; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
          Highlights Locked in Digital Graveyards
        </div>
        <p style="font-size: 11.5pt; color: #cbd5e1; line-height: 1.7; margin-bottom: 18px;">
          When readers encounter a life-defining quote or a philosophical breakthrough, it is either underlined in pencil never to be referenced again, or locked in proprietary e-reader files. There is no fluid commonplace book system to distill, preserve, and exchange timeless passages with fellow thinkers.
        </p>
        <div style="display: flex; gap: 14px;">
          <div style="flex: 1; background: rgba(15,23,42,0.6); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="color: #f87171; font-weight: 700; font-size: 10pt; margin-bottom: 4px;">❌ The Status Quo</div>
            <div style="font-size: 9pt; color: #94a3b8;">Underlined text forgotten on a physical shelf or lost in proprietary formats.</div>
          </div>
          <div style="flex: 1; background: rgba(15,23,42,0.6); padding: 12px; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="color: #34d399; font-weight: 700; font-size: 10pt; margin-bottom: 4px;">✓ The Liread Way</div>
            <div style="font-size: 9pt; color: #94a3b8;">A single click transforms book marginalia into personal saved wisdom and community discussion.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Knowledge Retention Challenge</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 7: THE SOLUTION
       ===================================================================== -->
  <div class="slide slide-accent">
    <div class="slide-header">
      <span class="pill-theme">The Solution</span>
      <span class="slide-number">07 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Introducing Liread</h2>
      <p class="slide-subtitle">A mindful digital sanctuary uniting deep focus and literary community</p>
      <div class="split-2">
        <div class="hero-card" style="border-left: 6px solid #10b981;">
          <div style="font-size: 18pt; font-family: 'Cinzel', serif; color: #ffffff; margin-bottom: 14px; font-weight: 700;">
            Focus in Private. Inspire in Public.
          </div>
          <p style="font-size: 11pt; color: #cbd5e1; line-height: 1.65;">
            Liread provides an all-in-one distraction-free web sanctuary: an immersive reading HUD timer, zero-network procedural audio, browser-native EPUB/PDF reader, and a high-signal social feed built strictly around authentic reflections.
          </p>
        </div>
        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px 18px;">
            <div style="color: #34d399; font-weight: 700; font-size: 10.5pt; margin-bottom: 2px;">✦ The Reading Sanctuary</div>
            <div style="font-size: 9pt; color: #94a3b8;">Full-screen HUD timer with customizable daily goals and procedural soundscapes.</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px 18px;">
            <div style="color: #38bdf8; font-weight: 700; font-size: 10.5pt; margin-bottom: 2px;">✦ The Open Library Reader</div>
            <div style="font-size: 9pt; color: #94a3b8;">Read millions of public domain books offline in your browser with zero latency.</div>
          </div>
          <div style="background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 14px 18px;">
            <div style="color: #fbbf24; font-weight: 700; font-size: 10.5pt; margin-bottom: 2px;">✦ The Commonplace Feed</div>
            <div style="font-size: 9pt; color: #94a3b8;">Publish verified marginalia and celebrate daily consistency with real readers.</div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Solution Architecture</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 8: HABIT COMPOUNDING
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Habit Science</span>
      <span class="slide-number">08 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">The Philosophy of Compounding</h2>
      <p class="slide-subtitle">Small daily pages compound into monumental lifelong wisdom</p>
      <div class="split-2-equal">
        <div class="hero-card" style="border-left: 6px solid #10b981; text-align: center;">
          <div class="huge-stat" style="color: #10b981;">18 Books</div>
          <div class="huge-stat-label">From Just 15 Minutes Daily</div>
          <p class="huge-stat-desc">
            Reading at standard cadence for only 15 minutes each morning yields over <strong>1,200,000 words</strong>—equivalent to completing 18 full masterworks every single year.
          </p>
        </div>
        <div class="hero-card" style="border-left: 6px solid #38bdf8; text-align: center;">
          <div class="huge-stat" style="color: #38bdf8;">109 Hours</div>
          <div class="huge-stat-label">Of Notification-Free Focus</div>
          <p class="huge-stat-desc">
            Over 4.5 solid days of continuous cognitive contemplation gained back from algorithm doom-scrolling, strengthening attention and cognitive reserve.
          </p>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Atomic Habits in Practice</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 9: FEATURE 1 - TIMER & HUD
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Feature Spotlight 01</span>
      <span class="slide-number">09 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Distraction-Free Reading Timer</h2>
      <p class="slide-subtitle">A focused HUD designed to anchor uninterrupted reading sessions</p>
      <div class="hero-card" style="border-left: 6px solid #10b981;">
        <div style="font-size: 16pt; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
          Full-Screen Focus Mode with Daily Goal Arcs
        </div>
        <p style="font-size: 11pt; color: #cbd5e1; line-height: 1.65; margin-bottom: 16px;">
          Implemented in <code style="color: #34d399; font-family: 'JetBrains Mono';">FullTimerModal.tsx</code> and <code style="color: #34d399; font-family: 'JetBrains Mono';">FloatingTimerBar.tsx</code>, the timer provides a gentle, ambient stopwatch that keeps time without aggressive beeping.
        </p>
        <ul class="feature-points">
          <li><strong>Custom Daily Commitments:</strong> Quick presets (15m, 30m, 45m, 60m) that automatically advance your streak.</li>
          <li><strong>Floating Sticky Bar:</strong> Keep reading while browsing your library or exploring new genres without losing session time.</li>
          <li><strong>Automated Database Logging:</strong> Seamlessly writes to <code style="font-family: 'JetBrains Mono'; color: #38bdf8;">reading_sessions</code> upon completion.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Core Capability: Time Tracking</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 10: FEATURE 2 - AMBIENT AUDIO ENGINE
       ===================================================================== -->
  <div class="slide slide-sky">
    <div class="slide-header">
      <span class="pill-theme" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); background: rgba(56, 189, 248, 0.12);">Feature Spotlight 02</span>
      <span class="slide-number">10 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Procedural Web Audio Engine</h2>
      <p class="slide-subtitle">Pure mathematical soundscapes with zero network downloads</p>
      <div class="hero-card" style="border-left: 6px solid #38bdf8;">
        <div style="font-size: 16pt; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
          100% Client-Side Audio Synthesis via Mathematical Oscillators
        </div>
        <p style="font-size: 11pt; color: #cbd5e1; line-height: 1.65; margin-bottom: 16px;">
          In <code style="color: #38bdf8; font-family: 'JetBrains Mono';">ambientAudioEngine.ts</code>, Liread bypasses heavy MP3 streams. Using the native browser Web Audio API, oscillators, and biquad noise filters, it synthesizes infinite, non-repeating acoustic environments.
        </p>
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 10px; margin-top: 14px;">
          <div style="background: rgba(15,23,42,0.7); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 18pt;">🌧️</div>
            <div style="font-size: 9pt; font-weight: 700; color: #ffffff;">Calm Rain</div>
            <div style="font-size: 7.5pt; color: #94a3b8;">Pink noise filtering</div>
          </div>
          <div style="background: rgba(15,23,42,0.7); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 18pt;">🔥</div>
            <div style="font-size: 9pt; font-weight: 700; color: #ffffff;">Fireplace</div>
            <div style="font-size: 7.5pt; color: #94a3b8;">Stochastic crackles</div>
          </div>
          <div style="background: rgba(15,23,42,0.7); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 18pt;">🌌</div>
            <div style="font-size: 9pt; font-weight: 700; color: #ffffff;">Deep Space</div>
            <div style="font-size: 7.5pt; color: #94a3b8;">Sub-bass drone</div>
          </div>
          <div style="background: rgba(15,23,42,0.7); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255,255,255,0.08);">
            <div style="font-size: 18pt;">🕊️</div>
            <div style="font-size: 9pt; font-weight: 700; color: #ffffff;">Morning Birds</div>
            <div style="font-size: 7.5pt; color: #94a3b8;">Harmonic chirps</div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Web Audio API Engineering</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 11: FEATURE 3 - OFFLINE READER
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme" style="color: #fbbf24; border-color: rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.12);">Feature Spotlight 03</span>
      <span class="slide-number">11 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">ReadEra Offline Reader Engine</h2>
      <p class="slide-subtitle">In-browser EPUB and PDF reading backed by client IndexedDB storage</p>
      <div class="hero-card" style="border-left: 6px solid #fbbf24;">
        <div style="font-size: 16pt; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
          Seamless In-Browser Reading with Zero External Software
        </div>
        <p style="font-size: 11pt; color: #cbd5e1; line-height: 1.65; margin-bottom: 16px;">
          Powered by <code style="color: #fbbf24; font-family: 'JetBrains Mono';">ReadEraViewer.tsx</code> and <code style="color: #fbbf24; font-family: 'JetBrains Mono';">readerStorageService.ts</code>, Liread turns modern browsers into rich e-readers supporting EPUB reflowable text and PDF rendering.
        </p>
        <ul class="feature-points">
          <li><strong>IndexedDB Persistence:</strong> Uploaded books and downloaded classics are stored locally in the <code style="font-family: 'JetBrains Mono'; color: #38bdf8;">readera-books-db</code> object store.</li>
          <li><strong>Offline Resilient:</strong> Read masterworks on airplanes or trains with full page state preservation.</li>
          <li><strong>Format Adaptability:</strong> Dynamic font scaling, line height tuning, and dark parchment modes.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Client Storage & Reading Engine</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 12: FEATURE 4 - BOOK DISCOVERY
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Feature Spotlight 04</span>
      <span class="slide-number">12 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Dynamic Literary Discovery</h2>
      <p class="slide-subtitle">Real-time Open Library integration across 14 curated genres</p>
      <div class="hero-card" style="border-left: 6px solid #10b981;">
        <div style="font-size: 16pt; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
          Instant Access to Millions of Works without Paywalls
        </div>
        <p style="font-size: 11pt; color: #cbd5e1; line-height: 1.65; margin-bottom: 16px;">
          Implemented in <code style="color: #34d399; font-family: 'JetBrains Mono';">ExploreView.tsx</code> and <code style="color: #34d399; font-family: 'JetBrains Mono';">bookSearchService.ts</code>, Liread queries Open Library's Subjects API and Gutendex with intelligent dual in-memory and <code style="font-family: 'JetBrains Mono'; color: #38bdf8;">sessionStorage</code> caching.
        </p>
        <ul class="feature-points">
          <li><strong>14 Diverse Curated Shelves:</strong> Philosophy, Technology, Science & Nature, Psychology, Habits & Focus, Classics, Sci-Fi, and History.</li>
          <li><strong>The Book of the Week Spotlight:</strong> Dynamic algorithmic spotlight highlighting weekly classics with synopsis and quick-start timer.</li>
          <li><strong>Instant Cover Fallback:</strong> HTML5 Canvas generates authentic clothbound book covers when remote cover images are missing.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Open Library API Integration</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 13: FEATURE 5 - COMMONPLACE FEED
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Feature Spotlight 05</span>
      <span class="slide-number">13 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Social Marginalia & Commonplace Feed</h2>
      <p class="slide-subtitle">Sharing passages and reflections with strictly verified human engagement</p>
      <div class="hero-card" style="border-left: 6px solid #10b981;">
        <div style="font-size: 16pt; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
          High-Signal Literary Exchange with Zero Fake Numbers
        </div>
        <p style="font-size: 11pt; color: #cbd5e1; line-height: 1.65; margin-bottom: 16px;">
          In <code style="color: #34d399; font-family: 'JetBrains Mono';">PostCard.tsx</code> and <code style="color: #34d399; font-family: 'JetBrains Mono';">feedStore.ts</code>, readers publish book quotes, ratings, and chapter takeaways. Likes and comments are calculated from actual relational database rows.
        </p>
        <ul class="feature-points">
          <li><strong>Honest Zero States:</strong> If a passage has zero likes, it explicitly says <code style="font-family: 'JetBrains Mono'; color: #94a3b8;">"No likes yet"</code> instead of generating fake bots.</li>
          <li><strong>One-Click Passage Stash:</strong> Bookmark passages shared by other readers directly into your private <code style="font-family: 'JetBrains Mono'; color: #38bdf8;">Saved Passages</code> commonplace book.</li>
          <li><strong>Spring Micro-Interactions:</strong> Delightful animated counters and spring-bounce physics upon upvoting.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Social Architecture: Real Engagement</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 14: FEATURE 6 - LIVE SANCTUARY
       ===================================================================== -->
  <div class="slide slide-purple">
    <div class="slide-header">
      <span class="pill-theme" style="color: #c084fc; border-color: rgba(192, 132, 252, 0.3); background: rgba(192, 132, 252, 0.12);">Feature Spotlight 06</span>
      <span class="slide-number">14 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Live Co-Reading Sanctuary</h2>
      <p class="slide-subtitle">Quiet digital solidarity: seeing fellow readers reading across the globe in real time</p>
      <div class="hero-card" style="border-left: 6px solid #c084fc;">
        <div style="font-size: 16pt; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
          Real-Time WebSocket Presence via Supabase Channels
        </div>
        <p style="font-size: 11pt; color: #cbd5e1; line-height: 1.65; margin-bottom: 16px;">
          Engineered in <code style="color: #c084fc; font-family: 'JetBrains Mono';">coReadingService.ts</code> and <code style="color: #c084fc; font-family: 'JetBrains Mono';">SanctuaryView.tsx</code>, the sanctuary connects readers without invasive video calls or noisy chat rooms.
        </p>
        <ul class="feature-points">
          <li><strong>Presence Broadcast:</strong> When your reading timer starts, your presence joins the global sanctuary heartbeat.</li>
          <li><strong>Calm Peer Visibility:</strong> See that 14 other readers are currently reading <em>Meditations</em> or <em>Atomic Habits</em> right now.</li>
          <li><strong>Gentle Motivation:</strong> Quiet companionship that eliminates the solitary feeling of reading without social fatigue.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Real-Time Presence System</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 15: FEATURE 7 - BOOKSHELF & STREAKS
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Feature Spotlight 07</span>
      <span class="slide-number">15 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Digital Bookshelf & Streak Analytics</h2>
      <p class="slide-subtitle">Visualizing personal milestones and compounding reading momentum</p>
      <div class="hero-card" style="border-left: 6px solid #10b981;">
        <div style="font-size: 16pt; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
          Reader Progression Tiers from Novice to Master of Tomes
        </div>
        <p style="font-size: 11pt; color: #cbd5e1; line-height: 1.65; margin-bottom: 16px;">
          In <code style="color: #34d399; font-family: 'JetBrains Mono';">BookshelfView.tsx</code> and <code style="color: #34d399; font-family: 'JetBrains Mono';">AnalyticsView.tsx</code>, readers track reading statuses (<code style="color: #38bdf8;">want_to_read</code>, <code style="color: #fbbf24;">reading</code>, <code style="color: #34d399;">completed</code>) and observe their habit compounding.
        </p>
        <ul class="feature-points">
          <li><strong>Automated Streak Calculations:</strong> Consecutively logged reading days automatically advance user streaks.</li>
          <li><strong>Rank Tiers:</strong> Earn authentic rank promotions: <em>Novice Reader</em> ➔ <em>Bookworm</em> ➔ <em>Avid Reader</em> ➔ <em>Literary Scholar</em> ➔ <em>Master of Tomes</em>.</li>
          <li><strong>Private Margins Stash:</strong> Distinct separation between public shared reflections and private reading marginalia.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Personal Analytics & Bookshelf</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 16: TECH ARCHITECTURE OVERVIEW
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Engineering Deep Dive</span>
      <span class="slide-number">16 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">System Architecture Overview</h2>
      <p class="slide-subtitle">A high-performance modern web stack built for zero latency and offline capability</p>
      <div class="hero-card" style="border-left: 6px solid #38bdf8;">
        <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 18px; margin-top: 6px;">
          <div style="background: rgba(15,23,42,0.7); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="color: #34d399; font-weight: 700; font-size: 11pt; margin-bottom: 6px;">1. Client Tier</div>
            <p style="font-size: 9pt; color: #cbd5e1; line-height: 1.5;">
              React 18 + TypeScript + Vite. Chunked asset distribution (<125kB gzip), Zustand state management, Web Audio synthesis, IndexedDB storage.
            </p>
          </div>
          <div style="background: rgba(15,23,42,0.7); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="color: #38bdf8; font-weight: 700; font-size: 11pt; margin-bottom: 6px;">2. Edge & Serverless</div>
            <p style="font-size: 9pt; color: #cbd5e1; line-height: 1.5;">
              Vercel Serverless Functions (`/api/book-file.ts`, `/api/telegram.ts`). Streamed public domain CDN proxying with automatic fallback resolution.
            </p>
          </div>
          <div style="background: rgba(15,23,42,0.7); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);">
            <div style="color: #c084fc; font-weight: 700; font-size: 11pt; margin-bottom: 6px;">3. Cloud Database</div>
            <p style="font-size: 9pt; color: #cbd5e1; line-height: 1.5;">
              Supabase PostgreSQL 15 with strict Row-Level Security (RLS), Realtime WebSockets, automated triggers, and PL/pgSQL ranking functions.
            </p>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Full-Stack Engineering Blueprint</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 17: FRONTEND ENGINEERING
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Frontend Architecture</span>
      <span class="slide-number">17 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Client-Side Architecture & Performance</h2>
      <p class="slide-subtitle">Strict TypeScript validation, sub-second loads, and reactive state stores</p>
      <div class="split-2">
        <div class="hero-card" style="border-left: 6px solid #10b981;">
          <div style="font-size: 15pt; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
            Deterministic State Machines with Zustand
          </div>
          <p style="font-size: 10.5pt; color: #cbd5e1; line-height: 1.6; margin-bottom: 14px;">
            Eliminating unnecessary React re-renders through targeted selectors. State stores (<code style="color: #34d399; font-family: 'JetBrains Mono';">authStore</code>, <code style="color: #34d399; font-family: 'JetBrains Mono';">feedStore</code>, <code style="color: #34d399; font-family: 'JetBrains Mono';">timerStore</code>, <code style="color: #34d399; font-family: 'JetBrains Mono';">readerStore</code>) maintain persistent local state with automatic rehydration sanitizers.
          </p>
          <ul class="feature-points">
            <li>Zero compiler errors with strict <code style="font-family: 'JetBrains Mono'; color: #38bdf8;">tsc -b && vite build</code>.</li>
            <li>Vendor chunk splitting isolating PDF.js, Charts, and Supabase client code.</li>
          </ul>
        </div>
        <div class="code-box">
<span class="comment">// Optimized persistent feed state with auto-sanitization</span>
<span class="keyword">export const</span> <span class="field">useFeedStore</span> = create<FeedStore>()(
  persist((set, get) => ({
    posts: [],
    sortBy: <span class="type">'latest'</span>,
    toggleUpvote: <span class="keyword">async</span> (postId, userId) => {
      <span class="comment">// Optimistic spring UI update</span>
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
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Client Layer Engineering</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 18: EDGE & SERVERLESS
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); background: rgba(56, 189, 248, 0.12);">Edge Infrastructure</span>
      <span class="slide-number">18 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Serverless Edge & CDN Proxying</h2>
      <p class="slide-subtitle">Delivering high-speed book streams while overcoming CORS limitations</p>
      <div class="hero-card" style="border-left: 6px solid #38bdf8;">
        <div style="font-size: 16pt; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
          Self-Contained Edge Proxy (<code style="font-family: 'JetBrains Mono'; color: #38bdf8;">/api/book-file.ts</code>)
        </div>
        <p style="font-size: 11pt; color: #cbd5e1; line-height: 1.65; margin-bottom: 16px;">
          When readers request timeless works from Project Gutenberg or Internet Archive, browser CORS constraints often block direct downloads. Liread's edge proxy streams the files dynamically with gzip chunking and 24-hour edge cache headers.
        </p>
        <ul class="feature-points">
          <li><strong>Dual Repository Fallback:</strong> If an EPUB link fails, the edge handler seamlessly falls back to PDF copies.</li>
          <li><strong>Zero-Dependency Registry:</strong> Integrated public domain catalog resolving timeless books in 0ms.</li>
          <li><strong>Telegram Bot Webhook:</strong> <code style="font-family: 'JetBrains Mono'; color: #34d399;">/api/telegram.ts</code> handles async bot interactions and book fulfillment.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Edge Serverless Layer</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 19: DATABASE ENTITIES
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Database Architecture 01</span>
      <span class="slide-number">19 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Relational Entity Model</h2>
      <p class="slide-subtitle">Clean, normalized PostgreSQL schema modeling the literary domain</p>
      <div class="hero-card" style="border-left: 6px solid #10b981;">
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
        <p style="font-size: 9.5pt; color: #cbd5e1; margin-top: 14px; line-height: 1.5;">
          All models are connected via foreign keys with cascade deletion. Indexes are placed on <code style="font-family: 'JetBrains Mono'; color: #34d399;">(user_id, session_date)</code> and <code style="font-family: 'JetBrains Mono'; color: #34d399;">(post_id)</code> for fast query planning.
        </p>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>PostgreSQL Relational Schema</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 20: DATA INTEGRITY & REAL COUNTS
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Database Architecture 02</span>
      <span class="slide-number">20 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Data Integrity: Verified Real Likes</h2>
      <p class="slide-subtitle">Eliminating fake counters via relational constraints and nested querying</p>
      <div class="hero-card" style="border-left: 6px solid #10b981;">
        <div style="font-size: 16pt; font-weight: 700; color: #ffffff; margin-bottom: 12px;">
          Enforcing Authentic Human Engagement via Relational Tables
        </div>
        <p style="font-size: 11pt; color: #cbd5e1; line-height: 1.65; margin-bottom: 16px;">
          Unlike platforms that manipulate arbitrary integer fields, Liread enforces authentic community engagement:
        </p>
        <ul class="feature-points">
          <li><strong>Relational Uniqueness:</strong> <code style="font-family: 'JetBrains Mono'; color: #38bdf8;">post_upvotes</code> enforces <code style="font-family: 'JetBrains Mono'; color: #34d399;">UNIQUE(post_id, user_id)</code>, strictly guaranteeing that one user can only like a passage once.</li>
          <li><strong>Nested Relation Counting:</strong> Client queries <code style="font-family: 'JetBrains Mono'; color: #38bdf8;">post_upvotes(user_id)</code> directly to compute true real-time upvotes without trusting inflated demo integers.</li>
          <li><strong>Zero Counter Leakage:</strong> When no users have upvoted a post, it strictly displays <strong>0 / "No likes yet"</strong>.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Relational Integrity Guarantees</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 21: AUTOMATIONS & RLS
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Database Architecture 03</span>
      <span class="slide-number">21 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Database Triggers & Row-Level Security</h2>
      <p class="slide-subtitle">Idempotent RLS policies and automated PL/pgSQL event triggers</p>
      <div class="hero-card" style="border-left: 6px solid #10b981;">
        <div class="split-2-equal">
          <div>
            <div style="color: #34d399; font-weight: 700; font-size: 12pt; margin-bottom: 8px;">Automated PL/pgSQL Triggers</div>
            <p style="font-size: 9.5pt; color: #cbd5e1; line-height: 1.6; margin-bottom: 10px;">
              When a user finishes a timer session, <code style="font-family: 'JetBrains Mono'; color: #38bdf8;">on_reading_session_created</code> recalculates continuous daily streaks and promotes the reader's rank tier atomically on the database engine.
            </p>
            <div style="font-size: 8.5pt; color: #94a3b8; font-family: 'JetBrains Mono';">
              EXECUTE FUNCTION handle_reading_session_inserted();
            </div>
          </div>
          <div>
            <div style="color: #38bdf8; font-weight: 700; font-size: 12pt; margin-bottom: 8px;">Strict Row-Level Security (RLS)</div>
            <p style="font-size: 9.5pt; color: #cbd5e1; line-height: 1.6; margin-bottom: 10px;">
              Every table has RLS enabled. Users can only edit or delete their own bookshelf items and marginalia, while public feeds and profiles remain safely accessible via authenticated and guest read policies.
            </p>
            <div style="font-size: 8.5pt; color: #94a3b8; font-family: 'JetBrains Mono';">
              WITH CHECK (auth.uid() = user_id);
            </div>
          </div>
        </div>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Database Automations & RLS</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 22: ROADMAP 1 - AI MARGINALIA
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme">Future Roadmap 01</span>
      <span class="slide-number">22 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Horizon 1: AI Contextual Marginalia</h2>
      <p class="slide-subtitle">Demystifying classic literature inline without breaking reading flow</p>
      <div class="hero-card" style="border-left: 6px solid #10b981;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 17pt; font-weight: 700; color: #ffffff;">Context-Aware Literary Companion & Semantic Search</div>
          <span style="font-family: 'JetBrains Mono'; font-size: 9pt; background: rgba(16,185,129,0.2); color: #6ee7b7; padding: 4px 10px; border-radius: 6px;">Q1 2027</span>
        </div>
        <p style="font-size: 11pt; color: #cbd5e1; line-height: 1.65; margin-bottom: 16px;">
          Reading dense classic philosophy (Marcus Aurelius, Spinoza, Kant) can be intimidating. Horizon 1 introduces on-demand contextual prompts directly inside the reading canvas:
        </p>
        <ul class="feature-points">
          <li><strong>Zero-Spoiler Concept Explanations:</strong> Tap any complex passage for a concise 2-sentence historical and philosophical background briefing.</li>
          <li><strong>Semantic Search Across Saved Marginalia:</strong> Retrieve quotes by concept (e.g. <em>"passages about dealing with anxiety and mortality"</em>) using vector embeddings.</li>
          <li><strong>Archaic Lexicon Translator:</strong> Instant definitions of Victorian and ancient idioms in natural modern prose.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Strategic Horizon 1</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 23: ROADMAP 2 - MICRO-CLUBS
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme" style="color: #38bdf8; border-color: rgba(56, 189, 248, 0.3); background: rgba(56, 189, 248, 0.12);">Future Roadmap 02</span>
      <span class="slide-number">23 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Horizon 2: Asynchronous Micro-Clubs</h2>
      <p class="slide-subtitle">Shared chapter margins and voice annotations with spoiler protection gates</p>
      <div class="hero-card" style="border-left: 6px solid #38bdf8;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 17pt; font-weight: 700; color: #ffffff;">Synchronous Pacing with Asynchronous Freedom</div>
          <span style="font-family: 'JetBrains Mono'; font-size: 9pt; background: rgba(56,189,248,0.2); color: #7dd3fc; padding: 4px 10px; border-radius: 6px;">Q2 2027</span>
        </div>
        <p style="font-size: 11pt; color: #cbd5e1; line-height: 1.65; margin-bottom: 16px;">
          Traditional book clubs struggle with scheduling meetings. Horizon 2 brings collaborative margins to Liread:
        </p>
        <ul class="feature-points">
          <li><strong>Spoiler-Safe Chapter Gates:</strong> Friends' reflections on Chapter 4 only unlock once you finish reading Chapter 4 yourself.</li>
          <li><strong>Audio Voice Marginalia:</strong> Attach 30-second audio thoughts directly to memorable book paragraphs.</li>
          <li><strong>Classroom & Reading Circle Groups:</strong> Dedicated private sanctuaries for university courses and small friend circles.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Strategic Horizon 2</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 24: ROADMAP 3 - HARDWARE SYNC
       ===================================================================== -->
  <div class="slide">
    <div class="slide-header">
      <span class="pill-theme" style="color: #fbbf24; border-color: rgba(251, 191, 36, 0.3); background: rgba(251, 191, 36, 0.12);">Future Roadmap 03</span>
      <span class="slide-number">24 / 26</span>
    </div>
    <div class="content-body">
      <h2 class="slide-title">Horizon 3: Native Mobile & E-Ink Hardware Sync</h2>
      <p class="slide-subtitle">Bridging physical E-readers and mobile devices into the Liread sanctuary</p>
      <div class="hero-card" style="border-left: 6px solid #fbbf24;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <div style="font-size: 17pt; font-weight: 700; color: #ffffff;">Hardware Integration & High-Contrast E-Ink Optimization</div>
          <span style="font-family: 'JetBrains Mono'; font-size: 9pt; background: rgba(251,191,36,0.2); color: #fde68a; padding: 4px 10px; border-radius: 6px;">Q3 2027</span>
        </div>
        <p style="font-size: 11pt; color: #cbd5e1; line-height: 1.65; margin-bottom: 16px;">
          Empowering readers who prefer electronic ink displays or mobile lock-screen widgets:
        </p>
        <ul class="feature-points">
          <li><strong>Kindle & Kobo Integration:</strong> Bi-directional synchronization of annotations and reading progress directly into Liread.</li>
          <li><strong>High-Contrast E-Ink Mode:</strong> Zero-animation, monochrome high-DPI stylesheet optimized for Onyx Boox and Kindle web browsers.</li>
          <li><strong>Lock-Screen Habit Widgets:</strong> iOS Live Activities and Android glanceable widgets displaying today's focus progress.</li>
        </ul>
      </div>
    </div>
    <div class="slide-footer">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Strategic Horizon 3</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 25: CLOSING THESIS
       ===================================================================== -->
  <div class="slide slide-accent" style="text-align: center; align-items: center; justify-content: center;">
    <div style="max-width: 9in;">
      <span class="pill-theme" style="margin-bottom: 24px;">The Liread Thesis</span>
      <div style="font-family: 'Cinzel', Georgia, serif; font-size: 32pt; font-weight: 700; color: #ffffff; line-height: 1.35; margin-bottom: 28px;">
        "Reading is not dying.<br />
        It is simply waiting for a <span style="color: #34d399; font-style: italic;">calm sanctuary</span> to call home."
      </div>
      <p style="font-size: 13pt; color: #cbd5e1; line-height: 1.7; max-width: 7.8in; margin: 0 auto 30px auto;">
        By marrying distraction-free audio engineering, zero-friction library access, and honest human accountability, Liread empowers readers worldwide to reclaim their attention and build lifelong compounding wisdom.
      </p>
    </div>
    <div class="slide-footer" style="width: 100%;">
      <span>Liread Hackathon Deck</span>
      <span class="brand">LIREAD</span>
      <span>Philosophical Synthesis</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 26: CALL TO ACTION & DEMO
       ===================================================================== -->
  <div class="slide" style="text-align: center; align-items: center; justify-content: center;">
    <div style="max-width: 8.5in;">
      <h2 style="font-family: 'Cinzel', serif; font-size: 40pt; font-weight: 900; color: #ffffff; margin-bottom: 14px;">
        Let's Make the World Read Again.
      </h2>
      <p style="font-size: 13pt; color: #94a3b8; margin-bottom: 32px;">
        Experience Liread live right now on your phone or laptop.
      </p>

      <div style="display: flex; justify-content: center; gap: 20px; margin-bottom: 36px;">
        <div style="background: rgba(16, 185, 129, 0.15); border: 2px solid #10b981; padding: 16px 28px; border-radius: 14px; text-align: left;">
          <div style="font-size: 9pt; color: #34d399; font-weight: 700; text-transform: uppercase;">Live Application</div>
          <div style="font-size: 14pt; color: #ffffff; font-weight: 700; font-family: 'JetBrains Mono'; margin-top: 4px;">liread.vercel.app</div>
        </div>
        <div style="background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.15); padding: 16px 28px; border-radius: 14px; text-align: left;">
          <div style="font-size: 9pt; color: #94a3b8; font-weight: 700; text-transform: uppercase;">Source Repository</div>
          <div style="font-size: 14pt; color: #ffffff; font-weight: 700; font-family: 'JetBrains Mono'; margin-top: 4px;">mulukentsegaye/liread-web</div>
        </div>
      </div>

      <div style="font-family: 'Cinzel', serif; font-size: 13pt; color: #34d399; letter-spacing: 0.05em;">
        Thank you! Questions & Live Demonstration
      </div>
    </div>
    <div class="slide-footer" style="width: 100%;">
      <span>Creator: <strong>Muluken Tsegaye</strong></span>
      <span class="brand">LIREAD</span>
      <span>Final Pitch Conclusion</span>
    </div>
  </div>

</body>
</html>
"""

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    
    html_path = os.path.join(project_root, "scratch", "presentation_deck.html")
    pdf_path = os.path.join(project_root, "Liread_Presentation.pdf")
    
    os.makedirs(os.path.dirname(html_path), exist_ok=True)
    
    print("[1/3] Generating 26-slide presentation markup (one concept per slide)...")
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
