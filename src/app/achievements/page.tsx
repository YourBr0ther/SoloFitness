'use client';

import { useAchievements } from '@/hooks/useAchievements';
import { Navigation } from '@/components/layout/Navigation';
import { Card } from '@/components/ui/Card';
import { Loader2, Lock, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AchievementsPage() {
  const { data, isLoading } = useAchievements();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <p>Unable to load achievements</p>
      </div>
    );
  }

  const { achievements, unlockedCount, totalCount } = data;

  // Sort: unlocked first, then by name
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return a.name.localeCompare(b.name);
  });

  return (
    <main className="min-h-screen bg-background-dark pb-20">
      <div className="max-w-md mx-auto p-4">
        {/* Header */}
        <header className="mb-6">
          <h1 className="font-heading text-3xl text-glow tracking-wide mb-2">
            AWARDS
          </h1>
          <div className="flex items-center gap-2">
            <Sparkles className="text-accent-cyan" size={20} />
            <span className="text-primary-400">
              {unlockedCount} / {totalCount} Unlocked
            </span>
          </div>
        </header>

        {/* Progress bar */}
        <div className="mb-6">
          <div className="progress-bar h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              className="progress-bar-fill h-full"
            />
          </div>
        </div>

        {/* Achievement grid */}
        <div className="grid grid-cols-2 gap-4">
          {sortedAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card
                className={`text-center relative overflow-hidden ${
                  achievement.unlocked
                    ? 'border-accent-cyan/30'
                    : 'opacity-60 grayscale'
                }`}
                glowing={achievement.unlocked}
              >
                {/* Locked overlay */}
                {!achievement.unlocked && (
                  <div className="absolute top-2 right-2">
                    <Lock size={14} className="text-primary-400/40" />
                  </div>
                )}

                {/* Icon */}
                <motion.div
                  className="text-4xl mb-2"
                  animate={
                    achievement.unlocked
                      ? { scale: [1, 1.1, 1] }
                      : {}
                  }
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    repeatType: 'reverse',
                  }}
                >
                  {achievement.icon}
                </motion.div>

                {/* Name */}
                <h3 className="font-semibold text-sm mb-1">
                  {achievement.name}
                </h3>

                {/* Description */}
                <p className="text-xs text-primary-400/60 mb-2">
                  {achievement.description}
                </p>

                {/* XP reward */}
                <div
                  className={`text-xs font-medium ${
                    achievement.unlocked ? 'text-accent-cyan' : 'text-primary-400/40'
                  }`}
                >
                  +{achievement.xpReward} XP
                </div>

                {/* Unlock date */}
                {achievement.unlocked && achievement.unlockedAt && (
                  <p className="text-xs text-primary-400/40 mt-1">
                    {new Date(achievement.unlockedAt).toLocaleDateString()}
                  </p>
                )}
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Empty state */}
        {achievements.length === 0 && (
          <div className="text-center py-12">
            <Sparkles className="mx-auto text-primary-400/40 mb-4" size={48} />
            <p className="text-primary-400/60">No achievements yet</p>
            <p className="text-sm text-primary-400/40">
              Complete workouts to unlock achievements
            </p>
          </div>
        )}
      </div>

      <Navigation />
    </main>
  );
}
