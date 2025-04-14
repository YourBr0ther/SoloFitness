import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';
import { AUTH_CONFIG } from '@/config/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Utility function for auth within this file
async function getAuthToken() {
  const cookieStore = await cookies();
  const token = cookieStore.get(AUTH_CONFIG.TOKEN_STORAGE_KEY)?.value;
  
  if (!token) {
    return null;
  }
  
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET /api/profile - Get user profile
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

    const userProfile = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            level: true,
            xp: true,
            avatarUrl: true,
            currentStreak: true,
            longestStreak: true,
            exerciseCounts: true,
            streakHistory: {
              select: {
                id: true,
                date: true,
                completed: true,
                xpEarned: true,
                exercises: true,
                createdAt: true,
                updatedAt: true
              },
              orderBy: {
                date: 'desc'
              },
              take: 14 // Get the last 14 days for the streak calendar
            },
            badges: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                unlocked: true,
                progress: true,
                total: true,
                isNew: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        settings: {
          select: {
            enableNotifications: true,
            darkMode: true,
            language: true,
            enablePenalties: true,
            enableBonuses: true,
            reminderTimes: true
          }
        }
      }
    });
    
    if (!userProfile) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(userProfile);
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { message: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: Request) {
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
    const { username, profile, settings, streakDay, badge } = await request.json();
    
    // Update user in a transaction to ensure all related data is updated
    const updatedUser = await prisma.$transaction(async (tx) => {
      // Update user if username is provided
      let userUpdate = {};
      if (username) {
        // Check if username is taken by another user
        const existingUser = await tx.user.findFirst({
          where: {
            AND: [
              { username },
              { NOT: { id: userId } }
            ]
          }
        });
        
        if (existingUser) {
          throw new Error('Username is already taken');
        }
        
        userUpdate = { username };
      }
      
      // Update user
      const updatedUser = await tx.user.update({
        where: { id: userId },
        data: userUpdate,
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          updatedAt: true
        }
      });
      
      // Get the current user profile
      const userProfile = await tx.profile.findUnique({
        where: { userId },
        include: {
          streakHistory: true,
          badges: true
        }
      });
      
      // Update profile if provided
      if (profile) {
        await tx.profile.upsert({
          where: { userId },
          create: {
            userId,
            level: profile.level ?? 1,
            xp: profile.xp ?? 0,
            avatarUrl: profile.avatarUrl,
            currentStreak: profile.currentStreak ?? 0,
            longestStreak: profile.longestStreak ?? 0,
            exerciseCounts: profile.exerciseCounts ?? { pushups: 0, situps: 0, squats: 0, milesRan: 0 }
          },
          update: {
            level: profile.level,
            xp: profile.xp,
            avatarUrl: profile.avatarUrl,
            currentStreak: profile.currentStreak,
            longestStreak: profile.longestStreak,
            exerciseCounts: profile.exerciseCounts
          }
        });
      }
      
      // Add streak day if provided
      if (streakDay && userProfile) {
        const existingDay = userProfile.streakHistory.find(day => day.date === streakDay.date);
        
        if (existingDay) {
          // Update existing streak day
          await tx.streakHistory.update({
            where: { id: existingDay.id },
            data: {
              completed: streakDay.completed,
              xpEarned: streakDay.xpEarned,
              exercises: streakDay.exercises
            }
          });
        } else {
          // Create new streak day
          await tx.streakHistory.create({
            data: {
              profileId: userProfile.id,
              date: streakDay.date,
              completed: streakDay.completed,
              xpEarned: streakDay.xpEarned,
              exercises: streakDay.exercises
            }
          });
        }
      }
      
      // Update badge if provided
      if (badge && userProfile) {
        const existingBadge = userProfile.badges.find(b => b.name === badge.name);
        
        if (existingBadge) {
          // Update existing badge
          await tx.badge.update({
            where: { id: existingBadge.id },
            data: {
              unlocked: badge.unlocked,
              progress: badge.progress,
              isNew: badge.isNew
            }
          });
        } else {
          // Create new badge
          await tx.badge.create({
            data: {
              profileId: userProfile.id,
              name: badge.name,
              description: badge.description,
              icon: badge.icon,
              unlocked: badge.unlocked,
              progress: badge.progress,
              total: badge.total,
              isNew: badge.isNew ?? true
            }
          });
        }
      }
      
      // Update settings if provided
      if (settings) {
        await tx.userSettings.upsert({
          where: { userId },
          create: {
            userId,
            enableNotifications: settings.enableNotifications ?? true,
            darkMode: settings.darkMode ?? false,
            language: settings.language ?? 'en',
            enablePenalties: settings.enablePenalties ?? true,
            enableBonuses: settings.enableBonuses ?? true,
            reminderTimes: settings.reminderTimes ?? []
          },
          update: {
            enableNotifications: settings.enableNotifications,
            darkMode: settings.darkMode,
            language: settings.language,
            enablePenalties: settings.enablePenalties,
            enableBonuses: settings.enableBonuses,
            reminderTimes: settings.reminderTimes
          }
        });
      }
      
      return updatedUser;
    });
    
    // Fetch the updated user with profile and settings
    const userWithProfileAndSettings = await prisma.user.findUnique({
      where: { id: updatedUser.id },
      select: {
        id: true,
        email: true,
        username: true,
        createdAt: true,
        updatedAt: true,
        profile: {
          select: {
            level: true,
            xp: true,
            avatarUrl: true,
            currentStreak: true,
            longestStreak: true,
            exerciseCounts: true,
            streakHistory: {
              select: {
                id: true,
                date: true,
                completed: true,
                xpEarned: true,
                exercises: true,
                createdAt: true,
                updatedAt: true
              },
              orderBy: {
                date: 'desc'
              },
              take: 14 // Get the last 14 days for the streak calendar
            },
            badges: {
              select: {
                id: true,
                name: true,
                description: true,
                icon: true,
                unlocked: true,
                progress: true,
                total: true,
                isNew: true,
                createdAt: true,
                updatedAt: true
              }
            }
          }
        },
        settings: {
          select: {
            enableNotifications: true,
            darkMode: true,
            language: true,
            enablePenalties: true,
            enableBonuses: true,
            reminderTimes: true
          }
        }
      }
    });
    
    return NextResponse.json(userWithProfileAndSettings);
  } catch (error) {
    console.error('Error updating profile:', error);
    
    // Handle specific error for username already taken
    if (error instanceof Error && error.message === 'Username is already taken') {
      return NextResponse.json(
        { message: error.message },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { message: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 