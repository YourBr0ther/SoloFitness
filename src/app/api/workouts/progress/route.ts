import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth-helper';

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

    // Get user profile to determine level and streak history
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: {
          include: {
            streakHistory: {
              orderBy: {
                date: 'desc'
              },
              take: 2 // Get today and yesterday's entries
            }
          }
        }
      }
    });

    if (!userProfile || !userProfile.profile) {
      return NextResponse.json(
        { message: 'User profile not found' },
        { status: 404 }
      );
    }

    const level = userProfile.profile.level || 1;
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
    const todayEntry = userProfile.profile.streakHistory.find(entry => entry.date === today);

    // Update or create today's streak history entry
    let updatedEntry;
    if (todayEntry) {
      updatedEntry = await prisma.streakHistory.update({
        where: { id: todayEntry.id },
        data: {
          completed: isCompleted,
          xpEarned,
          exercises
        }
      });
    } else {
      updatedEntry = await prisma.streakHistory.create({
        data: {
          profileId: userProfile.profile.id,
          date: today,
          completed: isCompleted,
          xpEarned,
          exercises
        }
      });
    }

    // Calculate current streak
    let currentStreak = 0;
    const streakHistory = userProfile.profile.streakHistory;
    
    for (const entry of streakHistory) {
      if (entry.completed) {
        currentStreak++;
      } else {
        break;
      }
    }

    // Update user profile if workout is completed
    if (isCompleted) {
      await prisma.profile.update({
        where: { id: userProfile.profile.id },
        data: {
          level: level + 1,
          xp: userProfile.profile.xp + xpEarned,
          currentStreak: currentStreak,
          longestStreak: Math.max(currentStreak, userProfile.profile.longestStreak || 0)
        }
      });
    }

    return NextResponse.json({
      completed: isCompleted,
      xpEarned,
      currentStreak,
      longestStreak: Math.max(currentStreak, userProfile.profile.longestStreak || 0),
      level: isCompleted ? level + 1 : level
    });
    
  } catch (error) {
    console.error('Error updating workout progress:', error);
    return NextResponse.json(
      { message: 'Failed to update workout progress' },
      { status: 500 }
    );
  }
} 