import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { AuthService } from '@/lib/auth.server';
import { AUTH_CONFIG } from '@/config/auth';

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.TOKEN_STORAGE_KEY)?.value;
    
    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const auth = AuthService.getInstance();
    const user = await auth.validateToken(token);

    if (!user) {
      // Try to refresh if we have a refresh token
      const refreshToken = cookieStore.get(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY)?.value;
      
      if (refreshToken) {
        try {
          const tokens = await auth.refreshToken(refreshToken);
          const refreshedUser = await auth.validateToken(tokens.token);

          if (refreshedUser) {
            const response = NextResponse.json(refreshedUser);

            // Set new tokens
            response.cookies.set({
              name: AUTH_CONFIG.TOKEN_STORAGE_KEY,
              value: tokens.token,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 7 * 24 * 60 * 60, // 7 days
            });

            response.cookies.set({
              name: AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY,
              value: tokens.refreshToken,
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              path: '/',
              maxAge: 30 * 24 * 60 * 60, // 30 days
            });

            return response;
          }
        } catch (error) {
          console.error('Token refresh error:', error);
        }
      }

      const response = NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
      response.cookies.delete(AUTH_CONFIG.TOKEN_STORAGE_KEY);
      response.cookies.delete(AUTH_CONFIG.REFRESH_TOKEN_STORAGE_KEY);
      return response;
    }

    // Add user data to response headers for API routes
    const response = NextResponse.json(user);
    response.headers.set('X-User-Id', user.id);
    return response;
  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}