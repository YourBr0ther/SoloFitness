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

    const { penaltyId, completed } = await request.json();

    if (!penaltyId) {
      return NextResponse.json({ error: 'Penalty ID required' }, { status: 400 });
    }

    // Verify the penalty belongs to the user
    const penalty = await prisma.penalty.findFirst({
      where: {
        id: penaltyId,
        dailyLog: {
          userId: session.user.id,
        },
      },
    });

    if (!penalty) {
      return NextResponse.json({ error: 'Penalty not found' }, { status: 404 });
    }

    // Update penalty completion status
    const updatedPenalty = await prisma.penalty.update({
      where: { id: penaltyId },
      data: { completed: Boolean(completed) },
    });

    return NextResponse.json({ penalty: updatedPenalty });
  } catch (error) {
    console.error('Penalty update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}