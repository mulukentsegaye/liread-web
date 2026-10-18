import React, { useEffect, useRef } from 'react';
import { Sun, Moon, Check, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { ThemeMode } from '../../types/theme';

interface VibeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VibeSelector: React.FC<VibeSelectorProps> = ({ isOpen, onClose }) => {
  const { theme, setTheme } = useTheme();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

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

  const themes: { id: ThemeMode; name: string; desc: string; icon: typeof Sun }[] = [
    {
      id: 'light',
      name: 'Light Mode',
      desc: 'Whitey-Silver (#F3F4F6) with Deep Emerald (#059669) accents',
      icon: Sun,
    },
    {
      id: 'dark',
      name: 'Dark Mode',
      desc: 'Deep Obsidian (#0B0F19) with Mint-Emerald (#34D399) accents',
      icon: Moon,
    },
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="theme-selector-title"
    >
      <div 
        ref={popoverRef}
        className="relative w-full max-w-sm rounded-3xl bg-vibe-card border border-vibe-border shadow-2xl p-5 text-vibe-ink animate-in zoom-in-95 duration-200"
      >
        <div className="flex items-center justify-between pb-3 border-b border-vibe-border mb-4">
          <div>
            <h2 id="theme-selector-title" className="text-base font-bold text-vibe-ink">
              Appearance
            </h2>
            <p className="text-xs text-vibe-ink-muted">
              Choose your reading environment
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full flex items-center justify-center text-vibe-ink-muted hover:text-vibe-ink hover:bg-vibe-card-subtle transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-2">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setTheme(t.id);
                  onClose();
                }}
                className={`w-full min-h-[56px] p-3 rounded-2xl flex items-center justify-between text-left transition-all border ${
                  isSelected
                    ? 'bg-vibe-accent-subtle border-vibe-accent shadow-xs'
                    : 'bg-vibe-card-subtle border-vibe-border hover:border-vibe-ink-muted/30'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'bg-vibe-accent text-white' : 'bg-vibe-card text-vibe-ink-muted'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-vibe-ink">
                      {t.name}
                    </p>
                    <p className="text-[11px] text-vibe-ink-muted truncate">
                      {t.desc}
                    </p>
                  </div>
                </div>

                {isSelected && (
                  <Check className="w-4 h-4 text-vibe-accent flex-shrink-0 ml-2" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
