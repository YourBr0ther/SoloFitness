import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { calculateDailyXP, calculateCompletionPercentage, LEVEL_REQUIREMENTS, getNextLevelXP } from '@/lib/level-system';
import { getRandomBonusTask, shouldAssignBonusTask } from '@/lib/bonus-tasks';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let dailyLog = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      include: {
        penalties: true,
        bonusTasks: true,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { settings: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create today's log if it doesn't exist
    if (!dailyLog) {
      // Check for penalties from yesterday
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      // Check if streak should be reset
      const yesterdayLog = await prisma.dailyLog.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: yesterday,
          },
        },
      });

      // If yesterday wasn't completed and user has a streak, reset it
      if (user.currentStreak > 0 && (!yesterdayLog || !yesterdayLog.completed)) {
        await prisma.user.update({
          where: { id: session.user.id },
          data: { currentStreak: 0 },
        });
        user.currentStreak = 0;
      }

      const penalties = [];
      if (yesterdayLog && !yesterdayLog.completed && user.settings?.penaltiesEnabled) {
        // Clamp level between 1 and 10
        const clampedLevel = Math.max(1, Math.min(10, user.level));
        const requirements = LEVEL_REQUIREMENTS[clampedLevel];
        
        if (requirements) {
          if (yesterdayLog.pushups < requirements.pushups) {
            penalties.push({
              exercise: 'pushups',
              amount: Math.ceil((requirements.pushups - yesterdayLog.pushups) * 0.25),
            });
          }
          if (yesterdayLog.situps < requirements.situps) {
            penalties.push({
              exercise: 'situps',
              amount: Math.ceil((requirements.situps - yesterdayLog.situps) * 0.25),
            });
          }
          if (yesterdayLog.squats < requirements.squats) {
            penalties.push({
              exercise: 'squats',
              amount: Math.ceil((requirements.squats - yesterdayLog.squats) * 0.25),
            });
          }
          if (yesterdayLog.milesRan < requirements.miles) {
            penalties.push({
              exercise: 'miles',
              amount: parseFloat(((requirements.miles - yesterdayLog.milesRan) * 0.25).toFixed(1)),
            });
          }
        }
      }

      // Create bonus task if eligible
      const bonusTask = (user.settings?.bonusEnabled && shouldAssignBonusTask(user.currentStreak))
        ? { task: getRandomBonusTask() }
        : undefined;

      dailyLog = await prisma.dailyLog.create({
        data: {
          userId: session.user.id,
          date: today,
          penalties: penalties.length > 0 ? {
            create: penalties,
          } : undefined,
          bonusTasks: bonusTask ? {
            create: [bonusTask],
          } : undefined,
        },
        include: {
          penalties: true,
          bonusTasks: true,
        },
      });
    }

    // Get level requirements and progress (with level clamping)
    const clampedLevel = Math.max(1, Math.min(10, user.level));
    const requirements = LEVEL_REQUIREMENTS[clampedLevel];
    const levelInfo = getNextLevelXP(user.totalXP);

    return NextResponse.json({
      dailyLog,
      user,
      requirements,
      levelInfo,
    });
  } catch (error) {
    console.error('Daily log fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { pushups, situps, squats, milesRan } = await request.json();

    // Validate and sanitize input values
    const validateExerciseValue = (value: any, max: number = 1000): number => {
      const num = parseFloat(value) || 0;
      return Math.max(0, Math.min(max, num));
    };

    const validatedPushups = validateExerciseValue(pushups);
    const validatedSitups = validateExerciseValue(situps);
    const validatedSquats = validateExerciseValue(squats);
    const validatedMiles = validateExerciseValue(milesRan, 50); // Max 50 miles per day

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Calculate completion and XP using validated values
    const completionPercentage = calculateCompletionPercentage(
      user.level,
      validatedPushups,
      validatedSitups,
      validatedSquats,
      validatedMiles
    );

    const xpEarned = calculateDailyXP(user.level, completionPercentage);
    const isCompleted = completionPercentage >= 1;

    // Get the existing daily log BEFORE updating to calculate XP delta correctly
    const existingDailyLog = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    });
    
    const previousXP = existingDailyLog?.xpEarned || 0;
    const xpDelta = xpEarned - previousXP;

    // Update daily log
    const updatedLog = await prisma.dailyLog.upsert({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
      update: {
        pushups: validatedPushups,
        situps: validatedSitups,
        squats: validatedSquats,
        milesRan: validatedMiles,
        xpEarned,
        completed: isCompleted,
      },
      create: {
        userId: session.user.id,
        date: today,
        pushups: validatedPushups,
        situps: validatedSitups,
        squats: validatedSquats,
        milesRan: validatedMiles,
        xpEarned,
        completed: isCompleted,
      },
      include: {
        penalties: true,
        bonusTasks: true,
      },
    });
    const newTotalXP = user.totalXP + xpDelta;
    const levelInfo = getNextLevelXP(newTotalXP);

    // Update user XP and level
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalXP: newTotalXP,
        level: levelInfo.currentLevel,
      },
    });

    // Update streak if this completes the day for the first time
    if (isCompleted && !existingDailyLog?.completed) {
      // Check yesterday for streak continuation
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);

      const yesterdayLog = await prisma.dailyLog.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: yesterday,
          },
        },
      });

      let newStreak = 1;
      if (yesterdayLog?.completed) {
        // Continue streak
        newStreak = updatedUser.currentStreak + 1;
      }

      await prisma.user.update({
        where: { id: session.user.id },
        data: {
          currentStreak: newStreak,
          longestStreak: Math.max(newStreak, updatedUser.longestStreak),
        },
      });
    }

    return NextResponse.json({ 
      dailyLog: updatedLog,
      levelInfo,
      newTotalXP,
    });
  } catch (error) {
    console.error('Daily log update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}