import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';
import { AUTH_CONFIG } from '@/config/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  email: string;
}

// Helper function to authenticate the request that works with Next.js headers
export async function authenticate(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(AUTH_CONFIG.TOKEN_STORAGE_KEY)?.value;

    if (!token) {
      console.log('[Auth Helper] No token found in cookies');
      return null;
    }

    console.log('[Auth Helper] Token found, verifying...');
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; type?: string };

    // If it's not an access token, return null
    if (decoded.type && decoded.type !== 'access') {
      console.log('[Auth Helper] Invalid token type:', decoded.type);
      return null;
    }

    console.log('[Auth Helper] Token verified, finding user:', decoded.userId);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      console.log('[Auth Helper] User not found for token');
      return null;
    }

    console.log('[Auth Helper] User authenticated:', user.email);
    return user;
  } catch (error) {
    console.error('[Auth Helper] Authentication error:', error);
    return null;
  }
}

// Helper function to require authentication
export async function requireAuth(request: Request): Promise<{ user: AuthUser } | NextResponse> {
  const user = await authenticate();
  
  if (!user) {
    return NextResponse.json(
      { message: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  return { user };
} 