import React, { useState } from 'react';
import {
  Shield,
  ShieldCheck,
  ShieldAlert,
  BellOff,
  Moon,
  Smartphone,
  Monitor,
  Lock,
  X,
  CheckCircle2,
  AlertTriangle,
  Maximize2,
  EyeOff,
  Flame,
  Radio,
  ExternalLink
} from 'lucide-react';
import { useFocusShieldStore } from '../../stores/focusShieldStore';

export const FocusShieldModal: React.FC = () => {
  const {
    isShieldActive,
    options,
    distractionCount,
    wakeLockActive,
    isSettingsModalOpen,
    closeSettingsModal,
    setShieldActive,
    updateOption,
    resetSessionStats
  } = useFocusShieldStore();

  const [activeTab, setActiveTab] = useState<'status' | 'osGuide'>('status');
  const [selectedOs, setSelectedOs] = useState<'ios' | 'android' | 'windows' | 'mac'>('ios');

  if (!isSettingsModalOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center p-3 sm:p-5 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
      onClick={closeSettingsModal}
      role="dialog"
      aria-modal="true"
      aria-labelledby="focus-shield-title"
    >
      <div
        className="relative w-full max-w-lg bg-vibe-card border border-vibe-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200 text-vibe-ink"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with ambient glow banner */}
        <div className="relative px-6 pt-6 pb-4 border-b border-vibe-border bg-gradient-to-r from-emerald-500/10 via-sky-500/5 to-transparent">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-2xl flex items-center justify-center transition-colors ${
                  isShieldActive
                    ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/25 ring-2 ring-emerald-400/30'
                    : 'bg-black/10 dark:bg-white/10 text-vibe-ink-muted'
                }`}
              >
                {isShieldActive ? (
                  <ShieldCheck className="w-5 h-5 animate-pulse" />
                ) : (
                  <Shield className="w-5 h-5" />
                )}
              </div>
              <div>
                <h3 id="focus-shield-title" className="text-base sm:text-lg font-heading font-bold text-vibe-ink flex items-center gap-2">
                  <span>Deep Focus Shield</span>
                  {isShieldActive && (
                    <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                      Armed
                    </span>
                  )}
                </h3>
                <p className="text-xs text-vibe-ink-muted">
                  Distraction &amp; Notification Blocker for Readers
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={closeSettingsModal}
              className="w-8 h-8 rounded-xl flex items-center justify-center text-vibe-ink-muted hover:text-vibe-ink hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
              aria-label="Close Focus Shield settings"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex items-center gap-2 mt-4">
            <button
              type="button"
              onClick={() => setActiveTab('status')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all ${
                activeTab === 'status'
                  ? 'bg-vibe-accent text-white shadow-xs'
                  : 'text-vibe-ink-secondary hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              Shield Controls &amp; Stats
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('osGuide')}
              className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'osGuide'
                  ? 'bg-vibe-accent text-white shadow-xs'
                  : 'text-vibe-ink-secondary hover:bg-black/5 dark:hover:bg-white/5'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>OS App Blocker Guide</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {activeTab === 'status' ? (
            <>
              {/* Master Power Card */}
              <div
                className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-4 ${
                  isShieldActive
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-black/5 dark:bg-white/5 border-vibe-border'
                }`}
              >
                <div>
                  <h4 className="text-sm font-semibold text-vibe-ink">
                    {isShieldActive ? 'Focus Shield is Active' : 'Focus Shield is Inactive'}
                  </h4>
                  <p className="text-xs text-vibe-ink-secondary mt-0.5">
                    {isShieldActive
                      ? 'In-app toasts muted, sleep prevented, and app-switching intercepted.'
                      : 'Distractions and notifications are currently unshielded.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShieldActive(!isShieldActive)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex-shrink-0 ${
                    isShieldActive
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
                      : 'bg-vibe-card-subtle border border-vibe-border text-vibe-ink hover:border-vibe-accent'
                  }`}
                >
                  {isShieldActive ? 'Deactivate' : 'Turn On'}
                </button>
              </div>

              {/* Live Session Counter */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-vibe-card-subtle border border-vibe-border">
                  <div className="flex items-center gap-1.5 text-xs text-vibe-ink-muted">
                    <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
                    <span>Distractions Resisted</span>
                  </div>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-2xl font-mono font-bold text-vibe-ink">
                      {distractionCount}
                    </span>
                    {distractionCount > 0 && (
                      <button
                        type="button"
                        onClick={resetSessionStats}
                        className="text-[11px] text-vibe-accent hover:underline font-medium"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-vibe-card-subtle border border-vibe-border">
                  <div className="flex items-center gap-1.5 text-xs text-vibe-ink-muted">
                    <Moon className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Anti-Dim WakeLock</span>
                  </div>
                  <div className="mt-1">
                    <span className="text-xs font-mono font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      {wakeLockActive ? 'Screen Awake' : 'Standby'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Shield Protection Controls */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-vibe-ink-muted">
                  Shield Armor Settings
                </h4>

                {/* 1. Mute in-app notifications */}
                <label className="flex items-start justify-between gap-3 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-vibe-border cursor-pointer transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 mt-0.5">
                      <BellOff className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-vibe-ink">
                        Mute All In-App Notifications
                      </span>
                      <span className="text-[11px] text-vibe-ink-secondary leading-snug block">
                        Completely silences incoming toasts, social badges, and system popups while reading.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.muteNotifications}
                    onChange={(e) => updateOption('muteNotifications', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
                  />
                </label>

                {/* 2. Prevent sleep (Wake Lock) */}
                <label className="flex items-start justify-between gap-3 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-vibe-border cursor-pointer transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 mt-0.5">
                      <Moon className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-vibe-ink">
                        Screen WakeLock (Anti-Dim)
                      </span>
                      <span className="text-[11px] text-vibe-ink-secondary leading-snug block">
                        Keeps the display alive to avoid lock-screen notification triggers and dimming.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.preventSleep}
                    onChange={(e) => updateOption('preventSleep', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
                  />
                </label>

                {/* 3. Pause timer on blur (Anti-Drift) */}
                <label className="flex items-start justify-between gap-3 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-vibe-border cursor-pointer transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 mt-0.5">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-vibe-ink">
                        Anti-App-Drift Guard
                      </span>
                      <span className="text-[11px] text-vibe-ink-secondary leading-snug block">
                        Pauses reading timer when you switch apps/tabs, and shows a mindful return screen.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.pauseTimerOnBlur}
                    onChange={(e) => updateOption('pauseTimerOnBlur', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
                  />
                </label>

                {/* 4. Fullscreen kiosk */}
                <label className="flex items-start justify-between gap-3 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-vibe-border cursor-pointer transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 mt-0.5">
                      <Maximize2 className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-vibe-ink">
                        Kiosk Immersion Mode
                      </span>
                      <span className="text-[11px] text-vibe-ink-secondary leading-snug block">
                        Hides browser tabs, address bars, bookmarks, and OS taskbar for pure e-reader focus.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.kioskFullscreen}
                    onChange={(e) => updateOption('kioskFullscreen', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
                  />
                </label>

                {/* 5. Accidental exit guard */}
                <label className="flex items-start justify-between gap-3 p-3 rounded-2xl hover:bg-black/5 dark:hover:bg-white/5 border border-transparent hover:border-vibe-border cursor-pointer transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mt-0.5">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-semibold block text-vibe-ink">
                        Accidental Close Protection
                      </span>
                      <span className="text-[11px] text-vibe-ink-secondary leading-snug block">
                        Prompts confirmation before tab closing or back navigation during focus sessions.
                      </span>
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={options.accidentalExitGuard}
                    onChange={(e) => updateOption('accidentalExitGuard', e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 mt-1 cursor-pointer"
                  />
                </label>
              </div>
            </>
          ) : (
            /* OS APP & NOTIFICATION BLOCKER GUIDE */
            <div className="space-y-4">
              <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-vibe-ink leading-relaxed">
                <span className="font-semibold block text-amber-600 dark:text-amber-400 mb-1 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                  Why OS Focus Mode is Essential:
                </span>
                Due to web browser security sandboxes, no website can forcefully kill external apps (like WhatsApp or Instagram) at the operating system level. However, combining Liread's Shield with your device's native Focus Mode completely blocks all external app notifications!
              </div>

              {/* OS Selector Tabs */}
              <div className="grid grid-cols-4 gap-1.5 p-1 rounded-2xl bg-black/5 dark:bg-white/5 border border-vibe-border text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setSelectedOs('ios')}
                  className={`py-1.5 rounded-xl transition-all ${
                    selectedOs === 'ios'
                      ? 'bg-vibe-accent text-white shadow-xs'
                      : 'text-vibe-ink-secondary hover:text-vibe-ink'
                  }`}
                >
                  iOS (iPhone)
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOs('android')}
                  className={`py-1.5 rounded-xl transition-all ${
                    selectedOs === 'android'
                      ? 'bg-vibe-accent text-white shadow-xs'
                      : 'text-vibe-ink-secondary hover:text-vibe-ink'
                  }`}
                >
                  Android
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOs('windows')}
                  className={`py-1.5 rounded-xl transition-all ${
                    selectedOs === 'windows'
                      ? 'bg-vibe-accent text-white shadow-xs'
                      : 'text-vibe-ink-secondary hover:text-vibe-ink'
                  }`}
                >
                  Windows
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedOs('mac')}
                  className={`py-1.5 rounded-xl transition-all ${
                    selectedOs === 'mac'
                      ? 'bg-vibe-accent text-white shadow-xs'
                      : 'text-vibe-ink-secondary hover:text-vibe-ink'
                  }`}
                >
                  macOS
                </button>
              </div>

              {/* OS Specific Instructions */}
              {selectedOs === 'ios' && (
                <div className="space-y-3 p-4 rounded-2xl bg-vibe-card-subtle border border-vibe-border text-xs">
                  <h5 className="font-semibold text-vibe-ink flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    Apple iOS (iPhone / iPad) Reading Focus Setup
                  </h5>
                  <ol className="list-decimal list-inside space-y-2 text-vibe-ink-secondary leading-relaxed">
                    <li>
                      <strong className="text-vibe-ink">Swipe down</strong> from the top-right corner to open <span className="font-medium">Control Center</span>.
                    </li>
                    <li>
                      Tap <strong className="text-vibe-ink">Focus</strong> &rarr; Select <strong className="text-emerald-500">Reading</strong> or <strong className="text-emerald-500">Do Not Disturb</strong>.
                    </li>
                    <li>
                      <strong className="text-vibe-ink">Pro Tip (App Blocker)</strong>: Go to <span className="font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-[11px]">Settings &rarr; Focus &rarr; Reading</span>:
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>Silence notifications from all apps except your chosen contacts.</li>
                        <li>Turn on <em>Hide Notification Badges</em> so red numbers won't tempt you.</li>
                        <li>Customize Home Screen pages to hide social media apps while reading!</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              )}

              {selectedOs === 'android' && (
                <div className="space-y-3 p-4 rounded-2xl bg-vibe-card-subtle border border-vibe-border text-xs">
                  <h5 className="font-semibold text-vibe-ink flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-emerald-500" />
                    Android Focus Mode &amp; Do Not Disturb
                  </h5>
                  <ol className="list-decimal list-inside space-y-2 text-vibe-ink-secondary leading-relaxed">
                    <li>
                      <strong className="text-vibe-ink">Swipe down twice</strong> from the top of your screen to open <span className="font-medium">Quick Settings</span>.
                    </li>
                    <li>
                      Tap <strong className="text-emerald-500">Do Not Disturb</strong> or <strong className="text-emerald-500">Bedtime Mode</strong>.
                    </li>
                    <li>
                      <strong className="text-vibe-ink">Hardware App Blocker</strong>: Go to <span className="font-mono bg-black/5 dark:bg-white/10 px-1.5 py-0.5 rounded text-[11px]">Settings &rarr; Digital Wellbeing &rarr; Focus Mode</span>:
                      <ul className="list-disc list-inside ml-4 mt-1 space-y-1">
                        <li>Select distracting apps (Instagram, TikTok, YouTube, WhatsApp).</li>
                        <li>Tap <em>Turn On Now</em> — Android will grey them out and prevent you from opening them until focus mode ends!</li>
                      </ul>
                    </li>
                  </ol>
                </div>
              )}

              {selectedOs === 'windows' && (
                <div className="space-y-3 p-4 rounded-2xl bg-vibe-card-subtle border border-vibe-border text-xs">
                  <h5 className="font-semibold text-vibe-ink flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-emerald-500" />
                    Windows 10 / 11 Focus Assist
                  </h5>
                  <ol className="list-decimal list-inside space-y-2 text-vibe-ink-secondary leading-relaxed">
                    <li>
                      Press the keyboard shortcut <kbd className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/15 font-mono text-[11px] font-bold">Win + N</kbd> or click the date/time in your taskbar.
                    </li>
                    <li>
                      Click the <strong className="text-emerald-500">Focus</strong> button to start a focus timer.
                    </li>
                    <li>
                      All Windows notification toasts and taskbar badge flashing will be muted automatically while your session is active.
                    </li>
                    <li>
                      Press <kbd className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/15 font-mono text-[11px] font-bold">F11</kbd> inside your browser to lock Fullscreen Kiosk mode!
                    </li>
                  </ol>
                </div>
              )}

              {selectedOs === 'mac' && (
                <div className="space-y-3 p-4 rounded-2xl bg-vibe-card-subtle border border-vibe-border text-xs">
                  <h5 className="font-semibold text-vibe-ink flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-emerald-500" />
                    Apple macOS Focus Mode
                  </h5>
                  <ol className="list-decimal list-inside space-y-2 text-vibe-ink-secondary leading-relaxed">
                    <li>
                      Click the <strong className="text-vibe-ink">Control Center</strong> icon (two toggles) in the top-right menu bar.
                    </li>
                    <li>
                      Click <strong className="text-emerald-500">Focus</strong> &rarr; Select <strong className="text-emerald-500">Do Not Disturb</strong>.
                    </li>
                    <li>
                      Press <kbd className="px-2 py-0.5 rounded bg-black/10 dark:bg-white/15 font-mono text-[11px] font-bold">Control + Command + F</kbd> for true distraction-free fullscreen reading.
                    </li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-vibe-border bg-vibe-card-subtle flex items-center justify-between">
          <span className="text-[11px] text-vibe-ink-muted">
            Protection is applied instantly inside the eReader.
          </span>
          <button
            type="button"
            onClick={closeSettingsModal}
            className="px-5 py-2 rounded-xl bg-vibe-accent hover:bg-vibe-accent-hover text-white text-xs font-semibold shadow-xs transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
