import { NextResponse } from 'next/server';
import { authenticate } from '@/lib/auth-helper';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { UserSettings } from '@/types/settings';

// Default settings
const DEFAULT_SETTINGS: UserSettings = {
  enableNotifications: true,
  darkMode: false,
  language: 'en',
  enablePenalties: true,
  enableBonuses: true,
  reminderTimes: ["09:00", "18:00"],
  theme: 'light',
  timezone: 'UTC',
  units: {
    weight: 'kg',
    distance: 'km',
    height: 'cm'
  },
  privacy: {
    profile: 'public',
    activity: 'friends',
    achievements: 'public'
  },
  notifications: {
    email: true,
    push: true,
    inApp: true
  },
  preferences: {
    showTutorial: true,
    showTips: true,
    showProgress: true,
    showLeaderboard: true
  }
};

export async function GET() {
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
    
    // Get user with settings
    const userDoc = await db.collection('users').findOne(
      { _id: new ObjectId(user.id) },
      { projection: { settings: 1 } }
    );

    if (!userDoc) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Return settings with defaults for missing fields
    const settings = { ...DEFAULT_SETTINGS, ...userDoc.settings };
    return NextResponse.json(settings);
    
  } catch (error) {
    console.error('Settings fetch error:', error);
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

    // Get current settings
    const userDoc = await db.collection('users').findOne(
      { _id: new ObjectId(user.id) },
      { projection: { settings: 1 } }
    );

    if (!userDoc) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Merge existing settings with updates
    const currentSettings = userDoc.settings || {};
    const newSettings = {
      ...DEFAULT_SETTINGS,
      ...currentSettings,
      ...updates
    };

    // Update the settings in the user document
    const result = await db.collection('users').findOneAndUpdate(
      { _id: new ObjectId(user.id) },
      { 
        $set: { 
          settings: newSettings,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result?.value) {
      return NextResponse.json(
        { message: 'Failed to update settings' },
        { status: 500 }
      );
    }

    return NextResponse.json(result.value.settings);
    
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
} 