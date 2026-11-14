import React, { useState } from 'react';
import { LireadLogo } from '../ui/LireadLogo';
import { 
  BookOpen, 
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
  Trophy,
  Sparkles,
  Headphones,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAmbientAudioStore } from '../../stores/ambientAudioStore';
import { AmbientSoundId } from '../../types/theme';
import { useAuthStore } from '../../stores/authStore';
import { ReadingImpactCalculator } from './ReadingImpactCalculator';
import { ScrollRevealCard } from './ScrollRevealCard';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenTimer?: () => void;
  onGoToLogin?: () => void;
  onGuest?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenTimer, onGoToLogin, onGuest }) => {
  const { signInAsGuest } = useAuthStore();
  const handleGuest = () => {
    signInAsGuest();
    if (onGuest) onGuest(); else onEnterApp();
  };
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
      data-theme="light"
      className="min-h-screen w-full transition-colors duration-500 overflow-x-clip flex flex-col justify-between bg-vibe-bg"
      style={{
        backgroundColor: 'var(--vibe-bg)',
        color: 'var(--vibe-ink)',
      }}
    >
      
      {/* ==============================================================================
          1. STICKY EDITORIAL TOP NAVIGATION
          ============================================================================== */}
      <header className="fixed top-0 left-0 right-0 z-50 w-full bg-vibe-bg/95 backdrop-blur-md border-b border-vibe-border px-4 sm:px-6 lg:px-12 py-3.5 transition-all duration-300 shadow-xs">
        <div className="w-full flex items-center justify-between gap-4">
          
          {/* Logo & Brand Identity */}
          <div className="flex items-center gap-2.5">
            <LireadLogo size="md" className="transition-transform active:scale-95" />
            <div>
              <span className="font-display text-xl sm:text-2xl font-bold tracking-tight text-vibe-ink">
                Liread
              </span>
            </div>
          </div>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 text-xs font-semibold tracking-wide text-vibe-ink-secondary">
            <a href="#features" className="hover:text-vibe-accent transition-colors">
              Philosophy
            </a>
            <a href="#timer" className="hover:text-vibe-accent transition-colors">
              Zen Timer
            </a>
            <a href="#soundscapes" className="hover:text-vibe-accent transition-colors">
              Soundscapes
            </a>
            <a href="#bookshelf" className="hover:text-vibe-accent transition-colors">
              Bookshelf
            </a>
            <a href="#analytics" className="hover:text-vibe-accent transition-colors">
              Habits
            </a>
            <a href="#calculator" className="hover:text-vibe-accent transition-colors">
              Impact
            </a>
          </nav>

          {/* Right Action Stack: Login / Guest */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              type="button"
              onClick={handleGuest}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-all border border-vibe-border shadow-xs active:scale-95 cursor-pointer"
            >
              <span>Continue as Guest</span>
            </button>

            {onGoToLogin && (
              <button
                type="button"
                onClick={onGoToLogin}
                className="hidden sm:flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover transition-all shadow-xs active:scale-95 cursor-pointer"
              >
                <span>Sign In / Create Account</span>
              </button>
            )}

            {/* Mobile buttons */}
            <button
              type="button"
              onClick={handleGuest}
              className="flex sm:hidden items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-all border border-vibe-border shadow-xs active:scale-95"
            >
              <span>Guest</span>
            </button>

            {onGoToLogin && (
              <button
                type="button"
                onClick={onGoToLogin}
                className="flex sm:hidden items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover transition-all shadow-xs active:scale-95"
              >
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>
      </header>

      {/* ==============================================================================
          2. HERO SECTION: EDITORIAL HEADLINE & LIVE READING DESK
          ============================================================================== */}
      <section className="relative w-full pt-28 sm:pt-36 pb-12 sm:pb-20 px-4 sm:px-6 lg:px-12 flex flex-col items-center text-center">
        
        {/* Subtle pill badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vibe-card border border-vibe-border text-xs text-vibe-ink-secondary mb-6 shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-vibe-accent" />
          <span className="font-medium tracking-wide">The Sanctuary for Intentional Readers</span>
        </div>

        {/* Editorial Title */}
        <h1 className="max-w-4xl text-3xl sm:text-5xl lg:text-6xl font-display font-normal tracking-tight text-vibe-ink leading-[1.15] sm:leading-[1.12] mb-6">
          Where deep reading meets <br />
          <span className="italic font-display font-normal text-vibe-accent">
            aesthetic focus.
          </span>
        </h1>

        {/* Lead Subtitle */}
        <p className="max-w-2xl text-sm sm:text-base lg:text-lg text-vibe-ink-secondary leading-relaxed font-normal mb-8 sm:mb-10">
          A calm, borderless space to read timeless books, listen to synthesized binaural soundscapes, and build lifelong daily reading habits.
        </p>

        {/* Action Button Group */}
        <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full sm:w-auto mb-14 sm:mb-20">
          {onGoToLogin && (
            <button
              onClick={onGoToLogin}
              className="w-full sm:w-auto px-7 py-3.5 rounded-full text-sm font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center justify-center gap-2.5 cursor-pointer"
            >
              <span>Begin Reading Free</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}

          <div className="grid grid-cols-2 gap-2.5 w-full sm:flex sm:w-auto sm:items-center sm:gap-3">
            <button
              onClick={handleGuest}
              className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold bg-vibe-card hover:bg-vibe-card-subtle text-vibe-ink border border-vibe-border transition-all active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xs cursor-pointer"
            >
              <span>Instant Guest Mode</span>
              <ChevronRight className="w-4 h-4 text-vibe-ink-muted hidden xs:inline-block" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById('features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-5 sm:px-6 py-3 sm:py-3.5 rounded-full text-xs sm:text-sm font-semibold bg-vibe-card-subtle hover:bg-vibe-card text-vibe-ink-secondary hover:text-vibe-ink border border-vibe-border-subtle transition-all active:scale-95 flex items-center justify-center gap-1.5 sm:gap-2 shadow-2xs cursor-pointer"
            >
              <span>Explore Features</span>
              <ChevronRight className="w-4 h-4 text-vibe-ink-muted hidden xs:inline-block" />
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------------------------
            THE LIVE READING DESK (Hero Interactive Centerpiece)
            -------------------------------------------------------------------------- */}
        <ScrollRevealCard translateY={48} className="w-full max-w-5xl mx-auto text-left">
          <div className="relative rounded-2xl sm:rounded-3xl border border-vibe-border/80 bg-vibe-card/90 backdrop-blur-md shadow-xl overflow-hidden transition-all duration-300">
            
            {/* Desk Top Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-7 py-3.5 border-b border-vibe-border/70 bg-vibe-card-subtle/50 text-xs">
              <div className="flex items-center gap-2.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-mono text-[11px] font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                  Live Reading Desk
                </span>
                <span className="hidden sm:inline text-vibe-ink-muted">·</span>
                <span className="hidden sm:inline text-vibe-ink-secondary font-medium">
                  Meditations by Marcus Aurelius
                </span>
              </div>

              {/* Soundscape Quick Bar */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-vibe-ink-muted hidden md:inline">Ambient:</span>
                <div className="flex items-center gap-1.5">
                  {soundOptions.map((s) => {
                    const isLive = activeSoundId === s.id && isPlaying;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => handleSelectSound(s.id)}
                        className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition-all flex items-center gap-1.5 border ${
                          isLive 
                            ? 'bg-vibe-accent text-white border-vibe-accent shadow-xs'
                            : 'bg-vibe-bg text-vibe-ink-secondary border-vibe-border hover:text-vibe-ink hover:border-vibe-border'
                        }`}
                        title={s.label}
                      >
                        <span>{s.icon}</span>
                        <span className="hidden lg:inline">{s.label.split(' ')[1] || s.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Desk Body: Broadside Reading Area & Zen Instrument */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-vibe-border/70">
              
              {/* Left (Col 1-7): The Literary Book Broadside */}
              <div className="lg:col-span-7 p-6 sm:p-10 space-y-6">
                <div className="flex items-center justify-between text-xs text-vibe-ink-muted">
                  <span className="font-mono uppercase tracking-widest text-[11px]">Book IV · Chapter III</span>
                  <div className="flex items-center gap-1.5 text-vibe-accent">
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                    <span className="font-mono text-[11px]">Page 48 of 184</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-display text-2xl sm:text-3xl text-vibe-ink font-normal leading-snug tracking-tight">
                    “Nowhere can man find a quieter or more untroubled retreat than in his own soul.”
                  </h3>
                  
                  <p className="font-serif text-sm sm:text-base text-vibe-ink-secondary leading-relaxed">
                    Constantly give yourself this retreat, and renew yourself. Let your basic principles be brief and fundamental, so that at once, when you recur to them, they will be sufficient to cleanse the soul completely.
                  </p>
                </div>

                <div className="pt-2 flex items-center justify-between border-t border-vibe-border/50 text-[11px] text-vibe-ink-muted font-mono">
                  <span>Gregory Hays Translation</span>
                  <span>Focus State: 100% · No Ads</span>
                </div>
              </div>

              {/* Right (Col 8-12): The Zen Immersion Dashboard */}
              <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between bg-vibe-card-subtle/30 space-y-6">
                
                {/* Big Zen Stopwatch */}
                <div className="space-y-2 text-center lg:text-left">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono uppercase tracking-wider text-[11px] text-vibe-ink-muted">Active Session</span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-vibe-accent font-medium">
                      <Clock className="w-3 h-3" />
                      25m Chime In 07:45
                    </span>
                  </div>
                  <div className="font-mono text-4xl sm:text-5xl font-light tracking-tight text-vibe-ink">
                    00:42:15
                  </div>
                  <p className="text-xs text-vibe-ink-secondary">
                    42 of 60 min daily goal fulfilled (70%)
                  </p>
                </div>

                {/* Daily Progress Gauge */}
                <div className="space-y-2">
                  <div className="w-full h-2 rounded-full bg-vibe-border/60 overflow-hidden">
                    <div className="h-full rounded-full bg-vibe-accent transition-all duration-500 w-[70%]" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] font-mono text-vibe-ink-muted">
                    <span>Goal: 60 mins</span>
                    <span className="text-vibe-accent font-semibold">18m to target</span>
                  </div>
                </div>

                {/* Audio Status pill */}
                <div className="p-3 rounded-xl bg-vibe-bg border border-vibe-border/80 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0">
                      <Headphones className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-vibe-ink truncate text-xs">
                        {isPlaying ? soundOptions.find(s => s.id === activeSoundId)?.label : 'Atmospheric Engine'}
                      </p>
                      <p className="text-[10px] text-vibe-ink-muted truncate">
                        {isPlaying ? 'Synthesized binaural loop' : 'Tap any sound to listen'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      if (isPlaying) pause();
                      else play('rain');
                    }}
                    className="px-3 py-1.5 rounded-lg bg-vibe-card hover:bg-vibe-card-subtle text-vibe-ink text-xs font-medium border border-vibe-border transition-colors flex items-center gap-1.5 flex-shrink-0"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isPlaying ? 'Pause' : 'Play Rain'}</span>
                  </button>
                </div>

                {/* Desk CTA */}
                <button
                  type="button"
                  onClick={onEnterApp}
                  className="w-full py-3 rounded-xl bg-vibe-ink text-vibe-bg font-semibold text-xs tracking-wide uppercase hover:opacity-90 transition-opacity flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Open Your Library</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

              </div>

            </div>

          </div>
        </ScrollRevealCard>

      </section>

      {/* ==============================================================================
          3. EDITORIAL MANIFESTO: 3 BORDERLESS ARCHITECTURAL PILLARS
          ============================================================================== */}
      <section id="features" className="w-full scroll-mt-20 py-16 sm:py-24 px-4 sm:px-6 lg:px-12 border-t border-vibe-border">
        <div className="max-w-6xl mx-auto space-y-14">
          
          <ScrollRevealCard translateY={24} className="text-center max-w-2xl mx-auto space-y-3">
            <span className="font-mono text-xs uppercase tracking-widest text-vibe-accent font-semibold">
              The Philosophy
            </span>
            <h2 className="text-2xl sm:text-4xl font-display font-normal text-vibe-ink tracking-tight">
              Crafted for contemplation, not clicks.
            </h2>
            <p className="text-sm sm:text-base text-vibe-ink-secondary leading-relaxed">
              Modern digital reading is plagued by intrusive push alerts, algorithmic feeds, and endless noise. Liread returns to the quiet dignity of a private personal study.
            </p>
          </ScrollRevealCard>

          {/* 3 Borderless Columns with Hairline Dividers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-0 md:divide-x divide-vibe-border">
            
            {/* Pillar 1 */}
            <ScrollRevealCard translateY={32} delayMs={0} className="px-0 md:px-8 first:pl-0 last:pr-0 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl text-vibe-ink font-normal">
                Distraction-Free Immersion
              </h3>
              <p className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed">
                Full-screen zen reading states, subtle interval pacing chimes, and automatic session logging keep your attention rooted entirely in the prose.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-vibe-accent">
                <span>Gentle 25-minute intervals</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </ScrollRevealCard>

            {/* Pillar 2 */}
            <ScrollRevealCard translateY={32} delayMs={80} className="px-0 md:px-8 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl text-vibe-ink font-normal">
                Binaural Ambient Engine
              </h3>
              <p className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed">
                Built-in real-time Web Audio synthesis. Layer rain droplets, library hearths, or morning forest breeze with zero bandwidth cost and zero ads.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-vibe-accent">
                <span>Pure client-side audio</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </ScrollRevealCard>

            {/* Pillar 3 */}
            <ScrollRevealCard translateY={32} delayMs={160} className="px-0 md:px-8 first:pl-0 last:pr-0 space-y-4">
              <div className="w-10 h-10 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
                <Bookmark className="w-5 h-5" />
              </div>
              <h3 className="font-display text-xl text-vibe-ink font-normal">
                Wisdom & Habit Compounding
              </h3>
              <p className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed">
                Capture marginalia passages with beautiful typography plaques. Measure consistency over years without competitive guilt or gamified burnout.
              </p>
              <div className="pt-2 flex items-center gap-2 text-xs font-semibold text-vibe-accent">
                <span>Personal knowledge archive</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            </ScrollRevealCard>

          </div>

        </div>
      </section>

      {/* ==============================================================================
          FEATURE 1: DISTRACTION-FREE IMMERSION TIMER
          ============================================================================== */}
      <section id="timer" className="w-full scroll-mt-20 py-16 sm:py-24 px-4 sm:px-6 lg:px-12 border-t border-vibe-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            
            {/* Left: Text & Editorial Details */}
            <div className="lg:col-span-6 space-y-6">
              <ScrollRevealCard translateY={40}>
                <span className="font-mono text-xs uppercase tracking-widest text-vibe-accent font-semibold">
                  Focus Engineering
                </span>
                <h2 className="text-2xl sm:text-4xl font-display font-normal text-vibe-ink tracking-tight mt-2 mb-4">
                  Distraction-Free Immersion Timer
                </h2>
                <p className="text-sm sm:text-base text-vibe-ink-secondary leading-relaxed mb-6">
                  Step into a deep, sustained reading state with a gentle stopwatch, customizable interval chimes, and instant session logging. Every second spent in a book quietly compounds into your daily goals.
                </p>

                <ul className="space-y-3.5 text-xs sm:text-sm text-vibe-ink-secondary">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Full-screen Zen mode with dark room compatibility and zero interface clutter</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Gentle interval chimes that encourage natural pauses without breaking deep flow</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Instant automatic session logging saved directly into your personal offline storage</span>
                  </li>
                </ul>

                <div className="pt-4">
                  <button
                    type="button"
                    onClick={onOpenTimer || onEnterApp}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-vibe-accent hover:text-vibe-accent-hover transition-colors"
                  >
                    <span>Launch the Zen Timer demo</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </ScrollRevealCard>
            </div>

            {/* Right: Borderless Minimalist Zen Clockwork */}
            <div className="lg:col-span-6">
              <ScrollRevealCard translateY={48} delayMs={120}>
                <div className="relative p-6 sm:p-10 rounded-2xl sm:rounded-3xl border border-vibe-border bg-vibe-card-subtle/40 backdrop-blur-sm space-y-6">
                  
                  {/* Active Header */}
                  <div className="flex items-center justify-between text-xs pb-4 border-b border-vibe-border">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-mono uppercase tracking-wider text-[11px] font-semibold text-vibe-ink">
                        Deep Reading Session
                      </span>
                    </div>
                    <span className="font-mono text-[11px] text-vibe-ink-muted">
                      Interval Chime: Every 25m
                    </span>
                  </div>

                  {/* Book Reference */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-mono uppercase tracking-widest text-vibe-ink-muted">Currently Engaged</p>
                    <h4 className="text-lg sm:text-xl font-display font-medium text-vibe-ink">
                      The Creative Act: A Way of Being
                    </h4>
                    <p className="text-xs text-vibe-ink-secondary">Rick Rubin · Page 142 of 210</p>
                  </div>

                  {/* Monospace Clock Display */}
                  <div className="py-8 px-4 text-center space-y-2 border-y border-vibe-border/70">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-vibe-ink-muted">
                      Elapsed Time
                    </span>
                    <div className="font-mono text-5xl sm:text-6xl font-light tracking-tight text-vibe-ink">
                      00:42:15
                    </div>
                    <div className="flex items-center justify-center gap-2 text-xs text-vibe-accent font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-vibe-accent" />
                      <span>Next chime in 07:45 · 70% of 60m daily goal</span>
                    </div>
                  </div>

                  {/* Linear Pacing Strip */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-vibe-ink-secondary">
                      <span>Daily Rhythm Progress</span>
                      <span className="font-bold text-vibe-ink">42m / 60m</span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-vibe-border overflow-hidden">
                      <div className="h-full rounded-full bg-vibe-accent w-[70%]" />
                    </div>
                  </div>

                  {/* Controls preview */}
                  <div className="flex items-center justify-between text-xs text-vibe-ink-muted pt-2">
                    <span className="flex items-center gap-1.5">
                      <Volume2 className="w-3.5 h-3.5 text-vibe-accent" />
                      Hearth Fireplace in background
                    </span>
                    <span className="font-mono text-[11px]">Auto-saved</span>
                  </div>

                </div>
              </ScrollRevealCard>
            </div>

          </div>
        </div>
      </section>

      {/* ==============================================================================
          FEATURE 2: ATMOSPHERIC SOUNDSCAPE ENGINE
          ============================================================================== */}
      <section id="soundscapes" className="w-full scroll-mt-20 py-16 sm:py-24 px-4 sm:px-6 lg:px-12 border-t border-vibe-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left: The Tactile Soundboard */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <ScrollRevealCard translateY={48} delayMs={120}>
                <div className="p-6 sm:p-9 rounded-2xl sm:rounded-3xl border border-vibe-border bg-vibe-card-subtle/30 space-y-6">
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-display text-lg text-vibe-ink font-medium">Tactile Soundboard</h4>
                      <p className="text-xs text-vibe-ink-muted">Tap to preview soundscapes live</p>
                    </div>

                    {isPlaying && (
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live Synthesizer
                        </span>
                        <button
                          type="button"
                          onClick={toggleMute}
                          title={isMuted ? 'Unmute' : 'Mute'}
                          className="p-1.5 rounded-lg text-vibe-ink-muted hover:text-vibe-ink transition-colors"
                        >
                          {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                  </div>

                  {/* 4 Interactive Audio Tracks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {soundOptions.map((sound) => {
                      const isThisPlaying = activeSoundId === sound.id && isPlaying;
                      return (
                        <button
                          key={sound.id}
                          type="button"
                          onClick={() => handleSelectSound(sound.id)}
                          className={`p-3.5 rounded-xl text-left transition-all flex items-center justify-between gap-3 active:scale-98 cursor-pointer border ${
                            isThisPlaying
                              ? 'border-vibe-accent bg-vibe-card text-vibe-accent ring-1 ring-vibe-accent shadow-xs'
                              : 'border-vibe-border bg-vibe-card hover:bg-vibe-card-subtle text-vibe-ink'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <span className="text-2xl">{sound.icon}</span>
                            <div className="min-w-0">
                              <p className="truncate text-xs font-bold">{sound.label}</p>
                              <p className="text-[10px] text-vibe-ink-muted truncate">{sound.desc}</p>
                            </div>
                          </div>
                          <div className="flex-shrink-0">
                            {isThisPlaying ? (
                              <div className="w-7 h-7 rounded-full bg-vibe-accent text-white flex items-center justify-center">
                                <Pause className="w-3.5 h-3.5" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-full border border-vibe-border bg-vibe-bg flex items-center justify-center text-vibe-ink-muted hover:text-vibe-ink">
                                <Play className="w-3 h-3 ml-0.5" />
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  {/* Volume Slider when active */}
                  {isPlaying ? (
                    <div className="flex items-center gap-3 pt-4 border-t border-vibe-border text-xs text-vibe-ink-muted">
                      <span className="text-[11px] font-mono">Master Volume</span>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={isMuted ? 0 : volume}
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="w-full accent-vibe-accent cursor-pointer h-1.5 bg-vibe-border rounded-lg"
                      />
                      <span className="font-mono text-[11px] font-semibold text-vibe-ink min-w-[32px] text-right">
                        {Math.round((isMuted ? 0 : volume) * 100)}%
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 text-[11px] text-vibe-ink-muted pt-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                      <span>100% native Web Audio · Zero audio files to download</span>
                    </div>
                  )}

                </div>
              </ScrollRevealCard>
            </div>

            {/* Right: Text & Editorial Details */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <ScrollRevealCard translateY={40}>
                <span className="font-mono text-xs uppercase tracking-widest text-vibe-accent font-semibold">
                  Acoustic Design
                </span>
                <h2 className="text-2xl sm:text-4xl font-display font-normal text-vibe-ink tracking-tight mt-2 mb-4">
                  Atmospheric Soundscapes
                </h2>
                <p className="text-sm sm:text-base text-vibe-ink-secondary leading-relaxed mb-6">
                  Drown out distracting street noise, buzzing notifications, and open office chatter with binaural audio. Whether you prefer the warmth of crackling cedar or rainy windowpanes.
                </p>

                <ul className="space-y-3.5 text-xs sm:text-sm text-vibe-ink-secondary">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Procedural noise generators synthesize authentic sounds infinitely without looping seams</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Runs locally in your browser with zero network streaming latency or heavy data usage</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Seamlessly transitions and plays in the background while browsing your bookshelf</span>
                  </li>
                </ul>
              </ScrollRevealCard>
            </div>

          </div>
        </div>
      </section>

      {/* ==============================================================================
          FEATURE 3: DIGITAL BOOKSHELF & MARGINALIA
          ============================================================================== */}
      <section id="bookshelf" className="w-full scroll-mt-20 py-16 sm:py-24 px-4 sm:px-6 lg:px-12 border-t border-vibe-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left: Text & Editorial Details */}
            <div className="lg:col-span-6 space-y-6">
              <ScrollRevealCard translateY={40}>
                <span className="font-mono text-xs uppercase tracking-widest text-vibe-accent font-semibold">
                  Personal Library
                </span>
                <h2 className="text-2xl sm:text-4xl font-display font-normal text-vibe-ink tracking-tight mt-2 mb-4">
                  Digital Bookshelf & Saved Marginalia
                </h2>
                <p className="text-sm sm:text-base text-vibe-ink-secondary leading-relaxed mb-6">
                  Preserve memorable lines, epiphanies, and marginalia as literary serif broadsides. Organize your reading queues, track completion percentages, and revisit kept wisdom anytime.
                </p>

                <ul className="space-y-3.5 text-xs sm:text-sm text-vibe-ink-secondary">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Beautiful passage cards with page references and authentic literary typography</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Personal reading queue with instant percentage and page completion trackers</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Export or share highlights with fellow serious readers without noise or ads</span>
                  </li>
                </ul>
              </ScrollRevealCard>
            </div>

            {/* Right: Broadside Quote & Shelf Preview */}
            <div className="lg:col-span-6 space-y-5">
              
              {/* Literary Broadside Passage */}
              <ScrollRevealCard translateY={44} delayMs={80}>
                <div className="p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-vibe-border bg-vibe-card shadow-md space-y-4 relative">
                  <div className="flex items-center justify-between text-xs text-vibe-accent">
                    <div className="flex items-center gap-1.5 font-semibold">
                      <Quote className="w-4 h-4" />
                      <span>Saved Passage</span>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-vibe-accent-subtle border border-vibe-accent/20 text-[11px] font-medium">
                      In Your Stash
                    </span>
                  </div>

                  <blockquote className="font-display italic text-base sm:text-lg text-vibe-ink leading-relaxed">
                    “The art of reading is in great part that of acquiring a better, deeper understanding of life through the words of others.”
                  </blockquote>

                  <div className="pt-2 border-t border-vibe-border/60 flex items-center justify-between text-xs text-vibe-ink-muted">
                    <span className="font-medium text-vibe-ink-secondary">Virginia Woolf · To the Lighthouse</span>
                    <span className="font-mono text-[11px]">Page 84</span>
                  </div>
                </div>
              </ScrollRevealCard>

              {/* Minimalist Bookshelf Queue */}
              <ScrollRevealCard translateY={44} delayMs={160}>
                <div className="p-5 sm:p-6 rounded-2xl border border-vibe-border bg-vibe-card-subtle/30 space-y-3">
                  <div className="flex items-center justify-between text-xs text-vibe-ink-muted pb-1">
                    <span className="font-mono uppercase tracking-widest text-[11px]">Active Library</span>
                    <span className="font-mono text-[11px]">2 Books In Progress</span>
                  </div>

                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-vibe-ink">The Creative Act</span>
                        <span className="text-vibe-ink-muted"> · Rick Rubin</span>
                      </div>
                      <span className="font-mono font-bold text-vibe-accent">68%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-vibe-border overflow-hidden">
                      <div className="h-full bg-vibe-accent w-[68%]" />
                    </div>

                    <div className="pt-1 flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-vibe-ink">Meditations</span>
                        <span className="text-vibe-ink-muted"> · Marcus Aurelius</span>
                      </div>
                      <span className="font-mono font-bold text-vibe-accent">42%</span>
                    </div>
                    <div className="w-full h-1 rounded-full bg-vibe-border overflow-hidden">
                      <div className="h-full bg-vibe-accent w-[42%]" />
                    </div>
                  </div>
                </div>
              </ScrollRevealCard>

            </div>

          </div>
        </div>
      </section>

      {/* ==============================================================================
          FEATURE 4: GENTLE ANALYTICS & HABIT RHYTHM
          ============================================================================== */}
      <section id="analytics" className="w-full scroll-mt-20 py-16 sm:py-24 px-4 sm:px-6 lg:px-12 border-t border-vibe-border">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">

            {/* Left: Minimalist Habit Rhythm Visualizer */}
            <div className="lg:col-span-6 order-2 lg:order-1">
              <ScrollRevealCard translateY={48} delayMs={120}>
                <div className="p-6 sm:p-9 rounded-2xl sm:rounded-3xl border border-vibe-border bg-vibe-card-subtle/30 space-y-6">
                  
                  {/* Streak & Today's Metric */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-amber-500 font-bold">
                        <Flame className="w-4 h-4 fill-current" />
                        <span>Reading Streak</span>
                      </div>
                      <div className="text-3xl font-mono font-bold text-vibe-ink">7 Days</div>
                      <p className="text-[11px] text-vibe-ink-muted">Personal record this month</p>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs text-vibe-accent font-bold">
                        <Clock className="w-4 h-4" />
                        <span>Today's Time</span>
                      </div>
                      <div className="text-3xl font-mono font-bold text-vibe-ink">52m</div>
                      <p className="text-[11px] text-vibe-ink-muted">87% of 60m daily goal</p>
                    </div>
                  </div>

                  {/* 7-Day Consistency Bars */}
                  <div className="pt-4 border-t border-vibe-border space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-vibe-ink">7-Day Reading Rhythm</span>
                      <span className="font-mono text-[11px] text-vibe-ink-muted">Total: 6.8 hrs</span>
                    </div>

                    <div className="flex items-end justify-between gap-2.5 h-24 pt-3">
                      {[
                        { day: 'Mon', mins: 45, height: '60%' },
                        { day: 'Tue', mins: 60, height: '80%' },
                        { day: 'Wed', mins: 30, height: '40%' },
                        { day: 'Thu', mins: 75, height: '100%' },
                        { day: 'Fri', mins: 50, height: '65%' },
                        { day: 'Sat', mins: 90, height: '100%' },
                        { day: 'Sun', mins: 52, height: '70%', today: true },
                      ].map((item, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                          <div 
                            className={`w-full rounded-md transition-all ${
                              item.today 
                                ? 'bg-vibe-accent shadow-xs' 
                                : 'bg-vibe-accent/60 hover:bg-vibe-accent/80'
                            }`}
                            style={{ height: item.height }}
                            title={`${item.mins} minutes`}
                          />
                          <span className={`text-[10px] font-mono ${item.today ? 'font-bold text-vibe-accent' : 'text-vibe-ink-muted'}`}>
                            {item.day}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Philosophy Footnote */}
                  <div className="pt-2 flex items-center gap-2 text-xs text-vibe-ink-muted">
                    <Feather className="w-3.5 h-3.5 text-vibe-accent flex-shrink-0" />
                    <span>Designed for calm personal mastery without toxic gamification.</span>
                  </div>

                </div>
              </ScrollRevealCard>
            </div>

            {/* Right: Text & Editorial Details */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              <ScrollRevealCard translateY={40}>
                <span className="font-mono text-xs uppercase tracking-widest text-vibe-accent font-semibold">
                  Sustained Consistency
                </span>
                <h2 className="text-2xl sm:text-4xl font-display font-normal text-vibe-ink tracking-tight mt-2 mb-4">
                  Gentle Analytics & Habit Streaks
                </h2>
                <p className="text-sm sm:text-base text-vibe-ink-secondary leading-relaxed mb-6">
                  Build a sustainable lifelong relationship with books. Track reading velocity, visualize weekly rhythms, and celebrate quiet consistency without shame or burnout.
                </p>

                <ul className="space-y-3.5 text-xs sm:text-sm text-vibe-ink-secondary">
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Flexible daily minute targets tailored to your schedule (20m, 45m, or 60m)</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Streak protection and calm insights that encourage steady return to pages</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5" />
                    </div>
                    <span>Zero public judgment: your reading rhythm is entirely your own private affair</span>
                  </li>
                </ul>
              </ScrollRevealCard>
            </div>

          </div>
        </div>
      </section>

      {/* ==============================================================================
          INTERACTIVE ANNUAL READING IMPACT CALCULATOR
          ============================================================================== */}
      <ReadingImpactCalculator onStartHabit={onEnterApp} onContinueGuest={handleGuest} />

      {/* ==============================================================================
          5. PHILOSOPHY & LITERARY QUOTE
          ============================================================================== */}
      <section id="quotes" className="w-full scroll-mt-20 py-20 sm:py-28 px-4 sm:px-6 lg:px-12 border-t border-vibe-border">
        <ScrollRevealCard delayMs={80} className="max-w-4xl mx-auto text-center space-y-8">
          
          <div className="w-10 h-10 rounded-full bg-vibe-accent-subtle text-vibe-accent mx-auto flex items-center justify-center">
            <Feather className="w-5 h-5" />
          </div>

          <blockquote className="font-display italic text-2xl sm:text-3xl lg:text-4xl text-vibe-ink leading-relaxed max-w-3xl mx-auto font-normal">
            “When I think of all the books still left for me to read, I have the certainty of being still happy.”
          </blockquote>

          <div className="space-y-1">
            <p className="text-sm font-bold text-vibe-ink tracking-wide">Jules Renard</p>
            <p className="text-xs text-vibe-ink-muted">French Author & Dramatist</p>
          </div>

        </ScrollRevealCard>
      </section>

      {/* ==============================================================================
          6. FINAL HIGH-IMPACT INVITATION
          ============================================================================== */}
      <section className="w-full py-20 sm:py-28 px-4 sm:px-6 lg:px-12 border-t border-vibe-border text-center">
        <ScrollRevealCard delayMs={80} className="max-w-3xl mx-auto space-y-6">

          <span className="font-mono text-xs uppercase tracking-widest text-vibe-accent font-semibold">
            Begin Your Sanctuary
          </span>

          <h2 className="text-3xl sm:text-5xl font-display font-normal text-vibe-ink tracking-tight">
            Reclaim your attention. <br />
            <span className="italic font-display font-normal text-vibe-accent">One page at a time.</span>
          </h2>

          <p className="text-sm sm:text-base text-vibe-ink-secondary max-w-lg mx-auto leading-relaxed">
            A quiet, distraction-free sanctuary to turn your daily reading into an intentional art form. Free, private, and distraction-free forever.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            {onGoToLogin && (
              <button
                onClick={onGoToLogin}
                className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-vibe-accent text-white hover:bg-vibe-accent-hover transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Create Free Account</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={handleGuest}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full text-sm font-semibold bg-vibe-card text-vibe-ink border border-vibe-border hover:bg-vibe-card-subtle transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue as Guest</span>
              <ChevronRight className="w-4 h-4 text-vibe-ink-muted" />
            </button>
          </div>

          <p className="text-xs text-vibe-ink-muted pt-2">
            No credit card required · Zero algorithms · Immediate offline access
          </p>
        </ScrollRevealCard>
      </section>

      {/* ==============================================================================
          7. EDITORIAL FOOTER
          ============================================================================== */}
      <footer className="w-full py-12 px-4 sm:px-6 lg:px-12 border-t border-vibe-border bg-vibe-bg text-xs text-vibe-ink-muted transition-colors duration-500">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          
          <div className="flex items-center gap-2.5">
            <LireadLogo size="xs" />
            <span className="font-display text-base font-bold text-vibe-ink">Liread</span>
            <span className="text-[11px]">© 2026 Liread. All rights reserved.</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-[11px]">
            <a href="#features" className="hover:text-vibe-ink transition-colors">Philosophy</a>
            <a href="#timer" className="hover:text-vibe-ink transition-colors">Timer</a>
            <a href="#soundscapes" className="hover:text-vibe-ink transition-colors">Soundscapes</a>
            <a href="#bookshelf" className="hover:text-vibe-ink transition-colors">Bookshelf</a>
            <a href="#analytics" className="hover:text-vibe-ink transition-colors">Habits</a>
            <a href="#calculator" className="hover:text-vibe-ink transition-colors">Impact</a>
            <button 
              onClick={handleGuest} 
              className="hover:text-vibe-ink transition-colors font-medium cursor-pointer"
            >
              Guest Mode
            </button>
            {onGoToLogin && (
              <button 
                onClick={onGoToLogin} 
                className="hover:text-vibe-ink transition-colors font-medium cursor-pointer"
              >
                Sign In
              </button>
            )}
          </div>

        </div>
      </footer>

    </div>
  );
};
