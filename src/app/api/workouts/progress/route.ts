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
  longestStreak: number;
  xp: number;
  exerciseCounts: {
    pushups: number;
    situps: number;
    squats: number;
    milesRan: number;
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
    const userProfile = await db.collection('profiles').findOne<UserProfile>(
      { userId: new ObjectId(user.id) },
      { projection: { level: 1, streakHistory: 1, longestStreak: 1, xp: 1, exerciseCounts: 1 } }
    );

    if (!userProfile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      );
    }

    const level = userProfile.level || 1;
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
    const todayEntry = userProfile.streakHistory?.find(entry => entry.date === today);

    // Update or create today's streak history entry
    let updatedEntry;
    if (todayEntry) {
      updatedEntry = await db.collection('streakHistory').updateOne(
        { _id: todayEntry._id },
        {
          $set: {
            completed: isCompleted,
            xpEarned,
            exercises
          }
        }
      );
    } else {
      updatedEntry = await db.collection('streakHistory').insertOne({
        userId: new ObjectId(user.id),
        date: today,
        completed: isCompleted,
        xpEarned,
        exercises
      });
    }

    // Calculate current streak
    let currentStreak = 0;
    const streakHistory = userProfile.streakHistory || [];
    
    for (const entry of streakHistory) {
      if (entry.completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Update longest streak if current streak is longer
    let longestStreak = userProfile.longestStreak || 0;
    if (currentStreak > longestStreak) {
      longestStreak = currentStreak;
    }

    // Update user profile
    const totalXp = userProfile.xp + xpEarned;
    const newLevel = Math.floor(totalXp / 100) + 1;

    // Update exercise counts
    const oldExerciseCounts = userProfile.exerciseCounts || {
      pushups: 0,
      situps: 0,
      squats: 0,
      milesRan: 0
    };

    const newExerciseCounts = {
      pushups: oldExerciseCounts.pushups + exercises.pushups,
      situps: oldExerciseCounts.situps + exercises.situps,
      squats: oldExerciseCounts.squats + exercises.squats,
      milesRan: oldExerciseCounts.milesRan + exercises.milesRan
    };

    // Update profile
    await db.collection('profiles').updateOne(
      { _id: userProfile._id },
      {
        $set: {
          xp: totalXp,
          level: newLevel,
          currentStreak: isCompleted ? currentStreak : 0,
          longestStreak,
          exerciseCounts: newExerciseCounts
        }
      }
    );

    return NextResponse.json({
      completed: isCompleted,
      xpEarned,
      currentStreak: isCompleted ? currentStreak : 0,
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