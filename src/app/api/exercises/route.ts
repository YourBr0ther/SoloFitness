import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// GET /api/exercises - Get all exercises
export async function GET() {
  try {
    const exercises = await prisma.exercise.findMany({
      orderBy: {
        name: 'asc'
      }
    });
    
    return NextResponse.json(exercises);
  } catch (error) {
    console.error('Error fetching exercises:', error);
    return NextResponse.json(
      { message: 'Failed to fetch exercises' },
      { status: 500 }
    );
  }
}

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

// POST /api/exercises - Create a new exercise
export async function POST(request: Request) {
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
    const { name, description, muscleGroup, equipment, difficulty, videoUrl, imageUrl } = await request.json();
    
    if (!name) {
      return NextResponse.json(
        { message: 'Exercise name is required' },
        { status: 400 }
      );
    }
    
    const exercise = await prisma.exercise.create({
      data: {
        name,
        description,
        muscleGroup,
        equipment,
        difficulty,
        videoUrl,
        imageUrl,
        userId
      }
    });
    
    return NextResponse.json(exercise, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { message: 'Failed to create exercise' },
      { status: 500 }
    );
  }
} 