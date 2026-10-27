import os
import subprocess
import sys

def build_html_presentation():
    html = """<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<title>Liread — Hackathon Pitch Presentation</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@500;700;900&family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap');

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
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    color: #1e293b;
    background-color: #0f172a;
    line-height: 1.45;
  }

  .slide {
    width: 11in;
    height: 8.5in;
    page-break-after: always;
    position: relative;
    overflow: hidden;
    padding: 0.65in 0.8in;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background: #0f172a;
    color: #f8fafc;
  }

  /* Slide specific background themes */
  .slide-light {
    background: #fafaf9;
    color: #1c1917;
  }

  .slide-dark {
    background: radial-gradient(circle at 15% 20%, #064e3b 0%, #062822 45%, #0a0f1d 100%);
    color: #f8fafc;
  }

  .slide-paper {
    background: #fdfbf7;
    color: #1e293b;
  }

  /* Header elements */
  .slide-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border-bottom: 2px solid rgba(226, 232, 240, 0.15);
    padding-bottom: 0.22in;
    margin-bottom: 0.25in;
  }

  .slide-light .slide-header {
    border-bottom: 2px solid #e7e5e4;
  }

  .slide-title-group h2 {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 26pt;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: #ffffff;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .slide-light .slide-title-group h2 {
    color: #0f172a;
  }

  .slide-title-group p {
    font-size: 11pt;
    color: #94a3b8;
    margin-top: 4px;
    font-weight: 400;
  }

  .slide-light .slide-title-group p {
    color: #64748b;
  }

  .badge-category {
    display: inline-block;
    padding: 6px 14px;
    border-radius: 9999px;
    font-size: 9pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    background: rgba(16, 185, 129, 0.15);
    color: #34d399;
    border: 1px solid rgba(16, 185, 129, 0.3);
  }

  .slide-light .badge-category {
    background: #ecfdf5;
    color: #059669;
    border: 1px solid #a7f3d0;
  }

  /* Slide Footer */
  .slide-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid rgba(226, 232, 240, 0.1);
    padding-top: 0.18in;
    font-size: 9pt;
    color: #64748b;
  }

  .slide-light .slide-footer {
    border-top: 1px solid #e7e5e4;
    color: #94a3b8;
  }

  .slide-footer .brand {
    font-family: 'Cinzel', serif;
    font-weight: 700;
    letter-spacing: 0.05em;
    color: #10b981;
  }

  /* Main content layout helpers */
  .content-body {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .grid-2 {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 0.35in;
  }

  .grid-3 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 0.28in;
  }

  .grid-4 {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    gap: 0.22in;
  }

  /* Card designs */
  .card {
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    padding: 0.25in;
    backdrop-filter: blur(10px);
  }

  .card-light {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    border-radius: 16px;
    padding: 0.25in;
    box-shadow: 0 4px 15px -3px rgba(0, 0, 0, 0.04);
  }

  .card-accent {
    border-left: 4px solid #10b981;
  }

  .card-amber {
    border-left: 4px solid #f59e0b;
  }

  .card-sky {
    border-left: 4px solid #38bdf8;
  }

  .card-rose {
    border-left: 4px solid #f43f5e;
  }

  .card h3 {
    font-size: 13pt;
    font-weight: 700;
    color: #f1f5f9;
    margin-bottom: 8px;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .card-light h3 {
    color: #0f172a;
  }

  .card p {
    font-size: 9.8pt;
    color: #94a3b8;
    line-height: 1.5;
  }

  .card-light p {
    color: #475569;
  }

  /* Metric Stat Callouts */
  .stat-box {
    text-align: center;
    padding: 0.25in;
    border-radius: 16px;
    background: rgba(15, 23, 42, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .slide-light .stat-box {
    background: #ffffff;
    border: 1px solid #e2e8f0;
    box-shadow: 0 4px 12px rgba(0,0,0,0.03);
  }

  .stat-number {
    font-size: 38pt;
    font-weight: 800;
    font-family: 'JetBrains Mono', monospace;
    line-height: 1;
    margin-bottom: 6px;
  }

  .stat-label {
    font-size: 9pt;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    font-weight: 600;
    color: #94a3b8;
  }

  .slide-light .stat-label {
    color: #64748b;
  }

  /* Architecture diagram blocks */
  .arch-diagram {
    display: flex;
    align-items: stretch;
    justify-content: space-between;
    gap: 16px;
    margin-top: 10px;
  }

  .arch-col {
    flex: 1;
    background: rgba(30, 41, 59, 0.7);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 14px;
    padding: 18px;
    display: flex;
    flex-direction: column;
  }

  .arch-col-header {
    font-size: 11pt;
    font-weight: 700;
    color: #34d399;
    margin-bottom: 12px;
    border-bottom: 1px solid rgba(255,255,255,0.08);
    padding-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  .arch-item {
    background: rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(255, 255, 255, 0.06);
    padding: 9px 12px;
    border-radius: 8px;
    margin-bottom: 8px;
    font-size: 9pt;
    color: #e2e8f0;
  }

  .arch-item strong {
    color: #ffffff;
    display: block;
    margin-bottom: 2px;
    font-size: 9.5pt;
  }

  .arch-arrow {
    display: flex;
    align-items: center;
    color: #34d399;
    font-size: 18pt;
    font-weight: bold;
  }

  /* Database table pill preview */
  .schema-table-card {
    background: rgba(15, 23, 42, 0.75);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 14px;
    font-size: 8.8pt;
  }

  .schema-table-name {
    font-family: 'JetBrains Mono', monospace;
    font-weight: 700;
    color: #38bdf8;
    margin-bottom: 8px;
    font-size: 9.5pt;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .schema-table-tag {
    font-size: 7.5pt;
    background: rgba(56, 189, 248, 0.15);
    color: #38bdf8;
    padding: 2px 6px;
    border-radius: 4px;
  }

  .schema-field {
    color: #94a3b8;
    margin-bottom: 4px;
    display: flex;
    justify-content: space-between;
  }

  .schema-field .fname {
    font-family: 'JetBrains Mono', monospace;
    color: #f1f5f9;
  }

  .schema-field .ftype {
    color: #64748b;
    font-size: 8pt;
  }

  /* List styles */
  .feature-list {
    list-style: none;
  }

  .feature-list li {
    position: relative;
    padding-left: 20px;
    margin-bottom: 8px;
    font-size: 9.5pt;
    color: #cbd5e1;
  }

  .feature-list li::before {
    content: "✦";
    position: absolute;
    left: 0;
    color: #10b981;
    font-size: 10pt;
  }

  /* Title Slide Unique Styling */
  .title-slide {
    background: radial-gradient(circle at 75% 30%, #064e3b 0%, #042f24 40%, #09101d 85%);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    padding: 1in 1.2in;
  }

  .title-logo {
    font-family: 'Cinzel', serif;
    font-size: 64pt;
    font-weight: 900;
    letter-spacing: -0.02em;
    color: #ffffff;
    line-height: 1;
    margin-bottom: 0.15in;
    text-shadow: 0 4px 20px rgba(0,0,0,0.5);
  }

  .title-tagline {
    font-family: 'Cinzel', serif;
    font-size: 22pt;
    color: #34d399;
    font-weight: 500;
    line-height: 1.35;
    max-width: 8.5in;
    margin-bottom: 0.3in;
  }

  .title-subtext {
    font-size: 12pt;
    color: #94a3b8;
    max-width: 7in;
    line-height: 1.6;
    margin-bottom: 0.45in;
  }

  .title-meta {
    display: flex;
    gap: 18px;
    align-items: center;
  }

  .pill-hackathon {
    background: rgba(16, 185, 129, 0.2);
    border: 1px solid #10b981;
    color: #6ee7b7;
    padding: 8px 18px;
    border-radius: 9999px;
    font-weight: 600;
    font-size: 10pt;
    letter-spacing: 0.05em;
  }

  .pill-stack {
    background: rgba(255, 255, 255, 0.08);
    border: 1px solid rgba(255, 255, 255, 0.15);
    color: #e2e8f0;
    padding: 8px 18px;
    border-radius: 9999px;
    font-size: 10pt;
  }

  /* Summary Slide Unique Styling */
  .summary-slide {
    background: radial-gradient(circle at 50% 50%, #064e3b 0%, #022c22 55%, #050a14 100%);
    text-align: center;
    align-items: center;
    justify-content: center;
  }

  .summary-quote {
    font-family: 'Cinzel', Georgia, serif;
    font-size: 32pt;
    font-weight: 700;
    color: #ffffff;
    line-height: 1.3;
    max-width: 8.5in;
    margin-bottom: 0.3in;
  }

  .summary-highlight {
    color: #34d399;
    font-style: italic;
  }

</style>
</head>
<body>

  <!-- =====================================================================
       SLIDE 1: TITLE SLIDE
       ===================================================================== -->
  <div class="slide title-slide">
    <div>
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 16px;">
        <span class="pill-hackathon">🚀 HACKATHON PITCH</span>
        <span class="pill-stack">Web / Open Source / Focus Companion</span>
      </div>
      <h1 class="title-logo">Liread</h1>
      <p class="title-tagline">
        Small daily pages. Massive compounding wisdom.
      </p>
      <p class="title-subtext">
        A calm, distraction-free reading sanctuary with deep-focus timers, procedural ambient soundscapes, offline reading, and mindful community accountability.
      </p>
      <div class="title-meta">
        <div style="font-size: 10pt; color: #cbd5e1;">
          <strong>Creator:</strong> Muluken Tsegaye &nbsp;•&nbsp; 
          <strong>Platform:</strong> Progressive Web App & Cloud Sanctuary
        </div>
      </div>
    </div>
    <div style="font-size: 9pt; color: #64748b; font-family: 'JetBrains Mono', monospace;">
      https://liread.vercel.app &nbsp;•&nbsp; Production Ready
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 2: THE PROBLEM
       ===================================================================== -->
  <div class="slide slide-dark">
    <div class="slide-header">
      <div class="slide-title-group">
        <span class="badge-category">The Crisis of Focus</span>
        <h2>The Modern Reading Dilemma</h2>
        <p>Why deep reading is collapsing in an era of algorithmic distraction</p>
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 10pt; color: #64748b;">
        SLIDE 02 / 08
      </div>
    </div>

    <div class="content-body">
      <!-- Top 3 Stat Cards -->
      <div class="grid-3" style="margin-bottom: 0.3in;">
        <div class="stat-box">
          <div class="stat-number" style="color: #f43f5e;">144m</div>
          <div class="stat-label">Daily algorithmic social screen time</div>
          <p style="font-size: 8.5pt; color: #94a3b8; margin-top: 6px;">Average adult spends 2.4+ hours daily in fragmented feeds.</p>
        </div>
        <div class="stat-box">
          <div class="stat-number" style="color: #f59e0b;">&lt; 14m</div>
          <div class="stat-label">Daily time devoted to deep reading</div>
          <p style="font-size: 8.5pt; color: #94a3b8; margin-top: 6px;">Literary contemplation has plummeted by 40% over the last decade.</p>
        </div>
        <div class="stat-box">
          <div class="stat-number" style="color: #a855f7;">74%</div>
          <div class="stat-label">Abandon books before the halfway mark</div>
          <p style="font-size: 8.5pt; color: #94a3b8; margin-top: 6px;">Notification fatigue and lack of accountability break reading momentum.</p>
        </div>
      </div>

      <!-- Problem Dimensions -->
      <div class="grid-3">
        <div class="card card-rose">
          <h3>⚡ Cognitive Fragmentation</h3>
          <p>Endless notifications and micro-stimuli rewire human attention spans, making sustained, reflective deep reading feel exhausting.</p>
        </div>
        <div class="card card-amber">
          <h3>🏛️ Solitary Isolation</h3>
          <p>Traditional book reading is entirely isolated. There are no friendly, pressure-free accountability systems to sustain daily consistency.</p>
        </div>
        <div class="card card-sky">
          <h3>📦 Siloed Marginalia</h3>
          <p>Brilliant quotes and life-changing perspectives remain trapped in paper margins or proprietary e-readers rather than shared wisdom.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Liread Hackathon Presentation</span>
      <span class="brand">LIREAD</span>
      <span>Problem & Opportunity Space</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 3: THE SOLUTION
       ===================================================================== -->
  <div class="slide slide-dark">
    <div class="slide-header">
      <div class="slide-title-group">
        <span class="badge-category">The Antidote</span>
        <h2>Introducing Liread</h2>
        <p>A serene, mindful sanctuary designed to restore human contemplation</p>
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 10pt; color: #64748b;">
        SLIDE 03 / 08
      </div>
    </div>

    <div class="content-body">
      <div class="grid-2" style="align-items: center; margin-bottom: 0.25in;">
        <div>
          <div style="font-size: 16pt; font-family: 'Cinzel', serif; color: #34d399; margin-bottom: 12px; font-weight: 700;">
            Where Deep Contemplation Meets Community Accountability
          </div>
          <p style="font-size: 10.5pt; color: #cbd5e1; line-height: 1.6; margin-bottom: 16px;">
            Liread is not another bloated social network or gamified tracker. It is a <strong>calm reading sanctuary</strong> engineered from the ground up to protect your attention, compound daily pages into masterworks, and celebrate quiet dedication.
          </p>
          <div style="display: flex; gap: 12px; flex-wrap: wrap;">
            <span style="background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3); padding: 5px 12px; border-radius: 6px; font-size: 8.5pt; font-weight: 600;">✦ Distraction-Free Audio Engine</span>
            <span style="background: rgba(56, 189, 248, 0.15); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.3); padding: 5px 12px; border-radius: 6px; font-size: 8.5pt; font-weight: 600;">✦ Zero-Algorithm Public Feed</span>
            <span style="background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); padding: 5px 12px; border-radius: 6px; font-size: 8.5pt; font-weight: 600;">✦ Real Relational Likes</span>
          </div>
        </div>

        <div style="background: rgba(6, 78, 59, 0.3); border: 1px solid rgba(52, 211, 153, 0.3); border-radius: 16px; padding: 0.3in;">
          <div style="font-size: 12pt; font-weight: 700; color: #ffffff; margin-bottom: 10px;">The Compounding Habit Engine</div>
          <p style="font-size: 9.5pt; color: #cbd5e1; line-height: 1.5; margin-bottom: 12px;">
            Reading just <strong>15 minutes every morning</strong> compounds into:
          </p>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div style="background: rgba(15,23,42,0.6); padding: 10px; border-radius: 8px;">
              <div style="font-size: 18pt; font-weight: 800; color: #34d399; font-family: 'JetBrains Mono', monospace;">18 Books</div>
              <div style="font-size: 8pt; color: #94a3b8; text-transform: uppercase;">Completed masterworks / year</div>
            </div>
            <div style="background: rgba(15,23,42,0.6); padding: 10px; border-radius: 8px;">
              <div style="font-size: 18pt; font-weight: 800; color: #38bdf8; font-family: 'JetBrains Mono', monospace;">109 Hours</div>
              <div style="font-size: 8pt; color: #94a3b8; text-transform: uppercase;">Quiet, notification-free focus</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 3 Pillar Pillars -->
      <div class="grid-3">
        <div class="card card-accent">
          <h3>1. Focused Immersion</h3>
          <p>Built-in Pomodoro & open reading timers paired with client-side synthesized ambient white noise, rain, and fireplace sounds.</p>
        </div>
        <div class="card card-sky">
          <h3>2. Zero-Friction Library</h3>
          <p>Instant access to millions of classic and public domain masterworks via Open Library & Project Gutenberg with offline reader.</p>
        </div>
        <div class="card card-amber">
          <h3>3. Mindful Commonplace</h3>
          <p>Capture marginalia, quote gems, and takeaways. Real upvotes from real human readers without fake bots or algorithmic doom loops.</p>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Liread Hackathon Presentation</span>
      <span class="brand">LIREAD</span>
      <span>Platform Vision & Solution</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 4: CORE FEATURES
       ===================================================================== -->
  <div class="slide slide-dark">
    <div class="slide-header">
      <div class="slide-title-group">
        <span class="badge-category">Codebase Deep Dive</span>
        <h2>Core Product Capabilities</h2>
        <p>Key interactive features built into the Liread application</p>
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 10pt; color: #64748b;">
        SLIDE 04 / 08
      </div>
    </div>

    <div class="content-body">
      <div class="grid-3" style="margin-bottom: 0.22in;">
        <!-- Feature 1 -->
        <div class="card card-accent">
          <h3>⏱️ Distraction-Free Timer</h3>
          <p style="margin-bottom: 8px;">Full-screen HUD timer with customizable daily goals (15m, 30m, 60m), real-time progress arcs, and automatic streak incrementation.</p>
          <ul class="feature-list">
            <li>Floating bottom timer sync</li>
            <li>Daily streak calculation triggers</li>
          </ul>
        </div>

        <!-- Feature 2 -->
        <div class="card card-sky">
          <h3>🎧 Procedural Ambient Audio</h3>
          <p style="margin-bottom: 8px;">Zero audio files downloaded. Pure Web Audio API oscillators synthesize authentic rain, fireplace crackles, deep space, and birdsong.</p>
          <ul class="feature-list">
            <li>100% offline synthesis</li>
            <li>Real-time frequency visualizer</li>
          </ul>
        </div>

        <!-- Feature 3 -->
        <div class="card card-amber">
          <h3>📖 ReadEra Offline Engine</h3>
          <p style="margin-bottom: 8px;">Browser-native EPUB and PDF reader powered by IndexedDB. Upload any personal document and read offline anywhere.</p>
          <ul class="feature-list">
            <li>EPUB flow rendering + PDF.js</li>
            <li>Persistent reading bookmark & zoom</li>
          </ul>
        </div>
      </div>

      <div class="grid-3">
        <!-- Feature 4 -->
        <div class="card card-accent">
          <h3>🌐 Dynamic Catalog & Spotlights</h3>
          <p style="margin-bottom: 8px;">Integrated Open Library API search across 14 curated genres, automated book cover rendering, and weekly algorithmic book spotlights.</p>
          <ul class="feature-list">
            <li>Dual in-memory / session caching</li>
            <li>Instant 0ms public domain downloads</li>
          </ul>
        </div>

        <!-- Feature 5 -->
        <div class="card card-rose">
          <h3>💬 Social Commonplace Feed</h3>
          <p style="margin-bottom: 8px;">Share inspiring book passages and personal reflections. Strictly real upvotes and comments with explicit zero states ("No likes yet").</p>
          <ul class="feature-list">
            <li>One-click passage bookmarking</li>
            <li>Rich reader profiles & follow network</li>
          </ul>
        </div>

        <!-- Feature 6 -->
        <div class="card card-sky">
          <h3>🕯️ Live Co-Reading Sanctuary</h3>
          <p style="margin-bottom: 8px;">Real-time Supabase Presence channels show fellow readers immersed in books worldwide, fostering quiet solidarity without pressure.</p>
          <ul class="feature-list">
            <li>Real-time presence heartbeat</li>
            <li>Daily & weekly reading leaderboards</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Liread Hackathon Presentation</span>
      <span class="brand">LIREAD</span>
      <span>Implemented Architecture Features</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 5: TECHNICAL ARCHITECTURE
       ===================================================================== -->
  <div class="slide slide-dark">
    <div class="slide-header">
      <div class="slide-title-group">
        <span class="badge-category">System Engineering</span>
        <h2>Technical Architecture</h2>
        <p>Modern, responsive, and type-safe full-stack web architecture</p>
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 10pt; color: #64748b;">
        SLIDE 05 / 08
      </div>
    </div>

    <div class="content-body">
      <!-- Architecture 3-Column Diagram -->
      <div class="arch-diagram" style="margin-bottom: 0.25in;">
        <!-- Col 1: Frontend Client -->
        <div class="arch-col" style="border-top: 3px solid #10b981;">
          <div class="arch-col-header">Client Layer (React 18 + Vite)</div>
          <div class="arch-item">
            <strong>React 18 & TypeScript</strong>
            Strict type safety, zero compile warnings, component modularity.
          </div>
          <div class="arch-item">
            <strong>Zustand State Store</strong>
            Lightweight stores (`authStore`, `feedStore`, `timerStore`, `readerStore`) with persistent middleware.
          </div>
          <div class="arch-item">
            <strong>Tailwind CSS & Tokens</strong>
            Fluid responsive layout, dark/light theme variables, custom typography.
          </div>
          <div class="arch-item">
            <strong>Web Audio & Canvas Engine</strong>
            Procedural ambient sound generator and dynamic clothbound cover canvas renderer.
          </div>
        </div>

        <div class="arch-arrow">➔</div>

        <!-- Col 2: Communication & Edge Layer -->
        <div class="arch-col" style="border-top: 3px solid #38bdf8;">
          <div class="arch-col-header">Edge & API Gateway</div>
          <div class="arch-item">
            <strong>Vercel Serverless Functions</strong>
            `/api/book-file.ts`: Streaming public domain EPUB/PDF CDN proxy with fallback resolution.
          </div>
          <div class="arch-item">
            <strong>Open Library REST APIs</strong>
            Querying `/subjects`, `/works`, and `/search` with debounced abort controllers.
          </div>
          <div class="arch-item">
            <strong>Telegram Bot Gateway</strong>
            `/api/telegram.ts`: Webhook bridge for community book deliveries.
          </div>
          <div class="arch-item">
            <strong>IndexedDB (ReadEra Storage)</strong>
            Client-side offline document caching for zero-latency reader loads.
          </div>
        </div>

        <div class="arch-arrow">➔</div>

        <!-- Col 3: Cloud & Database -->
        <div class="arch-col" style="border-top: 3px solid #a855f7;">
          <div class="arch-col-header">Backend (Supabase Cloud)</div>
          <div class="arch-item">
            <strong>PostgreSQL 15 Database</strong>
            Relational schema with foreign keys, cascade deletes, and automated triggers.
          </div>
          <div class="arch-item">
            <strong>Supabase Auth & RLS</strong>
            Row-level security policies guarding user reads/writes with zero-leak protection.
          </div>
          <div class="arch-item">
            <strong>Realtime Engine (WebSockets)</strong>
            Live presence for co-reading sanctuary and instant post upvote sync.
          </div>
          <div class="arch-item">
            <strong>PL/pgSQL Functions (RPC)</strong>
            Atomic streak computation and leaderboard window ranking (`DENSE_RANK()`).
          </div>
        </div>
      </div>

      <!-- Highlights Footer Row -->
      <div class="grid-3">
        <div style="background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 10px 14px; border-radius: 10px; font-size: 8.8pt; color: #a7f3d0;">
          <strong>⚡ Sub-Second Cold Starts:</strong> Vite asset splitting generates chunked bundles under 125kB gzip.
        </div>
        <div style="background: rgba(56, 189, 248, 0.1); border: 1px solid rgba(56, 189, 248, 0.2); padding: 10px 14px; border-radius: 10px; font-size: 8.8pt; color: #bae6fd;">
          <strong>🔒 Zero-Leak Security:</strong> No hardcoded secrets, client-side sanitized rate-limit notices, strict RLS.
        </div>
        <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.2); padding: 10px 14px; border-radius: 10px; font-size: 8.8pt; color: #e9d5ff;">
          <strong>📱 PWA & Offline First:</strong> Standalone installable web app capable of reading books without internet.
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Liread Hackathon Presentation</span>
      <span class="brand">LIREAD</span>
      <span>Architecture & Data Flow</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 6: DATABASE ARCHITECTURE
       ===================================================================== -->
  <div class="slide slide-dark">
    <div class="slide-header">
      <div class="slide-title-group">
        <span class="badge-category">Data Modeling</span>
        <h2>Database Architecture & Schema</h2>
        <p>PostgreSQL schema with atomic triggers, RLS policies, and relational integrity</p>
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 10pt; color: #64748b;">
        SLIDE 06 / 08
      </div>
    </div>

    <div class="content-body">
      <!-- 6 Key Schema Tables -->
      <div class="grid-3" style="margin-bottom: 0.22in;">
        <!-- Table 1: profiles -->
        <div class="schema-table-card">
          <div class="schema-table-name">
            <span>profiles</span>
            <span class="schema-table-tag">Core User</span>
          </div>
          <div class="schema-field"><span class="fname">id (PK)</span><span class="ftype">UUID -> auth.users</span></div>
          <div class="schema-field"><span class="fname">username</span><span class="ftype">TEXT UNIQUE</span></div>
          <div class="schema-field"><span class="fname">full_name</span><span class="ftype">TEXT</span></div>
          <div class="schema-field"><span class="fname">total_minutes</span><span class="ftype">INTEGER DEFAULT 0</span></div>
          <div class="schema-field"><span class="fname">current_streak</span><span class="ftype">INTEGER DEFAULT 0</span></div>
          <div class="schema-field"><span class="fname">rank_tier</span><span class="ftype">TEXT (Novice->Master)</span></div>
        </div>

        <!-- Table 2: posts -->
        <div class="schema-table-card">
          <div class="schema-table-name">
            <span>posts</span>
            <span class="schema-table-tag">Marginalia</span>
          </div>
          <div class="schema-field"><span class="fname">id (PK)</span><span class="ftype">UUID DEFAULT gen_random</span></div>
          <div class="schema-field"><span class="fname">user_id (FK)</span><span class="ftype">UUID -> profiles.id</span></div>
          <div class="schema-field"><span class="fname">book_title</span><span class="ftype">TEXT NOT NULL</span></div>
          <div class="schema-field"><span class="fname">quote_text</span><span class="ftype">TEXT</span></div>
          <div class="schema-field"><span class="fname">upvotes_count</span><span class="ftype">INTEGER (Synced)</span></div>
          <div class="schema-field"><span class="fname">comments_count</span><span class="ftype">INTEGER (Synced)</span></div>
        </div>

        <!-- Table 3: reading_sessions -->
        <div class="schema-table-card">
          <div class="schema-table-name">
            <span>reading_sessions</span>
            <span class="schema-table-tag">Time Tracking</span>
          </div>
          <div class="schema-field"><span class="fname">id (PK)</span><span class="ftype">UUID DEFAULT gen_random</span></div>
          <div class="schema-field"><span class="fname">user_id (FK)</span><span class="ftype">UUID -> profiles.id</span></div>
          <div class="schema-field"><span class="fname">book_title</span><span class="ftype">TEXT NOT NULL</span></div>
          <div class="schema-field"><span class="fname">duration_mins</span><span class="ftype">INTEGER NOT NULL</span></div>
          <div class="schema-field"><span class="fname">session_date</span><span class="ftype">DATE NOT NULL</span></div>
          <div class="schema-field"><span class="fname">created_at</span><span class="ftype">TIMESTAMPTZ</span></div>
        </div>
      </div>

      <div class="grid-3" style="margin-bottom: 0.22in;">
        <!-- Table 4: post_upvotes -->
        <div class="schema-table-card">
          <div class="schema-table-name">
            <span>post_upvotes</span>
            <span class="schema-table-tag">Relational Likes</span>
          </div>
          <div class="schema-field"><span class="fname">id (PK)</span><span class="ftype">UUID</span></div>
          <div class="schema-field"><span class="fname">post_id (FK)</span><span class="ftype">UUID -> posts.id</span></div>
          <div class="schema-field"><span class="fname">user_id (FK)</span><span class="ftype">UUID -> profiles.id</span></div>
          <div class="schema-field"><span class="fname">UNIQUE</span><span class="ftype">(post_id, user_id)</span></div>
          <div style="font-size: 7.8pt; color: #34d399; margin-top: 4px;">Enforces one upvote per user.</div>
        </div>

        <!-- Table 5: bookshelf -->
        <div class="schema-table-card">
          <div class="schema-table-name">
            <span>bookshelf</span>
            <span class="schema-table-tag">Personal Shelf</span>
          </div>
          <div class="schema-field"><span class="fname">id (PK)</span><span class="ftype">UUID</span></div>
          <div class="schema-field"><span class="fname">user_id (FK)</span><span class="ftype">UUID -> profiles.id</span></div>
          <div class="schema-field"><span class="fname">title & author</span><span class="ftype">TEXT NOT NULL</span></div>
          <div class="schema-field"><span class="fname">status</span><span class="ftype">want_to_read | reading | done</span></div>
          <div class="schema-field"><span class="fname">progress_pct</span><span class="ftype">INTEGER DEFAULT 0</span></div>
        </div>

        <!-- Table 6: saved_posts -->
        <div class="schema-table-card">
          <div class="schema-table-name">
            <span>saved_posts</span>
            <span class="schema-table-tag">Stash</span>
          </div>
          <div class="schema-field"><span class="fname">id (PK)</span><span class="ftype">UUID</span></div>
          <div class="schema-field"><span class="fname">user_id (FK)</span><span class="ftype">UUID -> profiles.id</span></div>
          <div class="schema-field"><span class="fname">post_id (FK)</span><span class="ftype">UUID -> posts.id</span></div>
          <div class="schema-field"><span class="fname">UNIQUE</span><span class="ftype">(user_id, post_id)</span></div>
          <div style="font-size: 7.8pt; color: #38bdf8; margin-top: 4px;">Private bookmarked passage stash.</div>
        </div>
      </div>

      <!-- Trigger & RPC Banner -->
      <div style="background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 12px 18px; display: flex; justify-content: space-between; align-items: center; font-size: 9pt;">
        <div>
          <strong style="color: #34d399;">⚡ Automated Triggers:</strong>
          <span style="color: #cbd5e1;"> `on_reading_session_created` auto-computes streaks & upgrades rank tiers. Upvote & comment changes atomically sync counter caches.</span>
        </div>
        <div style="color: #94a3b8; font-family: 'JetBrains Mono', monospace; font-size: 8.5pt;">
          RLS: Strictly Enforced
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Liread Hackathon Presentation</span>
      <span class="brand">LIREAD</span>
      <span>Relational Schema & DB Automations</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 7: FUTURE ROADMAP
       ===================================================================== -->
  <div class="slide slide-dark">
    <div class="slide-header">
      <div class="slide-title-group">
        <span class="badge-category">Strategic Evolution</span>
        <h2>Future Roadmap</h2>
        <p>Three high-impact horizons expanding the Liread ecosystem</p>
      </div>
      <div style="font-family: 'JetBrains Mono', monospace; font-size: 10pt; color: #64748b;">
        SLIDE 07 / 08
      </div>
    </div>

    <div class="content-body">
      <div class="grid-3" style="gap: 0.35in;">
        <!-- Phase 1 -->
        <div class="card" style="border-top: 4px solid #10b981; background: rgba(30, 41, 59, 0.8);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-size: 9pt; font-family: 'JetBrains Mono', monospace; color: #34d399; font-weight: 700;">HORIZON 1</span>
            <span style="font-size: 8pt; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 2px 8px; border-radius: 4px;">Q1 2027</span>
          </div>
          <h3 style="font-size: 14pt; margin-bottom: 12px; color: #ffffff;">
            🤖 AI Contextual Marginalia & Semantic Search
          </h3>
          <p style="font-size: 9.5pt; color: #cbd5e1; line-height: 1.6; margin-bottom: 16px;">
            Context-aware AI companion running on user-directed prompts to demystify complex philosophy, define archaic terms, and surface connections across saved passages without leaving the page.
          </p>
          <ul class="feature-list">
            <li>Zero-spoiler chapter synthesis</li>
            <li>Vector embedding search across your marginalia</li>
            <li>Etymology & philosophical background cards</li>
          </ul>
        </div>

        <!-- Phase 2 -->
        <div class="card" style="border-top: 4px solid #38bdf8; background: rgba(30, 41, 59, 0.8);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-size: 9pt; font-family: 'JetBrains Mono', monospace; color: #38bdf8; font-weight: 700;">HORIZON 2</span>
            <span style="font-size: 8pt; background: rgba(56, 189, 248, 0.2); color: #7dd3fc; padding: 2px 8px; border-radius: 4px;">Q2 2027</span>
          </div>
          <h3 style="font-size: 14pt; margin-bottom: 12px; color: #ffffff;">
            👥 Asynchronous Micro-Clubs & Shared Margins
          </h3>
          <p style="font-size: 9.5pt; color: #cbd5e1; line-height: 1.6; margin-bottom: 16px;">
            Collaborative reading circles where book clubs read the same masterwork simultaneously. Readers can reveal each other's margins and audio voice notes strictly after finishing the chapter.
          </p>
          <ul class="feature-list">
            <li>Spoiler-safe chapter gates</li>
            <li>Voice memo marginalia attachments</li>
            <li>Private book circles for friend groups & classes</li>
          </ul>
        </div>

        <!-- Phase 3 -->
        <div class="card" style="border-top: 4px solid #f59e0b; background: rgba(30, 41, 59, 0.8);">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
            <span style="font-size: 9pt; font-family: 'JetBrains Mono', monospace; color: #fbbf24; font-weight: 700;">HORIZON 3</span>
            <span style="font-size: 8pt; background: rgba(245, 158, 11, 0.2); color: #fde68a; padding: 2px 8px; border-radius: 4px;">Q3 2027</span>
          </div>
          <h3 style="font-size: 14pt; margin-bottom: 12px; color: #ffffff;">
            📱 Native Mobile & E-Ink Hardware Sync
          </h3>
          <p style="font-size: 9.5pt; color: #cbd5e1; line-height: 1.6; margin-bottom: 16px;">
            Direct two-way synchronization with dedicated e-readers (Kindle, Kobo, Boox) and high-contrast e-ink web companion mode, alongside native iOS/Android offline widgets.
          </p>
          <ul class="feature-list">
            <li>Bi-directional Kindle highlight imports</li>
            <li>Ultra-low power monochrome E-Ink layout mode</li>
            <li>Lock-screen reading streak widgets</li>
          </ul>
        </div>
      </div>
    </div>

    <div class="slide-footer">
      <span>Liread Hackathon Presentation</span>
      <span class="brand">LIREAD</span>
      <span>Platform Growth & Future Vision</span>
    </div>
  </div>


  <!-- =====================================================================
       SLIDE 8: SUMMARY & CLOSING
       ===================================================================== -->
  <div class="slide summary-slide">
    <div style="max-width: 9in;">
      <span class="badge-category" style="margin-bottom: 24px;">The Liread Mission</span>
      <h2 class="summary-quote">
        "Reading is not dying — it is simply waiting for a <span class="summary-highlight">calm, distraction-free sanctuary</span> to call home."
      </h2>

      <p style="font-size: 13pt; color: #cbd5e1; line-height: 1.7; margin-bottom: 0.4in; max-width: 7.5in; margin-left: auto; margin-right: auto;">
        By fusing deep-focus ambient technology, open literary access, and mindful human accountability, <strong>Liread</strong> empowers readers worldwide to reclaim their attention and build lifetime compounding wisdom.
      </p>

      <div style="display: flex; justify-content: center; gap: 20px; align-items: center; margin-bottom: 0.35in;">
        <div style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; padding: 12px 24px; border-radius: 12px; font-size: 11pt; color: #ffffff;">
          <strong>Live Web Application:</strong> liread.vercel.app
        </div>
        <div style="background: rgba(255, 255, 255, 0.08); border: 1px solid rgba(255, 255, 255, 0.15); padding: 12px 24px; border-radius: 12px; font-size: 11pt; color: #ffffff;">
          <strong>Open Source GitHub:</strong> mulukentsegaye/liread-web
        </div>
      </div>

      <div style="font-size: 12pt; font-family: 'Cinzel', serif; color: #34d399; letter-spacing: 0.05em;">
        Thank you for your time & consideration. Let's make the world read again.
      </div>
    </div>

    <div class="slide-footer" style="width: 100%;">
      <span>Liread Hackathon Pitch</span>
      <span class="brand">LIREAD</span>
      <span>Presentation Conclusion</span>
    </div>
  </div>

</body>
</html>
"""
    return html

def main():
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.abspath(os.path.join(script_dir, ".."))
    
    html_path = os.path.join(project_root, "scratch", "presentation.html")
    pdf_path = os.path.join(project_root, "Liread_Presentation.pdf")
    
    os.makedirs(os.path.dirname(html_path), exist_ok=True)
    
    # Write presentation HTML
    print("[1/3] Generating HTML Presentation markup...")
    with open(html_path, "w", encoding="utf-8") as f:
        f.write(build_html_presentation())
    print(f"      HTML written to: {html_path}")
    
    # Render PDF using Microsoft Edge headless
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
