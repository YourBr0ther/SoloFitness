import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-helper';
import type { BonusTask } from '@/types/journal';

// GET /api/workouts/bonus - Get bonus tasks
export async function GET() {
  const user = await authenticate();
  
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Return predefined bonus tasks
    const bonusTasks: BonusTask[] = [
      {
        id: 'bonus-plank',
        exercise: 'Plank',
        count: 0,
        unit: 'minutes'
      },
      {
        id: 'bonus-burpees',
        exercise: 'Burpees',
        count: 0,
        unit: 'reps'
      },
      {
        id: 'bonus-jumpingjacks',
        exercise: 'Jumping Jacks',
        count: 0,
        unit: 'reps'
      }
    ];

    return NextResponse.json(bonusTasks);
  } catch (error) {
    console.error('Error fetching bonus tasks:', error);
    return NextResponse.json(
      { message: 'Failed to fetch bonus tasks' },
      { status: 500 }
    );
  }
} 