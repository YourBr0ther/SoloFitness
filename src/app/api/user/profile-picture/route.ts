import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { profilePicture } = await request.json();

    if (!profilePicture) {
      return NextResponse.json({ error: 'Profile picture is required' }, { status: 400 });
    }

    // Validate base64 image format
    if (!profilePicture.startsWith('data:image/')) {
      return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });
    }

    // Check file size (limit to 2MB base64)
    if (profilePicture.length > 2 * 1024 * 1024) {
      return NextResponse.json({ error: 'Image too large (max 2MB)' }, { status: 400 });
    }

    // Update user profile picture
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { profilePicture },
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        level: true,
        currentXP: true,
        totalXP: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Profile picture update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Remove user profile picture
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: { profilePicture: null },
      select: {
        id: true,
        username: true,
        email: true,
        profilePicture: true,
        level: true,
        currentXP: true,
        totalXP: true,
        currentStreak: true,
        longestStreak: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error('Profile picture removal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}