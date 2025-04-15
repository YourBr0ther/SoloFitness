import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-helper';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(request: Request) {
  try {
    const user = await authenticate();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const client = await clientPromise;
    const db = client.db('solofitness');
    
    // Get user with profile and settings
    const userProfile = await db.collection('users').findOne(
      { _id: new ObjectId(user.id) },
      { 
        projection: {
          _id: 1,
          email: 1,
          username: 1,
          profile: 1,
          settings: 1
        }
      }
    );

    if (!userProfile) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }

    // Format the response
    const response = {
      id: userProfile._id.toString(),
      email: userProfile.email,
      username: userProfile.username,
      profile: userProfile.profile || {
        level: 1,
        xp: 0,
        currentStreak: 0
      },
      settings: userProfile.settings || {
        enableNotifications: true,
        darkMode: false,
        language: 'en',
        enablePenalties: true,
        enableBonuses: true,
        reminderTimes: ["09:00", "18:00"]
      }
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const user = await authenticate();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const updates = await request.json();
    const client = await clientPromise;
    const db = client.db('solofitness');

    // Validate updates
    const allowedProfileUpdates = ['level', 'xp', 'currentStreak', 'avatarUrl'];
    const allowedSettingsUpdates = ['enableNotifications', 'darkMode', 'language', 'enablePenalties', 'enableBonuses', 'reminderTimes'];
    
    const profileUpdates: Record<string, unknown> = {};
    const settingsUpdates: Record<string, unknown> = {};

    // Separate updates into profile and settings
    Object.keys(updates).forEach(key => {
      if (allowedProfileUpdates.includes(key)) {
        profileUpdates[`profile.${key}`] = updates[key];
      } else if (allowedSettingsUpdates.includes(key)) {
        settingsUpdates[`settings.${key}`] = updates[key];
      }
    });

    // Update the user document
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(user.id) },
      { 
        $set: {
          ...profileUpdates,
          ...settingsUpdates,
          updatedAt: new Date()
        }
      },
      { 
        returnDocument: 'after',
        projection: {
          _id: 1,
          email: 1,
          username: 1,
          profile: 1,
          settings: 1
        }
      }
    );

    if (!result?.value) {
      return NextResponse.json(
        { message: 'Profile not found' },
        { status: 404 }
      );
    }

    // Format the response
    const response = {
      id: result.value._id.toString(),
      email: result.value.email,
      username: result.value.username,
      profile: result.value.profile,
      settings: result.value.settings
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 