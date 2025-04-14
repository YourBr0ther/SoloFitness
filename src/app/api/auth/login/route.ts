import { NextResponse } from 'next/server';
import { AuthService } from '@/lib/auth.server';
import { PLATFORMS, AUTH_CONFIG } from '@/config/auth';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  console.log('[API] Login request received');
  try {
    const { email, password, platform = PLATFORMS.WEB } = await request.json();
    console.log('[API] Login attempt for email:', email, 'platform:', platform);

    const auth = AuthService.getInstance();
    const { user, tokens } = await auth.login(email, password);

    console.log('[API] Login successful, setting cookies');

    // Create the response with the user data only (not tokens)
    const response = NextResponse.json({ user });

    // Set the access token cookie
    response.cookies.set({
      name: AUTH_CONFIG.TOKEN_STORAGE_KEY,
      value: tokens.token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 7 * 24 * 60 * 60, // 7 days in seconds
    });

    // Set the refresh token cookie if it exists
    if (tokens.refreshToken) {
      response.cookies.set({
        name: AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
        value: tokens.refreshToken,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      });
    }

    console.log('[API] Cookies set successfully');
    return response;
  } catch (error) {
    console.error('[API] Login error:', error);
    const response = NextResponse.json(
      { message: error instanceof Error ? error.message : 'Internal server error' },
      { status: error instanceof Error ? 400 : 500 }
    );
    
    // Clear any existing cookies on error
    console.log('[API] Clearing existing cookies due to error');
    response.cookies.delete(AUTH_CONFIG.TOKEN_STORAGE_KEY);
    response.cookies.delete(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
    
    return response;
  }
} 