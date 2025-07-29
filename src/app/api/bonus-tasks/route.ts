import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bonusTaskId, completed } = await request.json();

    if (!bonusTaskId) {
      return NextResponse.json({ error: 'Bonus task ID required' }, { status: 400 });
    }

    // Verify the bonus task belongs to the user
    const bonusTask = await prisma.bonusTask.findFirst({
      where: {
        id: bonusTaskId,
        dailyLog: {
          userId: session.user.id,
        },
      },
    });

    if (!bonusTask) {
      return NextResponse.json({ error: 'Bonus task not found' }, { status: 404 });
    }

    // Update bonus task completion status
    const updatedBonusTask = await prisma.bonusTask.update({
      where: { id: bonusTaskId },
      data: { completed: Boolean(completed) },
    });

    // If completing the bonus task, award bonus XP
    if (completed && !bonusTask.completed) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const dailyLog = await prisma.dailyLog.findUnique({
        where: {
          userId_date: {
            userId: session.user.id,
            date: today,
          },
        },
      });

      if (dailyLog) {
        const bonusXP = 10; // Fixed bonus XP amount
        
        await prisma.dailyLog.update({
          where: { id: dailyLog.id },
          data: {
            xpEarned: dailyLog.xpEarned + bonusXP,
          },
        });

        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            totalXP: { increment: bonusXP },
          },
        });
      }
    }

    return NextResponse.json({ bonusTask: updatedBonusTask });
  } catch (error) {
    console.error('Bonus task update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}