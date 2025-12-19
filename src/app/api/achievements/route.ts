import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/achievements - Get all achievements with user unlock status
export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      include: {
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get all achievements
    const allAchievements = await prisma.achievement.findMany();

    // Map achievements with unlock status
    const achievementsWithStatus = allAchievements.map((achievement) => {
      const userAchievement = user.achievements.find(
        (ua) => ua.achievementId === achievement.id
      );

      return {
        ...achievement,
        unlocked: !!userAchievement,
        unlockedAt: userAchievement?.unlockedAt || null,
      };
    });

    return NextResponse.json({
      achievements: achievementsWithStatus,
      unlockedCount: user.achievements.length,
      totalCount: allAchievements.length,
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

// POST /api/achievements - Check and unlock achievements
export async function POST() {
  try {
    // Only fetch user and existing achievements - no daily logs
    const user = await prisma.user.findFirst({
      include: {
        achievements: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const allAchievements = await prisma.achievement.findMany();
    const unlockedKeys = new Set(
      user.achievements
        .map((ua) => allAchievements.find((a) => a.id === ua.achievementId)?.key)
        .filter((key): key is string => key !== undefined)
    );

    const newUnlocks: { key: string; name: string; icon: string; xpReward: number }[] = [];

    // Helper function for targeted daily log queries (only runs when needed)
    const checkDailyLogCondition = async (
      field: 'pushups' | 'situps' | 'squats' | 'runningKm' | 'completed',
      value: number | boolean
    ) => {
      const whereClause = { userId: user.id, [field]: typeof value === 'boolean' ? value : { gte: value } };
      const result = await prisma.dailyLog.findFirst({
        where: whereClause,
        select: { id: true },
      });
      return !!result;
    };

    // Check each achievement condition and collect achievements to unlock
    const achievementsToUnlock: typeof allAchievements = [];

    for (const achievement of allAchievements) {
      if (unlockedKeys.has(achievement.key)) continue;

      let shouldUnlock = false;

      switch (achievement.key) {
        case 'first_workout':
          shouldUnlock = user.totalWorkouts >= 1;
          break;
        case 'week_warrior':
          shouldUnlock = user.longestStreak >= 7;
          break;
        case 'two_week_streak':
          shouldUnlock = user.longestStreak >= 14;
          break;
        case 'month_master':
          shouldUnlock = user.longestStreak >= 30;
          break;
        case 'pushup_centurion':
          shouldUnlock = await checkDailyLogCondition('pushups', 100);
          break;
        case 'situp_centurion':
          shouldUnlock = await checkDailyLogCondition('situps', 100);
          break;
        case 'squat_centurion':
          shouldUnlock = await checkDailyLogCondition('squats', 100);
          break;
        case 'marathon_runner':
          shouldUnlock = await checkDailyLogCondition('runningKm', 10);
          break;
        case 'thousand_pushups':
          shouldUnlock = user.totalPushups >= 1000;
          break;
        case 'five_thousand_pushups':
          shouldUnlock = user.totalPushups >= 5000;
          break;
        case 'hundred_km':
          shouldUnlock = user.totalRunningKm >= 100;
          break;
        case 'perfect_day':
          shouldUnlock = await checkDailyLogCondition('completed', true);
          break;
        case 'shadow_monarch':
          // Check if user is on day 365
          const daysSinceStart = Math.floor(
            (Date.now() - user.startDate.getTime()) / (1000 * 60 * 60 * 24)
          );
          shouldUnlock = daysSinceStart >= 364;
          break;
        case 'arise':
          // Check if user has completed any penalty
          const completedPenalty = await prisma.penalty.findFirst({
            where: { userId: user.id, completed: true },
            select: { id: true },
          });
          shouldUnlock = !!completedPenalty;
          break;
      }

      if (shouldUnlock) {
        achievementsToUnlock.push(achievement);
      }
    }

    // Unlock all achievements in a single transaction
    if (achievementsToUnlock.length > 0) {
      const totalXpReward = achievementsToUnlock.reduce((sum, a) => sum + a.xpReward, 0);

      await prisma.$transaction(async (tx) => {
        // Create all achievement records
        await tx.userAchievement.createMany({
          data: achievementsToUnlock.map((achievement) => ({
            userId: user.id,
            achievementId: achievement.id,
          })),
        });

        // Update user XP once with total reward
        await tx.user.update({
          where: { id: user.id },
          data: {
            currentXP: { increment: totalXpReward },
          },
        });
      });

      // Build newUnlocks array for response
      achievementsToUnlock.forEach((achievement) => {
        newUnlocks.push({
          key: achievement.key,
          name: achievement.name,
          icon: achievement.icon,
          xpReward: achievement.xpReward,
        });
      });
    }

    return NextResponse.json({
      newUnlocks,
      message: newUnlocks.length > 0
        ? `Unlocked ${newUnlocks.length} new achievement(s)!`
        : 'No new achievements unlocked',
    });
  } catch (error) {
    console.error('Error checking achievements:', error);
    return NextResponse.json(
      { error: 'Failed to check achievements' },
      { status: 500 }
    );
  }
}
