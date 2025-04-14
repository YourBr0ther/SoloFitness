import { useState, useEffect } from 'react';
import { ApiService } from '@/services/realApi';
import { Profile, StreakDay, GymBadge } from '@/types/profile';
import { ApiError } from '@/types/errors';

const api = new ApiService();

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [streakHistory, setStreakHistory] = useState<StreakDay[]>([]);
  const [badges, setBadges] = useState<GymBadge[]>([]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await api.getUser();
      setProfile(response.data);
      
      // Load streak history and badges if available in the profile
      if (response.data.streakHistory) {
        setStreakHistory(response.data.streakHistory);
      }
      if (response.data.badges) {
        setBadges(response.data.badges);
      }
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError);
      console.error('Error loading profile:', apiError?.message || 'Unknown error');
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    try {
      setError(null);
      const response = await api.updateUser(updates);
      setProfile(response.data);
      return response.data;
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError);
      console.error('Error updating profile:', apiError?.message || 'Unknown error');
      throw apiError;
    }
  };

  const updateStreak = async (update: StreakDay) => {
    try {
      setError(null);
      const updatedHistory = [...streakHistory, update];
      await updateProfile({ streakHistory: updatedHistory });
      setStreakHistory(updatedHistory);
    } catch (err: unknown) {
      const apiError = err as ApiError;
      setError(apiError);
      console.error('Error updating streak:', apiError?.message || 'Unknown error');
      throw apiError;
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    isLoading,
    error,
    streakHistory,
    badges,
    loadProfile,
    updateProfile,
    updateStreak
  };
} 