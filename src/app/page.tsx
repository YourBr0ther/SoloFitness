'use client';

import { useUser } from '@/hooks/useUser';
import { useDailyLog, useUpdateDailyLog, useTogglePenalty } from '@/hooks/useDailyLog';
import { Navigation } from '@/components/layout/Navigation';
import { StreakCounter } from '@/components/dashboard/StreakCounter';
import { ExerciseCard } from '@/components/dashboard/ExerciseCard';
import { TodayProgress } from '@/components/dashboard/TodayProgress';
import { PenaltyBanner } from '@/components/dashboard/PenaltyBanner';
import { LevelBadge } from '@/components/dashboard/LevelBadge';
import { calculateCompletionPercentage } from '@/lib/levelSystem';
import { ExerciseType, DistanceUnit } from '@/types';
import { Loader2, RefreshCw, AlertCircle } from 'lucide-react';

export default function Dashboard() {
  const { data: user, isLoading: userLoading, error: userError, refetch: refetchUser } = useUser();
  const { data: log, isLoading: logLoading, error: logError, refetch: refetchLog } = useDailyLog();
  const updateLog = useUpdateDailyLog();
  const togglePenalty = useTogglePenalty();

  const isLoading = userLoading || logLoading;
  const hasError = userError || logError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (hasError) {
    const handleRetry = () => {
      if (userError) refetchUser();
      if (logError) refetchLog();
    };

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-sm">
          <AlertCircle className="w-12 h-12 text-danger mx-auto mb-4" />
          <p className="text-xl font-semibold mb-2">Unable to Load Data</p>
          <p className="text-primary-400/60 text-sm mb-6">
            {userError ? 'Failed to load user data' : 'Failed to load today\'s workout'}
          </p>
          <button
            onClick={handleRetry}
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600
                       hover:bg-primary-500 rounded-lg font-medium transition-colors"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!user || !log) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 text-center">
        <div>
          <AlertCircle className="w-12 h-12 text-warning mx-auto mb-4" />
          <p className="text-xl mb-2">No Data Found</p>
          <p className="text-primary-400/60 text-sm">
            Please check your database connection
          </p>
        </div>
      </div>
    );
  }

  const exercises: ExerciseType[] = ['pushups', 'situps', 'squats', 'running'];

  const handleExerciseUpdate = (type: ExerciseType, value: number) => {
    updateLog.mutate({ [type === 'running' ? 'runningKm' : type]: value });
  };

  const handlePenaltyToggle = (penaltyId: string, completed: boolean) => {
    togglePenalty.mutate({ penaltyId, completed });
  };

  const completedCount = exercises.filter((type) => {
    const current = type === 'running' ? log.runningKm : log[type];
    const target = type === 'running' ? log.targetRunningKm : log[`target${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof log];
    return current >= (target as number);
  }).length;

  const percentage = calculateCompletionPercentage(
    {
      pushups: log.pushups,
      situps: log.situps,
      squats: log.squats,
      runningKm: log.runningKm,
    },
    log.requirements
  );

  // Get penalty amounts per exercise
  const penaltiesByExercise = log.penalties?.reduce(
    (acc, p) => {
      if (!p.completed) {
        acc[p.exercise as ExerciseType] = (acc[p.exercise as ExerciseType] || 0) + p.amount;
      }
      return acc;
    },
    {} as Record<ExerciseType, number>
  ) || {};

  return (
    <main className="min-h-screen bg-background-dark pb-20">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <header className="flex items-center justify-between mb-6">
          <h1 className="font-heading text-3xl text-glow tracking-wide">
            SOLOFITNESS
          </h1>
          <LevelBadge
            level={user.currentLevel}
            dayNumber={user.dayNumber}
            showProgress
          />
        </header>

        {/* Streak Counter */}
        <StreakCounter
          currentStreak={user.streakStatus.currentStreak}
          longestStreak={user.longestStreak}
          isActive={user.streakStatus.isActive}
        />

        {/* Today's Progress */}
        <TodayProgress
          completedExercises={completedCount}
          totalExercises={4}
          xpEarned={log.xpEarned}
          percentage={percentage}
        />

        {/* Penalty Banner */}
        {log.penalties && log.penalties.length > 0 && (
          <PenaltyBanner
            penalties={log.penalties}
            distanceUnit={user.distanceUnit as DistanceUnit}
            onToggle={handlePenaltyToggle}
          />
        )}

        {/* Exercise Cards */}
        <div className="space-y-4">
          {exercises.map((type) => {
            const current = type === 'running' ? log.runningKm : log[type];
            const target =
              type === 'running'
                ? log.targetRunningKm
                : log[`target${type.charAt(0).toUpperCase() + type.slice(1)}` as keyof typeof log];

            return (
              <ExerciseCard
                key={type}
                type={type}
                current={current as number}
                target={target as number}
                distanceUnit={user.distanceUnit as DistanceUnit}
                onUpdate={(value) => handleExerciseUpdate(type, value)}
                penaltyAmount={penaltiesByExercise[type]}
              />
            );
          })}
        </div>

        {/* Day info */}
        <p className="text-center text-primary-400/40 text-sm mt-6">
          Day {user.dayNumber} of 365 &bull; Total XP: {user.currentXP}
        </p>
      </div>

      <Navigation />
    </main>
  );
}
