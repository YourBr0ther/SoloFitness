import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { AUTH_CONFIG } from '@/config/auth';

// Add routes that require authentication
const protectedRoutes = ['/coach', '/journal', '/profile'];
const authRoutes = ['/login', '/register', '/forgot-password'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip auth check for public routes and assets
  if (
    pathname.startsWith('/_next') || 
    pathname.startsWith('/api/auth/') ||
    pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_CONFIG.TOKEN_STORAGE_KEY)?.value;

  // Handle API routes - let the validate endpoint handle actual validation
  if (pathname.startsWith('/api/')) {
    if (!token) {
      return NextResponse.json(
        { message: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }
    return NextResponse.next();
  }

  // If trying to access auth routes while having a token, redirect to journal
  if (token && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/journal', request.url));
  }

  // If trying to access protected routes without token, redirect to login
  if (!token && protectedRoutes.includes(pathname)) {
    const response = NextResponse.redirect(new URL('/login', request.url));
    // Store the original URL to redirect back after login
    response.cookies.set({
      name: 'redirectTo',
      value: request.url,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 5 * 60, // 5 minutes
    });
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}; 