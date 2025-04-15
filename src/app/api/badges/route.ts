import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-helper';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/badges - Get user's badges
export async function GET() {
  const user = await authenticate();
  
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const client = await clientPromise;
    const db = client.db('solofitness');
    
    // Get user's profile with badges
    const userProfile = await db.collection('profiles').findOne(
      { userId: new ObjectId(user.id) },
      { projection: { badges: 1 } }
    );

    if (!userProfile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(userProfile.badges || []);
    
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { message: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
} 