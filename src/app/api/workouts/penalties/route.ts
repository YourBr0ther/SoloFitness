import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-helper';

// GET /api/workouts/penalties - Get penalty tasks
export async function GET() {
  const user = await authenticate();
  
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Return penalty tasks based on user's level
    // For now, we'll return a fixed set of tasks
    const penaltyTasks = [
      {
        id: 'penalty-pushups',
        exercise: 'Push-ups',
        count: 10,
        unit: 'reps'
      },
      {
        id: 'penalty-situps',
        exercise: 'Sit-ups',
        count: 15,
        unit: 'reps'
      },
      {
        id: 'penalty-squats',
        exercise: 'Squats',
        count: 10,
        unit: 'reps'
      },
      {
        id: 'penalty-running',
        exercise: 'Miles to run',
        count: 0.5,
        unit: 'miles'
      }
    ];

    return NextResponse.json(penaltyTasks);
    
  } catch (error) {
    console.error('Error fetching penalty tasks:', error);
    return NextResponse.json(
      { message: 'Failed to fetch penalty tasks' },
      { status: 500 }
    );
  }
} 