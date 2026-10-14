import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  BookMarked, 
  Orbit, 
  Coffee, 
  Leaf, 
  Check, 
  Palette 
} from 'lucide-react';
import { useThemeStore, ThemeId, THEMES } from '../../stores/themeStore';

export const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useThemeStore();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getThemeIcon = (id: ThemeId) => {
    switch (id) {
      case 'dark-academia':
        return <BookMarked className="w-4 h-4 text-[#D4AF37]" />;
      case 'deep-orbit':
        return <Orbit className="w-4 h-4 text-[#00F5D4]" />;
      case 'lofi-cafe':
        return <Coffee className="w-4 h-4 text-[#FF9F1C]" />;
      case 'botanical-zen':
      default:
        return <Leaf className="w-4 h-4 text-[#40916C]" />;
    }
  };

  const activeTheme = THEMES[theme] || THEMES['botanical-zen'];

  return (
    <div className="relative" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch theme vibe"
        className="min-h-[44px] px-3 py-1.5 rounded-full flex items-center gap-2 border transition-all text-xs font-semibold shadow-xs active:scale-95"
        style={{
          backgroundColor: 'var(--bg-surface-glass)',
          borderColor: 'var(--border-subtle)',
          color: 'var(--text-primary)',
          backdropFilter: 'var(--backdrop-blur)',
        }}
        title={`Current Vibe: ${activeTheme.name}`}
      >
        <Palette className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--accent-primary)' }} />
        <span className="hidden sm:inline font-medium truncate max-w-[120px]">
          {activeTheme.name}
        </span>
      </button>

      {/* Popover / Dropdown Menu */}
      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-72 sm:w-80 rounded-2xl p-2.5 shadow-2xl border z-50 animate-in fade-in slide-in-from-top-2 duration-150"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-primary)',
            backdropFilter: 'var(--backdrop-blur)',
            boxShadow: 'var(--accent-glow), 0 20px 25px -5px rgba(0, 0, 0, 0.3)',
          }}
        >
          <div className="px-3 py-2 border-b mb-1 flex items-center justify-between" style={{ borderColor: 'var(--border-subtle)' }}>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Select Reading Vibe
            </span>
            <Sparkles className="w-3.5 h-3.5" style={{ color: 'var(--accent-primary)' }} />
          </div>

          <div className="space-y-1.5">
            {(Object.keys(THEMES) as ThemeId[]).map((id) => {
              const cfg = THEMES[id];
              const isSelected = theme === id;
              return (
                <button
                  key={id}
                  onClick={() => {
                    setTheme(id);
                    setIsOpen(false);
                  }}
                  className={`w-full min-h-[50px] p-2.5 rounded-xl flex items-center justify-between text-left transition-all group ${
                    isSelected ? 'ring-2' : 'hover:opacity-90'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-surface-active)' : 'transparent',
                    boxShadow: isSelected ? '0 0 0 2px var(--accent-primary)' : 'none',
                  }}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {/* Theme Swatch Icon */}
                    <div 
                      className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 shadow-xs border"
                      style={{
                        backgroundColor: cfg.previewBg,
                        borderColor: cfg.previewAccent,
                      }}
                    >
                      {getThemeIcon(id)}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold leading-tight truncate" style={{ color: cfg.previewText }}>
                          {cfg.name}
                        </span>
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: cfg.previewAccent }} />
                        )}
                      </div>
                      <p className="text-[10px] leading-tight truncate text-gray-400 mt-0.5">
                        {cfg.subtitle}
                      </p>
                    </div>
                  </div>

                  {/* Micro Palette preview swatches */}
                  <div className="flex items-center gap-1 flex-shrink-0 pl-2">
                    <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: cfg.previewBg }}></span>
                    <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: cfg.previewAccent }}></span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
