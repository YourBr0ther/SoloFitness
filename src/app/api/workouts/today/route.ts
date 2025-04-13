import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth-helper';

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
              take: 2 // Get today and yesterday's entries if they exist
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
    
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];
    
    // Check if today's workout already exists
    const todayEntry = userProfile.profile.streakHistory.find(entry => entry.date === today);
    
    // Calculate exercise requirements based on level
    const requirements = {
      pushups: 10 + (level * 5),
      situps: 15 + (level * 5),
      squats: 10 + (level * 3),
      milesRan: Math.max(0.5, Math.floor((level / 3) * 10) / 10)
    };

    // If today's entry doesn't exist, create it
    if (!todayEntry) {
      await prisma.streakHistory.create({
        data: {
          profileId: userProfile.profile.id,
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