import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Utility function for auth within this file
function getAuthToken() {
  const headersList = headers();
  const authorization = headersList.get('Authorization');
  
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET /api/exercises/[id] - Get a single exercise
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    const exercise = await prisma.exercise.findUnique({
      where: { id }
    });
    
    if (!exercise) {
      return NextResponse.json(
        { message: 'Exercise not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(exercise);
  } catch (error) {
    console.error('Error fetching exercise:', error);
    return NextResponse.json(
      { message: 'Failed to fetch exercise' },
      { status: 500 }
    );
  }
}

// PUT /api/exercises/[id] - Update an exercise
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Get auth token
  const decoded = getAuthToken();
  
  if (!decoded) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const userId = decoded.userId;
    const id = params.id;
    const { name, description, muscleGroup, equipment, difficulty, videoUrl, imageUrl } = await request.json();
    
    // Check if exercise exists
    const existingExercise = await prisma.exercise.findUnique({
      where: { id }
    });
    
    if (!existingExercise) {
      return NextResponse.json(
        { message: 'Exercise not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns this exercise
    if (existingExercise.userId !== userId) {
      return NextResponse.json(
        { message: 'Not authorized to update this exercise' },
        { status: 403 }
      );
    }
    
    // Update exercise
    const updatedExercise = await prisma.exercise.update({
      where: { id },
      data: {
        name,
        description,
        muscleGroup,
        equipment,
        difficulty,
        videoUrl,
        imageUrl
      }
    });
    
    return NextResponse.json(updatedExercise);
  } catch (error) {
    console.error('Error updating exercise:', error);
    return NextResponse.json(
      { message: 'Failed to update exercise' },
      { status: 500 }
    );
  }
}

// DELETE /api/exercises/[id] - Delete an exercise
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  // Get auth token
  const decoded = getAuthToken();
  
  if (!decoded) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const userId = decoded.userId;
    const id = params.id;
    
    // Check if exercise exists
    const existingExercise = await prisma.exercise.findUnique({
      where: { id }
    });
    
    if (!existingExercise) {
      return NextResponse.json(
        { message: 'Exercise not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns this exercise
    if (existingExercise.userId !== userId) {
      return NextResponse.json(
        { message: 'Not authorized to delete this exercise' },
        { status: 403 }
      );
    }
    
    // Delete exercise
    await prisma.exercise.delete({
      where: { id }
    });
    
    return NextResponse.json(
      { message: 'Exercise deleted successfully' }
    );
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json(
      { message: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
} 