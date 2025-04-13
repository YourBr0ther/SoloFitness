import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

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
    
    // Get user profile to determine level and streak history
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            streakHistory: {
              orderBy: {
                date: 'desc',
              },
              take: 2, // Get today and yesterday's entries if they exist
            },
          },
        },
      },
    });

    if (!user || !user.profile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      );
    }

    const level = user.profile.level || 1;
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today's workout already exists
    const todayEntry = user.profile.streakHistory.find(entry => entry.date === today);
    
    // Check for penalties (incomplete tasks from yesterday)
    let penalties = { pushups: 0, situps: 0, squats: 0, milesRan: 0 };
    let hasPenalty = false;
    
    // Get yesterday's date in YYYY-MM-DD format
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayDate = yesterday.toISOString().split('T')[0];
    
    // Find yesterday's entry to check for incomplete tasks
    const yesterdayEntry = user.profile.streakHistory.find(entry => entry.date === yesterdayDate);
    
    if (yesterdayEntry && !yesterdayEntry.completed) {
      hasPenalty = true;
      
      // Get yesterday's exercise requirements
      const yesterdayRequirements = getExerciseRequirements(level);
      
      // Calculate penalties for incomplete exercises
      const exercises = yesterdayEntry.exercises as any;
      
      if (exercises.pushups < yesterdayRequirements.pushups) {
        penalties.pushups = Math.ceil((yesterdayRequirements.pushups - exercises.pushups) / 2);
      }
      
      if (exercises.situps < yesterdayRequirements.situps) {
        penalties.situps = Math.ceil((yesterdayRequirements.situps - exercises.situps) / 2);
      }
      
      if (exercises.squats < yesterdayRequirements.squats) {
        penalties.squats = Math.ceil((yesterdayRequirements.squats - exercises.squats) / 2);
      }
      
      if (exercises.milesRan < yesterdayRequirements.milesRan) {
        penalties.milesRan = Math.ceil((yesterdayRequirements.milesRan - exercises.milesRan) * 10) / 10;
      }
    }
    
    // Get exercise requirements for today
    const requirements = getExerciseRequirements(level);
    
    // Check if user qualifies for a bonus task (no penalties and 20% chance)
    let bonusTask = null;
    if (!hasPenalty && Math.random() < 0.2) { // 20% chance (1/5)
      bonusTask = getBonusTask();
    }
    
    // If we already have an entry for today, return it with any updates
    if (todayEntry) {
      return NextResponse.json({
        date: today,
        completed: todayEntry.completed,
        level,
        requirements,
        currentProgress: todayEntry.exercises,
        penalties,
        bonusTask,
        hasPenalty
      });
    }
    
    // Create a new streak history entry for today
    const newEntry = await prisma.streakHistory.create({
      data: {
        profileId: user.profile.id,
        date: today,
        completed: false,
        xpEarned: 0,
        exercises: {
          pushups: 0,
          situps: 0,
          squats: 0,
          milesRan: 0
        }
      }
    });
    
    return NextResponse.json({
      date: today,
      completed: false,
      level,
      requirements,
      currentProgress: {
        pushups: 0,
        situps: 0,
        squats: 0,
        milesRan: 0
      },
      penalties,
      bonusTask,
      hasPenalty
    });
    
  } catch (error) {
    console.error('Error fetching workout:', error);
    return NextResponse.json(
      { message: 'Failed to fetch workout' },
      { status: 500 }
    );
  }
}

