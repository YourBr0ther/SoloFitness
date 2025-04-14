import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth.server';
import { PLATFORMS } from '@/config/auth';

export async function POST(request: Request) {
  try {
    const { email, password, platform = PLATFORMS.WEB } = await request.json();

    const auth = AuthService.getInstance();
    const { user, tokens } = await auth.login(email, password);

    return NextResponse.json({
      user,
      tokens
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error ? 400 : 500 }
    );
  }
} 