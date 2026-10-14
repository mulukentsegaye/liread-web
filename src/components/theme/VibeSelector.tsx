import React, { useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Check, 
  X, 
  Sun, 
  Moon, 
  Flame, 
  Compass, 
  BookOpen, 
  Layers, 
  RotateCcw,
  Palette,
  Volume2
} from 'lucide-react';
import { useTheme, DEFAULT_VIBE } from '../../context/ThemeContext';
import { VibeConfig, VibeId, THEME_AMBIENT_MAP, AMBIENT_SOUNDS, ThemeId } from '../../types/theme';

interface VibeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VibeSelector: React.FC<VibeSelectorProps> = ({ isOpen, onClose }) => {
  const { vibe, allVibes, setVibe } = useTheme();
  const popoverRef = useRef<HTMLDivElement>(null);

  // Close when pressing Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Close on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node) && isOpen) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-start justify-center sm:items-center p-3 sm:p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="vibe-selector-title"
    >
      <div 
        ref={popoverRef}
        className="relative w-full max-w-2xl bg-vibe-card border border-vibe-border rounded-2xl sm:rounded-3xl shadow-vibe-elevated overflow-hidden animate-in zoom-in-95 duration-200 my-auto max-h-[90vh] flex flex-col transition-colors duration-500"
      >
        
        {/* Popover Header */}
        <div className="flex items-center justify-between px-5 sm:px-7 py-4 sm:py-5 border-b border-vibe-border-subtle bg-vibe-card-subtle/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-vibe-accent/10 border border-vibe-accent/20 flex items-center justify-center text-vibe-accent transition-colors">
              <Palette className="w-5 h-5" />
            </div>
            <div>
              <h2 id="vibe-selector-title" className="text-base sm:text-lg font-bold text-vibe-ink tracking-tight flex items-center gap-2">
                Reading Vibe Selector
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-vibe-accent text-white tracking-wider">
                  Live
                </span>
              </h2>
              <p className="text-xs text-vibe-ink-muted">
                Curated atmospheric aesthetics, palettes & literary typography
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            {vibe !== DEFAULT_VIBE && (
              <button
                type="button"
                onClick={() => setVibe(DEFAULT_VIBE)}
                title="Reset to Nordic Studio"
                className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors border border-vibe-border"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset Default</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close vibe selector"
              className="w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Vibes Grid */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-3.5 sm:space-y-4 max-h-[calc(85vh-140px)]">
          
          <div className="flex items-center justify-between text-xs text-vibe-ink-muted px-1">
            <span>Choose your aesthetic sanctuary:</span>
            <span className="text-[11px] font-mono">Instant 500ms smooth transition</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 sm:gap-4">
            {allVibes.map((item: VibeConfig) => {
              const isSelected = vibe === item.id;

              return (
                <div
                  key={item.id}
                  onClick={() => setVibe(item.id)}
                  tabIndex={0}
                  role="button"
                  aria-pressed={isSelected}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setVibe(item.id);
                    }
                  }}
                  className={`group relative text-left p-4 rounded-2xl border transition-all cursor-pointer select-none outline-none focus:ring-2 focus:ring-vibe-accent/40 ${
                    isSelected
                      ? 'border-vibe-accent ring-2 ring-vibe-accent/25 bg-vibe-card-subtle/80 shadow-md'
                      : 'border-vibe-border hover:border-vibe-ink-muted/40 hover:bg-vibe-card-hover bg-vibe-card shadow-xs'
                  }`}
                >
                  
                  {/* Top Bar: Title, Mode Icon, Active Indicator */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-vibe-ink group-hover:text-vibe-accent transition-colors">
                          {item.name}
                        </span>
                        {item.isDefault && (
                          <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            Default
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.2 rounded font-medium bg-vibe-card border border-vibe-border text-vibe-ink-muted">
                          {item.mode === 'dark' ? 'Dark' : item.mode === 'warm' ? 'Warm' : 'Daylight'}
                        </span>
                      </div>
                      <p className="text-xs text-vibe-ink-secondary mt-0.5 line-clamp-1 font-medium">
                        {item.tagline}
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isSelected ? (
                        <div className="w-6 h-6 rounded-full bg-vibe-accent text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border border-vibe-border-subtle group-hover:border-vibe-accent/40 flex items-center justify-center transition-colors">
                          <div className="w-2 h-2 rounded-full bg-transparent group-hover:bg-vibe-accent/40 transition-colors" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Live Mini Preview Box */}
                  <div 
                    className="p-3 rounded-xl border mb-3 overflow-hidden transition-all shadow-inner"
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
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-1.5">
                          <span 
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: item.colors.accent }}
                          />
                          <span 
                            className="text-[10px] font-semibold"
                            style={{ color: item.colors.ink }}
                          >
                            Readers Hub
                          </span>
                        </div>
                        <span 
                          className="text-[9px] px-1.5 py-0.2 rounded-full font-medium"
                          style={{
                            backgroundColor: item.colors.badgeBg,
                            color: item.colors.badgeText,
                          }}
                        >
                          Quote
                        </span>
                      </div>
                      
                      <p 
                        className="text-[11px] font-serif italic line-clamp-2 leading-tight mb-2"
                        style={{ color: item.colors.inkSecondary }}
                      >
                        “A room without books is like a body without a soul.”
                      </p>

                      <div className="flex items-center justify-between pt-1 border-t" style={{ borderColor: item.colors.borderSubtle }}>
                        <span className="text-[9px]" style={{ color: item.colors.inkMuted }}>
                          Cicero
                        </span>
                        <div 
                          className="px-2 py-0.5 rounded-full text-[9px] font-medium text-white shadow-xs"
                          style={{ backgroundColor: item.colors.accent }}
                        >
                          Read Now
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Swatches & Typography */}
                  <div className="flex items-center justify-between gap-2 pt-1 border-t border-vibe-border-subtle">
                    {/* Color Swatch Dots */}
                    <div className="flex items-center gap-1.5" title="Canvas · Card · Accent · Secondary">
                      {item.swatches.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-4 h-4 rounded-full border border-black/10 shadow-xs ring-1 ring-white/20 transition-transform group-hover:scale-110"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>

                    {/* Font Pairing Pill */}
                    <div className="text-[10px] text-vibe-ink-muted truncate max-w-[160px] font-mono">
                      {item.typography.uiFont} × {item.typography.quoteFont}
                    </div>
                  </div>

                  {/* Paired Ambient Audio Soundscape */}
                  {THEME_AMBIENT_MAP[item.id as ThemeId] && (
                    <div className="flex items-center gap-1.5 text-[10px] font-medium text-vibe-accent mt-1.5 pt-1.5 border-t border-vibe-border-subtle">
                      <Volume2 className="w-3 h-3 flex-shrink-0" />
                      <span className="truncate">
                        Ambient: {AMBIENT_SOUNDS[THEME_AMBIENT_MAP[item.id as ThemeId]].name}
                      </span>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        </div>

        {/* Popover Footer Info */}
        <div className="px-5 sm:px-7 py-3 border-t border-vibe-border-subtle bg-vibe-card-subtle/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-vibe-ink-muted">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Active vibe: <strong className="text-vibe-ink font-semibold">{allVibes.find((v: VibeConfig) => v.id === vibe)?.name}</strong></span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline">Persisted via localStorage & `data-theme`</span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-full bg-vibe-accent text-white font-medium hover:bg-vibe-accent-hover transition-colors shadow-xs"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
