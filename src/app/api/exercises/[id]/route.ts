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

// GET /api/exercises/[id] - Get a single exercise
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const client = await clientPromise;
    const db = client.db('solofitness');
    
    const exercise = await db.collection('exercises').findOne<Exercise>({
      _id: new ObjectId(id)
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
  const decoded = await getAuthToken();
  
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
    
    const client = await clientPromise;
    const db = client.db('solofitness');
    
    // Check if exercise exists
    const existingExercise = await db.collection('exercises').findOne<Exercise>({
      _id: new ObjectId(id)
    });
    
    if (!existingExercise) {
      return NextResponse.json(
        { message: 'Exercise not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns this exercise
    if (existingExercise.userId.toString() !== userId) {
      return NextResponse.json(
        { message: 'Not authorized to update this exercise' },
        { status: 403 }
      );
    }
    
    // Update exercise
    const now = new Date();
    await db.collection('exercises').updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name,
          description,
          muscleGroup,
          equipment,
          difficulty,
          videoUrl,
          imageUrl,
          updatedAt: now
        }
      }
    );
    
    const updatedExercise = await db.collection('exercises').findOne<Exercise>({
      _id: new ObjectId(id)
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
  const decoded = await getAuthToken();
  
  if (!decoded) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  try {
    const userId = decoded.userId;
    const id = params.id;
    
    const client = await clientPromise;
    const db = client.db('solofitness');
    
    // Check if exercise exists
    const existingExercise = await db.collection('exercises').findOne<Exercise>({
      _id: new ObjectId(id)
    });
    
    if (!existingExercise) {
      return NextResponse.json(
        { message: 'Exercise not found' },
        { status: 404 }
      );
    }
    
    // Check if user owns this exercise
    if (existingExercise.userId.toString() !== userId) {
      return NextResponse.json(
        { message: 'Not authorized to delete this exercise' },
        { status: 403 }
      );
    }
    
    // Delete exercise
    await db.collection('exercises').deleteOne({
      _id: new ObjectId(id)
    });
    
    return NextResponse.json({ message: 'Exercise deleted successfully' });
  } catch (error) {
    console.error('Error deleting exercise:', error);
    return NextResponse.json(
      { message: 'Failed to delete exercise' },
      { status: 500 }
    );
  }
} 