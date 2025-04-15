import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-helper';
import clientPromise from '@/lib/mongodb';
import { ObjectId, Document } from 'mongodb';

interface StreakEntry {
  _id?: ObjectId;
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

interface UserProfile extends Document {
  _id: ObjectId;
  email: string;
  username: string;
  profile: {
    level: number;
    streakHistory: StreakEntry[];
  };
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
    const userProfile = await db.collection('users').findOne<UserProfile>(
      { _id: new ObjectId(user.id) },
      { projection: { 'profile.level': 1, 'profile.streakHistory': 1 } }
    );

    if (!userProfile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      );
    }

    const level = userProfile.profile?.level || 1;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today's workout already exists
    const todayEntry = userProfile.profile?.streakHistory?.find(entry => entry.date === today);
    
    // Calculate exercise requirements based on level
    const requirements = {
      pushups: 10 + (level * 5),
      situps: 15 + (level * 5),
      squats: 10 + (level * 3),
      milesRan: Math.max(0.5, Math.floor((level / 3) * 10) / 10)
    };

    // If today's entry doesn't exist, create it
    if (!todayEntry) {
      const newEntry: StreakEntry = {
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
      };

      // Add the new entry to the streak history array
      await db.collection('users').updateOne(
        { _id: new ObjectId(user.id) },
        { $push: { "profile.streakHistory": newEntry } } as any
      );
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
      },
      hasPenalty: false, // We'll implement penalties later
      penalties: {
        pushups: 0,
        situps: 0,
        squats: 0,
        milesRan: 0
      },
      bonusTask: null // We'll implement bonus tasks later
    });
    
  } catch (error) {
    console.error('Error fetching today\'s workout:', error);
    return NextResponse.json(
      { message: 'Failed to fetch today\'s workout' },
      { status: 500 }
    );
  }
} 