// POST /api/workouts - Update workout progress and check completion
export async function POST(request: Request) {
  console.log('POST /api/workouts - Received request');
  // Get auth token
  const decoded = await getAuthToken();
  console.log('POST /api/workouts - Auth token decoded:', decoded ? 'valid' : 'invalid');
  
  if (!decoded) {
    console.log('POST /api/workouts - Unauthorized request');
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const userId = decoded.userId;
    const body = await request.json();
    console.log('POST /api/workouts - Request body:', body);
    const { exercises, completeBonusTask } = body;
    
    // Get the user's profile
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: {
          include: {
            streakHistory: {
              orderBy: {
                date: 'desc'
              },
              take: 14, // Get last 14 days for streak calculation
            }
          }
        }
      }
    });
    console.log('POST /api/workouts - Found user:', user ? 'yes' : 'no');
    console.log('POST /api/workouts - User has profile:', user?.profile ? 'yes' : 'no');

    if (!user || !user.profile) {
      console.log('POST /api/workouts - User or profile not found');
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      );
    }

    const level = user.profile.level || 1;
    const today = new Date().toISOString().split('T')[0];
    
    // Get today's requirements
    const requirements = getExerciseRequirements(level);
    
    // Check if exercises meet requirements
    const isCompleted = 
      exercises.pushups >= requirements.pushups &&
      exercises.situps >= requirements.situps &&
      exercises.squats >= requirements.squats &&
      exercises.milesRan >= requirements.milesRan;
    
    // Get today's entry
    const todayEntryIndex = user.profile.streakHistory.findIndex(entry => entry.date === today);
    
    // Calculate XP earned
    let xpEarned = 0;
    
    if (isCompleted) {
      // Base XP for completing daily workout
      xpEarned += 50;
      
      // Bonus XP for exceeding requirements (max 20% bonus)
      const pushupBonus = Math.min(20, Math.floor((exercises.pushups - requirements.pushups) / requirements.pushups * 100));
      const situpBonus = Math.min(20, Math.floor((exercises.situps - requirements.situps) / requirements.situps * 100));
      const squatBonus = Math.min(20, Math.floor((exercises.squats - requirements.squats) / requirements.squats * 100));
      const runningBonus = Math.min(20, Math.floor((exercises.milesRan - requirements.milesRan) / requirements.milesRan * 100));
      
      xpEarned += pushupBonus + situpBonus + squatBonus + runningBonus;
      
      // Additional XP for completing bonus task
      if (completeBonusTask) {
        xpEarned += 25;
      }
    }
    
    // Calculate streak
    let currentStreak = 0;
    let longestStreak = user.profile.longestStreak || 0;
    
    if (isCompleted) {
      const streakData = user.profile.streakHistory
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      currentStreak = 1; // Today counts as 1
      
      // Check previous days for consecutive completed workouts
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      for (let i = 0; i < streakData.length; i++) {
        const entry = streakData[i];
        if (entry.date === today) continue; // Skip today's entry
        
        const entryDate = new Date(entry.date);
        const expectedDate = new Date();
        expectedDate.setDate(yesterday.getDate() - i);
        
        // Check if this entry is from the expected date and is completed
        if (
          entryDate.getFullYear() === expectedDate.getFullYear() &&
          entryDate.getMonth() === expectedDate.getMonth() &&
          entryDate.getDate() === expectedDate.getDate() &&
          entry.completed
        ) {
          currentStreak++;
        } else {
          break; // Break the streak
        }
      }
      
      // Update longest streak if current streak is longer
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
      
      // Streak bonus XP (10 XP per day of streak, max 100)
      xpEarned += Math.min(100, currentStreak * 10);
    }
    
    // Update or create streak history entry
    let updatedEntry;
    console.log('POST /api/workouts - Updating streak history entry. Exists:', todayEntryIndex >= 0);
    
    if (todayEntryIndex >= 0) {
      // Update existing entry
      console.log('POST /api/workouts - Updating existing entry:', user.profile.streakHistory[todayEntryIndex].id);
      updatedEntry = await prisma.streakHistory.update({
        where: {
          id: user.profile.streakHistory[todayEntryIndex].id
        },
        data: {
          completed: isCompleted,
          xpEarned,
          exercises
        }
      });
    } else {
      // Create new entry
      console.log('POST /api/workouts - Creating new entry for date:', today);
      updatedEntry = await prisma.streakHistory.create({
        data: {
          profileId: user.profile.id,
          date: today,
          completed: isCompleted,
          xpEarned,
          exercises
        }
      });
    }
    console.log('POST /api/workouts - Updated/Created entry:', updatedEntry);
    
    // Update user profile
    const totalXp = user.profile.xp + xpEarned;
    const newLevel = Math.floor(totalXp / 100) + 1;
    
    // Update the exercise counts in the profile
    const oldExerciseCounts = user.profile.exerciseCounts as any || {
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
    await prisma.profile.update({
      where: {
        id: user.profile.id
      },
      data: {
        xp: totalXp,
        level: newLevel,
        currentStreak: isCompleted ? currentStreak : 0, // Reset streak if not completed
        longestStreak,
        exerciseCounts: newExerciseCounts
      }
    });
    
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