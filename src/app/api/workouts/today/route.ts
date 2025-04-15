import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-helper';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

interface StreakEntry {
  _id: ObjectId;
  userId: ObjectId;
  date: string;
  completed: boolean;
  xpEarned: number;
  exercises: {
    pushups: number;
    situps: number;
    squats: number;
    milesRan: number;
  };
}

interface UserProfile {
  _id: ObjectId;
  userId: ObjectId;
  level: number;
  streakHistory: StreakEntry[];
}

// GET /api/workouts/today - Get today's workout
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
    
    // Get user profile to determine level and streak history
    const userProfile = await db.collection('profiles').findOne<UserProfile>(
      { userId: new ObjectId(user.id) },
      { projection: { level: 1, streakHistory: 1 } }
    );

    if (!userProfile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      );
    }

    const level = userProfile.level || 1;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today's workout already exists
    const todayEntry = userProfile.streakHistory?.find(entry => entry.date === today);
    
    // Calculate exercise requirements based on level
    const requirements = {
      pushups: 10 + (level * 5),
      situps: 15 + (level * 5),
      squats: 10 + (level * 3),
      milesRan: Math.max(0.5, Math.floor((level / 3) * 10) / 10)
    };

    // If today's entry doesn't exist, create it
    if (!todayEntry) {
      await db.collection('streakHistory').insertOne({
        userId: new ObjectId(user.id),
        date: today,
        completed: false,
        xpEarned: 0,
        exercises: {
          pushups: 0,
          situps: 0,
          squats: 0,
          milesRan: 0
        }
      });
    }

    // Return today's workout data
    return NextResponse.json({
      date: today,
      completed: todayEntry?.completed || false,
      level,
      requirements,
      currentProgress: todayEntry?.exercises || {
        pushups: 0,
        situps: 0,
        squats: 0,
        milesRan: 0
      }
    });
    
  } catch (error) {
    console.error('Error fetching today\'s workout:', error);
    return NextResponse.json(
      { message: 'Failed to fetch today\'s workout' },
      { status: 500 }
    );
  }
} 