import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getTodayDateString, parseDateString } from '@/lib/dateUtils';

// GET /api/penalties - Get today's penalties
export async function GET() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const dateString = getTodayDateString();
    const date = parseDateString(dateString);

    const log = await prisma.dailyLog.findUnique({
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

    return NextResponse.json({
      penalties: log?.penalties || [],
    });
  } catch (error) {
    console.error('Error fetching penalties:', error);
    return NextResponse.json(
      { error: 'Failed to fetch penalties' },
      { status: 500 }
    );
  }
}

// PATCH /api/penalties - Toggle penalty completion
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { penaltyId, completed } = body;

    if (!penaltyId) {
      return NextResponse.json(
        { error: 'Penalty ID required' },
        { status: 400 }
      );
    }

    // Validate completed is a boolean
    if (typeof completed !== 'boolean') {
      return NextResponse.json(
        { error: 'Completed must be a boolean' },
        { status: 400 }
      );
    }

    // Check current state for idempotency
    const currentPenalty = await prisma.penalty.findUnique({
      where: { id: penaltyId },
    });

    if (!currentPenalty) {
      return NextResponse.json(
        { error: 'Penalty not found' },
        { status: 404 }
      );
    }

    // Return early if already in desired state (idempotent)
    if (currentPenalty.completed === completed) {
      return NextResponse.json(currentPenalty);
    }

    const penalty = await prisma.penalty.update({
      where: { id: penaltyId },
      data: { completed },
    });

    return NextResponse.json(penalty);
  } catch (error) {
    console.error('Error updating penalty:', error);
    return NextResponse.json(
      { error: 'Failed to update penalty' },
      { status: 500 }
    );
  }
}
