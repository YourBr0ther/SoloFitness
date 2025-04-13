import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { authenticate } from '@/lib/auth-helper';

// GET /api/profile/streak-history - Get user's streak history
export async function GET() {
  const user = await authenticate();
  
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    // Get user's streak history
    const userProfile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        profile: {
          include: {
            streakHistory: {
              orderBy: {
                date: 'desc'
              }
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

    return NextResponse.json(userProfile.profile.streakHistory);
    
  } catch (error) {
    console.error('Error fetching streak history:', error);
    return NextResponse.json(
      { message: 'Failed to fetch streak history' },
      { status: 500 }
    );
  }
} 