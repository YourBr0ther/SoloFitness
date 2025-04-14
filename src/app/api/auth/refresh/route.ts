import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth.server';

export async function POST(request: Request) {
  try {
    const { refreshToken } = await request.json();
    
    if (!refreshToken) {
      return NextResponse.json(
        { message: 'Refresh token is required' },
        { status: 400 }
      );
    }

    const auth = AuthService.getInstance();
    const tokens = await auth.refreshToken(refreshToken);

    return NextResponse.json(tokens);
  } catch (error) {
    console.error('Token refresh error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Invalid refresh token' },
      { status: 401 }
    );
  }
}