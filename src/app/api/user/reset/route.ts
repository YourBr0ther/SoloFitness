import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// DELETE /api/user/reset - Reset all user data and start fresh
export async function DELETE() {
  try {
    const user = await prisma.user.findFirst();

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Use a transaction to delete all related data
    await prisma.$transaction([
      // Delete user achievements first (foreign key constraint)
      prisma.userAchievement.deleteMany({
        where: { userId: user.id },
      }),
      // Delete penalties
      prisma.penalty.deleteMany({
        where: { userId: user.id },
      }),
      // Delete daily logs
      prisma.dailyLog.deleteMany({
        where: { userId: user.id },
      }),
      // Delete the user
      prisma.user.delete({
        where: { id: user.id },
      }),
    ]);

    // Create a fresh user
    const newUser = await prisma.user.create({
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

    return NextResponse.json({
      success: true,
      message: 'All data has been reset. Your journey begins anew!',
      user: newUser,
    });
  } catch (error) {
    console.error('Error resetting user data:', error);
    return NextResponse.json(
      { error: 'Failed to reset user data' },
      { status: 500 }
    );
  }
}
