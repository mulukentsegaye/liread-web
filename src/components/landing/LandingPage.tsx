import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  ChevronRight, 
  ArrowRight, 
  Check, 
  Bookmark, 
  BarChart3, 
  Feather,
  Star,
  Compass,
  Library,
  Quote,
  SlidersHorizontal,
  Flame,
  Trophy
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAmbientAudioStore } from '../../stores/ambientAudioStore';
import { AmbientSoundId } from '../../types/theme';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenTimer?: () => void;
  onGoToLogin?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenTimer, onGoToLogin }) => {
  const { vibeConfig } = useTheme();
  const { 
    isPlaying, 
    activeSoundId, 
    togglePlay, 
    play, 
    pause, 
    volume, 
    setVolume, 
    isMuted, 
    toggleMute 
  } = useAmbientAudioStore();

  const soundOptions: Array<{ id: AmbientSoundId; label: string; icon: string; desc: string }> = [
    { id: 'birds', label: 'Morning Songbirds', icon: '🕊️', desc: 'Light forest morning breeze' },
    { id: 'rain', label: 'Window Rain', icon: '🌧️', desc: 'Soft droplets against window glass' },
    { id: 'fireplace', label: 'Hearth Fireplace', icon: '🔥', desc: 'Crackling cedar in a library' },
    { id: 'deep-space', label: 'Cosmic Resonance', icon: '🌌', desc: 'Hypnotic low-frequency focus drone' },
  ];

  const handleSelectSound = async (soundId: AmbientSoundId) => {
    if (activeSoundId === soundId && isPlaying) {
      pause();
    } else {
      await play(soundId);
    }
  };

  return (
    <div 
      className="min-h-screen w-full transition-colors duration-500 overflow-x-clip flex flex-col justify-between selection:bg-vibe-accent/20 selection:text-vibe-accent"
      style={{
        backgroundColor: 'var(--vibe-bg)',
        color: 'var(--vibe-ink)',
      }}
    >
      
      {/* ==============================================================================
          1. STICKY EDITORIAL TOP NAVIGATION
          ============================================================================== */}
      <header className="sticky top-0 z-40 w-full bg-vibe-card/85 backdrop-blur-md border-b border-vibe-border px-4 sm:px-6 lg:px-12 py-3.5 transition-colors duration-500">
        <div className="w-full flex items-center justify-between gap-4">
          
          {/* Logo & Manifesto link */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-vibe-accent flex items-center justify-center text-white shadow-xs transition-transform active:scale-95">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-vibe-ink">
                Readers Hub
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide text-vibe-ink-secondary">
            <a href="#features" className="hover:text-vibe-accent transition-colors">
              Features
            </a>
            <a href="#soundscapes" className="hover:text-vibe-accent transition-colors">
              Atmospheric Audio
            </a>
            <a href="#quotes" className="hover:text-vibe-accent transition-colors">
              Philosophy
            </a>
          </nav>

          {/* Right Action Stack: Enter App Button & Login */}
          <div className="flex items-center gap-2 sm:gap-3">

            {onGoToLogin && (
              <button
                type="button"
                onClick={onGoToLogin}
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-all border border-vibe-border shadow-xs active:scale-95"
              >
                <span>Log In</span>
              </button>
            )}

            <button
              onClick={onEnterApp}
              className="group flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full text-xs font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover transition-all shadow-xs active:scale-95"
            >
              <span>Enter App</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>

        </div>
      </header>

      {/* ==============================================================================
          2. HERO SECTION: EDITORIAL HEADLINE & ATMOSPHERIC SHOWCASE
          ============================================================================== */}
      <section className="relative w-full pt-12 sm:pt-20 pb-16 sm:pb-24 px-4 sm:px-6 lg:px-12 flex flex-col items-center text-center">
        {/* Editorial Title */}
        <h1 className="max-w-4xl text-3xl sm:text-5xl lg:text-6xl font-serif font-normal tracking-tight text-vibe-ink leading-[1.15] sm:leading-[1.12] mb-6">
          Where deep reading meets <br />
          <span className="italic font-serif font-medium text-vibe-accent">
            aesthetic focus.
          </span>
        </h1>

        {/* Lead Subtitle */}
        <p className="max-w-2xl text-sm sm:text-base lg:text-lg text-vibe-ink-secondary leading-relaxed font-normal mb-8 sm:mb-10">
          Cultivate a calm, distraction-free reading habit with atmospheric generative soundscapes, 
          curated multi-theme aesthetics inspired by Kinfolk and archival libraries, and mindful reflection tools.
        </p>

        {/* Action Button Group */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto mb-12 sm:mb-16">
          <button
            onClick={onEnterApp}
            className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2.5"
          >
            <span>Launch Your Reading Space</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {onGoToLogin && (
            <button
              onClick={onGoToLogin}
              className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-semibold bg-vibe-card hover:bg-vibe-card-subtle text-vibe-ink border border-vibe-border transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Sign In to Account</span>
              <ChevronRight className="w-4 h-4 text-vibe-ink-muted" />
            </button>
          )}

          <button
            onClick={() => {
              const el = document.getElementById('features');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-semibold bg-vibe-card-subtle hover:bg-vibe-card text-vibe-ink-secondary hover:text-vibe-ink border border-vibe-border-subtle transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Explore Features</span>
          </button>
        </div>

      </section>

      {/* ==============================================================================
          3. CORE PRODUCT PILLARS & FEATURES
          ============================================================================== */}
      <section id="features" className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-12 border-t border-vibe-border">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-vibe-accent block mb-2">
              Engineered For Immersion
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-normal text-vibe-ink tracking-tight mb-4">
              Everything You Need to Read More Deeply
            </h2>
            <p className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed">
              No distracting ads, no infinite dopamine doom-scrolling. Just pure focus, literary connection, and timeless tools.
            </p>
          </div>

          {/* Bento-Style 4 Pillar Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Feature 1: Distraction-Free Timer */}
            <div className="p-6 sm:p-8 rounded-3xl bg-vibe-card border border-vibe-border shadow-xs hover:shadow-md transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
                <Clock className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-vibe-ink tracking-tight">
                Distraction-Free Immersion Timer
              </h3>
              <p className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed">
                Step into a full-screen reading state with a gentle stopwatch, customizable interval chimes, and instant session logging. Every second spent in a book quietly adds to your daily goals.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-vibe-ink-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-vibe-accent" />
                  <span>Full-screen Zen mode with dark room compatibility</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-vibe-accent" />
                  <span>Persistent mini HUD bar while browsing the feed</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-vibe-accent" />
                  <span>Integrated with ambient background audio loops</span>
                </li>
              </ul>
            </div>

            {/* Feature 2: Generative Atmospheric Soundscapes (Merged Interactive Audio) */}
            <div id="soundscapes" className="p-6 sm:p-8 rounded-3xl bg-vibe-card border border-vibe-border shadow-xs hover:shadow-md transition-all space-y-4 group">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
                  <Volume2 className="w-6 h-6" />
                </div>
                {isPlaying && (
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Live Audio
                    </span>
                    <button
                      type="button"
                      onClick={toggleMute}
                      title={isMuted ? 'Unmute' : 'Mute'}
                      className="p-1 rounded-lg text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors"
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold text-vibe-ink tracking-tight">
                  Atmospheric Soundscape Engine
                </h3>
                <p className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed mt-1">
                  Drown out distractions with looping ambient audio engineered for reading immersion. Tap any soundscape to preview live:
                </p>
              </div>

              {/* 4 Interactive Audio Tracks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {soundOptions.map((sound) => {
                  const isThisPlaying = activeSoundId === sound.id && isPlaying;
                  return (
                    <button
                      key={sound.id}
                      type="button"
                      onClick={() => handleSelectSound(sound.id)}
                      className={`px-3 py-2 rounded-xl text-left border text-xs font-medium transition-all flex items-center justify-between gap-2 active:scale-98 ${
                        isThisPlaying
                          ? 'border-vibe-accent bg-vibe-accent-subtle text-vibe-accent font-semibold ring-1 ring-vibe-accent/30 shadow-xs'
                          : 'border-vibe-border bg-vibe-card-subtle hover:bg-vibe-card text-vibe-ink hover:border-vibe-border'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="text-base">{sound.icon}</span>
                        <span className="truncate text-[11px]">{sound.label}</span>
                      </div>
                      <div className="flex-shrink-0">
                        {isThisPlaying ? (
                          <div className="w-5 h-5 rounded-full bg-vibe-accent text-white flex items-center justify-center">
                            <Pause className="w-2.5 h-2.5" />
                          </div>
                        ) : (
                          <div className="w-5 h-5 rounded-full border border-vibe-border flex items-center justify-center text-vibe-ink-muted group-hover:text-vibe-ink">
                            <Play className="w-2.5 h-2.5 ml-0.5" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Volume Slider when active */}
              {isPlaying && (
                <div className="flex items-center gap-3 pt-2 border-t border-vibe-border-subtle text-xs text-vibe-ink-muted">
                  <span className="text-[11px]">Volume</span>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={isMuted ? 0 : volume}
                    onChange={(e) => setVolume(parseFloat(e.target.value))}
                    className="w-24 accent-vibe-accent cursor-pointer h-1.5 bg-vibe-border rounded-lg"
                  />
                  <span className="font-mono text-[10px]">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
                </div>
              )}
            </div>

            {/* Feature 3: Digital Bookshelf & Saved Passages */}
            <div className="p-6 sm:p-8 rounded-3xl bg-vibe-card border border-vibe-border shadow-xs hover:shadow-md transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-vibe-ink tracking-tight">
                Digital Bookshelf & Saved Quotes
              </h3>
              <p className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed">
                Preserve memorable lines and marginalia with literary serif cards. Build your digital personal library, track reading progress percentages, and revisit kept quotes anytime.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-vibe-ink-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-vibe-accent" />
                  <span>Formatted passage cards with page numbers & book jackets</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-vibe-accent" />
                  <span>One-click bookmarking into your private saved stash</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-vibe-accent" />
                  <span>Share insights with a community of serious readers</span>
                </li>
              </ul>
            </div>

            {/* Feature 4: Mindful Analytics & Gentle Streaks */}
            <div className="p-6 sm:p-8 rounded-3xl bg-vibe-card border border-vibe-border shadow-xs hover:shadow-md transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-vibe-ink tracking-tight">
                Gentle Analytics & Habit Streaks
              </h3>
              <p className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed">
                Track your consistency with elegant circular gauges, 7-day and 30-day bar charts, and friendly community leaderboards designed to inspire rather than create burnout.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-vibe-ink-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-vibe-accent" />
                  <span>Customizable daily minute goals (30m, 60m, 90m)</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-vibe-accent" />
                  <span>Weekly reading rankings with fellow literature lovers</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-vibe-accent" />
                  <span>Privacy-first offline localStorage persistence</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </section>

      {/* ==============================================================================
          5. PHILOSOPHY & LITERARY QUOTES
          ============================================================================== */}
      <section id="quotes" className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-12 border-t border-vibe-border">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          
          <div className="w-10 h-10 rounded-full bg-vibe-accent-subtle text-vibe-accent mx-auto flex items-center justify-center">
            <Feather className="w-5 h-5" />
          </div>

          <blockquote className="font-serif italic text-xl sm:text-2xl lg:text-3xl text-vibe-ink leading-relaxed max-w-3xl mx-auto font-normal">
            “When I think of all the books still left for me to read, I have the certainty of being still happy.”
          </blockquote>

          <div className="space-y-1">
            <p className="text-sm font-bold text-vibe-ink tracking-wide">Jules Renard</p>
            <p className="text-xs text-vibe-ink-muted">French Author & Dramatist</p>
          </div>

        </div>
      </section>

      {/* ==============================================================================
          7. FINAL HIGH-IMPACT CALL TO ACTION
          ============================================================================== */}
      <section className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-12 border-t border-vibe-border relative overflow-hidden">
        <div className="max-w-3xl mx-auto rounded-3xl border border-vibe-border bg-vibe-card p-8 sm:p-14 text-center shadow-xl space-y-6">
          <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-vibe-accent block">
            Begin Your Ritual
          </span>

          <h2 className="text-2xl sm:text-4xl font-serif font-normal text-vibe-ink tracking-tight">
            Reclaim your attention. <br />
            <span className="italic text-vibe-accent">One page at a time.</span>
          </h2>

          <p className="text-xs sm:text-sm text-vibe-ink-secondary max-w-lg mx-auto leading-relaxed">
            A quiet, distraction-free space to turn your daily reading into an intentional art form. 
            Free, private, and distraction-free forever.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onEnterApp}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover transition-all shadow-md active:scale-95 flex items-center justify-center gap-2"
            >
              <span>Launch Readers Hub</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <p className="text-[11px] text-vibe-ink-muted">
            No credit card required · Zero algorithms · Immediate access
          </p>
        </div>

      </section>

      {/* ==============================================================================
          8. EDITORIAL FOOTER
          ============================================================================== */}
      <footer className="w-full py-10 px-4 sm:px-6 lg:px-12 border-t border-vibe-border bg-vibe-card text-xs text-vibe-ink-muted transition-colors duration-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-vibe-accent flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-4 h-4" />
            </div>
            <span className="font-serif text-base font-bold text-vibe-ink">Readers Hub</span>
            <span className="text-[11px]">© 2026 Readers Hub Inc. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
            <a href="#features" className="hover:text-vibe-ink transition-colors">Features</a>
            <a href="#soundscapes" className="hover:text-vibe-ink transition-colors">Audio</a>
            {onGoToLogin && (
              <button 
                onClick={onGoToLogin} 
                className="hover:text-vibe-ink transition-colors font-medium"
              >
                Log In
              </button>
            )}
            <button 
              onClick={onEnterApp} 
              className="font-semibold text-vibe-accent hover:underline"
            >
              Enter App →
            </button>
          </div>

        </div>
      </footer>

    </div>
  );
};
