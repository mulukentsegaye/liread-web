import React from 'react';
import { Palette, Sparkles, ChevronDown } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface VibeTriggerButtonProps {
  variant?: 'header' | 'sidebar' | 'compact';
  className?: string;
}

export const VibeTriggerButton: React.FC<VibeTriggerButtonProps> = ({ 
  variant = 'header',
  className = ''
}) => {
  const { vibeConfig, togglePopover } = useTheme();

  if (variant === 'sidebar') {
    return (
      <button
        type="button"
        onClick={togglePopover}
        title={`Current Vibe: ${vibeConfig.name} - Click to switch theme vibe`}
        aria-label="Open vibe atmosphere selector"
        className={`w-full min-h-[44px] flex items-center justify-center lg:justify-between px-3 lg:px-4 py-2.5 rounded-xl text-sm transition-all text-vibe-ink-secondary hover:bg-vibe-card-subtle hover:text-vibe-ink group ${className}`}
      >
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <Palette className="w-5 h-5 text-vibe-ink-muted group-hover:text-vibe-accent transition-colors flex-shrink-0" />
            <span 
              className="absolute -top-1 -right-1 w-2 h-2 rounded-full border border-vibe-card ring-1 ring-vibe-border" 
              style={{ backgroundColor: vibeConfig.colors.accent }}
            />
          </div>
          <span className="hidden lg:inline truncate font-medium">Vibe Atmosphere</span>
        </div>

        <div className="hidden lg:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-vibe-card border border-vibe-border text-[11px] font-medium text-vibe-ink-muted">
          <span 
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ backgroundColor: vibeConfig.colors.accent }}
          />
          <span className="truncate max-w-[85px]">{vibeConfig.name}</span>
        </div>
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        type="button"
        onClick={togglePopover}
        title={`Current Vibe: ${vibeConfig.name} - Change Theme Vibe`}
        aria-label="Change theme vibe"
        className={`min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full text-vibe-ink-secondary hover:text-vibe-ink hover:bg-vibe-card-subtle border border-vibe-border transition-colors ${className}`}
      >
        <div className="relative">
          <Palette className="w-4 h-4 text-vibe-accent" />
          <span 
            className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full" 
            style={{ backgroundColor: vibeConfig.colors.secondary }} 
          />
        </div>
      </button>
    );
  }

  // Header default variant: sleek pill with live color swatches and active vibe badge
  return (
    <button
      type="button"
      onClick={togglePopover}
      title={`Active Reading Vibe: ${vibeConfig.name} (${vibeConfig.tagline}) - Click to customize`}
      aria-label="Open reading vibe selector"
      className={`min-h-[40px] flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-vibe-card border border-vibe-border hover:border-vibe-accent/50 hover:bg-vibe-card-hover transition-all shadow-xs group cursor-pointer ${className}`}
    >
      {/* Icon with glowing theme accent */}
      <div 
        className="w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 flex-shrink-0"
        style={{ 
          backgroundColor: vibeConfig.colors.accentSubtle,
          color: vibeConfig.colors.accent 
        }}
      >
        <Sparkles className="w-3.5 h-3.5" />
      </div>

      {/* Vibe Name (Visible on sm+ screens) */}
      <div className="hidden sm:flex flex-col text-left">
        <span className="text-[10px] uppercase font-bold tracking-wider text-vibe-ink-muted leading-none">
          Vibe
        </span>
        <span className="text-xs font-semibold text-vibe-ink leading-tight truncate max-w-[95px] group-hover:text-vibe-accent transition-colors">
          {vibeConfig.name}
        </span>
      </div>

      {/* Mini Color Swatch preview dot trio */}
      <div className="flex items-center -space-x-1 pl-0.5">
        <span 
          className="w-2.5 h-2.5 rounded-full ring-1 ring-vibe-card flex-shrink-0"
          style={{ backgroundColor: vibeConfig.colors.accent }}
          title={`Accent: ${vibeConfig.colors.accent}`}
        />
        <span 
          className="w-2.5 h-2.5 rounded-full ring-1 ring-vibe-card flex-shrink-0"
          style={{ backgroundColor: vibeConfig.colors.secondary }}
          title={`Secondary: ${vibeConfig.colors.secondary}`}
        />
        <span 
          className="w-2.5 h-2.5 rounded-full ring-1 ring-vibe-card flex-shrink-0"
          style={{ backgroundColor: vibeConfig.colors.bg }}
          title={`Canvas: ${vibeConfig.colors.bg}`}
        />
      </div>

      <ChevronDown className="w-3.5 h-3.5 text-vibe-ink-muted group-hover:text-vibe-ink transition-transform group-hover:translate-y-0.5 hidden xs:inline" />
    </button>
  );
};
