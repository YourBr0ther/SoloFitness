'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';

export interface ToastData {
  id: string;
  type: 'achievement' | 'success' | 'error' | 'info';
  title: string;
  message?: string;
  icon?: string;
  xpReward?: number;
}

interface ToastProps {
  toast: ToastData;
  onDismiss: (id: string) => void;
}

export function Toast({ toast, onDismiss }: ToastProps) {
  const isAchievement = toast.type === 'achievement';

  return (
    <motion.div
      initial={{ opacity: 0, y: -50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.9 }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={`
        relative w-full max-w-sm mx-auto
        ${isAchievement ? 'card-elevated' : 'card'}
        p-4 rounded-2xl
        ${isAchievement ? 'border-accent-cyan/50 shadow-glow-blue' : ''}
      `}
    >
      {/* Close button */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="absolute top-2 right-2 p-1 text-primary-400/60 hover:text-primary-400 transition-colors"
      >
        <X size={16} />
      </button>

      <div className="flex items-center gap-3">
        {/* Icon */}
        {isAchievement ? (
          <motion.div
            className="text-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 0.5, repeat: 2 }}
          >
            {toast.icon || <Trophy className="text-accent-cyan" size={32} />}
          </motion.div>
        ) : (
          <div className="text-2xl">
            {toast.type === 'success' && '✅'}
            {toast.type === 'error' && '❌'}
            {toast.type === 'info' && 'ℹ️'}
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {isAchievement && (
            <p className="text-xs text-accent-cyan font-medium mb-0.5">
              ACHIEVEMENT UNLOCKED
            </p>
          )}
          <h4 className="font-semibold text-sm truncate">{toast.title}</h4>
          {toast.message && (
            <p className="text-xs text-primary-400/60 truncate">{toast.message}</p>
          )}
          {isAchievement && toast.xpReward && (
            <p className="text-xs text-accent-cyan font-medium mt-1">
              +{toast.xpReward} XP
            </p>
          )}
        </div>
      </div>
    </motion.div>
  );
}

interface ToastContainerProps {
  toasts: ToastData[];
  onDismiss: (id: string) => void;
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  return (
    <div className="fixed top-4 left-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence mode="sync">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast toast={toast} onDismiss={onDismiss} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
