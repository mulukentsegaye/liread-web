import React, { useState } from 'react';
import { 
  BookOpen, 
  Sparkles, 
  Clock, 
  Compass, 
  Volume2, 
  VolumeX, 
  Play, 
  Pause, 
  Flame, 
  ChevronRight, 
  ArrowRight, 
  Check, 
  Star, 
  SlidersHorizontal, 
  Bookmark, 
  BarChart3, 
  Library, 
  Layers, 
  Moon, 
  Sun,
  ShieldCheck,
  Feather,
  Quote
} from 'lucide-react';
import { useTheme, DEFAULT_VIBE } from '../../context/ThemeContext';
import { useAmbientAudioStore } from '../../stores/ambientAudioStore';
import { VibeTriggerButton } from '../theme/VibeTriggerButton';
import { AmbientSoundId, AMBIENT_SOUNDS, VibeId, VibeConfig, ThemeMode } from '../../types/theme';

interface LandingPageProps {
  onEnterApp: () => void;
  onOpenTimer?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onEnterApp, onOpenTimer }) => {
  const { vibe, allVibes, setVibe, vibeConfig, openPopover } = useTheme();
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

  const [activeTabAesthetic, setActiveTabAesthetic] = useState<ThemeMode>(vibe);

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

  const handleVibeSelect = (id: ThemeMode) => {
    setVibe(id);
    setActiveTabAesthetic(id);
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
              <span className="hidden sm:inline-block ml-2 text-[10px] uppercase tracking-widest font-mono font-semibold px-2 py-0.5 rounded-full bg-vibe-card-subtle text-vibe-ink-muted border border-vibe-border">
                Sanctuary
              </span>
            </div>
          </div>

          {/* Center Navigation Links (Hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-semibold tracking-wide text-vibe-ink-secondary">
            <a href="#vibes" className="hover:text-vibe-accent transition-colors">
              Multi-Theme Vibes
            </a>
            <a href="#features" className="hover:text-vibe-accent transition-colors">
              Reading Sanctuary
            </a>
            <a href="#soundscapes" className="hover:text-vibe-accent transition-colors">
              Atmospheric Audio
            </a>
            <a href="#quotes" className="hover:text-vibe-accent transition-colors">
              Philosophy
            </a>
          </nav>

          {/* Right Action Stack: Vibe Selector & Enter App Button */}
          <div className="flex items-center gap-2 sm:gap-3">
            <VibeTriggerButton variant="header" />

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
        
        {/* Subtle Ambient Radial Glow */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-40 -z-10"
          style={{
            background: 'radial-gradient(1000px 500px at 50% 20%, var(--vibe-accent) 0%, transparent 70%)',
            filter: 'blur(90px)',
          }}
        />

        {/* Top Tagline Pill */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-vibe-card border border-vibe-border shadow-xs text-xs font-medium text-vibe-ink-secondary mb-6 sm:mb-8 animate-in fade-in duration-500">
          <Sparkles className="w-3.5 h-3.5 text-vibe-accent" />
          <span>The Digital Sanctuary for Deep Reading</span>
          <span className="w-1 h-1 rounded-full bg-vibe-border" />
          <span className="text-vibe-accent font-semibold">{vibeConfig.name}</span>
        </div>

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

          <button
            onClick={() => {
              const el = document.getElementById('vibes');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded-full text-sm font-semibold bg-vibe-card hover:bg-vibe-card-subtle text-vibe-ink border border-vibe-border transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <span>Explore 9 Visual Vibes</span>
            <ChevronRight className="w-4 h-4 text-vibe-ink-muted" />
          </button>
        </div>

        {/* Social Proof & Literary Metric Strip */}
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12 py-3 px-6 rounded-2xl bg-vibe-card/60 border border-vibe-border text-xs text-vibe-ink-secondary mb-16 shadow-xs">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-1.5">
              <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 border border-emerald-500/30 flex items-center justify-center text-[10px] font-bold">MP</span>
              <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-600 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold">RR</span>
              <span className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-600 border border-indigo-500/30 flex items-center justify-center text-[10px] font-bold">AM</span>
            </div>
            <span className="font-medium text-vibe-ink">12,000+</span> Mindful Readers
          </div>

          <div className="hidden sm:block w-px h-4 bg-vibe-border" />

          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-vibe-accent" />
            <span className="font-medium text-vibe-ink">1.4M+</span> Minutes Logged
          </div>

          <div className="hidden sm:block w-px h-4 bg-vibe-border" />

          <div className="flex items-center gap-1.5">
            <div className="flex text-amber-500">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className="w-3 h-3 fill-current" />
              ))}
            </div>
            <span className="font-medium text-vibe-ink">4.9/5</span> Pure Reading Focus
          </div>
        </div>

        {/* ==============================================================================
            INTERACTIVE HERO MOCKUP CARD (Live Readers Hub Interface Preview)
            ============================================================================== */}
        <div className="w-full max-w-5xl rounded-3xl border border-vibe-border bg-vibe-card p-3 sm:p-5 shadow-2xl transition-all duration-500 overflow-hidden text-left relative">
          
          {/* Mockup Window Chrome Bar */}
          <div className="flex items-center justify-between pb-3 sm:pb-4 border-b border-vibe-border-subtle mb-4">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-rose-500/60" />
              <span className="w-3 h-3 rounded-full bg-amber-500/60" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <span className="text-[11px] font-mono text-vibe-ink-muted ml-2">readershub.app · Live Preview</span>
            </div>

            {/* Mini Quick Switcher directly on Mockup */}
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-vibe-ink-muted">
              <span>Theme:</span>
              <button
                onClick={() => handleVibeSelect('light')}
                className={`px-2.5 py-0.5 rounded-full border transition-all ${vibe === 'light' ? 'border-vibe-accent bg-vibe-accent text-white font-semibold' : 'border-vibe-border hover:bg-vibe-card-subtle'}`}
              >
                Light Mode
              </button>
              <button
                onClick={() => handleVibeSelect('dark')}
                className={`px-2.5 py-0.5 rounded-full border transition-all ${vibe === 'dark' ? 'border-vibe-accent bg-vibe-accent text-white font-semibold' : 'border-vibe-border hover:bg-vibe-card-subtle'}`}
              >
                Dark Mode
              </button>
            </div>
          </div>

          {/* Mockup Inside Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            
            {/* Left Column: Mini Nav */}
            <div className="hidden lg:block lg:col-span-3 space-y-1.5 p-3 rounded-2xl bg-vibe-card-subtle/50 border border-vibe-border-subtle text-xs">
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-vibe-accent-subtle text-vibe-accent font-semibold">
                <Compass className="w-4 h-4" />
                <span>Discover Feed</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-vibe-ink-secondary hover:text-vibe-ink">
                <Clock className="w-4 h-4" />
                <span>Reading Timer</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-vibe-ink-secondary hover:text-vibe-ink">
                <BarChart3 className="w-4 h-4" />
                <span>Analytics</span>
              </div>
              <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-vibe-ink-secondary hover:text-vibe-ink">
                <Library className="w-4 h-4" />
                <span>My Bookshelf</span>
              </div>

              <div className="pt-3 border-t border-vibe-border-subtle mt-4">
                <div className="p-3 rounded-xl bg-vibe-card border border-vibe-border">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-vibe-ink-muted">Active Vibe</span>
                  <p className="text-xs font-semibold text-vibe-ink mt-0.5">{vibeConfig.name}</p>
                  <p className="text-[10px] text-vibe-ink-muted leading-tight mt-1">{vibeConfig.tagline}</p>
                </div>
              </div>
            </div>

            {/* Center Column: Featured Book Quote & Reflection Card */}
            <div className="lg:col-span-6 space-y-3">
              <div className="p-4 sm:p-5 rounded-2xl bg-vibe-card border border-vibe-border shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img 
                      src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" 
                      alt="Maya Patel" 
                      className="w-8 h-8 rounded-full object-cover ring-1 ring-vibe-border"
                    />
                    <div>
                      <p className="text-xs font-bold text-vibe-ink">Maya Patel</p>
                      <p className="text-[10px] text-vibe-ink-muted">shared a passage · 2h ago</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-vibe-accent-subtle text-vibe-accent border border-vibe-accent/20">
                    Creativity
                  </span>
                </div>

                {/* Book Card Preview */}
                <div className="p-3.5 sm:p-4 rounded-xl bg-vibe-card-subtle border border-vibe-border flex flex-col sm:flex-row gap-3 items-center">
                  <div className="w-20 h-28 bg-vibe-card rounded border border-vibe-border p-2 flex flex-col justify-between text-center flex-shrink-0 shadow-xs">
                    <span className="text-[8px] font-bold uppercase leading-tight line-clamp-2">The Creative Act</span>
                    <span className="w-4 h-4 rounded-full border border-vibe-accent/40 mx-auto" />
                    <span className="text-[7px] text-vibe-ink-muted">Rick Rubin</span>
                  </div>
                  <div className="flex-1">
                    <Quote className="w-4 h-4 text-vibe-accent mb-1 opacity-75" />
                    <blockquote className="font-serif italic text-xs sm:text-sm text-vibe-ink leading-relaxed">
                      “The object isn't to make art, it's to be in that wonderful state which makes art inevitable.”
                    </blockquote>
                    <p className="text-[10px] font-mono text-vibe-ink-muted mt-2">p. 42 · Hardcover</p>
                  </div>
                </div>

                {/* Footer Engagement */}
                <div className="flex items-center justify-between text-[11px] text-vibe-ink-muted pt-1 border-t border-vibe-border-subtle">
                  <span>❤️ 48 Readers inspired</span>
                  <span>💬 12 Reflections</span>
                  <span>🔖 Saved to Bookshelf</span>
                </div>
              </div>

              {/* Floating Mini Sound Player Pill */}
              <div className="p-3 rounded-full bg-vibe-card border border-vibe-border shadow-xs flex items-center justify-between px-4">
                <div className="flex items-center gap-2.5">
                  <button 
                    onClick={togglePlay}
                    className="w-7 h-7 rounded-full bg-vibe-accent text-white flex items-center justify-center hover:bg-vibe-accent-hover transition-colors"
                  >
                    {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                  <div>
                    <span className="text-xs font-semibold text-vibe-ink block leading-tight">
                      {soundOptions.find(s => s.id === activeSoundId)?.label || 'Atmospheric Audio'}
                    </span>
                    <span className="text-[10px] text-vibe-ink-muted">
                      {isPlaying ? 'Playing Ambient Soundscape' : 'Click Play to Listen'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <span className={`w-1 h-3 rounded-full bg-vibe-accent ${isPlaying ? 'animate-pulse' : 'opacity-40'}`} />
                  <span className={`w-1 h-4 rounded-full bg-vibe-accent ${isPlaying ? 'animate-pulse delay-75' : 'opacity-40'}`} />
                  <span className={`w-1 h-2 rounded-full bg-vibe-accent ${isPlaying ? 'animate-pulse delay-150' : 'opacity-40'}`} />
                </div>
              </div>

            </div>

            {/* Right Column: Mini Goal & Streak Widget */}
            <div className="lg:col-span-3 space-y-3">
              <div className="p-4 rounded-2xl bg-vibe-card border border-vibe-border shadow-xs text-center space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-vibe-ink">Daily Goal</span>
                  <SlidersHorizontal className="w-3.5 h-3.5 text-vibe-ink-muted" />
                </div>

                <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="48" cy="48" r="40" stroke="currentColor" strokeWidth="6" className="text-vibe-border" fill="transparent" />
                    <circle 
                      cx="48" 
                      cy="48" 
                      r="40" 
                      stroke="currentColor" 
                      strokeWidth="6" 
                      strokeDasharray="251.2" 
                      strokeDashoffset="40" 
                      strokeLinecap="round" 
                      className="text-vibe-accent transition-all duration-700" 
                      fill="transparent" 
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-lg font-bold text-vibe-ink">52</span>
                    <span className="text-[9px] text-vibe-ink-muted">of 60 mins</span>
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-vibe-card-subtle text-[11px] font-medium text-vibe-accent flex items-center justify-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  <span>7-Day Reading Streak!</span>
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-vibe-card border border-vibe-border text-center">
                <button
                  onClick={onEnterApp}
                  className="w-full py-2 rounded-xl bg-vibe-accent text-white text-xs font-semibold hover:bg-vibe-accent-hover transition-colors shadow-xs"
                >
                  Enter Live App →
                </button>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* ==============================================================================
          3. INTERACTIVE MULTI-THEME VIBES SECTION
          ============================================================================== */}
      <section id="vibes" className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-12 border-t border-vibe-border bg-vibe-card-subtle/40 transition-colors duration-500">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-vibe-accent block mb-2">
              Atmospheric Personalization
            </span>
            <h2 className="text-2xl sm:text-4xl font-serif font-normal text-vibe-ink tracking-tight mb-4">
              Light & Dark Reading Modes
            </h2>
            <p className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed">
              Every reader has an optimal environment. Readers Hub switches seamlessly between clean 
              daylight reading and soothing eye-comfort dark mode:
            </p>
          </div>

          {/* Light & Dark Interactive Cards Grid */}
          <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            {allVibes.map((item: VibeConfig) => {
              const isSelected = vibe === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => handleVibeSelect(item.id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleVibeSelect(item.id);
                    }
                  }}
                  className={`group relative text-left p-5 rounded-2xl border transition-all cursor-pointer select-none outline-none ${
                    isSelected
                      ? 'border-vibe-accent ring-2 ring-vibe-accent/25 bg-vibe-card shadow-lg'
                      : 'border-vibe-border bg-vibe-card hover:border-vibe-ink-muted/50 hover:shadow-md'
                  }`}
                >
                  {/* Top Bar: Title, Default Badge, and Checkmark */}
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm sm:text-base text-vibe-ink group-hover:text-vibe-accent transition-colors">
                          {item.name}
                        </span>
                        {item.isDefault && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1 shadow-xs">
                            <Sparkles className="w-2.5 h-2.5" />
                            Default
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded font-medium bg-vibe-card-subtle border border-vibe-border text-vibe-ink-muted">
                          {item.mode === 'dark' ? 'Dark' : 'Light'}
                        </span>
                      </div>
                      <p className="text-xs text-vibe-ink-secondary mt-1 line-clamp-1 font-medium">
                        {item.tagline}
                      </p>
                    </div>

                    <div className="flex-shrink-0">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-vibe-accent text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-vibe-border-subtle group-hover:border-vibe-accent/40 flex items-center justify-center transition-colors">
                          <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-vibe-accent/40" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Visual Color Swatches preview */}
                  <div 
                    className="p-3 rounded-xl border mb-3 overflow-hidden shadow-inner"
                    style={{
                      backgroundColor: item.colors.bg,
                      borderColor: item.colors.border,
                    }}
                  >
                    <div 
                      className="p-2.5 rounded-lg border shadow-xs"
                      style={{
                        backgroundColor: item.colors.card,
                        borderColor: item.colors.border,
                      }}
                    >
                      <p 
                        className="text-[11px] font-serif italic line-clamp-1 mb-1"
                        style={{ color: item.colors.ink }}
                      >
                        “A book is a dream you hold in your hand.”
                      </p>
                      <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: item.colors.borderSubtle }}>
                        <span className="text-[9px]" style={{ color: item.colors.inkMuted }}>Neil Gaiman</span>
                        <span 
                          className="px-2 py-0.5 rounded-full text-[9px] font-medium text-white"
                          style={{ backgroundColor: item.colors.accent }}
                        >
                          Active
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Swatches dots and typography pairing */}
                  <div className="flex items-center justify-between gap-2 pt-2 border-t border-vibe-border-subtle text-xs">
                    <div className="flex items-center gap-1.5">
                      {item.swatches.map((color, idx) => (
                        <div 
                          key={idx} 
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-mono text-vibe-ink-muted truncate max-w-[150px]">
                      {item.typography.uiFont} × {item.typography.quoteFont}
                    </span>
                  </div>

                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ==============================================================================
          4. CORE PRODUCT PILLARS & SANCTUARY FEATURES
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

            {/* Feature 2: Generative Atmospheric Soundscapes */}
            <div className="p-6 sm:p-8 rounded-3xl bg-vibe-card border border-vibe-border shadow-xs hover:shadow-md transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-vibe-ink tracking-tight">
                Atmospheric Soundscape Engine
              </h3>
              <p className="text-xs sm:text-sm text-vibe-ink-secondary leading-relaxed">
                Drown out modern notifications with seamlessly looping binaural audio. Whether you prefer the crackle of a private library hearth or raindrops on a Shibuya coffee shop window.
              </p>
              <ul className="space-y-2 pt-2 text-xs text-vibe-ink-muted">
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-vibe-accent" />
                  <span>Auto-paired soundscapes for each aesthetic theme</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-vibe-accent" />
                  <span>Independent volume controls & mute hotkey</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-3.5 h-3.5 text-vibe-accent" />
                  <span>Lightweight audio synthesis with zero bandwidth lag</span>
                </li>
              </ul>
            </div>

            {/* Feature 3: Digital Bookshelf & Saved Passages */}
            <div className="p-6 sm:p-8 rounded-3xl bg-vibe-card border border-vibe-border shadow-xs hover:shadow-md transition-all space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-vibe-accent-subtle text-vibe-accent flex items-center justify-center">
                <Bookmark className="w-6 h-6" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-vibe-ink tracking-tight">
                Digital Bookshelf & Quote Sanctuary
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
          5. INTERACTIVE AMBIENT SOUNDSCAPE LOUNGE
          ============================================================================== */}
      <section id="soundscapes" className="w-full py-16 sm:py-24 px-4 sm:px-6 lg:px-12 border-t border-vibe-border bg-vibe-card-subtle/30">
        <div className="max-w-4xl mx-auto rounded-3xl border border-vibe-border bg-vibe-card p-6 sm:p-10 shadow-lg text-center space-y-6">
          
          <div className="space-y-2">
            <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-vibe-accent">
              Interactive Audio Lounge
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-normal text-vibe-ink">
              Listen to Readers Hub Soundscapes
            </h2>
            <p className="text-xs sm:text-sm text-vibe-ink-secondary max-w-lg mx-auto">
              Click any atmospheric track below to activate live soothing audio while you explore:
            </p>
          </div>

          {/* Sound buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 max-w-2xl mx-auto text-left">
            {soundOptions.map((sound) => {
              const isThisPlaying = activeSoundId === sound.id && isPlaying;

              return (
                <div
                  key={sound.id}
                  onClick={() => handleSelectSound(sound.id)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handleSelectSound(sound.id);
                    }
                  }}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isThisPlaying
                      ? 'border-vibe-accent bg-vibe-accent-subtle/60 ring-2 ring-vibe-accent/20 shadow-xs'
                      : 'border-vibe-border bg-vibe-card hover:bg-vibe-card-subtle'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-2xl">{sound.icon}</span>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-vibe-ink truncate">{sound.label}</p>
                      <p className="text-[11px] text-vibe-ink-muted truncate">{sound.desc}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    aria-label={`Play ${sound.label}`}
                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-colors ${
                      isThisPlaying ? 'bg-vibe-accent text-white' : 'bg-vibe-card-subtle text-vibe-ink border border-vibe-border'
                    }`}
                  >
                    {isThisPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Volume and Status Strip */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-vibe-border-subtle max-w-md mx-auto text-xs text-vibe-ink-muted">
            <div className="flex items-center gap-2">
              <button 
                onClick={toggleMute} 
                className="hover:text-vibe-ink transition-colors"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-rose-500" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <input 
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-24 accent-vibe-accent cursor-pointer"
              />
              <span className="font-mono text-[11px]">{Math.round((isMuted ? 0 : volume) * 100)}%</span>
            </div>

            <span className="hidden sm:inline">·</span>

            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${isPlaying ? 'bg-emerald-500 animate-pulse' : 'bg-vibe-ink-muted'}`} />
              <span>{isPlaying ? 'Soundscape active' : 'Audio paused'}</span>
            </div>
          </div>

        </div>
      </section>

      {/* ==============================================================================
          6. PHILOSOPHY & LITERARY QUOTES
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
        
        {/* Glow backdrop */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-30 -z-10"
          style={{
            background: 'radial-gradient(800px 400px at 50% 50%, var(--vibe-accent) 0%, transparent 75%)',
            filter: 'blur(100px)',
          }}
        />

        <div className="max-w-3xl mx-auto rounded-3xl border border-vibe-border bg-vibe-card p-8 sm:p-14 text-center shadow-xl space-y-6">
          <span className="text-[11px] font-mono uppercase tracking-widest font-bold text-vibe-accent block">
            Begin Your Ritual
          </span>

          <h2 className="text-2xl sm:text-4xl font-serif font-normal text-vibe-ink tracking-tight">
            Reclaim your attention. <br />
            <span className="italic text-vibe-accent">One page at a time.</span>
          </h2>

          <p className="text-xs sm:text-sm text-vibe-ink-secondary max-w-lg mx-auto leading-relaxed">
            Join thousands of thoughtful readers who have turned daily reading into an art form. 
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
            <a href="#vibes" className="hover:text-vibe-ink transition-colors">Vibes</a>
            <a href="#features" className="hover:text-vibe-ink transition-colors">Sanctuary</a>
            <a href="#soundscapes" className="hover:text-vibe-ink transition-colors">Audio</a>
            <button 
              onClick={() => setVibe(DEFAULT_VIBE)} 
              className="hover:text-vibe-accent transition-colors font-medium"
            >
              Reset Theme
            </button>
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
