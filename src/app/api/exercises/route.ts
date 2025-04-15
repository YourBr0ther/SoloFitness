import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface Exercise {
  _id: ObjectId;
  name: string;
  description?: string;
  muscleGroup?: string;
  equipment?: string;
  difficulty?: string;
  videoUrl?: string;
  imageUrl?: string;
  userId: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// GET /api/exercises - Get all exercises
export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db('solofitness');
    
    const exercises = await db.collection('exercises')
      .find<Exercise>({})
      .sort({ name: 1 })
      .toArray();
    
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
async function getAuthToken() {
  const headersList = await headers();
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
  const decoded = await getAuthToken();
  
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
    
    const client = await clientPromise;
    const db = client.db('solofitness');
    
    const now = new Date();
    const exercise = await db.collection('exercises').insertOne({
      name,
      description,
      muscleGroup,
      equipment,
      difficulty,
      videoUrl,
      imageUrl,
      userId: new ObjectId(userId),
      createdAt: now,
      updatedAt: now
    });
    
    return NextResponse.json({ 
      _id: exercise.insertedId,
      name,
      description,
      muscleGroup,
      equipment,
      difficulty,
      videoUrl,
      imageUrl,
      userId,
      createdAt: now,
      updatedAt: now
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating exercise:', error);
    return NextResponse.json(
      { message: 'Failed to create exercise' },
      { status: 500 }
    );
  }
} 