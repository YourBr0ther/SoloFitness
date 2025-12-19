'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { ToastContainer, ToastData } from '@/components/ui/Toast';

interface AchievementData {
  name: string;
  icon: string;
  xpReward: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastData, 'id'>) => void;
  showAchievementToast: (achievement: AchievementData) => void;
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION = 4000; // 4 seconds

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((toast: Omit<ToastData, 'id'>) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastData = { ...toast, id };

    setToasts((prev) => [...prev, newToast]);

    // Auto-dismiss after duration
    setTimeout(() => {
      dismissToast(id);
    }, TOAST_DURATION);
  }, [dismissToast]);

  const showAchievementToast = useCallback((achievement: AchievementData) => {
    showToast({
      type: 'achievement',
      title: achievement.name,
      message: 'Achievement unlocked!',
      icon: achievement.icon,
      xpReward: achievement.xpReward,
    });
  }, [showToast]);

  return (
    <ToastContext.Provider value={{ showToast, showAchievementToast, dismissToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
