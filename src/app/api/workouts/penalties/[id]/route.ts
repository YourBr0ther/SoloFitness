import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-helper';

// PUT /api/workouts/penalties/[id] - Update penalty task
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
    const { count } = await request.json();
    const { id } = params;

    // Return updated penalty task
    // In a real implementation, this would update the database
    const task = {
      id,
      exercise: id.includes('pushups') ? 'Push-ups' : 
                id.includes('situps') ? 'Sit-ups' : 
                id.includes('squats') ? 'Squats' : 'Miles to run',
      count: count || 0,
      unit: id.includes('running') ? 'miles' : 'reps'
    };

    return NextResponse.json(task);
    
  } catch (error) {
    console.error('Error updating penalty task:', error);
    return NextResponse.json(
      { message: 'Failed to update penalty task' },
      { status: 500 }
    );
  }
} 