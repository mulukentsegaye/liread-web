import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface TimerStore {
  isRunning: boolean;
  startTime: number | null; // Date.now() when started/resumed
  accumulatedSeconds: number; // Seconds counted before current running slice
  bookTitle: string;
  bookAuthor: string;
  subtitleNote: string;
  coverImageUrl?: string;
  isFullScreenOpen: boolean;

  // Actions
  startTimer: (bookTitle?: string, bookAuthor?: string, coverImageUrl?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimer: () => number; // returns elapsed minutes
  resetTimer: () => void;
  setBook: (title: string, author: string, note?: string, cover?: string) => void;
  setFullScreenOpen: (isOpen: boolean) => void;
  getElapsedSeconds: () => number;
}

export const useTimerStore = create<TimerStore>()(
  persist(
    (set, get) => ({
      isRunning: true, // Default running as seen in mockup ("00:42:15 Current session")
      startTime: Date.now() - 2535 * 1000, // Pre-seeded with 42 mins 15s to match the exact mockup!
      accumulatedSeconds: 0,
      bookTitle: 'The Creative Act',
      bookAuthor: 'Rick Rubin',
      subtitleNote: 'A little time, well spent.',
      coverImageUrl: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300',
      isFullScreenOpen: false,

      getElapsedSeconds: () => {
        const state = get();
        if (!state.isRunning || !state.startTime) {
          return state.accumulatedSeconds;
        }
        // Timestamp delta prevents browser background-tab throttling!
        const deltaSeconds = Math.max(0, Math.floor((Date.now() - state.startTime) / 1000));
        return state.accumulatedSeconds + deltaSeconds;
      },

      startTimer: (title, author, cover) => {
        set({
          isRunning: true,
          startTime: Date.now(),
          accumulatedSeconds: 0,
          bookTitle: title || get().bookTitle,
          bookAuthor: author || get().bookAuthor,
          coverImageUrl: cover || get().coverImageUrl,
        });
      },

      pauseTimer: () => {
        const state = get();
        if (!state.isRunning) return;
        const currentElapsed = state.getElapsedSeconds();
        set({
          isRunning: false,
          startTime: null,
          accumulatedSeconds: currentElapsed,
        });
      },

      resumeTimer: () => {
        const state = get();
        if (state.isRunning) return;
        set({
          isRunning: true,
          startTime: Date.now(),
        });
      },

      stopTimer: () => {
        const state = get();
        const totalSecs = state.getElapsedSeconds();
        const minutes = Math.max(1, Math.round(totalSecs / 60));
        set({
          isRunning: false,
          startTime: null,
          accumulatedSeconds: 0,
        });
        return minutes;
      },

      resetTimer: () => {
        set({
          isRunning: false,
          startTime: null,
          accumulatedSeconds: 0,
        });
      },

      setBook: (title, author, note, cover) => {
        set({
          bookTitle: title,
          bookAuthor: author,
          subtitleNote: note || `${author} - A little time, well spent.`,
          coverImageUrl: cover,
        });
      },

      setFullScreenOpen: (isOpen) => set({ isFullScreenOpen: isOpen }),
    }),
    {
      name: 'readers_hub_timer_state_v1',
    }
  )
);
