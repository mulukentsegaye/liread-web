import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface VibeTriggerButtonProps {
  variant?: 'header' | 'sidebar' | 'compact';
  className?: string;
}

export const VibeTriggerButton: React.FC<VibeTriggerButtonProps> = ({ 
  variant = 'header',
  className = ''
}) => {
  const { isDark, toggleTheme } = useTheme();

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`w-full min-h-[44px] flex items-center justify-center lg:justify-between px-3 lg:px-4 py-2.5 rounded-xl text-sm transition-all text-vibe-ink-secondary hover:bg-vibe-card-subtle hover:text-vibe-ink group ${className}`}
      >
        <div className="flex items-center gap-3.5">
          <div className="relative flex items-center justify-center w-5 h-5">
            {isDark ? (
              <Sun className="w-5 h-5 text-amber-400 group-hover:rotate-45 transition-transform flex-shrink-0" />
            ) : (
              <Moon className="w-5 h-5 text-vibe-ink-muted group-hover:text-vibe-accent transition-colors flex-shrink-0" />
            )}
          </div>
          <span className="hidden lg:inline truncate font-medium">
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-vibe-card border border-vibe-border text-[11px] font-medium text-vibe-ink-muted shadow-xs">
          <span>{isDark ? 'Dark' : 'Light'}</span>
        </div>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        className={`min-w-[40px] min-h-[40px] flex items-center justify-center rounded-full text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle border border-vibe-border transition-colors ${className}`}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-vibe-ink" />
        )}
      </button>
    );
  }

  // Header Variant (default)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      className={`min-h-[40px] px-3 sm:px-3.5 py-1.5 rounded-full flex items-center gap-2 border border-vibe-border bg-vibe-card hover:bg-vibe-card-subtle text-xs font-semibold text-vibe-ink shadow-xs transition-all active:scale-95 ${className}`}
    >
      <div className="relative flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-180 duration-300" />
        ) : (
          <Moon className="w-4 h-4 text-vibe-accent animate-in spin-in-180 duration-300" />
        )}
      </div>

      <span className="hidden sm:inline font-medium">
        {isDark ? 'Light' : 'Dark'}
      </span>
    </button>
  );
};
