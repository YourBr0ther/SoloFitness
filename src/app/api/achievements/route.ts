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
    const user = await prisma.user.findFirst({
      include: {
        achievements: true,
        dailyLogs: true, // Fetch all logs to check centurion achievements
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
      user.achievements.map((ua) =>
        allAchievements.find((a) => a.id === ua.achievementId)?.key
      )
    );

    const newUnlocks: string[] = [];

    // Check each achievement condition
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
          shouldUnlock = user.dailyLogs.some((log) => log.pushups >= 100);
          break;
        case 'situp_centurion':
          shouldUnlock = user.dailyLogs.some((log) => log.situps >= 100);
          break;
        case 'squat_centurion':
          shouldUnlock = user.dailyLogs.some((log) => log.squats >= 100);
          break;
        case 'marathon_runner':
          shouldUnlock = user.dailyLogs.some((log) => log.runningKm >= 10);
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
          shouldUnlock = user.dailyLogs.some((log) => log.completed);
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
          });
          shouldUnlock = !!completedPenalty;
          break;
      }

      if (shouldUnlock) {
        await prisma.userAchievement.create({
          data: {
            userId: user.id,
            achievementId: achievement.id,
          },
        });

        // Add XP reward
        await prisma.user.update({
          where: { id: user.id },
          data: {
            currentXP: { increment: achievement.xpReward },
          },
        });

        newUnlocks.push(achievement.key);
      }
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
