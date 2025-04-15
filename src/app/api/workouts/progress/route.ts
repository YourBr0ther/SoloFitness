import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-helper';
import clientPromise from '@/lib/mongodb';
import { ObjectId, Document } from 'mongodb';

interface StreakEntry extends Document {
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
    xp: number;
    currentStreak: number;
    longestStreak: number;
  };
}

// POST /api/workouts/progress - Update workout progress
export async function POST(request: Request) {
  const user = await authenticate();
  
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const { exercises, completeBonusTask } = await request.json();
    const client = await clientPromise;
    const db = client.db('solofitness');
    
    // Get user profile to determine level and streak history
    const userProfile = await db.collection('users').findOne<UserProfile>(
      { _id: new ObjectId(user.id) },
      { projection: { 'profile.level': 1, 'profile.streakHistory': 1, 'profile.xp': 1, 'profile.currentStreak': 1, 'profile.longestStreak': 1 } }
    );

    if (!userProfile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      );
    }

    const level = userProfile.profile?.level || 1;
    const today = new Date().toISOString().split('T')[0];

    // Calculate requirements based on level
    const requirements = {
      pushups: 10 + (level * 5),
      situps: 15 + (level * 5),
      squats: 10 + (level * 3),
      milesRan: Math.max(0.5, Math.floor((level / 3) * 10) / 10)
    };

    // Check if all requirements are met
    const isCompleted = 
      exercises.pushups >= requirements.pushups &&
      exercises.situps >= requirements.situps &&
      exercises.squats >= requirements.squats &&
      exercises.milesRan >= requirements.milesRan;

    // Calculate XP earned
    let xpEarned = isCompleted ? 50 : 0;
    if (completeBonusTask) {
      xpEarned += 25;
    }

    // Find today's entry if it exists
    const todayEntry = userProfile.profile?.streakHistory?.find(entry => entry.date === today);

    // Update or create today's streak history entry
    const newEntry: Omit<StreakEntry, keyof Document> = {
      userId: new ObjectId(user.id),
      date: today,
      completed: isCompleted,
      xpEarned,
      exercises
    };

    if (todayEntry) {
      // Update existing entry
      await db.collection('users').updateOne(
        { 
          _id: new ObjectId(user.id),
          'profile.streakHistory.date': today
        },
        {
          $set: {
            'profile.streakHistory.$': newEntry
          }
        }
      );
    } else {
      // Add new entry
      await db.collection('users').updateOne(
        { _id: new ObjectId(user.id) },
        {
          $push: {
            'profile.streakHistory': newEntry
          }
        }
      );
    }

    // Calculate current streak
    let currentStreak = userProfile.profile?.currentStreak || 0;
    if (isCompleted) {
      currentStreak++;
    } else {
      currentStreak = 0;
    }

    // Update longest streak if current streak is longer
    let longestStreak = userProfile.profile?.longestStreak || 0;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Update user profile with new XP, streak, etc.
    const totalXp = (userProfile.profile?.xp || 0) + xpEarned;
    const newLevel = Math.floor(totalXp / 100) + 1;

    await db.collection('users').updateOne(
      { _id: new ObjectId(user.id) },
      {
        $set: {
          'profile.xp': totalXp,
          'profile.level': newLevel,
          'profile.currentStreak': currentStreak,
          'profile.longestStreak': longestStreak
        }
      }
    );

    return NextResponse.json({
      completed: isCompleted,
      xpEarned,
      currentStreak,
      longestStreak,
      level: newLevel
    });
    
  } catch (error) {
    console.error('Error updating workout progress:', error);
    return NextResponse.json(
      { message: 'Failed to update workout progress' },
      { status: 500 }
    );
  }
} 