import { create } from 'zustand';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastAction {
  label: string;
  onClick: () => void;
}

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  action?: ToastAction;
  duration?: number; // ms, 0 means persist until dismissed
}

export interface AlertModalOptions {
  type?: 'info' | 'warning' | 'error' | 'success' | 'guest';
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export type InfoModalType = 'terms' | 'privacy' | 'help';

interface NoticeState {
  // Toasts
  toasts: ToastItem[];
  showToast: (toast: Omit<ToastItem, 'id'>) => string;
  removeToast: (id: string) => void;
  clearAllToasts: () => void;

  // Alert Modal
  alertModal: AlertModalOptions | null;
  showAlertModal: (options: AlertModalOptions) => void;
  closeAlertModal: () => void;

  // Goal Modal (replacing prompt)
  goalModal: {
    isOpen: boolean;
    initialMinutes: number;
    onSave?: (minutes: number) => void;
  } | null;
  openGoalModal: (initialMinutes: number, onSave: (minutes: number) => void) => void;
  closeGoalModal: () => void;

  // Info Modal (terms, privacy, help)
  infoModal: {
    isOpen: boolean;
    type: InfoModalType;
  } | null;
  openInfoModal: (type: InfoModalType) => void;
  closeInfoModal: () => void;
}

const activeTimeouts = new Map<string, NodeJS.Timeout>();

export const useNoticeStore = create<NoticeState>((set, get) => ({
  toasts: [],

  showToast: (toastData) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const newToast: ToastItem = {
      ...toastData,
      id,
      duration: toastData.duration ?? 4500,
    };

    set((state) => ({
      // Keep maximum 4 visible toasts to avoid overwhelming screen
      toasts: [...state.toasts.slice(-3), newToast],
    }));

    if (newToast.duration && newToast.duration > 0) {
      const timer = setTimeout(() => {
        get().removeToast(id);
      }, newToast.duration);
      activeTimeouts.set(id, timer);
    }

    return id;
  },

  removeToast: (id: string) => {
    const timer = activeTimeouts.get(id);
    if (timer) {
      clearTimeout(timer);
      activeTimeouts.delete(id);
    }
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },

  clearAllToasts: () => {
    activeTimeouts.forEach((timer) => clearTimeout(timer));
    activeTimeouts.clear();
    set({ toasts: [] });
  },

  // Alert Modal
  alertModal: null,
  showAlertModal: (options) => {
    set({ alertModal: options });
  },
  closeAlertModal: () => {
    set({ alertModal: null });
  },

  // Goal Modal
  goalModal: null,
  openGoalModal: (initialMinutes, onSave) => {
    set({
      goalModal: {
        isOpen: true,
        initialMinutes: Math.max(5, initialMinutes || 30),
        onSave,
      },
    });
  },
  closeGoalModal: () => {
    set({ goalModal: null });
  },

  // Info Modal
  infoModal: null,
  openInfoModal: (type) => {
    set({
      infoModal: {
        isOpen: true,
        type,
      },
    });
  },
  closeInfoModal: () => {
    set({ infoModal: null });
  },
}));

// Quick convenience helpers for dispatching toasts anywhere
export const toast = {
  info: (message: string, title?: string, action?: ToastAction) => {
    return useNoticeStore.getState().showToast({ type: 'info', message, title, action });
  },
  success: (message: string, title?: string, action?: ToastAction) => {
    return useNoticeStore.getState().showToast({ type: 'success', message, title, action });
  },
  warning: (message: string, title?: string, action?: ToastAction) => {
    return useNoticeStore.getState().showToast({ type: 'warning', message, title, action });
  },
  error: (message: string, title?: string, action?: ToastAction) => {
    return useNoticeStore.getState().showToast({ type: 'error', message, title, action });
  },
};
