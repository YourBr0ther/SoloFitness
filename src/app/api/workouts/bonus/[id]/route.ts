import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-helper';
import type { BonusTask } from '@/types/journal';

// PUT /api/workouts/bonus/[id] - Update a bonus task
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const user = await authenticate();
  
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { id } = params;
    const data = await request.json();

    // Validate the bonus task exists
    const validBonusTasks = ['bonus-plank', 'bonus-burpees', 'bonus-jumpingjacks'];
    if (!validBonusTasks.includes(id)) {
      return NextResponse.json(
        { message: 'Invalid bonus task ID' },
        { status: 400 }
      );
    }

    // Get exercise type based on ID
    let exercise = '';
    let unit = 'reps';
    
    switch(id) {
      case 'bonus-plank':
        exercise = 'Plank';
        unit = 'minutes';
        break;
      case 'bonus-burpees':
        exercise = 'Burpees';
        break;
      case 'bonus-jumpingjacks':
        exercise = 'Jumping Jacks';
        break;
    }

    // In a real implementation, this would update the database
    const updatedTask: BonusTask = {
      id,
      exercise,
      count: data.count || 0,
      unit
    };

    return NextResponse.json(updatedTask);
    
  } catch (error) {
    console.error('Error updating bonus task:', error);
    return NextResponse.json(
      { message: 'Failed to update bonus task' },
      { status: 500 }
    );
  }
} 