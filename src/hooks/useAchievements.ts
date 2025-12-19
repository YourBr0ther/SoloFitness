'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

interface Achievement {
  id: string;
  key: string;
  name: string;
  description: string;
  icon: string;
  xpReward: number;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface AchievementsData {
  achievements: Achievement[];
  unlockedCount: number;
  totalCount: number;
}

interface CheckAchievementsResult {
  newUnlocks: string[];
  message: string;
}

async function fetchAchievements(): Promise<AchievementsData> {
  const response = await fetch('/api/achievements');
  if (!response.ok) {
    throw new Error('Failed to fetch achievements');
  }
  return response.json();
}

async function checkAchievements(): Promise<CheckAchievementsResult> {
  const response = await fetch('/api/achievements', {
    method: 'POST',
  });
  if (!response.ok) {
    throw new Error('Failed to check achievements');
  }
  return response.json();
}

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: fetchAchievements,
  });
}

export function useCheckAchievements() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: checkAchievements,
    onSuccess: (data) => {
      if (data.newUnlocks.length > 0) {
        queryClient.invalidateQueries({ queryKey: ['achievements'] });
        queryClient.invalidateQueries({ queryKey: ['user'] });
      }
    },
  });
}
