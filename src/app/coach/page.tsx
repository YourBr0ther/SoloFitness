"use client";

import React, { useEffect, useState } from 'react';
import { Coach } from '@/types/coach';
import { useApi } from '@/contexts/ApiContext';
import CoachSelector from '@/components/coach/CoachSelector';
import ChatInterface from '@/components/coach/ChatInterface';
import ErrorDisplay from '@/components/ui/ErrorDisplay';
import { ApiError } from '@/types/errors';

export default function CoachPage() {
  const { api } = useApi();
  const [selectedCoach, setSelectedCoach] = useState<Coach | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [isChangingCoach, setIsChangingCoach] = useState(false);

  const loadDefaultCoach = async () => {
    try {
      setLoading(true);
      // Get list of coaches and select the first one
      const response = await api.getCoaches();
      if (response.data.length > 0) {
        const coachResponse = await api.getCoach(response.data[0].id);
        setSelectedCoach(coachResponse.data);
      } else {
        setError(new ApiError('No coaches available', 404));
      }
    } catch (error) {
      console.error('Error loading default coach:', error);
      setError(error as ApiError);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDefaultCoach();
  }, [api]);

  const handleCoachSelect = async (coach: Coach) => {
    try {
      setLoading(true);
      const response = await api.getCoach(coach.id);
      setSelectedCoach(response.data);
      setIsChangingCoach(false);
    } catch (error) {
      console.error('Error loading coach:', error);
      setError(error as ApiError);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !selectedCoach) {
    return <div>Loading...</div>;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <ErrorDisplay 
          error={error} 
          onRetry={() => {
            setError(null);
            loadDefaultCoach();
          }}
          className="mt-4"
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {isChangingCoach ? (
        <div className="p-4">
          <CoachSelector 
            onSelectCoach={handleCoachSelect} 
            isChangingCoach={true}
            onClose={() => setIsChangingCoach(false)}
          />
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <button
            onClick={() => setIsChangingCoach(true)}
            className="text-gray-400 hover:text-white transition-colors"
            disabled={loading}
          >
            Change Coach
          </button>
          {selectedCoach && (
            <ChatInterface 
              selectedCoach={selectedCoach} 
              onRequestChangeCoach={() => setIsChangingCoach(true)}
              isLoading={loading}
            />
          )}
        </div>
      )}
    </div>
  );
} 