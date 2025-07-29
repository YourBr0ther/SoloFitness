import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get last 30 days of logs for calendar view
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const logs = await prisma.dailyLog.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: thirtyDaysAgo,
        },
      },
      orderBy: {
        date: 'desc',
      },
    });

    return NextResponse.json({ logs });
  } catch (error) {
    console.error('Streak fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update streak based on today's completion
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLog = await prisma.dailyLog.findUnique({
      where: {
        userId_date: {
          userId: session.user.id,
          date: today,
        },
      },
    });

    if (!todayLog || !todayLog.completed) {
      return NextResponse.json({ error: 'Today not completed yet' }, { status: 400 });
    }

    // Check yesterday
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

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    let newStreak = 1;
    
    if (yesterdayLog?.completed) {
      // Continue streak
      newStreak = user.currentStreak + 1;
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        currentStreak: newStreak,
        longestStreak: Math.max(newStreak, user.longestStreak),
      },
    });

    return NextResponse.json({ 
      currentStreak: updatedUser.currentStreak,
      longestStreak: updatedUser.longestStreak,
    });
  } catch (error) {
    console.error('Streak update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}