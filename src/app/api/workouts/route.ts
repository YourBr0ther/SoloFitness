import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

interface StreakEntry {
  _id: ObjectId;
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

// Utility function for auth within this file
async function getAuthToken() {
  const headersList = await headers();
  const authHeader = headersList.get('authorization');
  
  if (!authHeader?.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authHeader.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// Helper function to get exercise requirements based on level
function getExerciseRequirements(level: number) {
  // Base requirements that scale with level
  return {
    pushups: Math.floor(10 + (level * 5)), // Level 1: 15, Level 2: 20, etc.
    situps: Math.floor(15 + (level * 5)),  // Level 1: 20, Level 2: 25, etc.
    squats: Math.floor(10 + (level * 3)),  // Level 1: 13, Level 2: 16, etc.
    milesRan: Math.max(0.5, Math.floor((level / 3) * 10) / 10) // Level 1-3: 0.5, Level 4-6: 1.0, etc.
  };
}

// Helper function to get bonus task based on random selection
function getBonusTask() {
  const bonusTasks = [
    "Meditate for 10 minutes",
    "Drink an extra glass of water",
    "Stretch for 5 minutes",
    "Call a friend or family member",
    "Write down 3 things you're grateful for",
    "Go for a walk outside",
    "Organize one small area of your living space",
    "Read for 15 minutes",
    "Prepare a healthy meal",
    "Perform a random act of kindness"
  ];
  
  return bonusTasks[Math.floor(Math.random() * bonusTasks.length)];
}

// GET /api/workouts - Get today's workout
export async function GET() {
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
    const client = await clientPromise;
    const db = client.db('solofitness');
    
    // Get user profile to determine level and streak history
    const userProfile = await db.collection('profiles').findOne<UserProfile>(
      { userId: new ObjectId(userId) },
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
    const todayEntry = userProfile.streakHistory?.find((entry: StreakEntry) => entry.date === today);

    // Check for penalties (incomplete tasks from yesterday)
    const yesterdayDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    
    // Find yesterday's entry to check for incomplete tasks
    const yesterdayEntry = userProfile.streakHistory?.find((entry: StreakEntry) => entry.date === yesterdayDate);
    
    if (yesterdayEntry && !yesterdayEntry.completed) {
      // Add penalties for incomplete tasks
      const penalties = getExerciseRequirements(level);
      return NextResponse.json({
        type: 'penalty',
        exercises: penalties,
        message: 'You have penalties from yesterday!'
      });
    }

    // If today's workout doesn't exist, create it
    if (!todayEntry) {
      // Create a new streak history entry for today
      const newEntry = await db.collection('streakHistory').insertOne({
        userId: new ObjectId(userId),
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

      return NextResponse.json({
        type: 'new',
        exercises: getExerciseRequirements(level),
        bonusTask: getBonusTask()
      });
    }

    // If today's workout exists, return it
    return NextResponse.json({
      type: 'existing',
      exercises: todayEntry.exercises,
      bonusTask: getBonusTask()
    });
    
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json(
      { message: 'Failed to fetch workout' },
      { status: 500 }
    );
  }
}

// POST /api/workouts - Update today's workout
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
    const { exercises, bonusTaskCompleted } = await request.json();
    
    // Get the user's profile
    const client = await clientPromise;
    const db = client.db('solofitness');
    const userProfile = await db.collection('profiles').findOne<UserProfile>(
      { userId: new ObjectId(userId) },
      { projection: { level: 1, streakHistory: 1, longestStreak: 1, xp: 1, exerciseCounts: 1 } }
    );
    
    console.log('POST /api/workouts - Found user:', userProfile ? 'yes' : 'no');
    console.log('POST /api/workouts - User has profile:', userProfile?.streakHistory ? 'yes' : 'no');

    if (!userProfile || !userProfile.streakHistory) {
      console.log('POST /api/workouts - User or profile not found');
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      );
    }

    const level = userProfile.level || 1;
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's entry
    const todayEntryIndex = userProfile.streakHistory.findIndex((entry: StreakEntry) => entry.date === today);
    
    // Calculate XP earned
    const requirements = getExerciseRequirements(level);
    const isCompleted = Object.entries(exercises).every(([key, value]) => 
      (value as number) >= (requirements[key as keyof typeof requirements] as number)
    );
    
    const xpEarned = isCompleted ? 10 : 0;
    
    // Calculate streak
    let currentStreak = 0;
    let longestStreak = userProfile.longestStreak || 0;
    
    if (isCompleted) {
      const streakData = userProfile.streakHistory
        .sort((a: StreakEntry, b: StreakEntry) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      for (let i = 0; i < streakData.length; i++) {
        if (streakData[i].completed) {
          currentStreak++;
        } else {
          break;
        }
      }
      
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    }
    
    let updatedEntry;
    
    if (todayEntryIndex >= 0) {
      // Update existing entry
      console.log('POST /api/workouts - Updating existing entry:', userProfile.streakHistory[todayEntryIndex]._id);
      updatedEntry = await db.collection('streakHistory').updateOne(
        { _id: userProfile.streakHistory[todayEntryIndex]._id },
        {
          $set: {
            completed: isCompleted,
            xpEarned,
            exercises
          }
        }
      );
    } else {
      // Create new entry
      console.log('POST /api/workouts - Creating new entry for date:', today);
      updatedEntry = await db.collection('streakHistory').insertOne({
        userId: new ObjectId(userId),
        date: today,
        completed: isCompleted,
        xpEarned,
        exercises
      });
    }
    
    console.log('POST /api/workouts - Updated/Created entry:', updatedEntry);
    
    // Update user profile
    const totalXp = userProfile.xp + xpEarned;
    const newLevel = Math.floor(totalXp / 100) + 1;
    
    // Update the exercise counts in the profile
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
    
    console.log('POST /api/workouts - Updating profile with new counts:', newExerciseCounts);
    await db.collection('profiles').updateOne(
      { _id: userProfile._id },
      {
        $set: {
          xp: totalXp,
          level: newLevel,
          currentStreak: isCompleted ? currentStreak : 0, // Reset streak if not completed
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
    console.error('POST /api/workouts - Error updating workout:', error);
    return NextResponse.json(
      { message: 'Failed to update workout' },
      { status: 500 }
    );
  }
}