'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DistanceUnit } from '@/types';

interface UserData {
  id: string;
  createdAt: string;
  distanceUnit: DistanceUnit;
  startDate: string;
  currentXP: number;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string | null;
  totalPushups: number;
  totalSitups: number;
  totalSquats: number;
  totalRunningKm: number;
  totalWorkouts: number;
  dayNumber: number;
  currentLevel: number;
  requirements: {
    pushups: number;
    situps: number;
    squats: number;
    runningKm: number;
    dayNumber: number;
  };
  streakStatus: {
    isActive: boolean;
    currentStreak: number;
  };
}

async function fetchUser(): Promise<UserData> {
  const response = await fetch('/api/user');
  if (!response.ok) {
    throw new Error('Failed to fetch user');
  }
  return response.json();
}

async function updateUser(data: { distanceUnit?: DistanceUnit }): Promise<UserData> {
  const response = await fetch('/api/user', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update user');
  }
  return response.json();
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: fetchUser,
  });
}

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user'] });
    },
  });
}
