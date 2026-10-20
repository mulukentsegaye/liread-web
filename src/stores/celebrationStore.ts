import { create } from 'zustand';
import { triggerCelebrationConfetti } from '../utils/confetti';

interface CelebrationState {
  isOpen: boolean;
  minutes: number;
  bookTitle: string;
  showCelebration: (minutes: number, bookTitle?: string) => void;
  closeCelebration: () => void;
}

let autoDismissTimeout: NodeJS.Timeout | null = null;

export const useCelebrationStore = create<CelebrationState>((set) => ({
  isOpen: false,
  minutes: 0,
  bookTitle: 'Untitled Book',

  showCelebration: (minutes: number, bookTitle = 'Reading Session') => {
    // Clear any previous auto-dismiss timeout
    if (autoDismissTimeout) {
      clearTimeout(autoDismissTimeout);
      autoDismissTimeout = null;
    }

    // Trigger visual confetti celebration
    triggerCelebrationConfetti();

    set({
      isOpen: true,
      minutes,
      bookTitle,
    });

    // Auto-dismiss after 4.5 seconds
    autoDismissTimeout = setTimeout(() => {
      set({ isOpen: false });
      autoDismissTimeout = null;
    }, 4500);
  },

  closeCelebration: () => {
    if (autoDismissTimeout) {
      clearTimeout(autoDismissTimeout);
      autoDismissTimeout = null;
    }
    set({ isOpen: false });
  },
}));
