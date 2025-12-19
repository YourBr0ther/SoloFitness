'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DailyRequirements } from '@/types';

interface Penalty {
  id: string;
  exercise: string;
  amount: number;
  completed: boolean;
  createdAt: string;
}

interface DailyLogData {
  id: string;
  userId: string;
  date: string;
  pushups: number;
  situps: number;
  squats: number;
  runningKm: number;
  targetPushups: number;
  targetSitups: number;
  targetSquats: number;
  targetRunningKm: number;
  completed: boolean;
  xpEarned: number;
  penalties: Penalty[];
  dayNumber: number;
  requirements: DailyRequirements;
}

interface UpdateLogData {
  pushups?: number;
  situps?: number;
  squats?: number;
  runningKm?: number;
}

async function fetchDailyLog(date?: string): Promise<DailyLogData> {
  const url = date ? `/api/daily-log?date=${date}` : '/api/daily-log';
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch daily log');
  }
  return response.json();
}

async function updateDailyLog(data: UpdateLogData): Promise<DailyLogData> {
  const response = await fetch('/api/daily-log', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Failed to update daily log');
  }
  return response.json();
}

export function useDailyLog(date?: string) {
  return useQuery({
    queryKey: ['dailyLog', date || 'today'],
    queryFn: () => fetchDailyLog(date),
  });
}

export function useUpdateDailyLog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateDailyLog,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLog'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Also check for new achievements
      fetch('/api/achievements', { method: 'POST' });
    },
  });
}

export function useTogglePenalty() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ penaltyId, completed }: { penaltyId: string; completed: boolean }) => {
      const response = await fetch('/api/penalties', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ penaltyId, completed }),
      });
      if (!response.ok) {
        throw new Error('Failed to update penalty');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLog'] });
      // Check for "arise" achievement
      fetch('/api/achievements', { method: 'POST' });
    },
  });
}
