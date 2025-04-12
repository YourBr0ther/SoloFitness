import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

// Utility function for auth within this file
function getAuthToken() {
  const headersList = headers();
  const authorization = headersList.get('Authorization');
  
  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }
  
  try {
    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    return decoded;
  } catch (error) {
    return null;
  }
}

// GET /api/profile - Get user profile
export async function GET() {
  // Get auth token
  const decoded = getAuthToken();
  
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
            avatarUrl: true
          }
        },
        settings: {
          select: {
            enableNotifications: true,
            darkMode: true,
            language: true
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
  const decoded = getAuthToken();
  
  if (!decoded) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const userId = decoded.userId;
    const { username, profile, settings } = await request.json();
    
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
      
      // Update profile if provided
      if (profile) {
        await tx.profile.upsert({
          where: { userId },
          create: {
            userId,
            level: profile.level ?? 1,
            xp: profile.xp ?? 0,
            avatarUrl: profile.avatarUrl
          },
          update: {
            level: profile.level,
            xp: profile.xp,
            avatarUrl: profile.avatarUrl
          }
        });
      }
      
      // Update settings if provided
      if (settings) {
        await tx.userSettings.upsert({
          where: { userId },
          create: {
            userId,
            enableNotifications: settings.enableNotifications ?? true,
            darkMode: settings.darkMode ?? false,
            language: settings.language ?? 'en'
          },
          update: {
            enableNotifications: settings.enableNotifications,
            darkMode: settings.darkMode,
            language: settings.language
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
            avatarUrl: true
          }
        },
        settings: {
          select: {
            enableNotifications: true,
            darkMode: true,
            language: true
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