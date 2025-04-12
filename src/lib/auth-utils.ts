import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

export interface AuthUser {
  id: string;
  email: string;
}

/**
 * Get the current user from the Authorization header
 * This correctly handles the Next.js headers API
 */
export function getCurrentUser() {
  try {
    // Headers is synchronous in Next.js App Router
    const headersList = headers();
    const authorization = headersList.get('Authorization');
    
    if (!authorization?.startsWith('Bearer ')) {
      return null;
    }
    
    const token = authorization.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string };
    
    return { userId: decoded.userId, email: decoded.email };
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
}

/**
 * Authenticate a request and return the user or an error response
 */
export async function authenticateRequest(): Promise<{ user: AuthUser } | { error: NextResponse }> {
  const userToken = getCurrentUser();
  
  if (!userToken) {
    return {
      error: NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      )
    };
  }
  
  try {
    const user = await prisma.user.findUnique({
      where: { id: userToken.userId },
      select: { id: true, email: true },
    });
    
    if (!user) {
      return {
        error: NextResponse.json(
          { message: 'User not found' },
          { status: 401 }
        )
      };
    }
    
    return { user };
  } catch (error) {
    console.error('Database error during authentication:', error);
    return {
      error: NextResponse.json(
        { message: 'Authentication error' },
        { status: 500 }
      )
    };
  }
} 