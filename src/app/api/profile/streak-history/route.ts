import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-helper';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

// GET /api/profile/streak-history - Get user's streak history
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
    
    // Get user's profile with streak history
    const userProfile = await db.collection('users').findOne(
      { _id: new ObjectId(user.id) },
      { projection: { 'profile.streakHistory': 1 } }
    );

    if (!userProfile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      );
    }

    // Sort streak history by date in descending order
    const sortedStreakHistory = (userProfile.profile.streakHistory || []).sort((a: any, b: any) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    return NextResponse.json(sortedStreakHistory);
    
  } catch (error) {
    console.error('Error fetching streak history:', error);
    return NextResponse.json(
      { message: 'Failed to fetch streak history' },
      { status: 500 }
    );
  }
} 