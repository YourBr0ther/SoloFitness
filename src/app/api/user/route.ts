import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        settings: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Don't send password
    const { password, ...userWithoutPassword } = user;

    return NextResponse.json({ 
      user: userWithoutPassword,
      settings: user.settings,
    });
  } catch (error) {
    console.error('User fetch error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { penaltiesEnabled, bonusEnabled } = body;

    // Update user settings
    const updatedSettings = await prisma.userSettings.upsert({
      where: { userId: session.user.id },
      update: {
        ...(penaltiesEnabled !== undefined && { penaltiesEnabled }),
        ...(bonusEnabled !== undefined && { bonusEnabled }),
      },
      create: {
        userId: session.user.id,
        penaltiesEnabled: penaltiesEnabled ?? true,
        bonusEnabled: bonusEnabled ?? true,
      },
    });

    return NextResponse.json({ settings: updatedSettings });
  } catch (error) {
    console.error('User update error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}