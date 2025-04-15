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
          avatarUrl: 1,
          'profile.level': 1,
          'profile.xp': 1,
          'profile.currentStreak': 1,
          'profile.longestStreak': 1,
          'profile.streakHistory': 1,
          'profile.badges': 1,
          'settings.enableNotifications': 1,
          'settings.darkMode': 1,
          'settings.language': 1,
          'settings.enablePenalties': 1,
          'settings.enableBonuses': 1,
          'settings.reminderTimes': 1
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
      username: userProfile.username || 'SOLO WARRIOR',
      avatarUrl: userProfile.avatarUrl || '/default-avatar.svg',
      level: userProfile.profile?.level || 1,
      xp: userProfile.profile?.xp || 0,
      currentStreak: userProfile.profile?.currentStreak || 0,
      longestStreak: userProfile.profile?.longestStreak || 0,
      streakHistory: userProfile.profile?.streakHistory || [],
      badges: userProfile.profile?.badges || [],
      settings: {
        enableNotifications: userProfile.settings?.enableNotifications ?? true,
        darkMode: userProfile.settings?.darkMode ?? false,
        language: userProfile.settings?.language ?? 'en',
        enablePenalties: userProfile.settings?.enablePenalties ?? true,
        enableBonuses: userProfile.settings?.enableBonuses ?? true,
        reminderTimes: userProfile.settings?.reminderTimes ?? ["09:00", "18:00"]
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
    const allowedProfileUpdates = ['level', 'xp', 'currentStreak', 'longestStreak'];
    const allowedSettingsUpdates = ['enableNotifications', 'darkMode', 'language', 'enablePenalties', 'enableBonuses', 'reminderTimes'];
    const allowedUserUpdates = ['username', 'avatarUrl'];
    
    const profileUpdates: Record<string, unknown> = {};
    const settingsUpdates: Record<string, unknown> = {};
    const userUpdates: Record<string, unknown> = {};

    // Separate updates into profile, settings, and user updates
    Object.keys(updates).forEach(key => {
      if (allowedProfileUpdates.includes(key)) {
        profileUpdates[`profile.${key}`] = updates[key];
      } else if (allowedSettingsUpdates.includes(key)) {
        settingsUpdates[`settings.${key}`] = updates[key];
      } else if (allowedUserUpdates.includes(key)) {
        userUpdates[key] = updates[key];
      }
    });

    // Update the user document
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(user.id) },
      { 
        $set: {
          ...userUpdates,
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
          avatarUrl: 1,
          'profile.level': 1,
          'profile.xp': 1,
          'profile.currentStreak': 1,
          'profile.longestStreak': 1,
          'profile.streakHistory': 1,
          'profile.badges': 1,
          'settings.enableNotifications': 1,
          'settings.darkMode': 1,
          'settings.language': 1,
          'settings.enablePenalties': 1,
          'settings.enableBonuses': 1,
          'settings.reminderTimes': 1
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
      username: result.value.username || 'SOLO WARRIOR',
      avatarUrl: result.value.avatarUrl || '/default-avatar.svg',
      level: result.value.profile?.level || 1,
      xp: result.value.profile?.xp || 0,
      currentStreak: result.value.profile?.currentStreak || 0,
      longestStreak: result.value.profile?.longestStreak || 0,
      streakHistory: result.value.profile?.streakHistory || [],
      badges: result.value.profile?.badges || [],
      settings: {
        enableNotifications: result.value.settings?.enableNotifications ?? true,
        darkMode: result.value.settings?.darkMode ?? false,
        language: result.value.settings?.language ?? 'en',
        enablePenalties: result.value.settings?.enablePenalties ?? true,
        enableBonuses: result.value.settings?.enableBonuses ?? true,
        reminderTimes: result.value.settings?.reminderTimes ?? ["09:00", "18:00"]
      }
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