import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth-helper';

// GET /api/badges - Get user's badges
export async function GET() {
  const user = await authenticate();
  
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get user's badges
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: {
          include: {
            badges: true
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

    return NextResponse.json(userProfile.profile.badges);
    
  } catch (error) {
    console.error('Error fetching badges:', error);
    return NextResponse.json(
      { message: 'Failed to fetch badges' },
      { status: 500 }
    );
  }
} 