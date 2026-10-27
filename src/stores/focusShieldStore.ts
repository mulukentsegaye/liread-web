import { create } from 'zustand';
import { useNoticeStore } from './noticeStore';
import { useTimerStore } from './timerStore';

interface FocusShieldOptions {
  muteNotifications: boolean;
  preventSleep: boolean; // Screen WakeLock
  kioskFullscreen: boolean;
  pauseTimerOnBlur: boolean;
  accidentalExitGuard: boolean;
}

interface FocusShieldStore {
  // Shield Master Toggle
  isShieldActive: boolean;
  options: FocusShieldOptions;

  // Real-time Session Runtime State
  distractionCount: number;
  isInterventionOpen: boolean;
  isSettingsModalOpen: boolean;
  wakeLockActive: boolean;
  wasTimerPausedByShield: boolean;

  // Actions
  toggleShield: () => void;
  setShieldActive: (active: boolean) => void;
  updateOption: <K extends keyof FocusShieldOptions>(key: K, value: FocusShieldOptions[K]) => void;
  recordDistraction: () => void;
  dismissIntervention: (resumeReadingTimer?: boolean) => void;
  resetSessionStats: () => void;
  openSettingsModal: () => void;
  closeSettingsModal: () => void;
  activateShieldSession: () => Promise<void>;
  deactivateShieldSession: () => void;
}

// Global WakeLock Sentinel reference
let wakeLockSentinel: any = null;

async function requestWakeLock(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
    try {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen');
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null;
      });
      return true;
    } catch (err) {
      console.warn('Wake Lock request could not be granted:', err);
      return false;
    }
  }
  return false;
}

function releaseWakeLock() {
  if (wakeLockSentinel) {
    try {
      wakeLockSentinel.release();
    } catch (e) {
      console.warn('Wake lock release error:', e);
    }
    wakeLockSentinel = null;
  }
}

// Storage helpers
const STORAGE_KEY_SHIELD = 'liread_focus_shield_enabled';
const STORAGE_KEY_OPTIONS = 'liread_focus_shield_options';

function loadInitialOptions(): FocusShieldOptions {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_OPTIONS);
    if (raw) {
      return {
        muteNotifications: true,
        preventSleep: true,
        kioskFullscreen: false,
        pauseTimerOnBlur: true,
        accidentalExitGuard: true,
        ...JSON.parse(raw),
      };
    }
  } catch {}
  return {
    muteNotifications: true,
    preventSleep: true,
    kioskFullscreen: false,
    pauseTimerOnBlur: true,
    accidentalExitGuard: true,
  };
}

function loadInitialShieldActive(): boolean {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SHIELD);
    if (raw !== null) {
      return raw === 'true';
    }
  } catch {}
  return true; // Active by default to give users distraction-free reading out of the box
}

export const useFocusShieldStore = create<FocusShieldStore>((set, get) => ({
  isShieldActive: typeof window !== 'undefined' ? loadInitialShieldActive() : true,
  options: typeof window !== 'undefined' ? loadInitialOptions() : {
    muteNotifications: true,
    preventSleep: true,
    kioskFullscreen: false,
    pauseTimerOnBlur: true,
    accidentalExitGuard: true,
  },
  distractionCount: 0,
  isInterventionOpen: false,
  isSettingsModalOpen: false,
  wakeLockActive: false,
  wasTimerPausedByShield: false,

  toggleShield: () => {
    const next = !get().isShieldActive;
    get().setShieldActive(next);
  },

  setShieldActive: (active: boolean) => {
    set({ isShieldActive: active });
    try {
      localStorage.setItem(STORAGE_KEY_SHIELD, String(active));
    } catch {}

    if (active) {
      get().activateShieldSession();
    } else {
      get().deactivateShieldSession();
    }
  },

  updateOption: (key, value) => {
    set((state) => {
      const nextOptions = { ...state.options, [key]: value };
      try {
        localStorage.setItem(STORAGE_KEY_OPTIONS, JSON.stringify(nextOptions));
      } catch {}
      return { options: nextOptions };
    });

    const state = get();
    if (state.isShieldActive) {
      if (key === 'muteNotifications') {
        useNoticeStore.getState().setDndActive(Boolean(value));
      }
      if (key === 'preventSleep') {
        if (value) {
          requestWakeLock().then((locked) => set({ wakeLockActive: locked }));
        } else {
          releaseWakeLock();
          set({ wakeLockActive: false });
        }
      }
      if (key === 'kioskFullscreen') {
        if (value && typeof document !== 'undefined' && !document.fullscreenElement) {
          document.documentElement.requestFullscreen?.().catch(() => {});
        } else if (!value && typeof document !== 'undefined' && document.fullscreenElement) {
          document.exitFullscreen?.().catch(() => {});
        }
      }
    }
  },

  recordDistraction: () => {
    const { isShieldActive, options } = get();
    if (!isShieldActive) return;

    let pausedTimer = false;
    if (options.pauseTimerOnBlur) {
      const timerStore = useTimerStore.getState();
      if (timerStore.isRunning) {
        timerStore.pauseTimer();
        pausedTimer = true;
      }
    }

    set((state) => ({
      distractionCount: state.distractionCount + 1,
      isInterventionOpen: true,
      wasTimerPausedByShield: pausedTimer || state.wasTimerPausedByShield,
    }));
  },

  dismissIntervention: (resumeReadingTimer = true) => {
    const { wasTimerPausedByShield, options } = get();

    if (resumeReadingTimer && wasTimerPausedByShield) {
      useTimerStore.getState().resumeTimer();
    }

    if (options.kioskFullscreen && typeof document !== 'undefined' && !document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }

    set({
      isInterventionOpen: false,
      wasTimerPausedByShield: false,
    });
  },

  resetSessionStats: () => {
    set({
      distractionCount: 0,
      isInterventionOpen: false,
      wasTimerPausedByShield: false,
    });
  },

  openSettingsModal: () => set({ isSettingsModalOpen: true }),
  closeSettingsModal: () => set({ isSettingsModalOpen: false }),

  activateShieldSession: async () => {
    const { options } = get();

    // 1. Mute notifications
    if (options.muteNotifications) {
      useNoticeStore.getState().setDndActive(true);
    }

    // 2. Prevent sleep (Wake Lock)
    if (options.preventSleep) {
      const locked = await requestWakeLock();
      set({ wakeLockActive: locked });
    }

    // 3. Kiosk Fullscreen
    if (options.kioskFullscreen && typeof document !== 'undefined' && !document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => {});
    }
  },

  deactivateShieldSession: () => {
    // 1. Unmute notifications
    useNoticeStore.getState().setDndActive(false);

    // 2. Release WakeLock
    releaseWakeLock();
    set({ wakeLockActive: false, isInterventionOpen: false });

    // 3. Exit Kiosk Fullscreen if requested
    if (typeof document !== 'undefined' && document.fullscreenElement) {
      document.exitFullscreen?.().catch(() => {});
    }
  },
}));
