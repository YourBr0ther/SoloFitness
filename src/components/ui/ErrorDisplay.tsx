'use client';

import { AlertCircle } from 'lucide-react';
import { ApiError } from '@/types/errors';

interface ErrorDisplayProps {
  error: ApiError | Error | string | null;
  onRetry?: () => void;
  className?: string;
}

export default function ErrorDisplay({ error, onRetry, className = '' }: ErrorDisplayProps) {
  if (!error) return null;

  const errorMessage = typeof error === 'string' 
    ? error 
    : error instanceof Error 
      ? error.message 
      : error.message || 'An unexpected error occurred';

  return (
    <div className={`bg-red-900/50 border border-red-800 rounded-lg p-4 ${className}`}>
      <div className="flex items-start space-x-3">
        <AlertCircle className="w-5 h-5 text-red-400 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-200 font-medium">{errorMessage}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 text-sm text-red-300 hover:text-red-200 transition-colors"
            >
              Try again
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 