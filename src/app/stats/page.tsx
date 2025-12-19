'use client';

import { useUser } from '@/hooks/useUser';
import { useDailyLog } from '@/hooks/useDailyLog';
import { useAchievements } from '@/hooks/useAchievements';
import { Navigation } from '@/components/layout/Navigation';
import { Card } from '@/components/ui/Card';
import { ProgressRing } from '@/components/ui/ProgressRing';
import { LevelBadge } from '@/components/dashboard/LevelBadge';
import { formatDistance } from '@/lib/unitConversion';
import { formatFullDate } from '@/lib/dateUtils';
import { calculateCompletionPercentage } from '@/lib/levelSystem';
import { DistanceUnit } from '@/types';
import { Loader2, Flame, Zap, Trophy, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StatsPage() {
  const { data: user, isLoading: userLoading } = useUser();
  const { data: log, isLoading: logLoading } = useDailyLog();
  const { data: achievements, isLoading: achievementsLoading } = useAchievements();

  const isLoading = userLoading || logLoading || achievementsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!user || !log) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p>Unable to load stats</p>
      </div>
    );
  }

  const percentage = calculateCompletionPercentage(
    {
      pushups: log.pushups,
      situps: log.situps,
      squats: log.squats,
      runningKm: log.runningKm,
    },
    {
      pushups: log.targetPushups,
      situps: log.targetSitups,
      squats: log.targetSquats,
      runningKm: log.targetRunningKm,
      dayNumber: log.dayNumber,
    }
  );

  return (
    <main className="min-h-screen bg-background-dark pb-20">
      <div className="max-w-md mx-auto p-4">
        {/* Header - Shareable Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-elevated p-6 mb-6 relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-accent-cyan/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-accent-purple/20 rounded-full blur-3xl" />

          <div className="relative z-10">
            {/* App title */}
            <div className="flex items-center justify-between mb-4">
              <h1 className="font-heading text-2xl text-glow tracking-wide">
                SOLOFITNESS
              </h1>
              <LevelBadge level={user.currentLevel} dayNumber={user.dayNumber} />
            </div>

            {/* Date */}
            <p className="text-primary-400/60 text-sm mb-4">
              {formatFullDate(new Date())}
            </p>

            {/* Today's progress */}
            <div className="flex items-center gap-6 mb-6">
              <ProgressRing value={percentage} max={100} size={80}>
                <span className="text-xl font-bold">{percentage}%</span>
              </ProgressRing>
              <div>
                <p className="text-2xl font-bold gradient-text">Today&apos;s Workout</p>
                <p className="text-primary-400/80">
                  {log.completed ? 'Complete!' : 'In Progress'}
                </p>
              </div>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-streak">
                  <Flame size={16} />
                  <span className="text-2xl font-bold">{user.currentStreak}</span>
                </div>
                <p className="text-xs text-primary-400/60">Day Streak</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-accent-cyan">
                  <Zap size={16} />
                  <span className="text-2xl font-bold">{user.currentXP}</span>
                </div>
                <p className="text-xs text-primary-400/60">Total XP</p>
              </div>
              <div className="text-center">
                <div className="flex items-center justify-center gap-1 text-accent-purple">
                  <Trophy size={16} />
                  <span className="text-2xl font-bold">
                    {achievements?.unlockedCount || 0}
                  </span>
                </div>
                <p className="text-xs text-primary-400/60">Achievements</p>
              </div>
            </div>

            {/* Share prompt */}
            <p className="text-center text-xs text-primary-400/40 mt-4">
              Screenshot to share your progress
            </p>
          </div>
        </motion.div>

        {/* Lifetime Stats */}
        <h2 className="font-heading text-xl text-glow mb-4">LIFETIME STATS</h2>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <Card className="text-center">
            <span className="text-3xl font-bold gradient-text">
              {user.totalPushups.toLocaleString()}
            </span>
            <p className="text-sm text-primary-400/60">Push-ups</p>
          </Card>
          <Card className="text-center">
            <span className="text-3xl font-bold gradient-text">
              {user.totalSitups.toLocaleString()}
            </span>
            <p className="text-sm text-primary-400/60">Sit-ups</p>
          </Card>
          <Card className="text-center">
            <span className="text-3xl font-bold gradient-text">
              {user.totalSquats.toLocaleString()}
            </span>
            <p className="text-sm text-primary-400/60">Squats</p>
          </Card>
          <Card className="text-center">
            <span className="text-3xl font-bold gradient-text">
              {formatDistance(user.totalRunningKm, user.distanceUnit as DistanceUnit, 1)}
            </span>
            <p className="text-sm text-primary-400/60">Running</p>
          </Card>
        </div>

        {/* More stats */}
        <Card className="mb-6">
          <div className="flex items-center justify-between py-2 border-b border-primary-400/10">
            <span className="text-primary-400/80">Total Workouts</span>
            <span className="font-bold">{user.totalWorkouts}</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-primary-400/10">
            <span className="text-primary-400/80">Longest Streak</span>
            <span className="font-bold text-streak">{user.longestStreak} days</span>
          </div>
          <div className="flex items-center justify-between py-2 border-b border-primary-400/10">
            <span className="text-primary-400/80">Current Level</span>
            <span className="font-bold">Level {user.currentLevel}</span>
          </div>
          <div className="flex items-center justify-between py-2">
            <span className="text-primary-400/80">Day of Journey</span>
            <span className="font-bold">{user.dayNumber} / 365</span>
          </div>
        </Card>

        {/* Journey info */}
        <Card className="flex items-center gap-4">
          <Calendar className="text-primary-400" size={24} />
          <div>
            <p className="font-medium">Journey Started</p>
            <p className="text-sm text-primary-400/60">
              {formatFullDate(new Date(user.startDate))}
            </p>
          </div>
        </Card>
      </div>

      <Navigation />
    </main>
  );
}
