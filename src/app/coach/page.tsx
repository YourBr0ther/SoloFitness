"use client";

import { useState, useEffect } from 'react';
import { Coach } from "@/types/coach";
import { COACHES } from "@/data/coaches";
import CoachSelector from '@/components/coach/CoachSelector';
import ChatInterface from '@/components/coach/ChatInterface';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { mockApiService } from '@/services/mockApi';
import { ApiError } from '@/types/errors';

export default function CoachPage() {
  const [selectedCoach, setSelectedCoach] = useState<Coach>(COACHES[0]);
  const [isChangingCoach, setIsChangingCoach] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadInitialCoach();
  }, []);

  const loadInitialCoach = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await mockApiService.getCoach(COACHES[0].id);
      setSelectedCoach(response.data);
    } catch (err) {
      setError(err as ApiError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCoachSelect = async (coach: Coach) => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await mockApiService.getCoach(coach.id);
      setSelectedCoach(response.data);
      setIsChangingCoach(false);
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
          onRetry={loadInitialCoach}
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <main className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top Navigation */}
      <div className="flex items-center justify-between p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-[#00A8FF]">Coach</h1>
        <button
          onClick={() => setIsChangingCoach(true)}
          className="text-gray-400 hover:text-white transition-colors"
          disabled={isLoading}
        >
          Change Coach
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {isChangingCoach ? (
          <div className="h-full overflow-y-auto">
            <div className="p-4">
              <CoachSelector 
                onSelectCoach={handleCoachSelect} 
                isChangingCoach={true}
                onClose={() => setIsChangingCoach(false)}
              />
            </div>
          </div>
        ) : (
          <ChatInterface 
            selectedCoach={selectedCoach} 
            onRequestChangeCoach={() => setIsChangingCoach(true)}
            isLoading={isLoading}
          />
        )}
      </div>
    </main>
  );
} 