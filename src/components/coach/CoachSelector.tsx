'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Coach } from '@/types/coach';
import { COACHES } from '@/data/coaches';
import { mockApiService } from '@/services/mockApi';
import { ApiError } from '@/types/errors';
import ErrorDisplay from '@/components/ui/ErrorDisplay';

interface CoachSelectorProps {
  onSelectCoach: (coach: Coach) => void;
  isChangingCoach: boolean;
  onClose: () => void;
}

export default function CoachSelector({ onSelectCoach, isChangingCoach, onClose }: CoachSelectorProps) {
  const [coaches, setCoaches] = useState<Coach[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  useEffect(() => {
    loadCoaches();
  }, []);

  const loadCoaches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await mockApiService.getCoaches();
      setCoaches(response.data);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  };

  if (error) {
    return (
      <div className="p-4">
        <ErrorDisplay 
          error={error} 
          onRetry={loadCoaches}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#00A8FF]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white">Select Your Coach</h2>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 gap-4">
        {coaches.map((coach) => (
          <div
            key={coach.id}
            className="flex items-center space-x-4 p-4 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700 transition-colors"
            onClick={() => onSelectCoach(coach)}
          >
            <div className="w-12 h-12 rounded-full bg-gray-700 flex items-center justify-center border border-[#00A8FF]">
              <img
                src={coach.avatar}
                alt={coach.name}
                className="w-8 h-8 rounded-full"
              />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-medium">{coach.name}</h3>
              <p className="text-gray-400 text-sm">{coach.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 