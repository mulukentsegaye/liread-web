import { create } from 'zustand';
import { triggerCelebrationConfetti } from '../utils/confetti';

interface ReflectionState {
  isOpen: boolean;
  sessionMinutes: number;
  bookTitle: string;
  bookAuthor?: string;
  openReflection: (minutes: number, bookTitle?: string, bookAuthor?: string) => void;
  closeReflection: () => void;
}

export const useReflectionStore = create<ReflectionState>((set) => ({
  isOpen: false,
  sessionMinutes: 0,
  bookTitle: 'Reading Session',
  bookAuthor: undefined,

  openReflection: (minutes: number, bookTitle = 'Reading Session', bookAuthor?: string) => {
    // Tasteful celebratory confetti burst for personal consistency & streak
    triggerCelebrationConfetti();

    set({
      isOpen: true,
      sessionMinutes: minutes,
      bookTitle,
      bookAuthor,
    });
  },

  closeReflection: () => {
    set({ isOpen: false });
  },
}));
