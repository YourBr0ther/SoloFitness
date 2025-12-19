import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getDayNumber, calculateDailyRequirements, getCurrentLevel } from '@/lib/levelSystem';
import { calculateStreakStatus } from '@/lib/streakCalculator';

// GET /api/user - Get user data with computed fields
export async function GET() {
  try {
    // Get or create user
    let user = await prisma.user.findFirst();

    if (!user) {
      // Create default user
      user = await prisma.user.create({
        data: {
          distanceUnit: 'km',
          startDate: new Date(),
          currentXP: 0,
          currentStreak: 0,
          longestStreak: 0,
          totalPushups: 0,
          totalSitups: 0,
          totalSquats: 0,
          totalRunningKm: 0,
          totalWorkouts: 0,
        },
      });
    }

    // Calculate computed fields
    const dayNumber = getDayNumber(user.startDate);
    const requirements = calculateDailyRequirements(dayNumber);
    const currentLevel = getCurrentLevel(dayNumber);

    // Check streak status
    const streakStatus = calculateStreakStatus(
      user.lastCompletedDate,
      user.currentStreak
    );

    // Update streak if broken (uses conditional update to avoid race conditions)
    if (streakStatus.shouldReset && user.currentStreak > 0) {
      const updated = await prisma.user.updateMany({
        where: {
          id: user.id,
          currentStreak: { gt: 0 }, // Only update if streak still > 0
        },
        data: { currentStreak: 0 },
      });
      // Refresh user if streak was reset
      if (updated.count > 0) {
        user = { ...user, currentStreak: 0 };
      }
    }

    return NextResponse.json({
      ...user,
      dayNumber,
      currentLevel,
      requirements,
      streakStatus: {
        isActive: !streakStatus.streakBroken,
        currentStreak: streakStatus.newStreak,
      },
    });
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user' },
      { status: 500 }
    );
  }
}

// PATCH /api/user - Update user settings
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { distanceUnit } = body;

    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        ...(distanceUnit && { distanceUnit }),
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 }
    );
  }
}
