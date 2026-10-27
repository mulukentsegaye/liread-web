import React from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Play,
  SlidersHorizontal,
  LogOut,
  Heart
} from 'lucide-react';
import { useFocusShieldStore } from '../../stores/focusShieldStore';
import { useReaderStore } from '../../stores/readerStore';

export const FocusInterventionOverlay: React.FC = () => {
  const {
    isShieldActive,
    isInterventionOpen,
    distractionCount,
    dismissIntervention,
    openSettingsModal
  } = useFocusShieldStore();

  const { activeBook, closeBook } = useReaderStore();

  if (!isShieldActive || !isInterventionOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-lg animate-in fade-in duration-300 text-white select-none"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="distraction-alert-title"
    >
      <div className="relative w-full max-w-md bg-stone-900/90 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600" />
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Shield Icon Badge */}
        <div className="relative mx-auto w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mb-5 shadow-lg shadow-emerald-950/50">
          <ShieldAlert className="w-8 h-8 animate-pulse text-emerald-400" />
        </div>

        {/* Interception Notification Tag */}
        <span className="inline-flex items-center px-3 py-1 rounded-full text-[11px] font-mono uppercase tracking-wider font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 mb-3">
          Distraction Intercepted
        </span>

        {/* Headline */}
        <h3
          id="distraction-alert-title"
          className="text-xl sm:text-2xl font-heading font-bold text-stone-100 tracking-tight"
        >
          You Stepped Away From Your Sanctuary
        </h3>

        {/* Explanatory Message */}
        <p className="text-xs sm:text-sm text-stone-300 mt-2 leading-relaxed">
          Notifications and external apps tempt us constantly. Liread paused your reading timer so your focus stats remain 100% authentic.
        </p>

        {/* Live Distraction Counter Metric */}
        <div className="my-5 p-3.5 rounded-2xl bg-stone-800/80 border border-stone-700/60 flex items-center justify-around text-xs">
          <div>
            <span className="block text-[10px] text-stone-400 uppercase tracking-wider font-mono">
              Interference Resisted
            </span>
            <span className="text-2xl font-mono font-bold text-emerald-400">
              {distractionCount} {distractionCount === 1 ? 'time' : 'times'}
            </span>
          </div>

          <div className="h-8 w-px bg-stone-700" />

          <div>
            <span className="block text-[10px] text-stone-400 uppercase tracking-wider font-mono">
              Timer Status
            </span>
            <span className="text-sm font-semibold text-amber-400">
              Safely Paused
            </span>
          </div>
        </div>

        {/* Inspirational Reading Affirmation */}
        <p className="text-[11px] text-stone-400 italic mb-6">
          &ldquo;Books are the quietest and most constant of friends.&rdquo; — Charles W. Eliot
        </p>

        {/* Primary and Secondary Action Buttons */}
        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => dismissIntervention(true)}
            className="w-full py-3.5 px-5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.01]"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Resume Deep Focus Reading</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={() => {
                openSettingsModal();
              }}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Shield Settings</span>
            </button>

            <button
              type="button"
              onClick={() => {
                dismissIntervention(false);
                closeBook();
              }}
              className="py-2.5 px-3 rounded-xl bg-stone-800 hover:bg-rose-950/40 text-stone-300 hover:text-rose-300 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit Reader</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
