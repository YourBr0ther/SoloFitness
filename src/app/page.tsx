'use client';

import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import StreakCounter from '@/components/dashboard/StreakCounter';
import ProfileAvatar from '@/components/dashboard/ProfileAvatar';
import XPDisplay from '@/components/dashboard/XPDisplay';
import LevelProgressBar from '@/components/dashboard/LevelProgressBar';
import ExerciseCard from '@/components/dashboard/ExerciseCard';
import PenaltyCard from '@/components/dashboard/PenaltyCard';
import BonusTaskCard from '@/components/dashboard/BonusTaskCard';
import { LEVEL_REQUIREMENTS } from '@/lib/level-system';
import { DailyLog, User, Penalty, BonusTask } from '@/types';
import { notificationManager } from '@/lib/notifications';

interface DashboardData {
  dailyLog: DailyLog;
  user: User & {
    settings?: {
      notificationsEnabled?: boolean;
      achievementNotifications?: boolean;
      streakReminders?: boolean;
    };
  };
  requirements: typeof LEVEL_REQUIREMENTS[1];
  levelInfo: {
    currentLevel: number;
    nextLevelXP: number;
    progress: number;
  };
}

export default function Dashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchDashboardData();
    }
  }, [status]);

  const fetchDashboardData = async () => {
    try {
      setError(null);
      const response = await fetch('/api/daily-log');
      if (response.ok) {
        const dashboardData = await response.json();
        setData(dashboardData);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to load dashboard data');
      }
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const updateExercise = async (field: string, value: number) => {
    if (!data) return;

    const updatedData = {
      pushups: data.dailyLog.pushups,
      situps: data.dailyLog.situps,
      squats: data.dailyLog.squats,
      milesRan: data.dailyLog.milesRan,
      [field]: value,
    };

    try {
      const response = await fetch('/api/daily-log', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        const responseData = await response.json();
        
        // Handle notifications based on API response (only if user has notifications enabled)
        if (responseData.notifications && data?.user?.settings?.notificationsEnabled) {
          const { notifications } = responseData;
          
          // Show workout completion notification
          if (notifications.workoutCompleted && notifications.xpGained > 0) {
            await notificationManager.showWorkoutCompleteNotification(
              notifications.xpGained,
              notifications.newLevel
            );
          }
          
          // Show streak milestone notification
          if (notifications.newStreak && data?.user?.settings?.streakReminders) {
            await notificationManager.showStreakNotification(notifications.newStreak);
          }
          
          // Show achievement notifications
          if (notifications.newlyUnlocked && notifications.newlyUnlocked.length > 0 && 
              data?.user?.settings?.achievementNotifications) {
            for (const achievement of notifications.newlyUnlocked) {
              await notificationManager.showAchievementNotification(
                achievement.name,
                achievement.description
              );
            }
          }
        }
        
        fetchDashboardData(); // Refresh data
      } else {
        const errorData = await response.json().catch(() => ({}));
        setError(errorData.error || 'Failed to update exercise');
      }
    } catch (error) {
      console.error('Failed to update exercise:', error);
      setError('Failed to update. Please try again.');
    }
  };

  const togglePenalty = async (penaltyId: string) => {
    if (!data) return;

    try {
      const response = await fetch('/api/penalties', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          penaltyId, 
          completed: true 
        }),
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      } else {
        console.error('Failed to update penalty');
      }
    } catch (error) {
      console.error('Failed to update penalty:', error);
    }
  };

  const toggleBonusTask = async () => {
    if (!data || !data.dailyLog.bonusTasks?.length) return;

    const bonusTask = data.dailyLog.bonusTasks[0];
    
    try {
      const response = await fetch('/api/bonus-tasks', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          bonusTaskId: bonusTask.id, 
          completed: !bonusTask.completed 
        }),
      });

      if (response.ok) {
        fetchDashboardData(); // Refresh data
      } else {
        console.error('Failed to update bonus task');
      }
    } catch (error) {
      console.error('Failed to update bonus task:', error);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-primary-400 text-xl">Loading your adventure...</div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-xl mb-4">{error}</div>
          <button 
            onClick={() => {
              setLoading(true);
              fetchDashboardData();
            }}
            className="bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!data || !session) {
    return (
      <div className="min-h-screen bg-background-dark flex items-center justify-center">
        <div className="text-red-400 text-xl">Failed to load dashboard</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-dark">
      {/* Header */}
      <header className="bg-primary-900/50 border-b border-primary-700 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <ProfileAvatar 
            username={session.user.username} 
            level={data.levelInfo.currentLevel}
            profilePicture={data.user.profilePicture}
          />
          
          <div className="flex items-center space-x-4">
            <Link
              href="/profile"
              className="text-primary-400 hover:text-primary-300 transition-colors"
            >
              Profile
            </Link>
            <button
              onClick={() => signOut()}
              className="text-gray-400 hover:text-gray-300 transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StreakCounter 
            currentStreak={data.user.currentStreak} 
            longestStreak={data.user.longestStreak} 
          />
          <XPDisplay 
            todayXP={data.dailyLog.xpEarned} 
            totalXP={data.user.totalXP} 
          />
          <LevelProgressBar 
            currentLevel={data.levelInfo.currentLevel}
            progress={data.levelInfo.progress}
            nextLevelXP={data.levelInfo.nextLevelXP}
          />
        </div>

        {/* Exercises Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <ExerciseCard
            title="Push-ups"
            current={data.dailyLog.pushups}
            target={data.requirements.pushups}
            unit="reps"
            icon="💪"
            onUpdate={(value) => updateExercise('pushups', value)}
          />
          <ExerciseCard
            title="Sit-ups"
            current={data.dailyLog.situps}
            target={data.requirements.situps}
            unit="reps"
            icon="🔥"
            onUpdate={(value) => updateExercise('situps', value)}
          />
          <ExerciseCard
            title="Squats"
            current={data.dailyLog.squats}
            target={data.requirements.squats}
            unit="reps"
            icon="🦵"
            onUpdate={(value) => updateExercise('squats', value)}
          />
          <ExerciseCard
            title="Running"
            current={data.dailyLog.milesRan}
            target={data.requirements.miles}
            unit="miles"
            icon="🏃‍♂️"
            onUpdate={(value) => updateExercise('milesRan', value)}
          />
        </div>

        {/* Special Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.dailyLog.penalties && data.dailyLog.penalties.length > 0 && (
            <PenaltyCard 
              penalties={data.dailyLog.penalties}
              onToggleComplete={togglePenalty}
            />
          )}
          
          {data.dailyLog.bonusTasks && data.dailyLog.bonusTasks.length > 0 && (
            <BonusTaskCard 
              bonusTask={data.dailyLog.bonusTasks[0]}
              onToggleComplete={toggleBonusTask}
            />
          )}
        </div>

        {/* Motivational Footer */}
        <div className="text-center mt-8 py-6">
          <p className="text-gray-400 text-sm mb-2">
            "The weakest hunter can become the strongest."
          </p>
          <p className="text-primary-400 text-xs">
            Keep training, Solo Hunter. Your journey has just begun. 🗡️
          </p>
        </div>
      </main>
    </div>
  );
}