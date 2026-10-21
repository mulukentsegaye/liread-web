import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  AmbientSoundId, 
  AmbientTrackConfig, 
  AMBIENT_SOUNDS, 
  THEME_AMBIENT_MAP, 
  ThemeId 
} from '../types/theme';
import { ambientAudioEngine } from '../lib/ambientAudioEngine';

interface AmbientAudioState {
  isPlaying: boolean;
  volume: number; // 0.0 to 1.0
  isMuted: boolean;
  activeSoundId: AmbientSoundId;
  autoPairWithTheme: boolean;
  isExpandedInTimer: boolean;

  // Actions
  togglePlay: () => Promise<void>;
  play: (soundId?: AmbientSoundId) => Promise<void>;
  pause: () => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  setSound: (soundId: AmbientSoundId, explicitUserChoice?: boolean) => Promise<void>;
  setAutoPairWithTheme: (auto: boolean) => void;
  setExpandedInTimer: (expanded: boolean) => void;
  syncWithTheme: (themeId: ThemeId) => Promise<void>;
  getActiveTrackConfig: () => AmbientTrackConfig;
}

export const useAmbientAudioStore = create<AmbientAudioState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      volume: 0.45,
      isMuted: false,
      activeSoundId: 'birds', // Default paired with nordic-studio
      autoPairWithTheme: true,
      isExpandedInTimer: false,

      getActiveTrackConfig: () => {
        const soundId = get().activeSoundId;
        return AMBIENT_SOUNDS[soundId] || AMBIENT_SOUNDS['birds'];
      },

      togglePlay: async () => {
        const state = get();
        if (state.isPlaying) {
          get().pause();
        } else {
          await get().play();
        }
      },

      play: async (soundId?: AmbientSoundId) => {
        const state = get();
        const soundToPlay = soundId || state.activeSoundId;
        const effectiveVolume = state.isMuted ? 0 : state.volume;

        set({ activeSoundId: soundToPlay, isPlaying: true });
        await ambientAudioEngine.play(soundToPlay, effectiveVolume);
      },

      pause: () => {
        ambientAudioEngine.pause();
        set({ isPlaying: false });
      },

      setVolume: (vol: number) => {
        const clamped = Math.max(0, Math.min(1, vol));
        set({ volume: clamped, isMuted: clamped === 0 });
        if (get().isPlaying && !get().isMuted) {
          ambientAudioEngine.setVolume(clamped);
        }
      },

      toggleMute: () => {
        const state = get();
        const nextMuted = !state.isMuted;
        set({ isMuted: nextMuted });
        if (state.isPlaying) {
          ambientAudioEngine.setVolume(nextMuted ? 0 : state.volume);
        }
      },

      setSound: async (soundId: AmbientSoundId, _explicitUserChoice = true) => {
        const state = get();
        set({ activeSoundId: soundId });
        if (state.isPlaying) {
          const effectiveVolume = state.isMuted ? 0 : state.volume;
          await ambientAudioEngine.play(soundId, effectiveVolume);
        }
      },

      setAutoPairWithTheme: (auto: boolean) => {
        set({ autoPairWithTheme: auto });
        if (auto && typeof window !== 'undefined') {
          const currentTheme = (document.documentElement.getAttribute('data-theme') as ThemeId) || 'botanical-zen';
          get().syncWithTheme(currentTheme);
        }
      },

      setExpandedInTimer: (expanded: boolean) => {
        set({ isExpandedInTimer: expanded });
      },

      syncWithTheme: async (themeId: ThemeId) => {
        const state = get();
        if (!state.autoPairWithTheme) return;

        const pairedSoundId = THEME_AMBIENT_MAP[themeId] || 'birds';
        if (state.activeSoundId !== pairedSoundId) {
          set({ activeSoundId: pairedSoundId });
          if (state.isPlaying) {
            const effectiveVolume = state.isMuted ? 0 : state.volume;
            await ambientAudioEngine.play(pairedSoundId, effectiveVolume);
          }
        }
      },
    }),
    {
      name: 'liread_ambient_audio_v1',
      partialize: (state) => ({
        volume: state.volume,
        isMuted: state.isMuted,
        autoPairWithTheme: state.autoPairWithTheme,
        activeSoundId: state.activeSoundId,
      }),
    }
  )
);

// Listen for global theme changes to automatically transition ambient audio
if (typeof window !== 'undefined') {
  window.addEventListener('liread-theme-changed', (e: Event) => {
    const customEvent = e as CustomEvent<{ theme: ThemeId }>;
    if (customEvent.detail?.theme) {
      useAmbientAudioStore.getState().syncWithTheme(customEvent.detail.theme);
    }
  });
}

