import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDayNumber, calculateDailyRequirements, calculateXP, isWorkoutComplete } from '@/lib/levelSystem';
import { calculatePenalties } from '@/lib/penaltySystem';
import { updateStreakOnComplete } from '@/lib/streakCalculator';
import { getTodayDateString, getYesterdayDateString, parseDateString } from '@/lib/dateUtils';

// GET /api/daily-log - Get today's log (or create if doesn't exist)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const dateParam = searchParams.get('date');

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const dateString = dateParam || getTodayDateString();
    const date = parseDateString(dateString);
    const dayNumber = getDayNumber(user.startDate);
    const requirements = calculateDailyRequirements(dayNumber);

    // Find existing log
    let log = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
      include: {
        penalties: true,
      },
    });

    // Create log if it doesn't exist for today
    if (!log && dateString === getTodayDateString()) {
      log = await prisma.dailyLog.create({
        data: {
          userId: user.id,
          date,
          pushups: 0,
          situps: 0,
          squats: 0,
          runningKm: 0,
          targetPushups: requirements.pushups,
          targetSitups: requirements.situps,
          targetSquats: requirements.squats,
          targetRunningKm: requirements.runningKm,
          completed: false,
          xpEarned: 0,
        },
        include: {
          penalties: true,
        },
      });

      // Check for penalties from yesterday
      const yesterdayString = getYesterdayDateString();
      const yesterday = parseDateString(yesterdayString);

      const yesterdayLog = await prisma.dailyLog.findUnique({
        where: {
          userId_date: {
            userId: user.id,
            date: yesterday,
          },
        },
      });

      if (yesterdayLog && !yesterdayLog.completed) {
        const yesterdayDayNumber = dayNumber - 1;
        const yesterdayRequirements = calculateDailyRequirements(yesterdayDayNumber);
        const penaltyCalcs = calculatePenalties(
          {
            pushups: yesterdayLog.pushups,
            situps: yesterdayLog.situps,
            squats: yesterdayLog.squats,
            runningKm: yesterdayLog.runningKm,
          },
          yesterdayRequirements
        );

        // Create penalties
        for (const penalty of penaltyCalcs) {
          await prisma.penalty.create({
            data: {
              userId: user.id,
              dailyLogId: log.id,
              exercise: penalty.exercise,
              amount: penalty.penaltyAmount,
              completed: false,
            },
          });
        }

        // Refetch log with penalties
        log = await prisma.dailyLog.findUnique({
          where: { id: log.id },
          include: { penalties: true },
        });
      }
    }

    if (!log) {
      return NextResponse.json(
        { error: 'Log not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...log,
      dayNumber,
      requirements,
    });
  } catch (error) {
    console.error('Error fetching daily log:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily log' },
      { status: 500 }
    );
  }
}

// POST /api/daily-log - Update today's log
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { pushups, situps, squats, runningKm } = body;

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const dateString = getTodayDateString();
    const date = parseDateString(dateString);
    const dayNumber = getDayNumber(user.startDate);
    const requirements = calculateDailyRequirements(dayNumber);

    // Get or create today's log
    let log = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: user.id,
          date,
        },
      },
    });

    const previousValues = log
      ? { pushups: log.pushups, situps: log.situps, squats: log.squats, runningKm: log.runningKm }
      : { pushups: 0, situps: 0, squats: 0, runningKm: 0 };

    const newValues = {
      pushups: pushups ?? previousValues.pushups,
      situps: situps ?? previousValues.situps,
      squats: squats ?? previousValues.squats,
      runningKm: runningKm ?? previousValues.runningKm,
    };

    const xpEarned = calculateXP(newValues, requirements);
    const completed = isWorkoutComplete(newValues, requirements);

    if (log) {
      // Update existing log
      log = await prisma.dailyLog.update({
        where: { id: log.id },
        data: {
          ...newValues,
          xpEarned,
          completed,
        },
        include: { penalties: true },
      });
    } else {
      // Create new log
      log = await prisma.dailyLog.create({
        data: {
          userId: user.id,
          date,
          ...newValues,
          targetPushups: requirements.pushups,
          targetSitups: requirements.situps,
          targetSquats: requirements.squats,
          targetRunningKm: requirements.runningKm,
          xpEarned,
          completed,
        },
        include: { penalties: true },
      });
    }

    // Calculate difference in values for lifetime stats
    const pushupsDiff = newValues.pushups - previousValues.pushups;
    const situpsDiff = newValues.situps - previousValues.situps;
    const squatsDiff = newValues.squats - previousValues.squats;
    const runningDiff = newValues.runningKm - previousValues.runningKm;

    // Calculate XP delta - check if ANY exercise had previous values
    const hadPreviousWork =
      previousValues.pushups > 0 ||
      previousValues.situps > 0 ||
      previousValues.squats > 0 ||
      previousValues.runningKm > 0;
    const previousXP = hadPreviousWork ? calculateXP(previousValues, requirements) : 0;
    const xpDelta = xpEarned - previousXP;

    // Update user stats
    const userUpdate: Record<string, unknown> = {
      totalPushups: { increment: Math.max(0, pushupsDiff) },
      totalSitups: { increment: Math.max(0, situpsDiff) },
      totalSquats: { increment: Math.max(0, squatsDiff) },
      totalRunningKm: { increment: Math.max(0, runningDiff) },
      currentXP: { increment: xpDelta },
    };

    // Update streak if workout is complete
    if (completed && !isWorkoutComplete(previousValues, requirements)) {
      const streakUpdate = updateStreakOnComplete(
        user.lastCompletedDate,
        user.currentStreak,
        user.longestStreak
      );

      userUpdate.currentStreak = streakUpdate.currentStreak;
      userUpdate.longestStreak = streakUpdate.longestStreak;
      userUpdate.lastCompletedDate = streakUpdate.lastCompletedDate;
      userUpdate.totalWorkouts = { increment: 1 };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: userUpdate,
    });

    return NextResponse.json({
      ...log,
      dayNumber,
      requirements,
    });
  } catch (error) {
    console.error('Error updating daily log:', error);
    return NextResponse.json(
      { error: 'Failed to update daily log' },
      { status: 500 }
    );
  }
}
