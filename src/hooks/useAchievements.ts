'use client';

import { useQuery } from '@tanstack/react-query';

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

async function fetchAchievements(): Promise<AchievementsData> {
  const response = await fetch('/api/achievements');
  if (!response.ok) {
    throw new Error('Failed to fetch achievements');
  }
  return response.json();
}

export function useAchievements() {
  return useQuery({
    queryKey: ['achievements'],
    queryFn: fetchAchievements,
  });
}
