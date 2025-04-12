import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  email: string;
}

// Helper function to authenticate the request that works with Next.js headers
export async function authenticate(): Promise<AuthUser | null> {
  try {
    // Using headers() synchronously
    const headersList = headers();
    const authorization = headersList.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, email: true },
    });

    if (!user) {
      return null;
    }

    return user;
  } catch (error) {
    console.error('Authentication error:', error);
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