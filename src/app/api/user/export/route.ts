import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDayNumber, calculateDailyRequirements, getCurrentLevel } from '@/lib/levelSystem';
import { calculateStreakStatus } from '@/lib/streakCalculator';

// GET /api/user/export - Export all user data for backup
export async function GET() {
  try {
    const user = await prisma.user.findFirst({
      include: {
        dailyLogs: {
          include: {
            penalties: true,
          },
          orderBy: { date: 'asc' },
        },
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

    // Calculate computed fields
    const dayNumber = getDayNumber(user.startDate);
    const requirements = calculateDailyRequirements(dayNumber);
    const currentLevel = getCurrentLevel(dayNumber);
    const streakStatus = calculateStreakStatus(
      user.lastCompletedDate,
      user.currentStreak
    );

    // Format the export data
    const exportData = {
      exportedAt: new Date().toISOString(),
      version: '3.0',
      user: {
        id: user.id,
        createdAt: user.createdAt,
        distanceUnit: user.distanceUnit,
        startDate: user.startDate,
        currentXP: user.currentXP,
        currentStreak: user.currentStreak,
        longestStreak: user.longestStreak,
        lastCompletedDate: user.lastCompletedDate,
        totalPushups: user.totalPushups,
        totalSitups: user.totalSitups,
        totalSquats: user.totalSquats,
        totalRunningKm: user.totalRunningKm,
        totalWorkouts: user.totalWorkouts,
        // Computed fields
        dayNumber,
        currentLevel,
        requirements,
        streakStatus: {
          isActive: !streakStatus.streakBroken,
          currentStreak: streakStatus.newStreak,
        },
      },
      dailyLogs: user.dailyLogs.map((log) => ({
        id: log.id,
        date: log.date,
        pushups: log.pushups,
        situps: log.situps,
        squats: log.squats,
        runningKm: log.runningKm,
        targetPushups: log.targetPushups,
        targetSitups: log.targetSitups,
        targetSquats: log.targetSquats,
        targetRunningKm: log.targetRunningKm,
        completed: log.completed,
        xpEarned: log.xpEarned,
        penalties: log.penalties.map((p) => ({
          exercise: p.exercise,
          amount: p.amount,
          completed: p.completed,
          createdAt: p.createdAt,
        })),
      })),
      achievements: user.achievements.map((ua) => ({
        key: ua.achievement.key,
        name: ua.achievement.name,
        description: ua.achievement.description,
        icon: ua.achievement.icon,
        xpReward: ua.achievement.xpReward,
        unlockedAt: ua.unlockedAt,
      })),
      statistics: {
        totalDaysLogged: user.dailyLogs.length,
        completedWorkouts: user.dailyLogs.filter((l) => l.completed).length,
        totalXPEarned: user.currentXP,
        achievementsUnlocked: user.achievements.length,
      },
    };

    return NextResponse.json(exportData);
  } catch (error) {
    console.error('Error exporting user data:', error);
    return NextResponse.json(
      { error: 'Failed to export user data' },
      { status: 500 }
    );
  }
}
