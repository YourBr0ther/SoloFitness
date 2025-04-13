import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Add routes that require authentication
const protectedRoutes = ['/coach', '/journal', '/profile'];
const authRoutes = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token');
  const { pathname } = request.nextUrl;

  // If trying to access auth routes while logged in, redirect to journal
  if (token && authRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/journal', request.url));
  }

  // If trying to access protected routes without token, redirect to login
  if (!token && protectedRoutes.includes(pathname)) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [...protectedRoutes, ...authRoutes]
}; 