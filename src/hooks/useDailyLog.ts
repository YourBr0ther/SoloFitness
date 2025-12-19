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
    // Optimistic update - immediately update UI before API responds
    onMutate: async (newData) => {
      // Cancel any outgoing refetches to prevent overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['dailyLog', 'today'] });

      // Snapshot the previous value
      const previousLog = queryClient.getQueryData<DailyLogData>(['dailyLog', 'today']);

      // Optimistically update the cache
      if (previousLog) {
        queryClient.setQueryData<DailyLogData>(['dailyLog', 'today'], {
          ...previousLog,
          ...newData,
        });
      }

      // Return context with the previous value for rollback
      return { previousLog };
    },
    // Rollback on error
    onError: (_err, _newData, context) => {
      if (context?.previousLog) {
        queryClient.setQueryData(['dailyLog', 'today'], context.previousLog);
      }
    },
    // Always refetch after error or success to ensure server state
    onSettled: async () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLog'] });
      queryClient.invalidateQueries({ queryKey: ['user'] });
      // Check for new achievements
      try {
        const response = await fetch('/api/achievements', { method: 'POST' });
        if (response.ok) {
          const data = await response.json();
          if (data.newUnlocks?.length > 0) {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['achievements'] });
          }
        }
      } catch (error) {
        console.error('Failed to check achievements:', error);
      }
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
    // Optimistic update for penalty toggle
    onMutate: async ({ penaltyId, completed }) => {
      await queryClient.cancelQueries({ queryKey: ['dailyLog', 'today'] });

      const previousLog = queryClient.getQueryData<DailyLogData>(['dailyLog', 'today']);

      if (previousLog) {
        queryClient.setQueryData<DailyLogData>(['dailyLog', 'today'], {
          ...previousLog,
          penalties: previousLog.penalties.map((p) =>
            p.id === penaltyId ? { ...p, completed } : p
          ),
        });
      }

      return { previousLog };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousLog) {
        queryClient.setQueryData(['dailyLog', 'today'], context.previousLog);
      }
    },
    onSettled: async () => {
      queryClient.invalidateQueries({ queryKey: ['dailyLog'] });
      // Check for "arise" achievement
      try {
        const response = await fetch('/api/achievements', { method: 'POST' });
        if (response.ok) {
          const data = await response.json();
          if (data.newUnlocks?.length > 0) {
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['achievements'] });
          }
        }
      } catch (error) {
        console.error('Failed to check achievements:', error);
      }
    },
  });
}
